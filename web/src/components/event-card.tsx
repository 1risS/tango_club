import Link from "next/link";
import type { Event } from "@/lib/data";

type EventCardProps = {
    event: Event;
};

export function EventCard({ event }: EventCardProps) {
    return (
        <Link
            href={`/agenda/${event.slug}`}
            className="group flex h-full flex-col rounded-[2rem] border border-line bg-panel p-5 transition hover:-translate-y-1 hover:border-foreground/30"
        >
            <div className="flex aspect-[16/10] items-center justify-center rounded-[1.5rem] bg-surface text-2xl font-medium text-muted">
                foto
            </div>
            <div className="mt-5 text-lg text-muted">
                {event.dateLabel} · {event.neighborhood}
            </div>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-[2.3rem]">
                {event.title}
            </h3>
            <p className="mt-3 text-xl leading-8 text-muted">{event.excerpt}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-base text-muted">
                {event.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                ))}
            </div>
        </Link>
    );
}