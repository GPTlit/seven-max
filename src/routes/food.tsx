import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Minus, Plus, ChefHat, Bike, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import type { FoodItem } from "@/lib/data";

export const Route = createFileRoute("/food")({
  head: () => ({
    meta: [
      { title: "Snacks & boissons — Seven Max Cinéma" },
      { name: "description", content: "Commandez popcorn, boissons et snacks livrés à votre siège." },
      { property: "og:title", content: "Snacks & boissons — Seven Max Cinéma" },
      { property: "og:description", content: "Livraison directe à votre siège pendant la séance." },
    ],
  }),
  component: Food,
});

const STEPS = ["preparing", "on_the_way", "delivered"] as const;

function Food() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [seat, setSeat] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: items = [] } = useQuery({ queryKey: ["food"], queryFn: async () => (await supabase.from("food_items").select("*").order("price")).data ?? [] });
  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("food_orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5)).data ?? [],
  });
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("my-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "food_orders", filter: `user_id=eq.${user.id}` }, () => qc.invalidateQueries({ queryKey: ["my-orders"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const add = (id: string, d: number) => setCart((c) => { const n = Math.max(0, (c[id] ?? 0) + d); const x = { ...c, [id]: n }; if (!n) delete x[id]; return x; });
  const lines = items.filter((i) => cart[i.id]).map((i) => ({ id: i.id, name: i.name, quantity: cart[i.id], price: i.price }));
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const name = (i: FoodItem) => (lang === "ar" && i.name_ar ? i.name_ar : i.name);

  const order = async () => {
    if (!user) return toast.error(t("signInRequired"));
    if (!seat.trim()) return toast.error(t("seatNumber"));
    setBusy(true);
    const { error } = await supabase.from("food_orders").insert({ user_id: user.id, items: lines, seat_info: seat.toUpperCase(), total_amount: total });
    setBusy(false);
    if (error) return toast.error(error.message);
    setCart({});
    toast.success("✓");
    qc.invalidateQueries({ queryKey: ["my-orders"] });
  };

  return (
    <div className="pb-10">
      <PageHeader title={t("food")} sub={t("foodSub")} />
      {orders.length > 0 && (
        <div className="mx-4 mb-4 space-y-2">
          <h2 className="text-sm font-semibold">{t("myOrders")}</h2>
          {orders.map((o) => {
            const idx = STEPS.indexOf(o.status as never);
            return (
              <div key={o.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex justify-between text-sm"><span>{t("seatNumber")}: <b>{o.seat_info}</b></span><span className="text-gold">{o.total_amount} MRU</span></div>
                <div className="mt-3 flex items-center gap-2">
                  {[ChefHat, Bike, CheckCircle2].map((I, i) => (
                    <div key={i} className="flex flex-1 items-center gap-2">
                      <span className={`rounded-full p-1.5 ${i <= idx ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"} ${i === idx && idx < 2 ? "animate-pulse" : ""}`}><I className="h-4 w-4" /></span>
                      <span className={`text-[11px] ${i <= idx ? "" : "text-muted-foreground"}`}>{t(`food_${STEPS[i]}` as never)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 px-4 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img src={i.image_url ?? ""} alt={i.name} loading="lazy" className="aspect-square w-full object-cover" />
            <div className="p-3">
              <p className="font-semibold">{name(i)}</p>
              <p className="text-xs text-muted-foreground">{i.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-gold">{i.price} MRU</span>
                {cart[i.id] ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => add(i.id, -1)} className="rounded-full bg-secondary p-1" aria-label="-"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="text-sm font-bold">{cart[i.id]}</span>
                    <button onClick={() => add(i.id, 1)} className="rounded-full bg-primary p-1" aria-label="+"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <button onClick={() => add(i.id, 1)} className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{t("addToCart")}</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {lines.length > 0 && (
        <div className="sticky bottom-20 mx-4 mt-6 rounded-2xl border border-border bg-card/95 p-4 backdrop-blur md:bottom-4">
          <div className="flex gap-3">
            <input value={seat} onChange={(e) => setSeat(e.target.value)} placeholder={`${t("seatNumber")} (E7)`} className="flex-1 rounded-xl border border-input bg-secondary px-3 py-2 outline-none focus:border-primary" />
            <button disabled={busy} onClick={order} className="rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50">{t("order")} · {total} MRU</button>
          </div>
        </div>
      )}
    </div>
  );
}
