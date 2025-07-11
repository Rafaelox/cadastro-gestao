import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { db } from "@/lib/database";
import type { FormaPagamento } from "@/types";
import { toast } from "@/hooks/use-toast";

export const FormasPagamentoList = () => {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<FormaPagamento>>({
    nome: '',
    descricao: '',
    ativo: true,
    ordem: 1
  });

  useEffect(() => {
    loadFormasPagamento();
  }, []);

  const loadFormasPagamento = async () => {
    try {
      setIsLoading(true);
      const data = await db.getFormasPagamento();
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as formas de pagamento."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome?.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome é obrigatório."
      });
      return;
    }

    try {
      if (editingId) {
        await db.updateFormaPagamento(editingId, formData);
        toast({
          title: "Sucesso",
          description: "Forma de pagamento atualizada com sucesso!"
        });
      } else {
        await db.createFormaPagamento(formData as Omit<FormaPagamento, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: "Sucesso",
          description: "Forma de pagamento criada com sucesso!"
        });
      }
      
      await loadFormasPagamento();
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar forma de pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar a forma de pagamento."
      });
    }
  };

  const handleEdit = (formaPagamento: FormaPagamento) => {
    setFormData(formaPagamento);
    setEditingId(formaPagamento.id!);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
      return;
    }

    try {
      await db.deleteFormaPagamento(id);
      toast({
        title: "Sucesso",
        description: "Forma de pagamento excluída com sucesso!"
      });
      await loadFormasPagamento();
    } catch (error) {
      console.error('Erro ao excluir forma de pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir a forma de pagamento."
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: '',
      descricao: '',
      ativo: true,
      ordem: 1
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Carregando formas de pagamento...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Formas de Pagamento</h2>
          <p className="text-muted-foreground">
            Gerencie as formas de pagamento disponíveis no sistema
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm || editingId !== null}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Forma de Pagamento
        </Button>
      </div>

      {(showForm || editingId !== null) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: PIX, Cartão de Crédito"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ordem">Ordem</Label>
                  <Input
                    id="ordem"
                    type="number"
                    min="1"
                    value={formData.ordem || 1}
                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da forma de pagamento"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <Label htmlFor="ativo">Ativo</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {formasPagamento.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Nenhuma forma de pagamento encontrada.
              </p>
            </CardContent>
          </Card>
        ) : (
          formasPagamento.map((formaPagamento) => (
            <Card key={formaPagamento.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{formaPagamento.nome}</h3>
                      <Badge variant={formaPagamento.ativo ? "default" : "secondary"}>
                        {formaPagamento.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">
                        Ordem: {formaPagamento.ordem}
                      </Badge>
                    </div>
                    {formaPagamento.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formaPagamento.descricao}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(formaPagamento)}
                      disabled={editingId !== null || showForm}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(formaPagamento.id!)}
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