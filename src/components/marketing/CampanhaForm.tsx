import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { databaseClient } from "@/lib/database-client";
import { CalendarIcon, Target, Users, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CampanhaMarketing, TemplateComunicacao, FiltroMarketing } from "@/types/comunicacao";
import type { Cliente, Categoria, Origem } from "@/types";

interface CampanhaFormProps {
  campanha?: CampanhaMarketing;
  onSave: (campanha: CampanhaMarketing) => void;
  onCancel: () => void;
  filtrosSegmentacao?: FiltroMarketing;
}

export const CampanhaForm = ({ campanha, onSave, onCancel, filtrosSegmentacao }: CampanhaFormProps) => {
  const [formData, setFormData] = useState<CampanhaMarketing>({
    nome: '',
    descricao: '',
    tipo_comunicacao: 'email',
    filtros: filtrosSegmentacao || {},
    status: 'rascunho',
    total_destinatarios: 0,
    total_enviados: 0,
    total_sucesso: 0,
    total_erro: 0,
    ativo: true,
    ...campanha,
  });

  const [templates, setTemplates] = useState<TemplateComunicacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [agendarEnvio, setAgendarEnvio] = useState(false);
  const [dataAgendamento, setDataAgendamento] = useState<Date>();
  const [horaAgendamento, setHoraAgendamento] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadMetadata();
    if (filtrosSegmentacao) {
      setFormData(prev => ({ ...prev, filtros: filtrosSegmentacao }));
      calcularDestinatarios(filtrosSegmentacao);
    }
  }, [filtrosSegmentacao]);

  const loadMetadata = async () => {
    try {
      const [templatesRes, categoriasRes, origensRes] = await Promise.all([
        databaseClient.getTemplatesComunicacao(),
        databaseClient.getCategorias(),
        databaseClient.getOrigens()
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

  const calcularDestinatarios = async (filtros: FiltroMarketing) => {
    try {
      const countResult = await databaseClient.getClientesSegmentados(filtros);
      const count = countResult.data?.length || 0;

      setFormData(prev => ({ 
        ...prev, 
        total_destinatarios: count || 0,
        filtros 
      }));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao calcular destinatários",
        variant: "destructive",
      });
    }
  };

  const handleTipoComunicacaoChange = (tipo: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tipo_comunicacao: tipo as 'email' | 'sms' | 'whatsapp'
    }));
    calcularDestinatarios(formData.filtros);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let dataFinal = formData;
    
    if (agendarEnvio && dataAgendamento && horaAgendamento) {
      const [hora, minuto] = horaAgendamento.split(':');
      const dataCompleta = new Date(dataAgendamento);
      dataCompleta.setHours(parseInt(hora), parseInt(minuto));
      
      dataFinal = {
        ...formData,
        data_agendamento: dataCompleta.toISOString(),
        status: 'agendada'
      };
    }

    onSave(dataFinal);
  };

  const templatesDoTipo = templates.filter(t => t.tipo === formData.tipo_comunicacao);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {campanha?.id ? 'Editar' : 'Nova'} Campanha de Marketing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome da Campanha</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Promoção Verão 2025"
                required
              />
            </div>
            
            <div>
              <Label>Tipo de Comunicação</Label>
              <Select
                value={formData.tipo_comunicacao}
                onValueChange={handleTipoComunicacaoChange}
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

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao || ''}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o objetivo da campanha..."
              rows={3}
            />
          </div>

          {/* Template */}
          <div>
            <Label>Template de Comunicação</Label>
            <Select
              value={formData.template_id?.toString() || ''}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                template_id: value ? parseInt(value) : undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templatesDoTipo.map((template) => (
                  <SelectItem key={template.id} value={template.id!.toString()}>
                    {template.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {templatesDoTipo.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Nenhum template ativo encontrado para {formData.tipo_comunicacao}
              </p>
            )}
          </div>

          {/* Segmentação */}
          <div>
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Segmentação de Clientes
            </Label>
            <Card className="mt-2">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Categorias */}
                  <div>
                    <Label className="text-sm">Categorias</Label>
                    <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                      {categorias.map((categoria) => (
                        <div key={categoria.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`cat-${categoria.id}`}
                            checked={formData.filtros.categoria_id?.includes(categoria.id!) || false}
                            onChange={(e) => {
                              const current = formData.filtros.categoria_id || [];
                              const newFiltros = {
                                ...formData.filtros,
                                categoria_id: e.target.checked
                                  ? [...current, categoria.id!]
                                  : current.filter(id => id !== categoria.id)
                              };
                              setFormData({ ...formData, filtros: newFiltros });
                              calcularDestinatarios(newFiltros);
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`cat-${categoria.id}`} className="text-sm">
                            {categoria.nome}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Origens */}
                  <div>
                    <Label className="text-sm">Origens</Label>
                    <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                      {origens.map((origem) => (
                        <div key={origem.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`orig-${origem.id}`}
                            checked={formData.filtros.origem_id?.includes(origem.id!) || false}
                            onChange={(e) => {
                              const current = formData.filtros.origem_id || [];
                              const newFiltros = {
                                ...formData.filtros,
                                origem_id: e.target.checked
                                  ? [...current, origem.id!]
                                  : current.filter(id => id !== origem.id)
                              };
                              setFormData({ ...formData, filtros: newFiltros });
                              calcularDestinatarios(newFiltros);
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`orig-${origem.id}`} className="text-sm">
                            {origem.nome}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">
                      {formData.total_destinatarios} destinatários encontrados
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clientes que aceitam {formData.tipo_comunicacao} e atendem aos filtros selecionados
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agendamento */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={agendarEnvio}
                onCheckedChange={setAgendarEnvio}
              />
              <Label>Agendar envio</Label>
            </div>

            {agendarEnvio && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data do Envio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataAgendamento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataAgendamento ? format(dataAgendamento, "dd/MM/yyyy") : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dataAgendamento}
                        onSelect={setDataAgendamento}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Horário do Envio</Label>
                  <Input
                    type="time"
                    value={horaAgendamento}
                    onChange={(e) => setHoraAgendamento(e.target.value)}
                  />
                </div>
              </div>
            )}
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
              {agendarEnvio ? 'Agendar Campanha' : 'Salvar Rascunho'}
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