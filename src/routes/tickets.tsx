import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hhmm, todayISO, type BookingWithShow } from "@/lib/data";
import { useI18n, fmtDate } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { PageHeader, SignInGate } from "@/components/AppShell";
import { TearTicket } from "@/components/fx/TearTicket";
import { movieTitle } from "@/components/MovieBits";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Mes billets — Seven Max Cinéma" },
      { name: "description", content: "Vos billets numériques et réservations Seven Max." },
      { property: "og:title", content: "Mes billets — Seven Max Cinéma" },
      { property: "og:description", content: "Portefeuille de billets numériques." },
    ],
  }),
  component: Tickets,
});

function Tickets() {
  const { t, lang } = useI18n();
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"up" | "past">("up");
  const { data = [] } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () =>
      ((await supabase.from("bookings").select("*, screening:screenings(*, movie:movies(*))").order("created_at", { ascending: false })).data ?? []) as BookingWithShow[],
  });

  // Live status updates (approval / admission at door triggers tear animation)
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("my-bookings")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` }, () =>
        qc.invalidateQueries({ queryKey: ["my-bookings"] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  if (!loading && !user) return <SignInGate />;
  const today = todayISO();
  const list = data.filter((b) => (b.screening ? (tab === "up" ? b.screening.date >= today && b.status !== "admitted" : b.screening.date < today || b.status === "admitted") : false));

  return (
    <div className="pb-10">
      <PageHeader title={t("myTickets")} />
      <div className="mx-4 grid grid-cols-2 rounded-xl bg-card p-1">
        {(["up", "past"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-lg py-2 text-sm ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            {k === "up" ? t("upcoming") : t("past")}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-8 px-4 md:grid-cols-2">
        {list.length === 0 && <p className="col-span-full py-10 text-center text-muted-foreground">{t("empty")}</p>}
        {list.map((b) => (
          <TearTicket
            key={b.id}
            title={b.screening?.movie ? movieTitle(b.screening.movie, lang) : ""}
            poster={b.screening?.movie?.poster_url}
            date={b.screening ? fmtDate(b.screening.date, lang) : ""}
            time={b.screening ? hhmm(b.screening.time) : ""}
            room={b.screening?.room ?? ""}
            seats={b.seats}
            bookingRef={b.booking_ref}
            amount={b.total_amount}
            status={b.status}
            torn={b.status === "admitted"}
          />
        ))}
      </div>
    </div>
  );
}
