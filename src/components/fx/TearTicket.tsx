import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import gsap from "gsap";
import { useI18n } from "@/lib/i18n";

type Props = {
  title: string;
  poster?: string | null;
  date: string;
  time: string;
  room: string;
  seats: string[];
  bookingRef: string;
  amount: number;
  status: string;
  /** when true, stub animates tearing off */
  torn: boolean;
};

/** Black / crimson / gold digital ticket with tear-off stub animation on admission. */
export function TearTicket(p: Props) {
  const { t, dir } = useI18n();
  const stub = useRef<HTMLDivElement>(null);
  const [wasTorn] = useState(p.torn);

  useEffect(() => {
    if (!stub.current) return;
    if (p.torn && !wasTorn) {
      gsap.timeline()
        .to(stub.current, { rotate: -4, duration: 0.15, yoyo: true, repeat: 3, transformOrigin: "50% 0%" })
        .to(stub.current, { y: 140, rotate: dir === "rtl" ? 18 : -18, opacity: 0, duration: 0.9, ease: "power2.in" });
    } else if (p.torn) {
      gsap.set(stub.current, { y: 140, opacity: 0 });
    }
  }, [p.torn]);

  const approved = p.status === "approved" || p.status === "admitted";

  return (
    <div className="relative mx-auto w-full max-w-sm select-none">
      <div className="overflow-hidden rounded-t-3xl border border-gold/30 bg-obsidian">
        <div className="relative h-36">
          {p.poster && <img src={p.poster} alt={p.title} className="h-full w-full object-cover opacity-70" />}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
          <div className="absolute bottom-3 start-4 end-4">
            <p className="text-xs tracking-[0.3em] text-gold">SEVEN MAX CINÉMA</p>
            <h3 className="font-display text-2xl leading-tight">{p.title}</h3>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 px-4 py-4 text-sm">
          <Field k={t("eventDate")} v={p.date} />
          <Field k="⏱" v={p.time} />
          <Field k="🎬" v={p.room} />
          <Field k={t("seats")} v={p.seats.join(", ")} />
          <Field k={t("total")} v={`${p.amount} MRU`} />
          <Field k="REF" v={p.bookingRef} small />
        </div>
      </div>
      {/* perforation */}
      <div className="relative h-5 bg-obsidian">
        <div className="absolute -start-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
        <div className="absolute -end-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
        <div className="absolute inset-x-4 top-1/2 border-t-2 border-dashed border-gold/40" />
      </div>
      <div className="relative h-52">
        {p.torn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-b-3xl border border-dashed border-gold/30 text-center">
            <span className="text-4xl">🎟️</span>
            <p className="mt-2 font-display text-lg text-gold">{t("admitted")}</p>
          </div>
        )}
        <div ref={stub} className="absolute inset-0 flex items-center gap-4 rounded-b-3xl border border-gold/30 bg-gradient-crimson p-4">
          <div className="rounded-xl bg-foreground p-2">
            <QRCodeSVG value={p.bookingRef} size={132} bgColor="transparent" fgColor="#09090f" />
          </div>
          <div className="flex-1">
            <p className="text-xs opacity-80">{t("showQr")}</p>
            <p className="mt-2 font-mono text-sm">{p.bookingRef}</p>
            <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${approved ? "bg-gold text-gold-foreground" : "bg-background/40"}`}>
              {t(`status_${p.status}` as never)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ k, v, small }: { k: string; v: string; small?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-foreground">{k}</p>
      <p className={`font-semibold ${small ? "text-[11px] break-all" : ""}`}>{v}</p>
    </div>
  );
}
