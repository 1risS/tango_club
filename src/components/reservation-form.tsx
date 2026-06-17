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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-2">
                <label
                    className="eyebrow text-[0.6rem] tracking-[0.34em] text-muted"
                    htmlFor="res-name"
                >
                    Nombre
                </label>
                <input
                    id="res-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Tu nombre completo"
                    className="liquid-input rounded-lg px-4 py-3 text-base font-medium transition"
                />
            </div>

            {/* Channel — editorial tab selector, no radio buttons */}
            <div className="flex flex-col gap-3">
                <span className="eyebrow text-[0.6rem] tracking-[0.34em] text-muted">
                    Cómo te contactamos
                </span>
                <div role="tablist" className="flex border-b border-line">
                    {channelOptions.map((option) => (
                        <button
                            key={option.value}
                            role="tab"
                            type="button"
                            aria-selected={channel === option.value}
                            onClick={() => setChannel(option.value)}
                            className={`relative mr-5 pb-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] transition-colors last:mr-0 ${channel === option.value
                                    ? "text-foreground"
                                    : "text-muted hover:text-foreground/60"
                                }`}
                        >
                            {option.label}
                            {channel === option.value && (
                                <span className="absolute inset-x-0 -bottom-px h-px bg-accent" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contact value */}
            <div className="flex flex-col gap-2">
                <label className="eyebrow text-[0.6rem] tracking-[0.34em] text-muted">
                    {expectsEmail
                        ? "Correo electrónico"
                        : expectsTelegram
                            ? "Usuario de Telegram"
                            : "Número de WhatsApp"}
                </label>
                {expectsEmail ? (
                    <input
                        value={contactValue}
                        onChange={(event) => setContactValue(event.target.value)}
                        placeholder="mail@ejemplo.com"
                        className="liquid-input rounded-lg px-4 py-3 text-base font-medium transition"
                    />
                ) : expectsTelegram ? (
                    <div className="grid grid-cols-[4.5rem_1fr] gap-2">
                        <div className="liquid-input flex items-center justify-center rounded-lg px-3 py-3 text-sm font-medium text-muted">
                            t.me/
                        </div>
                        <input
                            value={contactValue}
                            onChange={(event) => setContactValue(event.target.value)}
                            placeholder="tu_usuario"
                            className="liquid-input min-w-0 rounded-lg px-4 py-3 text-base font-medium transition"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-[7rem_1fr] gap-2">
                        <select
                            value={countryCode}
                            onChange={(event) => setCountryCode(event.target.value)}
                            className="liquid-input rounded-lg px-3 py-3 text-sm font-medium transition"
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
                            className="liquid-input min-w-0 rounded-lg px-4 py-3 text-base font-medium transition"
                        />
                    </div>
                )}
                {expectsTelegram ? (
                    <p className="text-xs leading-5 text-muted">
                        Podés escribirlo como usuario, @usuario o pegar la URL completa.
                    </p>
                ) : expectsWhatsapp ? (
                    <p className="text-xs leading-5 text-muted">
                        Solo usaremos este número para confirmar tu reserva.
                    </p>
                ) : reservationNote ? (
                    <p className="text-xs leading-5 text-muted">{reservationNote}</p>
                ) : null}
            </div>

            <button
                type="submit"
                disabled={!formIsValid || isPending}
                className="liquid-button liquid-button-primary mt-1 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-8 text-[0.72rem] font-semibold uppercase tracking-[0.26em] transition disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isPending ? "Enviando…" : "Confirmar reserva"}
            </button>

            {submissionState.error ? (
                <p className="rounded-lg border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-foreground/80">
                    {submissionState.error}
                </p>
            ) : null}

            {submissionState.success ? (
                <p className="rounded-lg border border-success/30 bg-success/8 px-4 py-3 text-sm text-foreground/80">
                    {submissionState.success}
                </p>
            ) : null}
        </form>
    );
}