import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReservationForm } from "@/components/reservation-form";
import { getEventBySlug } from "@/lib/data";

type EventDetailPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const event = getEventBySlug(slug);

    if (!event) {
        return {
            title: "Evento no encontrado | Baires Tango Club",
        };
    }

    return {
        title: `${event.title} | Baires Tango Club`,
        description: event.excerpt,
    };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
    const { slug } = await params;
    const event = getEventBySlug(slug);

    if (!event) {
        notFound();
    }

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-6 md:px-8 md:pb-24">
            <section className="overflow-hidden rounded-[2rem] border border-line bg-panel">
                <div className="flex min-h-[260px] items-center justify-center px-6 py-10 text-center text-2xl font-medium text-muted md:min-h-[420px] md:text-4xl">
                    imagen del evento 16:9
                </div>
            </section>

            <section className="mt-8 grid overflow-hidden rounded-[2rem] border border-line bg-line xl:grid-cols-[1fr_0.95fr]">
                <article className="bg-surface px-6 py-8 md:px-10 md:py-12">
                    <p className="text-lg font-semibold text-muted">{event.dateLabel}</p>
                    <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-tight md:text-7xl">
                        {event.title}
                    </h1>

                    <section className="mt-10">
                        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                            Descripcion extendida
                        </h2>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted md:text-2xl md:leading-10">
                            {event.description}
                        </p>
                    </section>

                    <section className="mt-10">
                        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                            Caracteristicas
                        </h2>
                        <ul className="mt-6 space-y-4 p-0 text-lg text-muted md:text-2xl">
                            {event.features.map((feature) => (
                                <li key={feature.label} className="flex items-center gap-4">
                                    <span
                                        className={`h-4 w-4 rounded-full ${feature.tone === "positive" ? "bg-success" : "bg-danger"
                                            }`}
                                    />
                                    <span>{feature.label}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="mt-10">
                        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Ubicacion</h2>
                        <p className="mt-5 text-lg text-muted md:text-2xl">{event.location}</p>
                        <div className="mx-auto mt-5 flex min-h-60 w-full max-w-[32rem] items-center justify-center rounded-[1.75rem] border border-line bg-panel text-3xl font-medium text-muted xl:mx-0 xl:max-w-none">
                            mini mapa
                        </div>
                    </section>
                </article>

                <aside className="bg-panel px-6 py-8 md:px-10 md:py-12">
                    <ReservationForm
                        eventSlug={event.slug}
                        reservationNote={event.reservationNote}
                    />
                </aside>
            </section>
        </main>
    );
}