import { useState, useEffect } from "react";
import { Plus, Building, Edit, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { databaseClient } from "@/lib/database-client";
import { useToast } from "@/hooks/use-toast";
import { ConfiguracaoEmpresa } from "@/types/recibo";

interface EmpresasListProps {
  onEdit: (empresa: ConfiguracaoEmpresa) => void;
  onAdd: () => void;
  refreshKey?: number;
}

export function EmpresasList({ onEdit, onAdd, refreshKey }: EmpresasListProps) {
  const [empresas, setEmpresas] = useState<ConfiguracaoEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const { data, error } = await databaseClient.getConfiguracaoEmpresa();

      if (error) throw error;
      setEmpresas((data as ConfiguracaoEmpresa[]) || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de empresas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAtivo = async (id: number, ativo: boolean) => {
    try {
      const result = await databaseClient.updateConfiguracaoEmpresa(id, { ativo: !ativo });

      // Result is void for updates in mock client

      toast({
        title: "Sucesso",
        description: `Empresa ${!ativo ? 'ativada' : 'desativada'} com sucesso.`,
      });

      loadEmpresas();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da empresa.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadEmpresas();
  }, [refreshKey]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Carregando empresas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Empresas Cadastradas</h2>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {empresas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <Building className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">Nenhuma empresa cadastrada</p>
              <p className="text-muted-foreground">Cadastre sua primeira empresa para começar.</p>
            </div>
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Empresa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {empresas.map((empresa) => (
            <Card key={empresa.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {empresa.tipo_pessoa === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                        {empresa.cpf_cnpj && ` • ${empresa.cpf_cnpj}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={empresa.ativo ? "default" : "secondary"}>
                      {empresa.ativo ? "Ativa" : "Inativa"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAtivo(empresa.id, empresa.ativo)}
                    >
                      {empresa.ativo ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(empresa)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {empresa.email && (
                    <div>
                      <span className="font-medium">Email:</span> {empresa.email}
                    </div>
                  )}
                  {empresa.telefone && (
                    <div>
                      <span className="font-medium">Telefone:</span> {empresa.telefone}
                    </div>
                  )}
                  {empresa.cidade && empresa.estado && (
                    <div>
                      <span className="font-medium">Localização:</span> {empresa.cidade}, {empresa.estado}
                    </div>
                  )}
                  {empresa.endereco && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Endereço:</span> {empresa.endereco}
                      {empresa.cep && ` - CEP: ${empresa.cep}`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}