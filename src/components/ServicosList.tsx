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
import { Search, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { db, type Servico } from "@/lib/database";

interface ServicosListProps {
  onEdit?: (servico: Servico) => void;
  onAdd?: () => void;
}

export function ServicosList({ onEdit, onAdd }: ServicosListProps) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [filteredServicos, setFilteredServicos] = useState<Servico[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadServicos = async () => {
    try {
      setIsLoading(true);
      const data = await db.getServicos();
      setServicos(data);
      setFilteredServicos(data);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServicos();
  }, []);

  useEffect(() => {
    const filtered = servicos.filter((servico) =>
      servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (servico.descricao?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredServicos(filtered);
  }, [searchTerm, servicos]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await db.deleteServico(id);
        toast({
          title: "Sucesso",
          description: "Serviço excluído com sucesso.",
        });
        loadServicos();
      } catch (error) {
        console.error("Erro ao excluir serviço:", error);
        toast({
          title: "Erro",
          description: "Erro ao excluir serviço.",
          variant: "destructive",
        });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando serviços...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Serviços Cadastrados</CardTitle>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredServicos.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {searchTerm ? "Nenhum serviço encontrado." : "Nenhum serviço cadastrado."}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServicos.map((servico) => (
                  <TableRow key={servico.id}>
                    <TableCell className="font-medium">{servico.nome}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {servico.descricao || "-"}
                    </TableCell>
                    <TableCell>{formatPrice(servico.preco)}</TableCell>
                    <TableCell>{formatDuration(servico.duracao_minutos)}</TableCell>
                    <TableCell>
                      <Badge variant={servico.ativo ? "default" : "secondary"}>
                        {servico.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit?.(servico)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(servico.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
  );
}