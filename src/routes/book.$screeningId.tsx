import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Upload, Store } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ROWS, COLS, PAYMENT_METHODS, hhmm, uploadReceipt } from "@/lib/data";
import { useI18n, fmtDate } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { SignInGate } from "@/components/AppShell";
import { movieTitle } from "@/components/MovieBits";

export const Route = createFileRoute("/book/$screeningId")({
  head: () => ({
    meta: [
      { title: "Réservation — Seven Max Cinéma" },
      { name: "description", content: "Choisissez vos sièges et payez avec Bankily, Sedad, Masrivi ou à la caisse." },
      { property: "og:title", content: "Réservation — Seven Max Cinéma" },
      { property: "og:description", content: "Choisissez vos sièges et réservez en ligne." },
    ],
  }),
  component: Book,
});

function Book() {
  const { screeningId } = Route.useParams();
  const { t, lang } = useI18n();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sel, setSel] = useState<string[]>([]);
  const [method, setMethod] = useState<string>("bankily");
  const [form, setForm] = useState({ full_name: "", phone: "", whatsapp: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState("");

  const { data: show } = useQuery({
    queryKey: ["screening", screeningId],
    queryFn: async () => (await supabase.from("screenings").select("*, movie:movies(*)").eq("id", screeningId).single()).data,
  });
  const { data: occupied = [], refetch } = useQuery({
    queryKey: ["occupied", screeningId],
    queryFn: async () => ((await supabase.rpc("get_occupied_seats", { _screening: screeningId })).data as string[]) ?? [],
    refetchInterval: 15000,
  });

  if (!show || !show.movie) return <div className="h-[60vh] animate-pulse" />;
  const price = show.price;
  const total = sel.length * price;
  const toggle = (s: string) => setSel((p) => (p.includes(s) ? p.filter((x) => x !== s) : p.length >= 10 ? p : [...p, s]));

  const submit = async () => {
    if (!user) return;
    if (!form.full_name || !form.phone) return toast.error(`${t("fullName")} / ${t("phone")}`);
    if (method !== "counter" && !file) return toast.error(t("receipt"));
    setBusy(true);
    try {
      const receipt_path = file ? await uploadReceipt(user.id, file) : null;
      const { data, error } = await supabase
        .from("bookings")
        .insert({ user_id: user.id, screening_id: screeningId, seats: sel, payment_method: method, receipt_path, ...form, total_amount: total, quantity: sel.length })
        .select("booking_ref")
        .single();
      if (error) {
        if (error.message.includes("SEATS_TAKEN")) { toast.error(t("seatsTaken")); setSel([]); refetch(); setStep(1); return; }
        throw error;
      }
      setRef(data.booking_ref);
      setStep(3);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const Summary = (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3">
      <img src={show.movie.poster_url ?? ""} alt="" className="h-20 w-14 rounded-lg object-cover" />
      <div className="text-sm">
        <p className="font-semibold">{movieTitle(show.movie, lang)}</p>
        <p className="text-xs text-muted-foreground">{fmtDate(show.date, lang)} · <span dir="ltr">{hhmm(show.time)}</span> · {show.room}</p>
        {sel.length > 0 && <p className="mt-1 text-xs">{sel.length} × {price} MRU · {sel.join(", ")}</p>}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => (step === 2 ? setStep(1) : history.back())} className="rounded-full border border-border p-2" aria-label="Back">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <h1 className="font-display text-2xl">{step === 1 ? t("chooseSeats") : step === 2 ? t("payment") : t("bookingSent")}</h1>
      </div>

      {step === 1 && (
        <>
          {Summary}
          <div className="mt-6 overflow-x-auto" dir="ltr">
            <div className="mx-auto min-w-[340px] max-w-xl">
              <div className="relative mx-auto mb-8 h-10 w-[85%]">
                <div className="absolute inset-x-0 top-0 h-10 rounded-[50%/100%_100%_0_0] border-t-4 border-foreground/90" style={{ boxShadow: "0 -12px 40px -6px oklch(0.95 0 0 / .5)" }} />
                <p className="pt-4 text-center text-xs tracking-[0.4em] text-muted-foreground">{t("screen")}</p>
              </div>
              {ROWS.map((r) => (
                <div key={r} className="mb-1.5 flex items-center justify-center gap-1.5">
                  <span className="w-4 text-xs text-muted-foreground">{r}</span>
                  {Array.from({ length: COLS }, (_, i) => {
                    const id = `${r}${i + 1}`;
                    const occ = occupied.includes(id);
                    const on = sel.includes(id);
                    return (
                      <button
                        key={id}
                        disabled={occ}
                        onClick={() => toggle(id)}
                        title={id}
                        className={`h-6 w-6 rounded-t-md rounded-b-sm text-[8px] transition-all sm:h-7 sm:w-7 ${i === 5 ? "me-3" : ""} ${occ ? "cursor-not-allowed bg-muted-foreground/30" : on ? "scale-110 bg-primary text-primary-foreground shadow-glow" : "border border-border bg-secondary hover:border-primary"}`}
                      >
                        {on ? i + 1 : ""}
                      </button>
                    );
                  })}
                  <span className="w-4 text-xs text-muted-foreground">{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex justify-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm border border-border bg-secondary" />{t("available")}</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-primary" />{t("selected")}</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-muted-foreground/30" />{t("occupied")}</span>
          </div>
          <div className="sticky bottom-20 mt-6 rounded-2xl border border-border bg-card/95 p-4 backdrop-blur md:bottom-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{sel.length} {t("seats")}</p>
                <p className="text-sm font-semibold">{sel.join(", ") || "—"}</p>
              </div>
              <p className="text-2xl font-bold text-gold">{total} MRU</p>
            </div>
            <button
              disabled={sel.length === 0}
              onClick={() => (user ? setStep(2) : nav({ to: "/auth" }))}
              className="mt-3 w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-40"
            >
              {user ? t("continue") : t("signIn")}
            </button>
          </div>
        </>
      )}

      {step === 2 && (!user && !loading ? <SignInGate /> : (
        <div className="space-y-5">
          {Summary}
          <div>
            <h2 className="mb-2 font-semibold">{t("payMethod")}</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((p) => (
                <button key={p.id} onClick={() => setMethod(p.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-start ${method === p.id ? "border-primary bg-accent" : "border-border bg-card"}`}>
                  {p.logo ? <img src={p.logo} alt={p.label} className="h-10 w-10 rounded-lg bg-foreground object-contain" /> : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary"><Store className="h-5 w-5" /></span>}
                  <span className="flex-1 font-medium">{p.label || t("counter")}</span>
                  <span className={`h-4 w-4 rounded-full border-2 ${method === p.id ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          {method !== "counter" && <p className="rounded-xl border border-gold/30 bg-accent p-3 text-sm">{t("transferTo")} — <b dir="ltr">+222 45 25 26 27</b> · <b>{total} MRU</b></p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label={t("fullName")} value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
            <Input label={t("phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
            <Input label={t("whatsapp")} value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} type="tel" />
            <Input label={t("quantity")} value={String(sel.length)} onChange={() => {}} readOnly />
          </div>
          {method !== "counter" && (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-center hover:border-primary">
              {file ? <img src={URL.createObjectURL(file)} alt="receipt" className="max-h-48 rounded-lg" /> : <Upload className="h-8 w-8 text-gold" />}
              <span className="text-sm font-medium">{t("receipt")}</span>
              <span className="text-xs text-muted-foreground">{file?.name ?? t("uploadReceipt")}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          )}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <span>{t("total")}</span><span className="text-2xl font-bold text-gold">{total} MRU</span>
          </div>
          <button disabled={busy} onClick={submit} className="w-full rounded-full bg-primary py-3.5 font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
            {busy ? "…" : t("confirm")}
          </button>
        </div>
      ))}

      {step === 3 && (
        <div className="py-8 text-center">
          <CheckCircle2 className="mx-auto h-20 w-20 text-success" />
          <h2 className="mt-4 font-display text-3xl">{t("bookingSent")}</h2>
          <p className="mt-2 text-muted-foreground">{t("bookingPendingMsg")}</p>
          <p className="mt-4 font-mono text-gold">{ref}</p>
          <div className="mx-auto mt-6 max-w-sm">{Summary}</div>
          <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
            <Link to="/tickets" className="rounded-full border border-gold py-3 font-semibold text-gold">{t("viewTicket")}</Link>
            <Link to="/" className="rounded-full bg-primary py-3 font-semibold text-primary-foreground">{t("backHome")}</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function Input({ label, value, onChange, type = "text", readOnly }: { label: string; value: string; onChange: (v: string) => void; type?: string; readOnly?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-secondary px-3 py-2.5 outline-none focus:border-primary read-only:opacity-60"
      />
    </label>
  );
}
