import { useEffect, useState } from "react";
import { getInsurer, formatReimbursement, CATEGORY_LABELS, type Insurer, type Category } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface InsurerDetailPageProps {
  insurerName: string;
  onBack: () => void;
}

export function InsurerDetailPage({ insurerName, onBack }: InsurerDetailPageProps) {
  const [insurer, setInsurer] = useState<Insurer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanLevel, setSelectedPlanLevel] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getInsurer(insurerName)
      .then((data) => {
        setInsurer(data);
        if (data.plans.length > 0) {
          setSelectedPlanLevel(data.plans[0].level);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [insurerName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (error || !insurer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-destructive">Erreur: {error || "Assureur non trouvé"}</div>
        <Button variant="outline" onClick={onBack}>Retour</Button>
      </div>
    );
  }

  const selectedPlan = insurer.plans.find((p) => p.level === selectedPlanLevel);

  // Group guarantees by category
  const guaranteesByCategory = selectedPlan?.guarantees.reduce((acc, guarantee) => {
    if (!acc[guarantee.category]) {
      acc[guarantee.category] = [];
    }
    acc[guarantee.category].push(guarantee);
    return acc;
  }, {} as Record<Category, typeof selectedPlan.guarantees>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          &larr; Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{insurer.brand}</h1>
          <p className="text-muted-foreground">{insurer.name}</p>
        </div>
      </div>

      {/* Plan selector */}
      <div className="flex flex-wrap gap-2">
        {insurer.plans.map((plan) => (
          <Button
            key={plan.level}
            variant={selectedPlanLevel === plan.level ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPlanLevel(plan.level)}
          >
            {plan.name}
          </Button>
        ))}
      </div>

      {/* Guarantees */}
      {selectedPlan && guaranteesByCategory && (
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.entries(guaranteesByCategory) as [Category, typeof selectedPlan.guarantees][]).map(
            ([category, guarantees]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">{CATEGORY_LABELS[category]}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {guarantees.map((guarantee) => (
                      <div key={guarantee.key} className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{guarantee.label}</div>
                          {guarantee.details && (
                            <div className="text-xs text-muted-foreground">{guarantee.details}</div>
                          )}
                          {guarantee.limit && (
                            <div className="text-xs text-muted-foreground">Limite: {guarantee.limit}</div>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {formatReimbursement(guarantee.reimbursement)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
