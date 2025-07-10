import { useState } from "react";
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
          cliente={selectedCliente}
          onSave={handleSuccess}
          onCancel={() => setShowForm(false)} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Clientes</CardTitle>
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