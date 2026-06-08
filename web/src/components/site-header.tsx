"use client";

import Link from "next/link";
import { useState } from "react";

const navigationItems = [
    { href: "/agenda", label: "Agenda" },
    { href: "/about", label: "About" },
];

export function SiteHeader() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-line/70 bg-background/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8 md:py-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-3"
                    onClick={() => setIsOpen(false)}
                >
                    <span className="sr-only">Baires Tango Club</span>
                    <span className="h-4 w-28 rounded bg-brand-muted md:h-5 md:w-36" />
                </Link>

                <nav className="hidden items-center gap-10 text-xl font-semibold text-muted md:flex">
                    {navigationItems.map((item) => (
                        <Link key={item.href} href={item.href} className="transition hover:text-foreground">
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="relative md:hidden">
                    <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "Cerrar navegacion" : "Abrir navegacion"}
                        onClick={() => setIsOpen((open) => !open)}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-panel"
                    >
                        <span className="relative block h-5 w-5">
                            <span
                                className={`absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-[7px] bg-muted transition ${isOpen ? "translate-y-0 rotate-45" : ""}`}
                            />
                            <span
                                className={`absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 bg-muted transition ${isOpen ? "opacity-0" : "opacity-100"}`}
                            />
                            <span
                                className={`absolute left-0 top-1/2 block h-0.5 w-5 translate-y-[6px] bg-muted transition ${isOpen ? "translate-y-0 -rotate-45" : ""}`}
                            />
                        </span>
                    </button>

                    {isOpen ? (
                        <nav className="absolute right-0 top-[calc(100%+0.75rem)] flex min-w-52 flex-col overflow-hidden rounded-[1.4rem] border border-line bg-panel shadow-2xl shadow-black/20">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="border-b border-line px-5 py-4 text-lg font-semibold text-foreground last:border-b-0"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    ) : null}
                </div>
            </div>
        </header>
    );
}