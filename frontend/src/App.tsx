import { useState } from "react";
import { InsurersListPage } from "@/pages/insurers-list";
import { InsurerDetailPage } from "@/pages/insurer-detail";

export function App() {
  const [selectedInsurer, setSelectedInsurer] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {selectedInsurer ? (
          <InsurerDetailPage
            insurerName={selectedInsurer}
            onBack={() => setSelectedInsurer(null)}
          />
        ) : (
          <InsurersListPage onSelectInsurer={setSelectedInsurer} />
        )}
      </div>
    </div>
  );
}

export default App;