import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/Field";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Seven Max Cinéma" },
      { name: "description", content: "Connectez-vous avec Google, Apple ou votre e-mail." },
      { property: "og:title", content: "Connexion — Seven Max Cinéma" },
      { property: "og:description", content: "Accédez à vos billets et réservations." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/account" }); }, [user]);

  const oauth = async (p: "google" | "apple") => {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r.error) toast.error(String(r.error.message ?? r.error));
  };

  const submit = async () => {
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name: name } } });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success(t("checkEmail"));
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <img src="/assets/brand/logo-512.jpg" alt="Seven Max" className="mx-auto h-24 w-24 rounded-2xl shadow-glow" />
      <h1 className="mt-6 text-center font-display text-3xl">{mode === "in" ? t("signIn") : t("signUp")}</h1>
      <div className="mt-6 space-y-2">
        <button onClick={() => oauth("google")} className="w-full rounded-full bg-foreground py-3 font-semibold text-background">{t("google")}</button>
        <button onClick={() => oauth("apple")} className="w-full rounded-full border border-border bg-card py-3 font-semibold"> {t("apple")}</button>
      </div>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />{t("or")}<span className="h-px flex-1 bg-border" /></div>
      <div className="space-y-3">
        {mode === "up" && <Input label={t("fullName")} value={name} onChange={setName} />}
        <Input label={t("email")} value={email} onChange={setEmail} type="email" />
        <Input label={t("password")} value={password} onChange={setPassword} type="password" />
        <button disabled={busy} onClick={submit} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50">
          {mode === "in" ? t("signIn") : t("signUp")}
        </button>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm text-gold">
          {mode === "in" ? t("signUp") : t("signIn")}
        </button>
      </div>
    </div>
  );
}
