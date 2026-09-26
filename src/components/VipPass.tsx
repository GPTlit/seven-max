import { Crown } from "lucide-react";
import { useI18n, fmtDate } from "@/lib/i18n";
import { ProfileCard } from "@/components/fx/ProfileCard";

export function VipPass({ name, companion, status, validUntil }: { name: string; companion?: string | null; status: string; validUntil?: string | null }) {
  const { t, lang } = useI18n();
  return (
    <ProfileCard active={status === "active"}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-gold">SEVEN MAX</p>
            <p className="font-display text-2xl">VIP PASS</p>
          </div>
          <Crown className="h-8 w-8 text-gold" />
        </div>
        <div>
          <p className="text-lg font-bold">{name}</p>
          <p className="text-xs opacity-80">+1 {companion || "—"}</p>
          <div className="mt-2 flex justify-between text-[11px] opacity-80">
            <span>{status === "active" && validUntil ? `${t("memberSince")} ${fmtDate(validUntil, lang, { day: "numeric", month: "short", year: "numeric" })}` : t("status_pending")}</span>
            <span className="tracking-widest">★★★★★</span>
          </div>
        </div>
      </div>
    </ProfileCard>
  );
}

