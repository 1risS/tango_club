import { EventCard } from "@/components/event-card";
import { getAllEvents } from "@/lib/data";

export default function AgendaPage() {
    const events = getAllEvents();

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-6 md:px-8 md:pb-24">
            <section className="page-hero">
                <p className="eyebrow text-sm text-muted">Agenda</p>
                <h1 className="anim-up font-display mt-4 max-w-4xl text-5xl leading-[0.95] tracking-tight text-foreground md:text-7xl">
                    Fechas y milongas con una lectura mas precisa y aireada.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted md:text-xl">
                    La propuesta busca que cada evento se lea como una ficha clara: contexto, atmosfera y reserva en un solo flujo.
                </p>
            </section>

            <section className="scroll-reveal grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                    <EventCard key={event.slug} event={event} />
                ))}
            </section>
        </main>
    );
}
