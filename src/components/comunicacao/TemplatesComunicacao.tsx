import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Smartphone, Plus, Edit, Trash2, Eye } from "lucide-react";
import { TemplateComunicacao } from "@/types/comunicacao";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const TemplatesComunicacao = () => {
  const [templates, setTemplates] = useState<TemplateComunicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<TemplateComunicacao | null>(null);
  const [visualizando, setVisualizando] = useState<TemplateComunicacao | null>(null);
  const { toast } = useToast();

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates_comunicacao')
        .select('*')
        .order('tipo', { ascending: true });

      if (error) throw error;
      setTemplates(data as TemplateComunicacao[] || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const salvarTemplate = async (template: TemplateComunicacao) => {
    try {
      if (template.id) {
        const { id, ...updateData } = template;
        const { error } = await supabase
          .from('templates_comunicacao')
          .update(updateData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { id, ...insertData } = template;
        const { error } = await supabase
          .from('templates_comunicacao')
          .insert([insertData]);
        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Template salvo com sucesso",
      });
      
      setEditando(null);
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive",
      });
    }
  };

  const excluirTemplate = async (id: number) => {
    try {
      const { error } = await supabase
        .from('templates_comunicacao')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template excluído com sucesso",
      });
      
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir template",
        variant: "destructive",
      });
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'whatsapp': return <Smartphone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-green-100 text-green-800';
      case 'whatsapp': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Carregando templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Templates de Comunicação</h2>
        <Button onClick={() => setEditando({
          nome: '',
          tipo: 'email',
          conteudo: '',
          ativo: true,
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getIcon(template.tipo)}
                  <Badge className={getTipoColor(template.tipo)}>
                    {template.tipo.toUpperCase()}
                  </Badge>
                </div>
                <Switch
                  checked={template.ativo}
                  onCheckedChange={(checked) => 
                    salvarTemplate({ ...template, ativo: checked })
                  }
                />
              </div>
              <CardTitle className="text-lg">{template.nome}</CardTitle>
              {template.assunto && (
                <p className="text-sm text-muted-foreground">
                  Assunto: {template.assunto}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.conteudo}
                </p>
              </div>

              {template.variaveis && Object.keys(template.variaveis).length > 0 && (
                <div>
                  <Label className="text-xs font-medium">Variáveis:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.keys(template.variaveis).map((variavel) => (
                      <Badge key={variavel} variant="outline" className="text-xs">
                        {`{${variavel}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{template.nome}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {template.assunto && (
                        <div>
                          <Label>Assunto:</Label>
                          <p className="text-sm">{template.assunto}</p>
                        </div>
                      )}
                      <div>
                        <Label>Conteúdo:</Label>
                        <div className="whitespace-pre-wrap text-sm p-3 bg-muted rounded">
                          {template.conteudo}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditando(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => excluirTemplate(template.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editando && (
        <TemplateForm
          template={editando}
          onSave={salvarTemplate}
          onCancel={() => setEditando(null)}
        />
      )}
    </div>
  );
};

interface TemplateFormProps {
  template: TemplateComunicacao;
  onSave: (template: TemplateComunicacao) => void;
  onCancel: () => void;
}

const TemplateForm = ({ template, onSave, onCancel }: TemplateFormProps) => {
  const [formData, setFormData] = useState<TemplateComunicacao>(template);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const variaveisComuns = [
    '{nome}', '{email}', '{telefone}', '{data}', '{hora}', 
    '{servico}', '{consultor}', '{valor}', '{empresa}'
  ];

  const inserirVariavel = (variavel: string) => {
    const textarea = document.getElementById('conteudo') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.conteudo;
      const newText = text.substring(0, start) + variavel + text.substring(end);
      setFormData({ ...formData, conteudo: newText });
      
      // Restaurar posição do cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variavel.length;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {template.id ? 'Editar' : 'Novo'} Template
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome do Template</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Boas-vindas, Lembrete de consulta"
                required
              />
            </div>
            
            <div>
              <Label>Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: any) => 
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.tipo === 'email' && (
            <div>
              <Label>Assunto</Label>
              <Input
                value={formData.assunto || ''}
                onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                placeholder="Assunto do email"
              />
            </div>
          )}

          <div>
            <Label>Conteúdo</Label>
            <Textarea
              id="conteudo"
              value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
              placeholder="Digite o conteúdo da mensagem..."
              rows={6}
              required
            />
            <div className="mt-2">
              <Label className="text-sm">Variáveis disponíveis:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {variaveisComuns.map((variavel) => (
                  <Button
                    key={variavel}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => inserirVariavel(variavel)}
                  >
                    {variavel}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label>Ativo</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">Salvar Template</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};