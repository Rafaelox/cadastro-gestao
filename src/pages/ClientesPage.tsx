import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientesList } from "@/components/ClientesList";
import { ClienteForm } from "@/components/ClienteForm";
import { Cliente } from "@/lib/database";

export const ClientesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    console.log('ClientesPage - handleSuccess chamado');
    setSelectedCliente(null);
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  console.log('ClientesPage - Render:', { showForm, selectedCliente });

  if (showForm) {
    console.log('ClientesPage - Renderizando formulário com cliente:', selectedCliente);
    return (
      <div className="container mx-auto p-4 pb-20">
        <ClienteForm 
          cliente={selectedCliente}
          onSave={handleSuccess}
          onCancel={() => {
            console.log('ClientesPage - onCancel chamado');
            setShowForm(false);
          }} 
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
              console.log('ClientesPage - onEdit chamado com cliente:', cliente);
              setSelectedCliente(cliente);
              setShowForm(true);
              console.log('ClientesPage - showForm definido como true');
            }}
            onNew={() => {
              console.log('ClientesPage - onNew chamado');
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