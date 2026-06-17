import Link from "next/link";
import { logoutAdminAction } from "@/app/admin/actions";
import { requireAdminAccess } from "@/lib/admin-auth";
import { listReservations } from "@/lib/reservations";

function formatDate(dateString: string) {
    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(dateString));
}

export default async function AdminPage() {
    await requireAdminAccess();
    const reservations = await listReservations();
    const pendingMessages = reservations.filter(
        (reservation) => reservation.outboundStatus === "pending_dispatch",
    ).length;

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-6 md:px-8 md:pb-24">
            <section className="editorial-frame liquid-glass liquid-glass-strong rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-muted">Admin</p>
                        <h1 className="font-display mt-4 text-4xl tracking-tight md:text-5xl">
                            Reservas hechas
                        </h1>
                        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
                            Panel privado para revisar quien reservo, por que canal quiere ser contactado y el estado del mensaje preparado.
                        </p>
                    </div>

                    <form action={logoutAdminAction}>
                        <button
                            type="submit"
                            className="liquid-button inline-flex min-h-12 items-center justify-center rounded-[1.2rem] px-5 text-base font-semibold text-foreground"
                        >
                            Cerrar sesion
                        </button>
                    </form>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <article className="liquid-glass liquid-glass-soft rounded-[1.5rem] px-5 py-5">
                        <p className="text-sm uppercase tracking-[0.22em] text-muted">Reservas</p>
                        <p className="mt-3 text-4xl font-semibold">{reservations.length}</p>
                    </article>
                    <article className="liquid-glass liquid-glass-soft rounded-[1.5rem] px-5 py-5">
                        <p className="text-sm uppercase tracking-[0.22em] text-muted">Mensajes pendientes</p>
                        <p className="mt-3 text-4xl font-semibold">{pendingMessages}</p>
                    </article>
                    <article className="liquid-glass liquid-glass-soft rounded-[1.5rem] px-5 py-5">
                        <p className="text-sm uppercase tracking-[0.22em] text-muted">Base</p>
                        <p className="mt-3 text-lg font-semibold text-muted">Postgres local / Neon-ready</p>
                    </article>
                </div>
            </section>

            <section className="mt-8 flex flex-col gap-4">
                {reservations.length === 0 ? (
                    <article className="liquid-glass liquid-glass-soft rounded-[2rem] px-6 py-8 text-lg text-muted md:px-8">
                        Todavia no hay reservas guardadas.
                    </article>
                ) : (
                    reservations.map((reservation) => (
                        <article
                            key={reservation.id}
                            className="liquid-glass liquid-glass-soft rounded-[2rem] px-6 py-6 md:px-8"
                        >
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.24em] text-muted">
                                        {formatDate(reservation.createdAt)}
                                    </p>
                                    <h2 className="font-display mt-3 text-3xl tracking-tight">
                                        {reservation.name}
                                    </h2>
                                    <p className="mt-2 text-lg text-muted">{reservation.eventTitle}</p>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2 lg:min-w-[22rem]">
                                    <div className="liquid-glass rounded-[1.4rem] px-4 py-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-muted">Canal</p>
                                        <p className="mt-2 text-lg font-semibold capitalize">{reservation.channel}</p>
                                    </div>
                                    <div className="liquid-glass rounded-[1.4rem] px-4 py-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-muted">Estado mensaje</p>
                                        <p className="mt-2 text-lg font-semibold">
                                            {reservation.outboundStatus ?? "sin mensaje"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                <div className="liquid-glass rounded-[1.4rem] px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-muted">Contacto</p>
                                    {reservation.contactUrl ? (
                                        <Link
                                            href={reservation.contactUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-2 inline-flex text-lg font-semibold text-foreground transition hover:text-muted"
                                        >
                                            {reservation.contactValue}
                                        </Link>
                                    ) : (
                                        <p className="mt-2 text-lg font-semibold">{reservation.contactValue}</p>
                                    )}
                                </div>

                                <div className="liquid-glass rounded-[1.4rem] px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-muted">Proveedor sugerido</p>
                                    <p className="mt-2 text-lg font-semibold">
                                        {reservation.outboundProviderHint ?? "sin definir"}
                                    </p>
                                </div>
                            </div>

                            {reservation.outboundMessageBody ? (
                                <div className="liquid-glass mt-4 rounded-[1.4rem] px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-muted">Mensaje preparado</p>
                                    <p className="mt-2 text-base leading-7 text-foreground">
                                        {reservation.outboundMessageBody}
                                    </p>
                                    {reservation.outboundDispatchNote ? (
                                        <p className="mt-3 text-sm leading-6 text-muted">
                                            {reservation.outboundDispatchNote}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </article>
                    ))
                )}
            </section>
        </main>
    );
}