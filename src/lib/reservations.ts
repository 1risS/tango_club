import "server-only";

import { Pool } from "pg";
import type { ContactChannel } from "@/lib/data";

export type ReservationInput = {
  eventSlug: string;
  name: string;
  channel: ContactChannel;
  contactValue: string;
};

export type ReservationRecord = ReservationInput & {
  id: string;
  eventTitle: string;
  contactUrl?: string;
  createdAt: string;
};

export type OutboundMessageJob = {
  id: string;
  reservationId: string;
  eventSlug: string;
  eventTitle: string;
  channel: ContactChannel;
  destination: string;
  destinationUrl?: string;
  providerHint: "whatsapp-cloud-api" | "telegram-bot-api" | "email-provider";
  status: "pending_dispatch";
  messageBody: string;
  dispatchNote: string;
  createdAt: string;
};

export type ReservationAdminListItem = ReservationRecord & {
  outboundStatus: OutboundMessageJob["status"] | null;
  outboundProviderHint: OutboundMessageJob["providerHint"] | null;
  outboundMessageBody: string | null;
  outboundDispatchNote: string | null;
};

type GlobalDatabaseState = typeof globalThis & {
  __reservationPool?: Pool;
  __reservationSchemaPromise?: Promise<void>;
};

const globalDatabaseState = globalThis as GlobalDatabaseState;

function isContactChannel(value: string): value is ContactChannel {
  return value === "whatsapp" || value === "telegram" || value === "email";
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 8;
}

function normalizeTelegramUsername(value: string) {
  const normalizedValue = value
    .trim()
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/^t\.me\//i, "")
    .replace(/^@/, "");

  if (!/^[A-Za-z0-9_]{5,32}$/.test(normalizedValue)) {
    throw new Error("Ingresa un usuario de Telegram valido.");
  }

  return normalizedValue;
}

function buildContactUrl(channel: ContactChannel, contactValue: string) {
  if (channel === "email") {
    return `mailto:${contactValue}`;
  }

  if (channel === "telegram") {
    return `https://t.me/${contactValue}`;
  }

  const digits = contactValue.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : undefined;
}

function getProviderHint(channel: ContactChannel): OutboundMessageJob["providerHint"] {
  if (channel === "telegram") {
    return "telegram-bot-api";
  }

  if (channel === "whatsapp") {
    return "whatsapp-cloud-api";
  }

  return "email-provider";
}

function getDispatchNote(channel: ContactChannel) {
  if (channel === "telegram") {
    return "Telegram requiere un bot y que la persona haya iniciado la conversacion previamente. El contacto queda guardado y listo para automatizar ese paso.";
  }

  if (channel === "whatsapp") {
    return "Para envio automatico por WhatsApp hace falta integrar Meta Cloud API o un proveedor como Twilio con plantillas aprobadas.";
  }

  return "Para envio automatico por e-mail hace falta integrar un proveedor como Resend, Postmark o SMTP.";
}

function buildAutomaticMessage(reservation: ReservationRecord) {
  return `Hola ${reservation.name}, recibimos tu reserva para ${reservation.eventTitle}. En breve te confirmamos disponibilidad por este medio.`;
}

function getDatabaseConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no esta configurada.",
    );
  }

  return connectionString;
}

function getDatabaseSsl(connectionString: string) {
  const shouldUseSsl = connectionString.includes("neon.tech");
  return shouldUseSsl ? { rejectUnauthorized: false } : undefined;
}

function getPool() {
  if (!globalDatabaseState.__reservationPool) {
    const connectionString = getDatabaseConnectionString();

    globalDatabaseState.__reservationPool = new Pool({
      connectionString,
      ssl: getDatabaseSsl(connectionString),
    });
  }

  return globalDatabaseState.__reservationPool;
}

async function ensureDatabaseSchema() {
  if (!globalDatabaseState.__reservationSchemaPromise) {
    const pool = getPool();

    globalDatabaseState.__reservationSchemaPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS reservations (
          id UUID PRIMARY KEY,
          event_slug TEXT NOT NULL,
          event_title TEXT NOT NULL,
          name TEXT NOT NULL,
          channel TEXT NOT NULL,
          contact_value TEXT NOT NULL,
          contact_url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS outbound_messages (
          id UUID PRIMARY KEY,
          reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
          event_slug TEXT NOT NULL,
          event_title TEXT NOT NULL,
          channel TEXT NOT NULL,
          destination TEXT NOT NULL,
          destination_url TEXT,
          provider_hint TEXT NOT NULL,
          status TEXT NOT NULL,
          message_body TEXT NOT NULL,
          dispatch_note TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS outbound_messages_status_created_at_idx
        ON outbound_messages (status, created_at DESC)
      `);
    })();
  }

  await globalDatabaseState.__reservationSchemaPromise;
}

export function validateReservationInput(payload: unknown): ReservationInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload invalido.");
  }

  const rawPayload = payload as Record<string, unknown>;
  const eventSlug = cleanString(rawPayload.eventSlug);
  const name = cleanString(rawPayload.name);
  const channelValue = cleanString(rawPayload.channel).toLowerCase();
  const contactValue = cleanString(rawPayload.contactValue);

  if (!eventSlug) {
    throw new Error("Falta el evento a reservar.");
  }

  if (name.length < 3) {
    throw new Error("El nombre debe tener al menos 3 caracteres.");
  }

  if (!isContactChannel(channelValue)) {
    throw new Error("El canal de comunicacion no es valido.");
  }

  if (channelValue === "email") {
    if (!isValidEmail(contactValue)) {
      throw new Error("Ingresa un e-mail valido.");
    }

    return {
      eventSlug,
      name,
      channel: channelValue,
      contactValue: contactValue.toLowerCase(),
    };
  }

  if (channelValue === "telegram") {
    return {
      eventSlug,
      name,
      channel: channelValue,
      contactValue: normalizeTelegramUsername(contactValue),
    };
  }

  if (!isValidPhone(contactValue)) {
    throw new Error("Ingresa un telefono valido con codigo de area.");
  }

  return {
    eventSlug,
    name,
    channel: channelValue,
    contactValue: contactValue.trim(),
  };
}

export async function createReservation(
  input: ReservationInput,
  eventTitle: string,
): Promise<ReservationRecord> {
  await ensureDatabaseSchema();

  const reservation: ReservationRecord = {
    ...input,
    id: crypto.randomUUID(),
    eventTitle,
    contactUrl: buildContactUrl(input.channel, input.contactValue),
    createdAt: new Date().toISOString(),
  };

  await getPool().query(
    `
      INSERT INTO reservations (
        id,
        event_slug,
        event_title,
        name,
        channel,
        contact_value,
        contact_url,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      reservation.id,
      reservation.eventSlug,
      reservation.eventTitle,
      reservation.name,
      reservation.channel,
      reservation.contactValue,
      reservation.contactUrl ?? null,
      reservation.createdAt,
    ],
  );

  return reservation;
}

export async function queueAutomaticMessage(
  reservation: ReservationRecord,
): Promise<OutboundMessageJob> {
  await ensureDatabaseSchema();

  const outboundMessage: OutboundMessageJob = {
    id: crypto.randomUUID(),
    reservationId: reservation.id,
    eventSlug: reservation.eventSlug,
    eventTitle: reservation.eventTitle,
    channel: reservation.channel,
    destination: reservation.contactValue,
    destinationUrl: reservation.contactUrl,
    providerHint: getProviderHint(reservation.channel),
    status: "pending_dispatch",
    messageBody: buildAutomaticMessage(reservation),
    dispatchNote: getDispatchNote(reservation.channel),
    createdAt: new Date().toISOString(),
  };

  await getPool().query(
    `
      INSERT INTO outbound_messages (
        id,
        reservation_id,
        event_slug,
        event_title,
        channel,
        destination,
        destination_url,
        provider_hint,
        status,
        message_body,
        dispatch_note,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `,
    [
      outboundMessage.id,
      outboundMessage.reservationId,
      outboundMessage.eventSlug,
      outboundMessage.eventTitle,
      outboundMessage.channel,
      outboundMessage.destination,
      outboundMessage.destinationUrl ?? null,
      outboundMessage.providerHint,
      outboundMessage.status,
      outboundMessage.messageBody,
      outboundMessage.dispatchNote,
      outboundMessage.createdAt,
    ],
  );

  return outboundMessage;
}

export async function listReservations(limit = 100): Promise<ReservationAdminListItem[]> {
  await ensureDatabaseSchema();

  const result = await getPool().query<{
    id: string;
    event_slug: string;
    event_title: string;
    name: string;
    channel: ContactChannel;
    contact_value: string;
    contact_url: string | null;
    created_at: string;
    outbound_status: OutboundMessageJob["status"] | null;
    outbound_provider_hint: OutboundMessageJob["providerHint"] | null;
    outbound_message_body: string | null;
    outbound_dispatch_note: string | null;
  }>(
    `
      SELECT
        r.id,
        r.event_slug,
        r.event_title,
        r.name,
        r.channel,
        r.contact_value,
        r.contact_url,
        r.created_at,
        om.status AS outbound_status,
        om.provider_hint AS outbound_provider_hint,
        om.message_body AS outbound_message_body,
        om.dispatch_note AS outbound_dispatch_note
      FROM reservations r
      LEFT JOIN LATERAL (
        SELECT
          outbound_messages.status,
          outbound_messages.provider_hint,
          outbound_messages.message_body,
          outbound_messages.dispatch_note
        FROM outbound_messages
        WHERE outbound_messages.reservation_id = r.id
        ORDER BY outbound_messages.created_at DESC
        LIMIT 1
      ) om ON TRUE
      ORDER BY r.created_at DESC
      LIMIT $1
    `,
    [limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    eventSlug: row.event_slug,
    eventTitle: row.event_title,
    name: row.name,
    channel: row.channel,
    contactValue: row.contact_value,
    contactUrl: row.contact_url ?? undefined,
    createdAt: row.created_at,
    outboundStatus: row.outbound_status,
    outboundProviderHint: row.outbound_provider_hint,
    outboundMessageBody: row.outbound_message_body,
    outboundDispatchNote: row.outbound_dispatch_note,
  }));
}