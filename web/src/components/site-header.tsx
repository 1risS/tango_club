"use client";

import Link from "next/link";
import { useState } from "react";
import { ShaderLogo } from "@/components/shader-logo";

const navigationItems = [
    { href: "/agenda", label: "Agenda" },
    { href: "/about", label: "Concepto" },
];

export function SiteHeader() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-line bg-background/96 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8 md:py-4">
                <Link
                    href="/"
                    className="inline-flex min-w-0 items-center gap-3"
                    onClick={() => setIsOpen(false)}
                >
                    <ShaderLogo className="h-10 w-10 shrink-0 md:h-11 md:w-11" />
                    <span className="flex min-w-0 flex-col">
                        <span className="font-display text-[1.45rem] leading-none text-foreground md:text-[1.7rem]">
                            La Yunta
                        </span>
                        <span className="eyebrow mt-1 text-[0.55rem] tracking-[0.28em] text-muted md:text-[0.6rem]">
                            Club Social
                        </span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-10 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-muted md:flex">
                    {navigationItems.map((item) => (
                        <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "Cerrar navegacion" : "Abrir navegacion"}
                    onClick={() => setIsOpen((open) => !open)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface md:hidden"
                >
                    <span className="relative block h-4 w-5" aria-hidden="true">
                        <span
                            className={`absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-muted transition-all duration-200 ease-out ${isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : ""}`}
                        />
                        <span
                            className={`absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-muted transition-all duration-200 ease-out ${isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"}`}
                        />
                        <span
                            className={`absolute left-0 bottom-0 block h-0.5 w-5 rounded-full bg-muted transition-all duration-200 ease-out ${isOpen ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""}`}
                        />
                    </span>
                </button>
            </div>

            {isOpen ? (
                <nav className="border-t border-line px-5 pb-4 pt-3 grid gap-1 md:hidden">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="block py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-muted transition-colors hover:text-foreground border-b border-line/60 last:border-0"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            ) : null}
        </header>
    );
}