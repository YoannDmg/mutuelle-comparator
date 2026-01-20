import { useEffect, useState } from "react";
import { getInsurers, type InsurerListItem } from "@/lib/api";
import { InsurerCard } from "@/components/insurer-card";
import { Input } from "@/components/ui/input";

interface InsurersListPageProps {
  onSelectInsurer: (name: string) => void;
}

export function InsurersListPage({ onSelectInsurer }: InsurersListPageProps) {
  const [insurers, setInsurers] = useState<InsurerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getInsurers()
      .then(setInsurers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredInsurers = insurers.filter(
    (insurer) =>
      insurer.name.toLowerCase().includes(search.toLowerCase()) ||
      insurer.brand.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Chargement des assureurs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Erreur: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Comparateur de mutuelles</h1>
        <p className="text-muted-foreground">
          Comparez les offres de {insurers.length} assureurs
        </p>
      </div>

      <Input
        placeholder="Rechercher un assureur..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filteredInsurers.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          Aucun assureur trouvé pour "{search}"
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInsurers.map((insurer) => (
            <InsurerCard
              key={insurer.name}
              insurer={insurer}
              onSelect={onSelectInsurer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
