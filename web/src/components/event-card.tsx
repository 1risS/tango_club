import Link from "next/link";
import type { Event } from "@/lib/data";

type EventCardProps = {
    event: Event;
};

export function EventCard({ event }: EventCardProps) {
    return (
        <Link
            href={`/agenda/${event.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_24px_56px_rgba(0,0,0,0.44)]"
        >
            {/* Thumbnail */}
            <div className="relative aspect-16/10 overflow-hidden bg-linear-to-br from-accent-soft via-surface to-panel">
                <span className="absolute right-4 top-4 liquid-chip rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted">
                    En vivo
                </span>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col px-5 py-5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted">
                    {event.dateLabel} · {event.neighborhood}
                </p>
                <h3 className="font-display mt-3 italic text-[2rem] leading-[1.04] tracking-tight text-foreground md:text-[2.3rem]">
                    {event.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-base leading-7 text-muted">{event.excerpt}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    {event.tags.map((tag) => (
                        <span
                            key={tag}
                            className="liquid-chip rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-muted"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
