import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Play, Share2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { todayISO, hhmm } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { DateScrubber, TrailerModal, movieTitle } from "@/components/MovieBits";

export const Route = createFileRoute("/movie/$id")({
  head: () => ({
    meta: [
      { title: "Détails du film — Seven Max Cinéma" },
      { name: "description", content: "Synopsis, distribution, bande-annonce et séances." },
      { property: "og:title", content: "Détails du film — Seven Max Cinéma" },
      { property: "og:description", content: "Réservez votre séance au cinéma Seven Max." },
    ],
  }),
  component: MovieDetail,
});

function MovieDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const [date, setDate] = useState(todayISO());
  const [trailer, setTrailer] = useState(false);
  const { data: m } = useQuery({
    queryKey: ["movie", id],
    queryFn: async () => (await supabase.from("movies").select("*").eq("id", id).single()).data,
  });
  const { data: shows = [] } = useQuery({
    queryKey: ["movie-shows", id, date],
    queryFn: async () => (await supabase.from("screenings").select("*").eq("movie_id", id).eq("date", date).order("time")).data ?? [],
  });

  if (!m) return <div className="h-[60vh] animate-pulse" />;
  const desc = lang === "ar" && m.description_ar ? m.description_ar : m.description;

  return (
    <div className="pb-8">
      <div className="relative h-[52vh] min-h-[360px] overflow-hidden">
        <img src={m.poster_url ?? ""} alt={m.title} className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-40" />
        <div className="relative mx-auto flex h-full max-w-4xl items-end gap-6 px-4 pb-6">
          <img src={m.poster_url ?? ""} alt={m.title} className="hidden h-80 rounded-2xl border border-border object-cover shadow-2xl md:block" />
          <div className="flex-1">
            <h1 className="font-display text-4xl md:text-5xl">{movieTitle(m, lang)}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{m.duration} · {m.genre}</p>
            <div className="mt-3 flex items-center gap-3 text-sm">
              {m.rating && <span className="flex items-center gap-1 font-bold"><Star className="h-4 w-4 fill-gold text-gold" />{m.rating}</span>}
              {m.age_rating && <span className="rounded border border-border px-2 py-0.5 text-xs">{m.age_rating}</span>}
            </div>
            <div className="mt-4 flex gap-2">
              {m.trailer_url && (
                <button onClick={() => setTrailer(true)} className="flex items-center gap-2 rounded-full border border-border bg-background/50 px-4 py-2 text-sm hover:border-gold">
                  <Play className="h-4 w-4" />{t("trailer")}
                </button>
              )}
              <button
                onClick={() => navigator.share?.({ title: m.title, url: location.href }).catch(() => {})}
                className="rounded-full border border-border bg-background/50 p-2.5 hover:border-gold" aria-label="Share"
              ><Share2 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto max-w-4xl">
        <p className="px-4 leading-relaxed text-muted-foreground">{desc}</p>
        {m.cast_list && m.cast_list.length > 0 && (
          <div className="mt-6 px-4">
            <h2 className="mb-3 font-display text-lg">{t("cast")}</h2>
            <div className="no-scrollbar flex gap-4 overflow-x-auto">
              {m.cast_list.map((c) => (
                <div key={c} className="w-20 shrink-0 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-crimson font-display text-xl">
                    {c.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <p className="mt-1 text-[11px] leading-tight">{c}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <h2 className="mb-3 mt-8 px-4 font-display text-lg">{t("showtimes")}</h2>
        <DateScrubber value={date} onChange={setDate} />
        <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-4">
          {shows.length === 0 && <p className="col-span-full py-4 text-center text-sm text-muted-foreground">{t("noShows")}</p>}
          {shows.map((s) => (
            <Link key={s.id} to="/book/$screeningId" params={{ screeningId: s.id }} className="rounded-xl border border-border bg-card py-3 text-center hover:border-primary">
              <p className="font-bold" dir="ltr">{hhmm(s.time)}</p>
              <p className="text-[11px] text-muted-foreground">{s.room} · {s.price} MRU</p>
            </Link>
          ))}
        </div>
      </div>
      {trailer && m.trailer_url && <TrailerModal url={m.trailer_url} onClose={() => setTrailer(false)} />}
    </div>
  );
}
