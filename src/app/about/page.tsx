export default function AboutPage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-6 md:px-8 md:pb-24">
            {/* Page hero — bare text on background */}
            <section className="page-hero">
                <p className="eyebrow text-sm text-muted">Concepto</p>
                <h1 className="font-display mt-4 text-5xl leading-[0.95] tracking-tight text-foreground md:text-7xl">
                    Un lenguaje mas oscuro para ordenar la experiencia de la milonga.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted md:text-xl">
                    La referencia ahora se cruza con el shader del club: una interfaz de negros y grises profundos,
                    tipografia dramatica y acentos anaglifos minimos para que la noche tenga presencia sin volver ruidosa la lectura.
                </p>
            </section>

            {/* Content */}
            <article className="liquid-glass max-w-xl rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
                <h2 className="eyebrow text-xs text-muted">Que incluye</h2>
                <ul className="mt-5 space-y-5 text-base leading-7 text-muted md:text-lg md:leading-8">
                    <li className="flex gap-3">
                        <span className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        Home nocturna con hero mas cinematografico y sistema de acentos rojo/cian.
                    </li>
                    <li className="flex gap-3">
                        <span className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        Logo shader integrado en navbar como firma visual del club.
                    </li>
                    <li className="flex gap-3">
                        <span className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        Un sistema de tokens oscuros para que el resto del sitio herede la nueva direccion.
                    </li>
                    <li className="flex gap-3">
                        <span className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        Base tecnica intacta para seguir iterando datos, reservas y contenido.
                    </li>
                </ul>
            </article>
        </main>
    );
}
