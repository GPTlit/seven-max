import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/Field";

export const Route = createFileRoute("/rental")({
  head: () => ({
    meta: [
      { title: "Location de salle — Seven Max Cinéma" },
      { name: "description", content: "Louez une salle privée Seven Max pour vos anniversaires, réunions et séminaires." },
      { property: "og:title", content: "Location de salle — Seven Max Cinéma" },
      { property: "og:description", content: "Projections privées et événements à Nouakchott." },
    ],
  }),
  component: Rental,
});

function Rental() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [f, setF] = useState({ full_name: "", phone: "", email: "", event_type: "", event_date: "", guests: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });

  const submit = async () => {
    if (!f.full_name || !f.phone) return toast.error(`${t("fullName")} / ${t("phone")}`);
    setBusy(true);
    const { error } = await supabase.from("hall_rentals").insert({
      ...f, user_id: user?.id ?? null, guests: f.guests ? Number(f.guests) : null, event_date: f.event_date || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <div className="relative h-56 overflow-hidden md:mx-4 md:mt-4 md:rounded-2xl">
        <img src="/assets/brand/hall.jpg" alt={t("rental")} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-4 start-4 end-4">
          <h1 className="font-display text-3xl">{t("rental")}</h1>
          <p className="text-sm text-muted-foreground">{t("rentalSub")}</p>
        </div>
      </div>
      {done ? (
        <p className="m-4 rounded-2xl border border-gold/40 bg-accent p-6 text-center">{t("sent")}</p>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Input label={t("fullName")} value={f.full_name} onChange={set("full_name")} />
          <Input label={t("phone")} value={f.phone} onChange={set("phone")} type="tel" />
          <Input label={t("email")} value={f.email} onChange={set("email")} type="email" />
          <Input label={t("eventType")} value={f.event_type} onChange={set("event_type")} />
          <Input label={t("eventDate")} value={f.event_date} onChange={set("event_date")} type="date" />
          <Input label={t("guests")} value={f.guests} onChange={set("guests")} type="number" />
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs text-muted-foreground">{t("message")}</span>
            <textarea value={f.message} onChange={(e) => set("message")(e.target.value)} rows={4} className="w-full rounded-xl border border-input bg-secondary px-3 py-2.5 outline-none focus:border-primary" />
          </label>
          <button disabled={busy} onClick={submit} className="rounded-full bg-gradient-gold py-3.5 font-bold text-gold-foreground disabled:opacity-50 sm:col-span-2">{t("send")}</button>
        </div>
      )}
    </div>
  );
}
