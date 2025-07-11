import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  UserCheck,
  Mail,
  Phone,
  Percent
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/database";
import type { Consultor } from "@/types";

interface ConsultoresListProps {
  onEdit?: (consultor: Consultor) => void;
  onAdd?: () => void;
}

export const ConsultoresList = ({ onEdit, onAdd }: ConsultoresListProps) => {
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const loadConsultores = async () => {
    setIsLoading(true);
    try {
      const data = await db.getConsultores();
      setConsultores(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar consultores",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConsultores();
  }, []);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await db.deleteConsultor(id);
      toast({
        title: "Consultor excluído",
        description: "O consultor foi excluído com sucesso.",
      });
      loadConsultores();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredConsultores = consultores.filter(consultor =>
    consultor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultor.telefone?.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando consultores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <UserCheck className="h-6 w-6" />
          <span>Consultores</span>
        </h2>
        {onAdd && (
          <Button onClick={onAdd} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Novo Consultor</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Consultores</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredConsultores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum consultor encontrado</p>
              {onAdd && (
                <Button onClick={onAdd} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeiro consultor
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultores.map((consultor) => (
                    <TableRow key={consultor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{consultor.nome}</div>
                          {consultor.cpf && (
                            <div className="text-sm text-muted-foreground">
                              CPF: {consultor.cpf}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {consultor.email && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Mail className="h-3 w-3" />
                              <span>{consultor.email}</span>
                            </div>
                          )}
                          {consultor.telefone && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="h-3 w-3" />
                              <span>{consultor.telefone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Percent className="h-3 w-3" />
                          <span>{consultor.percentual_comissao.toFixed(2)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={consultor.ativo ? "default" : "secondary"}>
                          {consultor.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(consultor)}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Editar</span>
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Excluir</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o consultor "{consultor.nome}"?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(consultor.id!)}
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={deletingId === consultor.id}
                                >
                                  {deletingId === consultor.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};