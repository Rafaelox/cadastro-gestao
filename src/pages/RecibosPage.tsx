import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfiguracaoEmpresaForm } from '@/components/ConfiguracaoEmpresaForm';
import { ReciboForm } from '@/components/recibos/ReciboForm';
import { RecibosList } from '@/components/recibos/RecibosList';
import { Building2, Receipt, FileText } from 'lucide-react';

export default function RecibosPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestão de Recibos</h1>
        <p className="text-muted-foreground">
          Configure sua empresa e gere recibos profissionais
        </p>
      </div>

      <Tabs defaultValue="configuracao" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="configuracao" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="gerar" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Gerar Recibo
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuracao">
          <ConfiguracaoEmpresaForm />
        </TabsContent>

        <TabsContent value="gerar">
          <ReciboForm />
        </TabsContent>

        <TabsContent value="lista">
          <RecibosList />
        </TabsContent>
      </Tabs>
    </div>
  );
}