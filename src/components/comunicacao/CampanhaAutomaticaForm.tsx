import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Calendar, Gift, Clock } from "lucide-react";
import { CampanhaAutomatica, TemplateComunicacao, FiltroMarketing } from "@/types/comunicacao";
import type { Categoria, Origem } from "@/types";

interface CampanhaAutomaticaFormProps {
  campanha?: CampanhaAutomatica;
  onSave: (campanha: CampanhaAutomatica) => void;
  onCancel: () => void;
}

export const CampanhaAutomaticaForm = ({ campanha, onSave, onCancel }: CampanhaAutomaticaFormProps) => {
  const [formData, setFormData] = useState<CampanhaAutomatica>({
    nome: '',
    tipo_trigger: 'aniversario',
    template_id: 0,
    dias_antes: 0,
    dias_depois: 0,
    filtros: {},
    ativo: true,
    ...campanha,
  });

  const [templates, setTemplates] = useState<TemplateComunicacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [origens, setOrigens] = useState<Origem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [templatesRes, categoriasRes, origensRes] = await Promise.all([
        supabase
          .from('templates_comunicacao')
          .select('*')
          .eq('ativo', true)
          .order('nome'),
        supabase
          .from('categorias')
          .select('*')
          .eq('ativo', true)
          .order('nome'),
        supabase
          .from('origens')
          .select('*')
          .eq('ativo', true)
          .order('nome')
      ]);

      if (templatesRes.error) throw templatesRes.error;
      if (categoriasRes.error) throw categoriasRes.error;
      if (origensRes.error) throw origensRes.error;

      setTemplates(templatesRes.data as TemplateComunicacao[] || []);
      setCategorias(categoriasRes.data || []);
      setOrigens(origensRes.data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados necessários",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getTriggerIcon = (tipo: string) => {
    switch (tipo) {
      case 'aniversario': return <Gift className="h-4 w-4" />;
      case 'primeira_compra': return <Calendar className="h-4 w-4" />;
      case 'sem_movimento': return <Clock className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (tipo: string) => {
    switch (tipo) {
      case 'aniversario': return 'Aniversário do Cliente';
      case 'primeira_compra': return 'Primeira Compra';
      case 'sem_movimento': return 'Sem Movimento';
      default: return tipo;
    }
  };

  const getTriggerDescription = (tipo: string) => {
    switch (tipo) {
      case 'aniversario': 
        return 'Enviar mensagem automática no aniversário do cliente ou dias antes/depois';
      case 'primeira_compra': 
        return 'Enviar mensagem de boas-vindas após a primeira compra do cliente';
      case 'sem_movimento': 
        return 'Enviar mensagem para clientes que não realizaram compras há um tempo';
      default: 
        return '';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          {campanha?.id ? 'Editar' : 'Nova'} Campanha Automática
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <Label>Nome da Campanha</Label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Parabéns Aniversário, Boas-vindas"
              required
            />
          </div>

          {/* Tipo de Trigger */}
          <div>
            <Label>Evento que Dispara a Campanha</Label>
            <div className="grid gap-3 mt-2">
              {['aniversario', 'primeira_compra', 'sem_movimento'].map((tipo) => (
                <Card 
                  key={tipo}
                  className={`cursor-pointer transition-colors ${
                    formData.tipo_trigger === tipo 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setFormData({ 
                    ...formData, 
                    tipo_trigger: tipo as 'aniversario' | 'primeira_compra' | 'sem_movimento'
                  })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <input
                          type="radio"
                          name="tipo_trigger"
                          value={tipo}
                          checked={formData.tipo_trigger === tipo}
                        onChange={() => setFormData({ 
                          ...formData, 
                          tipo_trigger: tipo as 'aniversario' | 'primeira_compra' | 'sem_movimento'
                        })}
                          className="sr-only"
                        />
                        {getTriggerIcon(tipo)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{getTriggerLabel(tipo)}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getTriggerDescription(tipo)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Configurações de Timing */}
          {(formData.tipo_trigger === 'aniversario' || formData.tipo_trigger === 'sem_movimento') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.tipo_trigger === 'aniversario' && (
                <>
                  <div>
                    <Label>Dias Antes do Aniversário</Label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={formData.dias_antes || 0}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        dias_antes: parseInt(e.target.value) || 0 
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      0 = no dia do aniversário
                    </p>
                  </div>

                  <div>
                    <Label>Dias Depois do Aniversário</Label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={formData.dias_depois || 0}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        dias_depois: parseInt(e.target.value) || 0 
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Para mensagens de follow-up
                    </p>
                  </div>
                </>
              )}

              {formData.tipo_trigger === 'sem_movimento' && (
                <div>
                  <Label>Dias Sem Movimento</Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.dias_antes || 30}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      dias_antes: parseInt(e.target.value) || 30 
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Quantos dias sem compras para disparar
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Template */}
          <div>
            <Label>Template de Comunicação</Label>
            <Select
              value={formData.template_id?.toString() || ''}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                template_id: parseInt(value) 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id!.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{template.tipo}</span>
                      - {template.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtros Adicionais */}
          <div>
            <Label>Filtros Adicionais (Opcional)</Label>
            <Card className="mt-2">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Categorias */}
                  <div>
                    <Label className="text-sm">Apenas Categorias</Label>
                    <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                      {categorias.map((categoria) => (
                        <div key={categoria.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`auto-cat-${categoria.id}`}
                            checked={(formData.filtros as FiltroMarketing)?.categoria_id?.includes(categoria.id!) || false}
                            onCheckedChange={(checked) => {
                              const current = (formData.filtros as FiltroMarketing)?.categoria_id || [];
                              const newFiltros = {
                                ...formData.filtros,
                                categoria_id: checked
                                  ? [...current, categoria.id!]
                                  : current.filter(id => id !== categoria.id)
                              };
                              setFormData({ ...formData, filtros: newFiltros });
                            }}
                          />
                          <Label htmlFor={`auto-cat-${categoria.id}`} className="text-sm">
                            {categoria.nome}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Origens */}
                  <div>
                    <Label className="text-sm">Apenas Origens</Label>
                    <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                      {origens.map((origem) => (
                        <div key={origem.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`auto-orig-${origem.id}`}
                            checked={(formData.filtros as FiltroMarketing)?.origem_id?.includes(origem.id!) || false}
                            onCheckedChange={(checked) => {
                              const current = (formData.filtros as FiltroMarketing)?.origem_id || [];
                              const newFiltros = {
                                ...formData.filtros,
                                origem_id: checked
                                  ? [...current, origem.id!]
                                  : current.filter(id => id !== origem.id)
                              };
                              setFormData({ ...formData, filtros: newFiltros });
                            }}
                          />
                          <Label htmlFor={`auto-orig-${origem.id}`} className="text-sm">
                            {origem.nome}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  Se nenhum filtro for selecionado, a campanha será aplicada a todos os clientes elegíveis
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label>Campanha ativa</Label>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              Salvar Campanha Automática
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};