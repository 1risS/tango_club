import { EventCard } from "@/components/event-card";
import { getAllEvents } from "@/lib/data";

export default function AgendaPage() {
    const events = getAllEvents();

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-6 md:px-8 md:pb-24">
            <section className="rounded-[2rem] border border-line bg-surface px-6 py-8 md:px-10 md:py-12">
                <p className="text-sm uppercase tracking-[0.28em] text-muted">Agenda</p>
                <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">
                    Milongas y fechas para armar tu semana.
                </h1>
                <p className="mt-6 max-w-3xl text-xl leading-9 text-muted md:text-2xl">
                    Una agenda simple para explorar eventos, revisar detalles y reservar desde la misma app.
                </p>
            </section>

            <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                    <EventCard key={event.slug} event={event} />
                ))}
            </section>
        </main>
    );
}