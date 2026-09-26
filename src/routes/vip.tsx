import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Crown, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_METHODS, VIP_PRICE, uploadReceipt } from "@/lib/data";
import { useI18n, fmtDate } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { PageHeader, SignInGate } from "@/components/AppShell";
import { VipPass } from "@/components/VipPass";
import { Input } from "@/components/Field";

export const Route = createFileRoute("/vip")({
  head: () => ({
    meta: [
      { title: "Abonnement VIP — Seven Max Cinéma" },
      { name: "description", content: "Pass VIP Seven Max pour vous et un accompagnant." },
      { property: "og:title", content: "Abonnement VIP — Seven Max Cinéma" },
      { property: "og:description", content: "Pass membre + 1 accompagnant." },
    ],
  }),
  component: Vip,
});

function Vip() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [method, setMethod] = useState("bankily");
  const [companion, setCompanion] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: mem } = useQuery({
    queryKey: ["membership", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("memberships").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });

  if (!loading && !user) return <SignInGate />;
  const name = (user?.user_metadata?.full_name as string) || user?.email || "";

  const submit = async () => {
    if (!user) return;
    if (!phone || !file) return toast.error(`${t("phone")} / ${t("receipt")}`);
    setBusy(true);
    try {
      const receipt_path = await uploadReceipt(user.id, file);
      const { error } = await supabase.from("memberships").insert({ user_id: user.id, companion_name: companion, phone, payment_method: method, receipt_path });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["membership"] });
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-xl pb-10">
      <PageHeader title={t("vip")} sub={t("vipSub")} />
      <div className="px-4">
        <VipPass name={name} companion={mem?.companion_name ?? companion} status={mem?.status ?? "preview"} validUntil={mem?.valid_until} />
        {!mem && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-gold/30 bg-accent p-5">
              <p className="text-3xl font-bold text-gold">{VIP_PRICE} MRU <span className="text-sm font-normal text-muted-foreground">{t("perMonth")}</span></p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {[t("vipSub"), t("food"), t("bookNow")].map((x) => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-gold" />{x}</li>)}
              </ul>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.filter((p) => p.logo).map((p) => (
                <button key={p.id} onClick={() => setMethod(p.id)} className={`rounded-xl border p-2 ${method === p.id ? "border-primary bg-accent" : "border-border"}`}>
                  <img src={p.logo} alt={p.label} className="mx-auto h-10 w-10 rounded bg-foreground object-contain" />
                  <p className="mt-1 text-[11px]">{p.label}</p>
                </button>
              ))}
            </div>
            <Input label={t("companion")} value={companion} onChange={setCompanion} />
            <Input label={t("phone")} value={phone} onChange={setPhone} type="tel" />
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border p-4 hover:border-primary">
              <Upload className="h-5 w-5 text-gold" /><span className="text-sm">{file?.name ?? t("receipt")}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <button disabled={busy} onClick={submit} className="w-full rounded-full bg-gradient-gold py-3.5 font-bold text-gold-foreground disabled:opacity-50">{t("subscribe")}</button>
          </div>
        )}
        {mem?.status === "pending" && <p className="mt-6 text-center text-muted-foreground">{t("bookingPendingMsg")}</p>}
      </div>
    </div>
  );
}
