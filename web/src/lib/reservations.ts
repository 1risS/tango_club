import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
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

const storageDir = path.join(process.cwd(), ".data");
const reservationsFilePath = path.join(storageDir, "reservations.json");
const outboundMessagesFilePath = path.join(storageDir, "outbound-messages.json");

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

async function ensureStorageFile(filePath: string) {
  await mkdir(storageDir, { recursive: true });

  try {
    await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeFile(filePath, "[]\n", "utf8");
      return;
    }

    throw error;
  }
}

async function readStorageFile<T>(filePath: string) {
  await ensureStorageFile(filePath);
  const fileContents = await readFile(filePath, "utf8");
  return JSON.parse(fileContents) as T[];
}

async function writeStorageFile<T>(filePath: string, items: T[]) {
  await ensureStorageFile(filePath);
  await writeFile(filePath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
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
  const reservation: ReservationRecord = {
    ...input,
    id: crypto.randomUUID(),
    eventTitle,
    contactUrl: buildContactUrl(input.channel, input.contactValue),
    createdAt: new Date().toISOString(),
  };

  const reservations = await readStorageFile<ReservationRecord>(reservationsFilePath);
  reservations.unshift(reservation);
  await writeStorageFile(reservationsFilePath, reservations);

  return reservation;
}

export async function queueAutomaticMessage(
  reservation: ReservationRecord,
): Promise<OutboundMessageJob> {
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

  const outboundMessages = await readStorageFile<OutboundMessageJob>(outboundMessagesFilePath);
  outboundMessages.unshift(outboundMessage);
  await writeStorageFile(outboundMessagesFilePath, outboundMessages);

  return outboundMessage;
}