import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { migrateUsersToAuth } from "@/services/user-migration.service";
import { toast } from "@/hooks/use-toast";

export const UserMigration = () => {
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMigration = async () => {
    setIsLoading(true);
    try {
      const result = await migrateUsersToAuth();
      setMigrationResult(result);
      
      if (result.success) {
        toast({
          title: "Migração concluída",
          description: `${result.migrated_users} usuários migrados com sucesso.`,
        });
      } else {
        toast({
          title: "Erro na migração",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro na migração",
        description: error.message || "Não foi possível migrar os usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Migração de Usuários</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta ferramenta migra usuários da tabela `profiles` para o sistema de autenticação do Supabase.
            Execute apenas uma vez para sincronizar usuários existentes.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handleMigration} 
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <ArrowRight className="h-4 w-4" />
          <span>{isLoading ? "Migrando..." : "Iniciar Migração"}</span>
        </Button>

        {migrationResult && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">Resultado da Migração:</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Criados:</strong> {migrationResult.migrated_users}
              </div>
              <div>
                <strong>Existentes:</strong> {migrationResult.existing_users}
              </div>
              <div>
                <strong>Erros:</strong> {migrationResult.errors}
              </div>
            </div>

            {migrationResult.details && migrationResult.details.length > 0 && (
              <div className="mt-4">
                <strong>Detalhes:</strong>
                <div className="max-h-40 overflow-y-auto space-y-1 mt-2">
                  {migrationResult.details.map((detail: any, index: number) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                      <strong>{detail.email}:</strong> {detail.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};