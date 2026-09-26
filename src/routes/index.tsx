import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Crown, Popcorn, PartyPopper, Clock, MapPin, Phone, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchMovies } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { RippleGrid } from "@/components/fx/RippleGrid";
import { ParticleText } from "@/components/fx/ParticleText";
import { CardSwap } from "@/components/fx/CardSwap";
import { PosterCard, movieTitle } from "@/components/MovieBits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seven Max Cinéma — سينما سفن ماكس، نواكشوط" },
      { name: "description", content: "Films à l'affiche, séances et réservation en ligne au cinéma Seven Max, Nouakchott." },
      { property: "og:title", content: "Seven Max Cinéma — Nouakchott" },
      { property: "og:description", content: "Plus qu'un cinéma, une expérience. Réservez vos places en ligne." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, lang } = useI18n();
  const { data: movies = [] } = useQuery({ queryKey: ["movies"], queryFn: fetchMovies });
  const { data: ads = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => (await supabase.from("announcements").select("*").eq("active", true).order("created_at", { ascending: false })).data ?? [],
  });
  const featured = movies.filter((m) => m.featured);
  const [front, setFront] = useState(0);
  const cur = featured[front];

  return (
    <div>
      {ads[0] && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-gold/30 bg-accent px-4 py-2.5 text-sm">
          <Megaphone className="h-4 w-4 shrink-0 text-gold" />
          <p className="min-w-0 truncate"><b>{ads[0].title}</b> — {ads[0].body}</p>
        </div>
      )}

      <section className="relative overflow-hidden">
        <RippleGrid />
        <div className="relative grid items-center gap-6 px-4 pb-8 pt-6 md:grid-cols-2 md:py-14">
          <div>
            <ParticleText text="SEVEN MAX" height={110} />
            <p className="-mt-1 text-center text-xs tracking-[0.6em] text-gold md:text-start">CINÉMA · سينما</p>
            <p className="mt-4 text-center font-display text-lg text-muted-foreground md:text-start">{t("tagline")}</p>
            {cur && (
              <div className="mt-6 hidden md:block">
                <p className="text-xs text-gold">{t("featured")}</p>
                <h2 className="font-display text-4xl">{movieTitle(cur, lang)}</h2>
                <p className="text-sm text-muted-foreground">{cur.genre} · {cur.duration}</p>
                <Link to="/movie/$id" params={{ id: cur.id }} className="mt-4 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow">
                  {t("bookNow")}
                </Link>
              </div>
            )}
          </div>
          <div className="h-[340px] md:h-[440px]" dir="ltr">
            {featured.length > 0 && (
              <CardSwap
                items={featured}
                onFrontChange={setFront}
                render={(m) => (
                  <Link to="/movie/$id" params={{ id: m.id }} className="relative block h-full">
                    <img src={m.poster_url ?? ""} alt={m.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-3" dir={lang === "ar" ? "rtl" : "ltr"}>
                      <p className="font-display text-lg leading-tight">{movieTitle(m, lang)}</p>
                      <p className="text-[11px] text-gold">{m.genre}</p>
                    </div>
                  </Link>
                )}
              />
            )}
          </div>
          {cur && (
            <Link to="/movie/$id" params={{ id: cur.id }} className="block rounded-full bg-primary py-3 text-center font-semibold text-primary-foreground shadow-glow md:hidden">
              {t("bookNow")} — {movieTitle(cur, lang)}
            </Link>
          )}
        </div>
      </section>

      <section className="py-4">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-display text-xl">{t("nowShowing")}</h2>
          <Link to="/movies" className="text-xs text-gold">{t("movies")} ›</Link>
        </div>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
          {movies.map((m) => <PosterCard key={m.id} m={m} />)}
        </div>
      </section>

      <section className="grid gap-3 px-4 py-4 md:grid-cols-3">
        <QuickCard to="/food" icon={<Popcorn className="h-6 w-6" />} title={t("food")} sub={t("foodSub")} />
        <QuickCard to="/vip" icon={<Crown className="h-6 w-6" />} title={t("vip")} sub={t("vipSub")} gold />
        <QuickCard to="/rental" icon={<PartyPopper className="h-6 w-6" />} title={t("rental")} sub={t("rentalSub")} />
      </section>

      <section className="mx-4 my-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 font-display text-xl">{t("info")}</h2>
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold" />{t("hours")}</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{t("address")}</p>
          <p className="flex items-center gap-2" dir="ltr"><Phone className="h-4 w-4 text-gold" />+222 45 25 26 27</p>
        </div>
      </section>
    </div>
  );
}

function QuickCard({ to, icon, title, sub, gold }: { to: "/food" | "/vip" | "/rental"; icon: React.ReactNode; title: string; sub: string; gold?: boolean }) {
  return (
    <Link to={to} className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors hover:border-primary ${gold ? "border-gold/40 bg-accent" : "border-border bg-card"}`}>
      <span className={`rounded-xl p-2.5 ${gold ? "bg-gradient-gold text-gold-foreground" : "bg-primary text-primary-foreground"}`}>{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </Link>
  );
}
