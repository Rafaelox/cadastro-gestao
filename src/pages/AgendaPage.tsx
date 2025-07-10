import { useState } from "react";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgendaList } from "@/components/AgendaList";
import { AgendaForm } from "@/components/AgendaForm";

export const AgendaPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  if (showForm) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <AgendaForm onSuccess={handleSuccess} />
        <div className="mt-4">
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Agenda
            </CardTitle>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AgendaList key={refreshKey} />
        </CardContent>
      </Card>
    </div>
  );
};