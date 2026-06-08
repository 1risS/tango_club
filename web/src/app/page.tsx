import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { getFeaturedEvents } from "@/lib/data";

export default function Home() {
  const featuredEvents = getFeaturedEvents();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-4 md:px-8 md:pb-24">
      <section className="grid overflow-hidden rounded-[2rem] border border-line bg-line lg:grid-cols-[1fr_0.92fr]">
        <div className="bg-surface px-6 py-10 md:px-10 md:py-14 xl:px-12 xl:py-16">
          <p className="text-sm uppercase tracking-[0.28em] text-muted">Baires Tango Club</p>
          <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-tight text-foreground md:text-7xl">
            Bienvenidx a Baires Tango Club
          </h1>
          <p className="mt-8 max-w-lg text-xl leading-9 text-muted md:text-2xl">
            Un espacio de encuentro para disfrutar de la experiencia real de la
            milonga portena.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/agenda"
              className="inline-flex min-h-16 items-center justify-center rounded-[1.35rem] border border-[#d8d5cb] bg-button px-8 text-xl font-semibold text-foreground transition hover:bg-button-active"
            >
              Ver agenda -&gt;
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-16 items-center justify-center rounded-[1.35rem] border border-line bg-panel px-8 text-xl font-semibold text-muted transition hover:border-foreground/30 hover:text-foreground"
            >
              About
            </Link>
          </div>
        </div>
        <div className="flex min-h-[320px] items-center justify-center bg-panel px-6 py-10 text-2xl font-medium text-muted md:min-h-[480px] md:px-10">
          foto
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-line bg-surface px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted">Proximos eventos</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Agenda de esta semana
            </h2>
          </div>
          <Link
            href="/agenda"
            className="text-lg font-semibold text-muted transition hover:text-foreground"
          >
            ver todos -&gt;
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
}
