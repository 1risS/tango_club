"use client";

import { useState, useTransition } from "react";
import type { ContactChannel } from "@/lib/data";

type ReservationFormProps = {
    eventSlug: string;
    reservationNote: string;
};

type SubmissionState = {
    error: string | null;
    success: string | null;
};

const channelOptions: { value: ContactChannel; label: string }[] = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "telegram", label: "Telegram" },
    { value: "email", label: "E-Mail" },
];

const countryCodes = [
    { label: "AR +54", value: "+54" },
    { label: "UY +598", value: "+598" },
    { label: "CL +56", value: "+56" },
];

export function ReservationForm({
    eventSlug,
    reservationNote,
}: ReservationFormProps) {
    const [name, setName] = useState("");
    const [channel, setChannel] = useState<ContactChannel>("whatsapp");
    const [countryCode, setCountryCode] = useState("+54");
    const [contactValue, setContactValue] = useState("");
    const [submissionState, setSubmissionState] = useState<SubmissionState>({
        error: null,
        success: null,
    });
    const [isPending, startTransition] = useTransition();

    const expectsEmail = channel === "email";
    const expectsTelegram = channel === "telegram";
    const expectsWhatsapp = channel === "whatsapp";
    const normalizedTelegramValue = contactValue
        .trim()
        .replace(/^https?:\/\/(www\.)?/i, "")
        .replace(/^t\.me\//i, "")
        .replace(/^@/, "");
    const formIsValid =
        name.trim().length >= 3 &&
        (expectsEmail
            ? /[^\s@]+@[^\s@]+\.[^\s@]+/.test(contactValue.trim())
            : expectsTelegram
                ? /^[A-Za-z0-9_]{5,32}$/.test(normalizedTelegramValue)
                : contactValue.replace(/[^\d]/g, "").length >= 8);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmissionState({ error: null, success: null });

        startTransition(async () => {
            try {
                const response = await fetch("/api/reservations", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        eventSlug,
                        name,
                        channel,
                        contactValue: expectsEmail || expectsTelegram
                            ? contactValue.trim()
                            : `${countryCode} ${contactValue.trim()}`.trim(),
                    }),
                });

                const payload = (await response.json()) as { message?: string; reservation?: { id: string } };

                if (!response.ok) {
                    setSubmissionState({
                        error: payload.message ?? "No pudimos registrar tu reserva.",
                        success: null,
                    });
                    return;
                }

                setSubmissionState({
                    error: null,
                    success:
                        payload.message ??
                        `Reserva registrada. Codigo ${payload.reservation?.id.slice(0, 8)}.`,
                });
                setName("");
                setContactValue("");
                setChannel("whatsapp");
                setCountryCode("+54");
            } catch {
                setSubmissionState({
                    error: "No pudimos guardar tu reserva. Intenta nuevamente.",
                    success: null,
                });
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-[34rem] flex-col gap-8">
            <div>
                <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
                    Datos para la reserva
                </h2>
            </div>

            <label className="flex w-full flex-col gap-3 text-2xl font-semibold text-foreground">
                <span>Nombre</span>
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="nombre completo"
                    className="min-h-16 w-full rounded-[1.25rem] border border-[#e5e1d6] bg-[#f4f1eb] px-5 text-xl font-medium text-[#2a2a28] outline-none transition placeholder:text-[#4b4b46] focus:border-foreground"
                />
            </label>

            <fieldset className="m-0 min-w-0 border-0 p-0">
                <legend className="max-w-sm px-0 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                    Canal de comunicacion de preferencia
                </legend>
                <div className="flex flex-col gap-4 pt-10 text-xl text-muted md:text-2xl">
                    {channelOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-4">
                            <input
                                type="radio"
                                name="channel"
                                value={option.value}
                                checked={channel === option.value}
                                onChange={() => setChannel(option.value)}
                                className="h-6 w-6 accent-[#efede6]"
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            <div className="flex flex-col gap-3">
                <p className="text-sm text-muted">
                    {expectsTelegram
                        ? "Si elegis Telegram, dejanos tu usuario. Podes escribirlo como irisR, @irisR o pegar la URL completa."
                        : reservationNote}
                </p>
                {expectsEmail ? (
                    <input
                        value={contactValue}
                        onChange={(event) => setContactValue(event.target.value)}
                        placeholder="mail@ejemplo.com"
                        className="min-h-16 w-full rounded-[1.25rem] border border-[#e5e1d6] bg-[#f4f1eb] px-5 text-xl font-medium text-[#2a2a28] outline-none transition placeholder:text-[#4b4b46] focus:border-foreground"
                    />
                ) : expectsTelegram ? (
                    <div className="grid grid-cols-[6.25rem_minmax(0,1fr)] gap-3">
                        <div className="flex min-h-16 items-center justify-center rounded-[1.25rem] border border-[#e5e1d6] bg-[#f4f1eb] px-3 text-lg font-medium text-[#4b4b46] sm:text-xl">
                            t.me/
                        </div>
                        <input
                            value={contactValue}
                            onChange={(event) => setContactValue(event.target.value)}
                            placeholder="tu_usuario"
                            className="min-h-16 min-w-0 w-full rounded-[1.25rem] border border-[#e5e1d6] bg-[#f4f1eb] px-4 text-lg font-medium text-[#2a2a28] outline-none transition placeholder:text-[#4b4b46] focus:border-foreground sm:px-5 sm:text-xl"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3">
                        <select
                            value={countryCode}
                            onChange={(event) => setCountryCode(event.target.value)}
                            className="min-h-16 w-full rounded-[1.25rem] border border-[#e5e1d6] bg-[#f4f1eb] px-4 text-lg font-medium text-[#2a2a28] outline-none transition focus:border-foreground sm:px-5 sm:text-xl"
                        >
                            {countryCodes.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <input
                            value={contactValue}
                            onChange={(event) => setContactValue(event.target.value)}
                            placeholder="11 1234 5678"
                            className="min-h-16 min-w-0 w-full rounded-[1.25rem] border border-[#e5e1d6] bg-[#f4f1eb] px-4 text-lg font-medium text-[#2a2a28] outline-none transition placeholder:text-[#4b4b46] focus:border-foreground sm:px-5 sm:text-xl"
                        />
                    </div>
                )}
                {expectsWhatsapp ? (
                    <p className="text-sm text-muted">Vamos a usar este numero solo para confirmar la reserva.</p>
                ) : null}
            </div>

            <button
                type="submit"
                disabled={!formIsValid || isPending}
                className="inline-flex min-h-16 w-full items-center justify-center rounded-[1.35rem] border border-[#efede6] bg-[#f4f1eb] px-8 text-2xl font-semibold text-[#2a2a28] transition disabled:cursor-not-allowed disabled:border-[#d7d7d5] disabled:bg-button-disabled disabled:text-[#c8c5bc] enabled:hover:bg-[#e7e1d5]"
            >
                {isPending ? "Enviando..." : "Reservar"}
            </button>

            {submissionState.error ? (
                <p className="rounded-[1.25rem] border border-danger/40 bg-danger/10 px-4 py-3 text-base text-[#ffd8d4]">
                    {submissionState.error}
                </p>
            ) : null}

            {submissionState.success ? (
                <p className="rounded-[1.25rem] border border-success/40 bg-success/10 px-4 py-3 text-base text-[#d8ffdb]">
                    {submissionState.success}
                </p>
            ) : null}
        </form>
    );
}