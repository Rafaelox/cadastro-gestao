import { useState } from "react";
import { Clipboard, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoricoList } from "@/components/HistoricoList";
import { AtendimentoForm } from "@/components/AtendimentoForm";

export const AtendimentosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgendaId, setSelectedAgendaId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAtendimentoSuccess = () => {
    setSelectedAgendaId(null);
    setRefreshKey(prev => prev + 1);
  };

  if (selectedAgendaId) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <AtendimentoForm
          agendaId={selectedAgendaId}
          onCancel={() => setSelectedAgendaId(null)}
          onSuccess={handleAtendimentoSuccess}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="h-5 w-5" />
              Histórico de Atendimentos
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atendimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <HistoricoList 
            searchTerm={searchTerm} 
            key={refreshKey}
            onNovoAtendimento={(agendaId) => setSelectedAgendaId(agendaId)}
          />
        </CardContent>
      </Card>
    </div>
  );
};