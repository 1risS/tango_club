export default function AboutPage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-6 md:px-8 md:pb-24">
            <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <article className="rounded-[2rem] border border-line bg-surface px-6 py-8 md:px-10 md:py-12">
                    <p className="text-sm uppercase tracking-[0.28em] text-muted">About</p>
                    <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
                        Una base para curar agenda y gestionar reservas.
                    </h1>
                    <p className="mt-6 max-w-3xl text-xl leading-9 text-muted md:text-2xl">
                        Esta primera version replica el lenguaje de los wireframes: contraste alto,
                        bloques claros y foco en contenido. El backend ya queda listo para migrar la
                        reserva a Neon sin rehacer la UI.
                    </p>
                </article>

                <article className="rounded-[2rem] border border-line bg-panel px-6 py-8 md:px-10 md:py-12">
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Que incluye</h2>
                    <ul className="mt-6 space-y-4 text-lg leading-8 text-muted md:text-xl">
                        <li>Home con hero, CTA y eventos destacados.</li>
                        <li>Agenda completa con tarjetas enlazadas al detalle.</li>
                        <li>Detalle con formulario y endpoint de reserva.</li>
                        <li>Estructura lista para reemplazar mocks por Neon DB.</li>
                    </ul>
                </article>
            </section>
        </main>
    );
}