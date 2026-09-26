import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ticket, Popcorn, Crown, PartyPopper, Shield, LogOut, ChevronLeft, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { PageHeader, SignInGate } from "@/components/AppShell";
import { VipPass } from "@/components/VipPass";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Mon compte — Seven Max Cinéma" },
      { name: "description", content: "Profil, pass VIP, réservations et notifications." },
      { property: "og:title", content: "Mon compte — Seven Max Cinéma" },
      { property: "og:description", content: "Gérez votre compte Seven Max." },
    ],
  }),
  component: Account,
});

function Account() {
  const { t } = useI18n();
  const { user, isAdmin, loading } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data: mem } = useQuery({
    queryKey: ["membership", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("memberships").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });
  const { data: notes = [] } = useQuery({
    queryKey: ["notifications", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(5)).data ?? [],
  });

  if (loading) return null;
  if (!user) return <SignInGate />;
  const name = (user.user_metadata?.full_name as string) || user.email || "";

  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };

  const links = [
    { to: "/tickets", icon: Ticket, label: t("myTickets") },
    { to: "/food", icon: Popcorn, label: t("food") },
    { to: "/vip", icon: Crown, label: t("vip") },
    { to: "/rental", icon: PartyPopper, label: t("rental") },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: t("admin") }] : []),
  ] as const;

  return (
    <div className="mx-auto max-w-xl pb-10">
      <PageHeader title={t("account")} />
      <div className="mx-4 mb-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-crimson font-display text-xl">{name[0]?.toUpperCase()}</div>
        <div className="min-w-0"><p className="truncate font-semibold">{name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
      </div>
      {mem && <div className="mb-5 px-4"><VipPass name={name} companion={mem.companion_name} status={mem.status} validUntil={mem.valid_until} /></div>}
      {notes.length > 0 && (
        <div className="mx-4 mb-5 rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4 text-gold" />{t("notifications")}</p>
          {notes.map((n) => <div key={n.id} className="border-t border-border py-2 text-sm"><b>{n.title}</b><p className="text-muted-foreground">{n.body}</p></div>)}
        </div>
      )}
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0 hover:bg-secondary">
            <l.icon className={`h-5 w-5 ${l.to === "/admin" ? "text-primary" : "text-gold"}`} />
            <span className="flex-1">{l.label}</span>
            <ChevronLeft className="h-4 w-4 text-muted-foreground ltr:rotate-180" />
          </Link>
        ))}
      </div>
      <button onClick={signOut} className="mx-4 mt-5 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-full border border-border py-3 text-sm text-muted-foreground hover:text-foreground">
        <LogOut className="h-4 w-4" />{t("signOut")}
      </button>
    </div>
  );
}
