import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Star, X } from "lucide-react";
import { useI18n, fmtDate } from "@/lib/i18n";
import { todayISO, type Movie } from "@/lib/data";

export function movieTitle(m: Movie, lang: string) {
  return lang === "ar" && m.title_ar ? m.title_ar : m.title;
}

export function TrailerModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur" onClick={onClose}>
      <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-border" onClick={(e) => e.stopPropagation()}>
        <iframe src={`${url}?autoplay=1`} className="h-full w-full" allow="autoplay; encrypted-media; fullscreen" title="Trailer" />
        <button onClick={onClose} className="absolute end-3 top-3 rounded-full bg-background/80 p-2" aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

export function PosterCard({ m }: { m: Movie }) {
  const { lang } = useI18n();
  const [trailer, setTrailer] = useState(false);
  return (
    <div className="group w-36 shrink-0 md:w-44">
      <Link to="/movie/$id" params={{ id: m.id }} className="relative block aspect-[2/3] overflow-hidden rounded-xl border border-border">
        <img src={m.poster_url ?? ""} alt={m.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {m.age_rating && <span className="absolute end-2 top-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-bold">{m.age_rating}</span>}
        {m.rating && (
          <span className="absolute bottom-2 start-2 flex items-center gap-1 rounded bg-background/80 px-1.5 py-0.5 text-[11px] font-bold">
            <Star className="h-3 w-3 fill-gold text-gold" />{m.rating}
          </span>
        )}
      </Link>
      <div className="mt-2 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{movieTitle(m, lang)}</p>
          <p className="truncate text-xs text-muted-foreground">{m.genre}</p>
        </div>
        {m.trailer_url && (
          <button onClick={() => setTrailer(true)} className="rounded-full border border-border p-1.5 hover:border-primary" aria-label="Trailer">
            <Play className="h-3 w-3" />
          </button>
        )}
      </div>
      {trailer && m.trailer_url && <TrailerModal url={m.trailer_url} onClose={() => setTrailer(false)} />}
    </div>
  );
}

export function DateScrubber({ value, onChange, days = 7 }: { value: string; onChange: (d: string) => void; days?: number }) {
  const { t, lang } = useI18n();
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
      {Array.from({ length: days }, (_, i) => {
        const iso = todayISO(i);
        const active = iso === value;
        const label = i === 0 ? t("today") : i === 1 ? t("tomorrow") : fmtDate(iso, lang, { weekday: "short" });
        return (
          <button
            key={iso}
            onClick={() => onChange(iso)}
            className={`min-w-[74px] shrink-0 rounded-xl border px-3 py-2 text-center transition-all ${active ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
          >
            <p className="text-[11px]">{label}</p>
            <p className="text-lg font-bold leading-tight">{new Date(iso + "T00:00:00").getDate()}</p>
          </button>
        );
      })}
    </div>
  );
}
