import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Trash2, ScanLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { hhmm, receiptUrl, type BookingWithShow } from "@/lib/data";
import { Input } from "@/components/Field";
import { TearTicket } from "@/components/fx/TearTicket";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — Seven Max Cinéma" },
      { name: "description", content: "Espace de gestion Seven Max." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Administration — Seven Max Cinéma" },
      { property: "og:description", content: "Espace de gestion." },
    ],
  }),
  component: Admin,
});

const TABS = ["bookings", "gate", "food", "movies", "showtimes", "vip", "rentals", "ads"] as const;
const LABELS: Record<(typeof TABS)[number], string> = {
  bookings: "Réservations", gate: "Contrôle entrée", food: "Commandes snack", movies: "Films",
  showtimes: "Séances", vip: "VIP", rentals: "Location salle", ads: "Annonces & notifs",
};

function Admin() {
  const { isAdmin, loading } = useAuth();
  const { t } = useI18n();
  const [tab, setTab] = useState<(typeof TABS)[number]>("bookings");
  if (loading) return null;
  if (!isAdmin) return <p className="p-10 text-center text-muted-foreground">⛔ {t("admin")}</p>;
  return (
    <div className="px-4 pb-10 pt-6" dir="ltr">
      <h1 className="font-display text-3xl">{t("admin")}</h1>
      <div className="no-scrollbar my-4 flex gap-2 overflow-x-auto">
        {TABS.map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${tab === k ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>{LABELS[k]}</button>
        ))}
      </div>
      {tab === "bookings" && <Bookings />}
      {tab === "gate" && <Gate />}
      {tab === "food" && <FoodOrders />}
      {tab === "movies" && <Movies />}
      {tab === "showtimes" && <Showtimes />}
      {tab === "vip" && <VipAdmin />}
      {tab === "rentals" && <Rentals />}
      {tab === "ads" && <Ads />}
    </div>
  );
}

const card = "rounded-2xl border border-border bg-card p-4";
const btn = "rounded-lg px-3 py-1.5 text-xs font-semibold";

function ReceiptLink({ path }: { path: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  if (!path) return <span className="text-xs text-muted-foreground">Caisse / cash</span>;
  return url ? (
    <a href={url} target="_blank" rel="noreferrer"><img src={url} alt="reçu" className="mt-2 max-h-64 rounded-lg border border-border" /></a>
  ) : (
    <button onClick={async () => setUrl(await receiptUrl(path))} className={`${btn} bg-secondary`}>Voir le reçu</button>
  );
}

function Bookings() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const { data = [] } = useQuery({
    queryKey: ["admin-bookings", filter],
    queryFn: async () => ((await supabase.from("bookings").select("*, screening:screenings(*, movie:movies(*))").eq("status", filter).order("created_at", { ascending: false }).limit(100)).data ?? []) as BookingWithShow[],
  });
  const setStatus = async (b: BookingWithShow, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", b.id);
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({ user_id: b.user_id, title: status === "approved" ? "Réservation confirmée ✓" : "Réservation refusée", body: `${b.booking_ref} — ${b.screening?.movie?.title ?? ""}` });
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };
  return (
    <div className="space-y-3">
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-input bg-secondary px-3 py-2 text-sm">
        {["pending", "approved", "admitted", "rejected", "cancelled"].map((s) => <option key={s}>{s}</option>)}
      </select>
      {data.length === 0 && <p className="text-muted-foreground">—</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((b) => (
          <div key={b.id} className={card}>
            <div className="flex justify-between"><b>{b.screening?.movie?.title}</b><span className="font-mono text-xs text-gold">{b.booking_ref}</span></div>
            <p className="text-sm text-muted-foreground">{b.screening?.date} {b.screening && hhmm(b.screening.time)} · {b.screening?.room} · {b.seats.join(", ")}</p>
            <p className="mt-2 text-sm">{b.full_name} · {b.phone} · WA {b.whatsapp || "—"}</p>
            <p className="text-sm"><b>{b.total_amount} MRU</b> via {b.payment_method}</p>
            <ReceiptLink path={b.receipt_path} />
            {b.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => setStatus(b, "approved")} className={`${btn} flex items-center gap-1 bg-success text-background`}><Check className="h-3 w-3" />Approuver</button>
                <button onClick={() => setStatus(b, "rejected")} className={`${btn} flex items-center gap-1 bg-destructive`}><X className="h-3 w-3" />Refuser</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Gate() {
  const [ref, setRef] = useState("");
  const [b, setB] = useState<BookingWithShow | null>(null);
  const find = async () => {
    const { data } = await supabase.from("bookings").select("*, screening:screenings(*, movie:movies(*))").eq("booking_ref", ref.trim().toUpperCase()).maybeSingle();
    if (!data) return toast.error("Billet introuvable");
    setB(data as BookingWithShow);
  };
  const admit = async () => {
    if (!b) return;
    if (b.status !== "approved") return toast.error(`Statut: ${b.status}`);
    const { error } = await supabase.from("bookings").update({ status: "admitted", admitted_at: new Date().toISOString() }).eq("id", b.id);
    if (error) return toast.error(error.message);
    setB({ ...b, status: "admitted" });
    toast.success("Client admis ✓");
  };
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex gap-2">
        <input value={ref} onChange={(e) => setRef(e.target.value)} onKeyDown={(e) => e.key === "Enter" && find()} placeholder="SVX-2026…" className="flex-1 rounded-xl border border-input bg-secondary px-3 py-2.5 font-mono" />
        <button onClick={find} className="flex items-center gap-1 rounded-xl bg-primary px-4 font-semibold"><ScanLine className="h-4 w-4" />Vérifier</button>
      </div>
      {b && (
        <>
          <TearTicket key={b.id} title={b.screening?.movie?.title ?? ""} poster={b.screening?.movie?.poster_url} date={b.screening?.date ?? ""} time={b.screening ? hhmm(b.screening.time) : ""} room={b.screening?.room ?? ""} seats={b.seats} bookingRef={b.booking_ref} amount={b.total_amount} status={b.status} torn={b.status === "admitted"} />
          {b.status === "approved" && <button onClick={admit} className="w-full rounded-full bg-gradient-gold py-3 font-bold text-gold-foreground">Admettre & déchirer le billet</button>}
        </>
      )}
    </div>
  );
}

function FoodOrders() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-food"], queryFn: async () => (await supabase.from("food_orders").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [] });
  useEffect(() => {
    const ch = supabase.channel("admin-food").on("postgres_changes", { event: "*", schema: "public", table: "food_orders" }, () => qc.invalidateQueries({ queryKey: ["admin-food"] })).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  const set = async (id: string, status: string) => {
    await supabase.from("food_orders").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-food"] });
  };
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.map((o) => (
        <div key={o.id} className={card}>
          <div className="flex justify-between"><b>Siège {o.seat_info}</b><span className="text-gold">{o.total_amount} MRU</span></div>
          <p className="text-sm text-muted-foreground">{(o.items as { name: string; quantity: number }[]).map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
          <div className="mt-3 flex gap-2">
            {(["preparing", "on_the_way", "delivered"] as const).map((s) => (
              <button key={s} onClick={() => set(o.id, s)} className={`${btn} ${o.status === s ? "bg-primary" : "bg-secondary"}`}>{s}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const emptyMovie = { title: "", title_ar: "", genre: "", duration: "", rating: "", age_rating: "", poster_url: "", trailer_url: "", description: "", description_ar: "", cast_list: "", featured: false };

function Movies() {
  const qc = useQueryClient();
  const [f, setF] = useState<typeof emptyMovie & { id?: string }>(emptyMovie);
  const { data = [] } = useQuery({ queryKey: ["movies"], queryFn: async () => (await supabase.from("movies").select("*").order("created_at")).data ?? [] });
  const save = async () => {
    const { id, ...rest } = f;
    const row = { ...rest, rating: rest.rating ? Number(rest.rating) : null, cast_list: rest.cast_list.split(",").map((s) => s.trim()).filter(Boolean), trailer_url: toEmbed(rest.trailer_url) };
    const { error } = id ? await supabase.from("movies").update(row).eq("id", id) : await supabase.from("movies").insert(row);
    if (error) return toast.error(error.message);
    setF(emptyMovie);
    qc.invalidateQueries({ queryKey: ["movies"] });
  };
  const del = async (id: string) => { if (!confirm("Supprimer ?")) return; await supabase.from("movies").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["movies"] }); };
  const s = (k: keyof typeof emptyMovie) => (v: string) => setF({ ...f, [k]: v });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${card} grid gap-3 sm:grid-cols-2`}>
        <Input label="Titre (FR/EN)" value={f.title} onChange={s("title")} />
        <Input label="Titre (AR)" value={f.title_ar} onChange={s("title_ar")} />
        <Input label="Genre" value={f.genre} onChange={s("genre")} />
        <Input label="Durée" value={f.duration} onChange={s("duration")} />
        <Input label="Note /10" value={f.rating} onChange={s("rating")} type="number" />
        <Input label="Âge" value={f.age_rating} onChange={s("age_rating")} />
        <Input label="URL affiche" value={f.poster_url} onChange={s("poster_url")} />
        <Input label="URL bande-annonce YouTube" value={f.trailer_url} onChange={s("trailer_url")} />
        <Input label="Synopsis FR" value={f.description} onChange={s("description")} />
        <Input label="Synopsis AR" value={f.description_ar} onChange={s("description_ar")} />
        <Input label="Casting (virgules)" value={f.cast_list} onChange={s("cast_list")} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} />À la une</label>
        <button onClick={save} className="rounded-full bg-primary py-2.5 font-semibold sm:col-span-2">{f.id ? "Mettre à jour" : "Ajouter le film"}</button>
      </div>
      <div className="space-y-2">
        {data.map((m) => (
          <div key={m.id} className={`${card} flex items-center gap-3`}>
            <img src={m.poster_url ?? ""} alt="" className="h-14 w-10 rounded object-cover" />
            <div className="flex-1"><b>{m.title}</b><p className="text-xs text-muted-foreground">{m.genre}</p></div>
            <button onClick={() => setF({ ...emptyMovie, ...m, id: m.id, rating: String(m.rating ?? ""), cast_list: (m.cast_list ?? []).join(", "), title_ar: m.title_ar ?? "", genre: m.genre ?? "", duration: m.duration ?? "", age_rating: m.age_rating ?? "", poster_url: m.poster_url ?? "", trailer_url: m.trailer_url ?? "", description: m.description ?? "", description_ar: m.description_ar ?? "", featured: !!m.featured })} className={`${btn} bg-secondary`}>Modifier</button>
            <button onClick={() => del(m.id)} className={`${btn} bg-destructive`}><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function toEmbed(u: string) {
  const m = u.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : u || null;
}

function Showtimes() {
  const qc = useQueryClient();
  const { data: movies = [] } = useQuery({ queryKey: ["movies"], queryFn: async () => (await supabase.from("movies").select("*").order("created_at")).data ?? [] });
  const { data = [] } = useQuery({ queryKey: ["admin-shows"], queryFn: async () => (await supabase.from("screenings").select("*, movie:movies(title)").gte("date", new Date().toLocaleDateString("en-CA")).order("date").order("time").limit(200)).data ?? [] });
  const [f, setF] = useState({ movie_id: "", date: "", time: "", room: "Salle 1", price: "150" });
  const add = async () => {
    if (!f.movie_id || !f.date || !f.time) return toast.error("Champs requis");
    const { error } = await supabase.from("screenings").insert({ ...f, price: Number(f.price) });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-shows"] });
  };
  const del = async (id: string) => { await supabase.from("screenings").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-shows"] }); };
  return (
    <div className="space-y-4">
      <div className={`${card} grid gap-3 sm:grid-cols-6`}>
        <select value={f.movie_id} onChange={(e) => setF({ ...f, movie_id: e.target.value })} className="rounded-xl border border-input bg-secondary px-3 py-2.5 sm:col-span-2">
          <option value="">Film…</option>{movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <Input label="" value={f.date} onChange={(v) => setF({ ...f, date: v })} type="date" />
        <Input label="" value={f.time} onChange={(v) => setF({ ...f, time: v })} type="time" />
        <Input label="" value={f.room} onChange={(v) => setF({ ...f, room: v })} />
        <Input label="" value={f.price} onChange={(v) => setF({ ...f, price: v })} type="number" />
        <button onClick={add} className="rounded-full bg-primary py-2.5 font-semibold sm:col-span-6">Ajouter la séance</button>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {data.map((s) => (
          <div key={s.id} className={`${card} flex items-center justify-between py-2 text-sm`}>
            <span><b>{(s.movie as { title: string } | null)?.title}</b><br /><span className="text-muted-foreground">{s.date} {hhmm(s.time)} · {s.room} · {s.price} MRU</span></span>
            <button onClick={() => del(s.id)} className={`${btn} bg-destructive`}><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VipAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-vip"], queryFn: async () => (await supabase.from("memberships").select("*").order("created_at", { ascending: false })).data ?? [] });
  const set = async (id: string, status: string) => {
    const valid_until = new Date(Date.now() + 30 * 864e5).toLocaleDateString("en-CA");
    await supabase.from("memberships").update(status === "active" ? { status, valid_until } : { status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-vip"] });
  };
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.map((m) => (
        <div key={m.id} className={card}>
          <b>{m.phone}</b> · +1 {m.companion_name || "—"} · <span className="text-gold">{m.status}</span>
          <p className="text-xs text-muted-foreground">{m.payment_method} · {m.valid_until ?? ""}</p>
          <ReceiptLink path={m.receipt_path} />
          <div className="mt-2 flex gap-2">
            <button onClick={() => set(m.id, "active")} className={`${btn} bg-success text-background`}>Activer 30j</button>
            <button onClick={() => set(m.id, "rejected")} className={`${btn} bg-destructive`}>Refuser</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Rentals() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-rentals"], queryFn: async () => (await supabase.from("hall_rentals").select("*").order("created_at", { ascending: false })).data ?? [] });
  const set = async (id: string, status: string) => { await supabase.from("hall_rentals").update({ status }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-rentals"] }); };
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.map((r) => (
        <div key={r.id} className={card}>
          <b>{r.full_name}</b> · {r.phone} · <span className="text-gold">{r.status}</span>
          <p className="text-sm text-muted-foreground">{r.event_type} · {r.event_date} · {r.guests} pers.</p>
          <p className="text-sm">{r.message}</p>
          <div className="mt-2 flex gap-2">{["contacted", "confirmed", "closed"].map((s) => <button key={s} onClick={() => set(r.id, s)} className={`${btn} bg-secondary`}>{s}</button>)}</div>
        </div>
      ))}
    </div>
  );
}

function Ads() {
  const qc = useQueryClient();
  const [a, setA] = useState({ title: "", body: "" });
  const [n, setN] = useState({ title: "", body: "" });
  const { data = [] } = useQuery({ queryKey: ["admin-ads"], queryFn: async () => (await supabase.from("announcements").select("*").order("created_at", { ascending: false })).data ?? [] });
  const addAd = async () => { if (!a.title) return; await supabase.from("announcements").insert(a); setA({ title: "", body: "" }); qc.invalidateQueries({ queryKey: ["admin-ads"] }); qc.invalidateQueries({ queryKey: ["announcements"] }); };
  const toggle = async (id: string, active: boolean) => { await supabase.from("announcements").update({ active }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-ads"] }); };
  const broadcast = async () => {
    if (!n.title) return;
    const { error } = await supabase.from("notifications").insert({ ...n, user_id: null });
    if (error) return toast.error(error.message);
    setN({ title: "", body: "" }); toast.success("Notification envoyée");
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${card} space-y-3`}>
        <h3 className="font-semibold">Bannière / publicité</h3>
        <Input label="Titre" value={a.title} onChange={(v) => setA({ ...a, title: v })} />
        <Input label="Texte" value={a.body} onChange={(v) => setA({ ...a, body: v })} />
        <button onClick={addAd} className="w-full rounded-full bg-primary py-2.5 font-semibold">Publier</button>
        {data.map((d) => (
          <div key={d.id} className="flex items-center justify-between border-t border-border pt-2 text-sm">
            <span>{d.title}</span>
            <button onClick={() => toggle(d.id, !d.active)} className={`${btn} ${d.active ? "bg-success text-background" : "bg-secondary"}`}>{d.active ? "Active" : "Inactive"}</button>
          </div>
        ))}
      </div>
      <div className={`${card} space-y-3`}>
        <h3 className="font-semibold">Notification à tous les clients</h3>
        <Input label="Titre" value={n.title} onChange={(v) => setN({ ...n, title: v })} />
        <Input label="Message" value={n.body} onChange={(v) => setN({ ...n, body: v })} />
        <button onClick={broadcast} className="w-full rounded-full bg-gradient-gold py-2.5 font-bold text-gold-foreground">Diffuser</button>
      </div>
    </div>
  );
}
