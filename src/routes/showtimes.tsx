import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { fetchScreeningsByDate, todayISO, hhmm, type Movie, type Screening } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/AppShell";
import { DateScrubber, movieTitle } from "@/components/MovieBits";

export const Route = createFileRoute("/showtimes")({
  head: () => ({
    meta: [
      { title: "Séances — Seven Max Cinéma" },
      { name: "description", content: "Horaires des séances du jour et de la semaine au cinéma Seven Max." },
      { property: "og:title", content: "Séances — Seven Max Cinéma" },
      { property: "og:description", content: "Consultez les horaires et réservez votre siège." },
    ],
  }),
  component: Showtimes,
});

function Showtimes() {
  const { t, lang } = useI18n();
  const [date, setDate] = useState(todayISO());
  const { data = [], isLoading } = useQuery({ queryKey: ["screenings", date], queryFn: () => fetchScreeningsByDate(date) });

  const byMovie = new Map<string, { movie: Movie; shows: Screening[] }>();
  for (const s of data) {
    if (!s.movie) continue;
    const e = byMovie.get(s.movie_id) ?? { movie: s.movie, shows: [] };
    e.shows.push(s);
    byMovie.set(s.movie_id, e);
  }

  return (
    <div>
      <PageHeader title={t("showtimes")} />
      <DateScrubber value={date} onChange={setDate} />
      <p className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <MapPin className="h-4 w-4 text-gold" /> Seven Max Cinéma — {t("address")}
      </p>
      <div className="space-y-3 p-4">
        {!isLoading && byMovie.size === 0 && <p className="py-10 text-center text-muted-foreground">{t("noShows")}</p>}
        {[...byMovie.values()].map(({ movie, shows }) => (
          <div key={movie.id} className="flex gap-4 rounded-2xl border border-border bg-card p-3">
            <Link to="/movie/$id" params={{ id: movie.id }} className="shrink-0">
              <img src={movie.poster_url ?? ""} alt={movie.title} className="h-32 w-22 rounded-lg object-cover" style={{ width: 88 }} loading="lazy" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{movieTitle(movie, lang)}</p>
              <p className="text-xs text-muted-foreground">{movie.genre} · {movie.duration}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {shows.map((s) => (
                  <Link key={s.id} to="/book/$screeningId" params={{ screeningId: s.id }} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:border-primary hover:bg-primary hover:text-primary-foreground" dir="ltr">
                    {hhmm(s.time)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
