import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientesList } from "@/components/ClientesList";
import { ClienteForm } from "@/components/ClienteForm";

export const ClientesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  if (showForm) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <ClienteForm 
          onSave={handleSuccess}
          onCancel={() => setShowForm(false)} 
        />
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
            <CardTitle>Clientes</CardTitle>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ClientesList 
            onEdit={(cliente) => {
              setSelectedCliente(cliente);
              setShowForm(true);
            }}
            onNew={() => {
              setSelectedCliente(null);
              setShowForm(true);
            }}
            key={refreshKey} 
          />
        </CardContent>
      </Card>
    </div>
  );
};