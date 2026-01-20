import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InsurerListItem } from "@/lib/api";

interface InsurerCardProps {
  insurer: InsurerListItem;
  onSelect?: (name: string) => void;
}

export function InsurerCard({ insurer, onSelect }: InsurerCardProps) {
  return (
    <Card className="hover:ring-primary/30 transition-all cursor-pointer" onClick={() => onSelect?.(insurer.name)}>
      <CardHeader>
        <CardTitle>{insurer.brand}</CardTitle>
        <CardDescription>{insurer.name}</CardDescription>
      </CardHeader>
      <CardFooter className="justify-between">
        <Badge variant="secondary">
          {insurer.planCount} formule{insurer.planCount > 1 ? 's' : ''}
        </Badge>
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation();
          onSelect?.(insurer.name);
        }}>
          Voir les formules
        </Button>
      </CardFooter>
    </Card>
  );
}
