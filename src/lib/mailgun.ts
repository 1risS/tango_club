import "server-only";

import type { ReservationRecord } from "@/lib/reservations";

type MailgunSendResult = {
  attempted: boolean;
  sent: boolean;
  error?: string;
};

function cleanString(value: string | undefined) {
  return value?.trim() ?? "";
}

function getMailgunDomain(fromAddress: string) {
  const explicitDomain = cleanString(process.env.MAILGUN_DOMAIN);

  if (explicitDomain) {
    return explicitDomain;
  }

  const atIndex = fromAddress.lastIndexOf("@");
  return atIndex > -1 ? fromAddress.slice(atIndex + 1) : "";
}

function buildReservationEmailText(reservation: ReservationRecord) {
  return [
    `Hola ${reservation.name},`,
    "",
    `Recibimos tu reserva para ${reservation.eventTitle}.`,
    "",
    "En breve te confirmamos disponibilidad por este medio.",
    "",
    "Gracias por sumarte a Omen Tango Club.",
  ].join("\n");
}

export async function sendReservationEmailConfirmation(
  reservation: ReservationRecord,
): Promise<MailgunSendResult> {
  if (reservation.channel !== "email") {
    return { attempted: false, sent: false };
  }

  const apiKey = cleanString(process.env.MAILGUN_API_KEY);
  if (!apiKey) {
    return { attempted: false, sent: false };
  }

  const fromAddress = cleanString(process.env.MAILGUN_FROM) || "support@mg.layunta.ar";
  const domain = getMailgunDomain(fromAddress);

  if (!domain) {
    return {
      attempted: true,
      sent: false,
      error: "No pudimos resolver el dominio de Mailgun.",
    };
  }

  const endpoint = `https://api.mailgun.net/v3/${domain}/messages`;
  const basicAuth = Buffer.from(`api:${apiKey}`).toString("base64");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      from: fromAddress,
      to: reservation.contactValue,
      subject: `Reserva recibida: ${reservation.eventTitle}`,
      text: buildReservationEmailText(reservation),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return {
      attempted: true,
      sent: false,
      error: `Mailgun devolvio ${response.status}: ${errorBody.slice(0, 300)}`,
    };
  }

  return { attempted: true, sent: true };
}