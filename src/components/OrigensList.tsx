import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { db, Origem } from "@/lib/database";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

export const OrigensList = () => {
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Origem>>({
    nome: '',
    descricao: '',
    ativo: true
  });

  useEffect(() => {
    loadOrigens();
  }, []);

  const loadOrigens = async () => {
    setIsLoading(true);
    try {
      const data = await db.getOrigens();
      setOrigens(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar origens",
        description: "Não foi possível carregar as origens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da origem é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        await db.updateOrigem(editingId, formData);
        toast({
          title: "Origem atualizada",
          description: "Origem atualizada com sucesso",
        });
        setEditingId(null);
      } else {
        await db.createOrigem(formData as Omit<Origem, 'id'>);
        toast({
          title: "Origem criada",
          description: "Nova origem criada com sucesso",
        });
        setShowForm(false);
      }
      
      setFormData({ nome: '', descricao: '', ativo: true });
      loadOrigens();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (origem: Origem) => {
    setEditingId(origem.id!);
    setFormData(origem);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta origem?')) return;
    
    try {
      await db.deleteOrigem(id);
      toast({
        title: "Origem excluída",
        description: "Origem removida com sucesso",
      });
      loadOrigens();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a origem",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({ nome: '', descricao: '', ativo: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">
                Origens
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie as origens dos clientes
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={showForm || editingId !== null}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Origem
            </Button>
          </div>
        </CardHeader>

        {/* Formulário */}
        {(showForm || editingId !== null) && (
          <CardContent className="border-t border-border/50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-foreground">
                    Nome da Origem <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome da origem"
                    className="bg-background/50 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao" className="text-foreground">
                    Descrição
                  </Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição da origem"
                    className="bg-background/50 border-border"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-border hover:bg-muted/50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Lista de Origens */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Carregando origens...</p>
            </CardContent>
          </Card>
        ) : origens.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma origem encontrada</p>
            </CardContent>
          </Card>
        ) : (
          origens.map((origem) => (
            <Card key={origem.id} className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {origem.nome}
                      </h3>
                      <Badge 
                        variant={origem.ativo ? "default" : "secondary"}
                        className={origem.ativo ? "bg-success text-white" : ""}
                      >
                        {origem.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    
                    {origem.descricao && (
                      <p className="text-sm text-muted-foreground">
                        {origem.descricao}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(origem)}
                      className="border-border hover:bg-muted/50"
                      disabled={editingId !== null || showForm}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(origem.id!)}
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      disabled={editingId !== null || showForm}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};