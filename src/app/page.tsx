import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { getFeaturedEvents } from "@/lib/data";

export default function Home() {
  const featuredEvents = getFeaturedEvents();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-8 md:px-8 md:pb-24 md:pt-12">
      {/* ── Hero: text sits directly on background, no glass card ── */}
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-8">
        <article className="py-6 md:py-10 xl:py-14">
          <p className="eyebrow text-xs tracking-[0.38em] text-accent-red">La Yunta · Club Social</p>
          <h1 className="anim-up anim-delay-100 font-display mt-7 italic max-w-4xl text-[3.6rem] leading-[0.93] tracking-[-0.03em] text-foreground md:text-[5.8rem] xl:text-[7rem]">
            Una agenda oscura para perderse entre milongas, ritual y madrugada.
          </h1>
          <p className="anim-up anim-delay-300 mt-8 max-w-2xl text-lg leading-8 text-muted md:text-xl md:leading-9">
            Negro, humo, blanco roto y apenas un destello de rojo para marcar presencia.
            La noche antes de llegar.
          </p>
          <div className="anim-in anim-delay-500 mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/agenda"
              className="liquid-button liquid-button-primary inline-flex min-h-14 items-center justify-center rounded-full px-8 text-[0.78rem] font-semibold uppercase tracking-[0.28em]"
            >
              Ver agenda
            </Link>
            <Link
              href="/about"
              className="liquid-button inline-flex min-h-14 items-center justify-center rounded-full px-8 text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-foreground"
            >
              Concepto
            </Link>
          </div>
        </article>

        <aside className="liquid-glass liquid-glass-stage relative flex min-h-100 flex-col overflow-hidden rounded-xl px-6 py-8 md:px-8 md:py-10 lg:min-h-120">
          <div className="relative flex h-full flex-1 flex-col justify-between">
            <p className="eyebrow text-[0.6rem] tracking-[0.36em] text-muted">Buenos Aires</p>
            <div>
              <p className="font-display mt-8 italic text-[2.8rem] leading-[0.96] text-foreground md:text-[3.5rem]">
                Donde el tango<br />es clima.
              </p>
              <p className="mt-5 max-w-xs text-base leading-7 text-muted">
                Una agenda pensada para los que saben que la noche empieza antes de llegar.
              </p>
            </div>
            <div className="mt-8 border-t border-foreground/8 pt-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted">
                Próximas fechas disponibles
              </p>
            </div>
          </div>
        </aside>
      </section>

      {/* ── Editorial columns ── */}
      <section className="scroll-reveal mt-20 border-t border-line pt-10 md:mt-28 md:pt-14">
        <div className="grid gap-10 xl:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow text-xs tracking-[0.38em] text-accent-red">El club</p>
            <h2 className="font-display mt-5 italic max-w-sm text-4xl leading-[0.96] text-foreground md:text-5xl">
              Una gráfica sobria para una noche que habla sola.
            </h2>
          </div>
          <div className="grid gap-0 pt-1 sm:grid-cols-3">
            <div className="border-t border-line pt-5">
              <p className="eyebrow text-[0.65rem] tracking-[0.32em] text-muted">Tipografía</p>
              <p className="mt-3 text-base leading-7 text-muted">Una serif dramática para la noche y una sans sobria para navegar sin ruido.</p>
            </div>
            <div className="border-t border-line pt-5 sm:px-6">
              <p className="eyebrow text-[0.65rem] tracking-[0.32em] text-muted">Ritmo</p>
              <p className="mt-3 text-base leading-7 text-muted">Más contraste, menos luz ambiente y una lectura que parece salir del fondo.</p>
            </div>
            <div className="border-t border-line pt-5">
              <p className="eyebrow text-[0.65rem] tracking-[0.32em] text-muted">Paleta</p>
              <p className="mt-3 text-base leading-7 text-muted">Rojo tango, ocre cálido y blanco papel — sin azules ni cian que rompan el clima.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured events ── */}
      <section className="scroll-reveal mt-16 md:mt-24">
        <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-xs tracking-[0.38em] text-accent-red">Próximos eventos</p>
            <h2 className="font-display mt-3 italic text-4xl leading-none text-foreground md:text-5xl">
              Agenda de esta semana
            </h2>
          </div>
          <Link
            href="/agenda"
            className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-muted transition-colors hover:text-foreground"
          >
            Ver todos →
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
