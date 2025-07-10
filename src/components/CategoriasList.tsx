import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { db, Categoria } from "@/lib/database";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

export const CategoriasList = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Categoria>>({
    nome: '',
    descricao: '',
    ativo: true
  });


  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    setIsLoading(true);
    try {
      const data = await db.getCategorias();
      setCategorias(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias",
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
        description: "O nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        await db.updateCategoria(editingId, formData);
        toast({
          title: "Categoria atualizada",
          description: "Categoria atualizada com sucesso",
        });
        setEditingId(null);
      } else {
        await db.createCategoria(formData as Omit<Categoria, 'id'>);
        toast({
          title: "Categoria criada",
          description: "Nova categoria criada com sucesso",
        });
        setShowForm(false);
      }
      
      setFormData({ nome: '', descricao: '', ativo: true });
      loadCategorias();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria.id!);
    setFormData(categoria);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      await db.deleteCategoria(id);
      toast({
        title: "Categoria excluída",
        description: "Categoria removida com sucesso",
      });
      loadCategorias();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a categoria",
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
                Categorias
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie as categorias de clientes
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
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
                    Nome da Categoria <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome da categoria"
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
                    placeholder="Descrição da categoria"
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

      {/* Lista de Categorias */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Carregando categorias...</p>
            </CardContent>
          </Card>
        ) : categorias.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
            </CardContent>
          </Card>
        ) : (
          categorias.map((categoria) => (
            <Card key={categoria.id} className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {categoria.nome}
                      </h3>
                      <Badge 
                        variant={categoria.ativo ? "default" : "secondary"}
                        className={categoria.ativo ? "bg-success text-white" : ""}
                      >
                        {categoria.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    
                    {categoria.descricao && (
                      <p className="text-sm text-muted-foreground">
                        {categoria.descricao}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(categoria)}
                      className="border-border hover:bg-muted/50"
                      disabled={editingId !== null || showForm}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(categoria.id!)}
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