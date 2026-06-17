import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/data";
import { sendReservationEmailConfirmation } from "@/lib/mailgun";
import {
  createReservation,
  queueAutomaticMessage,
  validateReservationInput,
} from "@/lib/reservations";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const reservationInput = validateReservationInput(payload);

    if (!getEventBySlug(reservationInput.eventSlug)) {
      return NextResponse.json(
        { message: "El evento que intentas reservar no existe." },
        { status: 404 },
      );
    }

    const event = getEventBySlug(reservationInput.eventSlug);

    if (!event) {
      return NextResponse.json(
        { message: "El evento que intentas reservar no existe." },
        { status: 404 },
      );
    }

    const reservation = await createReservation(reservationInput, event.title);
    const outboundMessage = await queueAutomaticMessage(reservation);
    const emailDispatch =
      reservation.channel === "email"
        ? await sendReservationEmailConfirmation(reservation)
        : null;

    const responseMessage =
      reservation.channel === "telegram"
        ? "Reserva registrada. Guardamos tu usuario de Telegram y dejamos preparado el mensaje para automatizarlo cuando conectemos el bot."
        : reservation.channel === "email" && emailDispatch?.sent
          ? "Reserva registrada. Te enviamos un e-mail de confirmacion."
          : "Reserva registrada. Guardamos tus datos y dejamos preparado el mensaje automatico para este canal.";

    return NextResponse.json(
      {
        message: responseMessage,
        reservation,
        outboundMessage,
        emailDispatch,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos procesar la reserva.";

    return NextResponse.json({ message }, { status: 400 });
  }
}