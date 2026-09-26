import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Film, CalendarDays, Ticket, Menu, Bell, Languages } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

export function Logo({ small }: { small?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/assets/brand/logo-512.jpg" alt="Seven Max Cinéma" className={`${small ? "h-9 w-9" : "h-11 w-11"} rounded-xl object-cover`} />
      <div className="leading-none">
        <p className="font-display text-base tracking-wider">SEVEN <span className="text-primary">MAX</span></p>
        <p className="text-[9px] tracking-[0.45em] text-gold">CINÉMA</p>
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = [
    { to: "/", icon: Home, label: t("home") },
    { to: "/movies", icon: Film, label: t("movies") },
    { to: "/showtimes", icon: CalendarDays, label: t("showtimes") },
    { to: "/tickets", icon: Ticket, label: t("tickets") },
    { to: "/account", icon: Menu, label: t("more") },
  ] as const;

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className={`rounded-full px-4 py-2 text-sm transition-colors ${path === n.to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-border p-0.5 text-xs font-semibold" role="group" aria-label="Language">
              <Languages className="mx-1.5 h-3.5 w-3.5 text-gold" />
              {(["ar", "fr", "en"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`rounded-full px-2.5 py-1 ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {l === "ar" ? "ع" : l.toUpperCase()}
                </button>
              ))}
            </div>
            <Link to="/account" className="rounded-full border border-border p-2 hover:border-gold" aria-label={t("notifications")}>
              <Bell className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 py-3 text-[11px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                <n.icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-4 pb-4 pt-6">
      <h1 className="font-display text-3xl">{title}</h1>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function SignInGate() {
  const { t } = useI18n();
  return (
    <div className="mx-4 mt-10 rounded-2xl border border-border bg-card p-8 text-center">
      <p className="mb-4 text-muted-foreground">{t("signInRequired")}</p>
      <Link to="/auth" className="inline-block rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground">{t("signIn")}</Link>
    </div>
  );
}
