import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchMovies } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/AppShell";
import { PosterCard } from "@/components/MovieBits";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Films à l'affiche — Seven Max Cinéma" },
      { name: "description", content: "Tous les films à l'affiche au cinéma Seven Max de Nouakchott." },
      { property: "og:title", content: "Films à l'affiche — Seven Max Cinéma" },
      { property: "og:description", content: "Découvrez les films actuellement projetés à Seven Max." },
    ],
  }),
  component: Movies,
});

function Movies() {
  const { t } = useI18n();
  const { data = [] } = useQuery({ queryKey: ["movies"], queryFn: fetchMovies });
  return (
    <div>
      <PageHeader title={t("movies")} />
      <div className="grid grid-cols-2 gap-4 px-4 pb-8 sm:grid-cols-3 md:grid-cols-5 [&>div]:w-full">
        {data.map((m) => <PosterCard key={m.id} m={m} />)}
      </div>
    </div>
  );
}
