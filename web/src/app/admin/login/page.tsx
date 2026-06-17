import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loginAdminAction } from "@/app/admin/actions";

type AdminLoginPageProps = {
    searchParams?: Promise<{
        error?: string;
    }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
    if (await isAdminAuthenticated()) {
        redirect("/admin");
    }

    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const hasInvalidCredentialsError = resolvedSearchParams?.error === "invalid";

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 px-5 py-8 md:px-8 md:py-12">
            <section className="editorial-frame liquid-glass liquid-glass-strong mx-auto flex w-full max-w-xl flex-col rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
                <p className="text-sm uppercase tracking-[0.28em] text-muted">Admin</p>
                <h1 className="font-display mt-4 text-4xl tracking-tight md:text-5xl">
                    Acceso privado
                </h1>
                <p className="mt-4 text-lg leading-8 text-muted">
                    Esta pagina muestra las reservas del sitio. Solo entra quien tenga tus credenciales de admin.
                </p>

                <form action={loginAdminAction} className="mt-8 flex flex-col gap-5">
                    <label className="flex flex-col gap-3 text-lg font-semibold text-foreground">
                        <span>Usuario</span>
                        <input
                            type="text"
                            name="username"
                            autoComplete="username"
                            placeholder="usuario admin"
                            className="liquid-input min-h-14 rounded-[1.25rem] px-5 text-lg font-medium transition"
                        />
                    </label>

                    <label className="flex flex-col gap-3 text-lg font-semibold text-foreground">
                        <span>Password</span>
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            placeholder="tu password privada"
                            className="liquid-input min-h-14 rounded-[1.25rem] px-5 text-lg font-medium transition"
                        />
                    </label>

                    <button
                        type="submit"
                        className="liquid-button liquid-button-primary mt-2 inline-flex min-h-14 items-center justify-center rounded-[1.35rem] px-8 text-xl font-semibold transition"
                    >
                        Entrar al admin
                    </button>
                </form>

                {hasInvalidCredentialsError ? (
                    <p className="mt-5 rounded-[1.25rem] border border-danger/40 bg-danger/10 px-4 py-3 text-base text-[#ffd8d4]">
                        Las credenciales no coinciden.
                    </p>
                ) : null}
            </section>
        </main>
    );
}