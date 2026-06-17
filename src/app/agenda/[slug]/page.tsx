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
            title: "Evento no encontrado | La Yunta",
        };
    }

    return {
        title: `${event.title} | La Yunta`,
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
        <>
            {/* ── Cinematic hero: full-bleed, no rounded corners, no glass card ── */}
            <div
                className="relative w-full overflow-hidden bg-panel"
                style={{ height: "clamp(200px, 44vh, 540px)" }}
            >
                {/* atmospheric warm glows */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(circle at 20% 60%, rgba(140,25,40,0.32), transparent 44%), radial-gradient(circle at 78% 28%, rgba(165,125,38,0.2), transparent 36%)",
                    }}
                />
                {/* fade to background at bottom so content merges */}
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, var(--background) 0%, transparent 55%)" }}
                />
                {/* date + neighborhood overlaid at bottom-left */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 md:px-8 md:pb-7">
                    <div className="mx-auto max-w-7xl">
                        <p className="eyebrow text-[0.62rem] tracking-[0.42em] text-foreground/40">
                            {event.dateLabel} · {event.neighborhood}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Editorial content: no glass boxes ── */}
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 md:px-8 md:pb-24">
                {/* tags row */}
                <div className="flex flex-wrap items-center gap-2 border-b border-line py-4">
                    {event.tags.map((tag) => (
                        <span
                            key={tag}
                            className="liquid-chip rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-muted"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Two-column: editorial article + sticky reservation */}
                <div className="grid xl:grid-cols-[1fr_20rem]">
                    {/* ── Left: open typographic content ── */}
                    <article className="py-10 xl:pr-14 md:py-14">
                        {/* Architectural title */}
                        <h1 className="anim-up anim-delay-100 font-display italic text-[3rem] leading-[0.92] tracking-[-0.03em] text-foreground md:text-[4.6rem] xl:text-[5.6rem]">
                            {event.title}
                        </h1>

                        {/* Description */}
                        <section className="scroll-reveal mt-12 border-t border-line pt-10">
                            <p className="eyebrow mb-5 text-[0.6rem] tracking-[0.4em] text-accent-red">
                                Sobre la noche
                            </p>
                            <p className="max-w-prose text-lg leading-8 text-muted md:text-xl md:leading-9">
                                {event.description}
                            </p>
                        </section>

                        {/* Features */}
                        <section className="scroll-reveal mt-10 border-t border-line pt-10">
                            <p className="eyebrow mb-6 text-[0.6rem] tracking-[0.4em] text-accent-red">
                                Ambiente
                            </p>
                            <ul className="space-y-3.5">
                                {event.features.map((feature) => (
                                    <li
                                        key={feature.label}
                                        className="flex items-baseline gap-3 text-base text-muted md:text-lg"
                                    >
                                        <span
                                            className={`mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ${feature.tone === "positive" ? "bg-success" : "bg-danger"
                                                }`}
                                        />
                                        {feature.label}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Location */}
                        <section className="scroll-reveal mt-10 border-t border-line pt-10">
                            <p className="eyebrow mb-4 text-[0.6rem] tracking-[0.4em] text-accent-red">
                                Dónde
                            </p>
                            <p className="text-base text-muted md:text-lg">{event.location}</p>
                            <div className="mt-6 flex min-h-44 items-center justify-center rounded-lg border border-line bg-panel text-sm text-muted/40">
                                mapa
                            </div>
                        </section>
                    </article>

                    {/* ── Right: sticky reservation column ── */}
                    <aside className="anim-in anim-delay-400 border-t border-line py-8 xl:sticky xl:top-20 xl:self-start xl:border-t-0 xl:border-l xl:border-line xl:pl-10 xl:pt-14 xl:pb-16">
                        <p className="eyebrow mb-6 text-[0.6rem] tracking-[0.4em] text-accent-red">
                            Reservar
                        </p>
                        <ReservationForm
                            eventSlug={event.slug}
                            reservationNote={event.reservationNote}
                        />
                    </aside>
                </div>
            </main>
        </>
    );
}
