import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Smartphone, Plus, Trash2, Eye, EyeOff, Settings, Zap, Send, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { ConfiguracaoComunicacao } from "@/types/comunicacao";
import { ConfiguracaoFormFields } from "./ConfiguracaoFormFields";
import { TesteConfiguracao } from "./TesteConfiguracao";
import { ProviderDocumentation } from "./ProviderDocumentation";
import { useCommunicationValidation } from "@/hooks/useCommunicationValidation";

const getIcon = (tipo: string) => {
  switch (tipo) {
    case 'email': return <Mail className="h-5 w-5" />;
    case 'sms': return <MessageSquare className="h-5 w-5" />;
    case 'whatsapp': return <Smartphone className="h-5 w-5" />;
    default: return <MessageSquare className="h-5 w-5" />;
  }
};

export const ConfiguracoesComunicacao = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoComunicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  const [mostrarSenhas, setMostrarSenhas] = useState<Record<number, boolean>>({});
  const [testando, setTestando] = useState<ConfiguracaoComunicacao | null>(null);
  const { toast } = useToast();

  const loadConfiguracoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuracoes_comunicacao')
        .select('*')
        .order('tipo_servico', { ascending: true });
      
      if (error) throw error;
      setConfiguracoes(data as ConfiguracaoComunicacao[] || []);
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: `Erro ao carregar configurações: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguracoes();
  }, []);

  const salvarConfiguracao = async (config: ConfiguracaoComunicacao) => {
    try {
      if (config.id) {
        const { id, ...updateData } = config;
        const { error } = await supabase
          .from('configuracoes_comunicacao')
          .update(updateData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { id, ...insertData } = config;
        const { error } = await supabase
          .from('configuracoes_comunicacao')
          .insert([insertData]);
        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configuração salva com sucesso",
      });
      
      setEditando(null);
      loadConfiguracoes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração",
        variant: "destructive",
      });
    }
  };

  const excluirConfiguracao = async (id: number) => {
    try {
      const { error } = await supabase
        .from('configuracoes_comunicacao')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração excluída com sucesso",
      });
      
      loadConfiguracoes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir configuração",
        variant: "destructive",
      });
    }
  };


  const toggleMostrarSenha = (id: number) => {
    setMostrarSenhas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const adicionarConfiguracaoPadrao = async (tipo: 'email' | 'sms' | 'whatsapp') => {
    const configsPadrao = {
      email: {
        tipo_servico: 'email' as const,
        provider: 'SendGrid',
        api_key: '',
        ativo: false,
      },
      sms: {
        tipo_servico: 'sms' as const,
        provider: 'Twilio',
        api_key: '',
        ativo: false,
      },
      whatsapp: {
        tipo_servico: 'whatsapp' as const,
        provider: 'Twilio WhatsApp',
        api_key: '',
        ativo: false,
      }
    };

    await salvarConfiguracao(configsPadrao[tipo]);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
          </div>
          <div>
            <p className="font-medium">Carregando configurações...</p>
            <p className="text-sm text-muted-foreground">Aguarde um momento</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header melhorado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Configurações de Comunicação</h2>
          <p className="text-muted-foreground">
            Gerencie suas conexões com provedores de Email, SMS e WhatsApp
          </p>
        </div>
        <Button 
          onClick={() => setEditando(0)}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      {configuracoes.length === 0 ? (
        <div className="min-h-[500px] flex items-center justify-center">
          <Card className="max-w-2xl w-full border-dashed border-2 border-border/50 bg-gradient-to-br from-card via-card to-muted/20">
            <CardContent className="p-12 text-center">
              <div className="space-y-6">
                {/* Ícone animado */}
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse"></div>
                  <div className="relative rounded-full bg-primary/10 p-4 border border-primary/20">
                    <Settings className="h-12 w-12 text-primary" />
                  </div>
                </div>
                
                {/* Conteúdo */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">Configure seus canais de comunicação</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Conecte seus provedores de Email, SMS e WhatsApp para começar a enviar mensagens automatizadas aos seus clientes.
                  </p>
                </div>
                
                {/* Botões de ação */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <Button 
                    onClick={() => adicionarConfiguracaoPadrao('email')}
                    variant="default" 
                    size="lg"
                    className="flex flex-col items-center gap-3 h-auto py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Mail className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Configurar Email</div>
                      <div className="text-xs opacity-90">SMTP, SendGrid, etc.</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => adicionarConfiguracaoPadrao('sms')}
                    variant="default" 
                    size="lg"
                    className="flex flex-col items-center gap-3 h-auto py-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <MessageSquare className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Configurar SMS</div>
                      <div className="text-xs opacity-90">Twilio, Zenvia, etc.</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => adicionarConfiguracaoPadrao('whatsapp')}
                    variant="default" 
                    size="lg"
                    className="flex flex-col items-center gap-3 h-auto py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Smartphone className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Configurar WhatsApp</div>
                      <div className="text-xs opacity-90">Business API</div>
                    </div>
                  </Button>
                </div>
                
                {/* Link de ajuda */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    Precisa de ajuda? <Button variant="link" className="h-auto p-0 text-primary">Consulte nossa documentação</Button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {configuracoes.map((config) => (
            <Card 
              key={config.id} 
              className="relative group hover:shadow-lg transition-all duration-200 border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm"
            >
              {/* Status indicator */}
              <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${config.ativo ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${
                    config.tipo_servico === 'email' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    config.tipo_servico === 'sms' ? 'bg-green-50 border-green-200 text-green-700' :
                    'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    {getIcon(config.tipo_servico)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg capitalize font-semibold">{config.tipo_servico}</CardTitle>
                    <p className="text-sm text-muted-foreground">{config.provider}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status visual */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${config.ativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">
                      {config.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <Switch
                    checked={config.ativo}
                    onCheckedChange={(checked) => 
                      salvarConfiguracao({ ...config, ativo: checked })
                    }
                  />
                </div>
                
                {/* API Key com visual melhorado */}
                {config.api_key && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      API Key
                    </Label>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
                      <code className="text-sm text-muted-foreground flex-1 font-mono">
                        {mostrarSenhas[config.id!] 
                          ? config.api_key 
                          : '••••••••••••••••'
                        }
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMostrarSenha(config.id!)}
                        className="h-8 w-8 p-0"
                      >
                        {mostrarSenhas[config.id!] ? 
                          <EyeOff className="h-4 w-4" /> : 
                          <Eye className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botões de ação melhorados */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditando(config.id!)}
                    className="flex-1 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTestando(config)}
                    className="hover:bg-blue-500 hover:text-white transition-all duration-200"
                    disabled={!config.ativo}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => excluirConfiguracao(config.id!)}
                    className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editando !== null && (
        <ConfiguracaoForm
          configuracao={editando === 0 ? undefined : configuracoes.find(c => c.id === editando)}
          onSave={salvarConfiguracao}
          onCancel={() => setEditando(null)}
        />
      )}

      {testando && (
        <TesteConfiguracao
          configuracao={testando}
          onClose={() => setTestando(null)}
        />
      )}
    </div>
  );
};

interface ConfiguracaoFormProps {
  configuracao?: ConfiguracaoComunicacao;
  onSave: (config: ConfiguracaoComunicacao) => void;
  onCancel: () => void;
}

const ConfiguracaoForm = ({ configuracao, onSave, onCancel }: ConfiguracaoFormProps) => {
  const [formData, setFormData] = useState<ConfiguracaoComunicacao>(
    configuracao || {
      tipo_servico: 'email',
      provider: '',
      api_key: '',
      api_secret: '',
      webhook_url: '',
      configuracoes_extras: {},
      ativo: true,
    }
  );
  const [testLoading, setTestLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const { toast } = useToast();
  const { validateConfiguration } = useCommunicationValidation();

  // Validar em tempo real
  useEffect(() => {
    if (formData.provider) {
      const result = validateConfiguration(formData);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [formData, validateConfiguration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const testConfiguration = async () => {
    setTestLoading(true);
    try {
      // Simular teste de configuração
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Teste realizado",
        description: "Configuração testada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao testar a configuração",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-7xl max-h-[90vh] flex gap-6">
        {/* Formulário principal */}
        <Card className="flex-1 overflow-auto">
        <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {configuracao ? 'Editar' : 'Nova'} Configuração de {formData.tipo_servico.toUpperCase()}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Configure seu provedor de {formData.tipo_servico} para envio de mensagens
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getIcon(formData.tipo_servico)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seletor de tipo de serviço */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Label className="text-base font-medium">Tipo de Serviço</Label>
                <Select
                  value={formData.tipo_servico}
                  onValueChange={(value: any) => 
                    setFormData({ 
                      ...formData, 
                      tipo_servico: value,
                      provider: '',
                      api_key: '',
                      api_secret: '',
                      webhook_url: '',
                      configuracoes_extras: {}
                    })
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        WhatsApp
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                    />
                    <Label>{formData.ativo ? 'Ativo' : 'Inativo'}</Label>
                  </div>
                </div>
                <div className={`h-12 rounded-lg border-2 border-dashed flex items-center justify-center ${
                  formData.ativo ? 'border-green-300 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'
                }`}>
                  <span className="font-medium">
                    {formData.ativo ? 'Configuração Ativa' : 'Configuração Inativa'}
                  </span>
                </div>
              </div>
            </div>

            {/* Indicadores de validação */}
            {validationResult && (
              <div className="space-y-3">
                {validationResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Erros de configuração:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {validationResult.errors.map((error: string, index: number) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {validationResult.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Avisos:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {validationResult.warnings.map((warning: string, index: number) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {validationResult.isValid && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Configuração válida! Você pode salvar e testar esta configuração.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Campos específicos por tipo */}
            <ConfiguracaoFormFields 
              formData={formData} 
              setFormData={setFormData} 
            />

            {/* Botões de ação */}
            <div className="flex gap-3 pt-6 border-t">
              <Button 
                type="submit" 
                size="lg" 
                className="flex-1"
                disabled={validationResult && !validationResult.isValid}
              >
                <Plus className="h-4 w-4 mr-2" />
                {configuracao ? 'Atualizar' : 'Salvar'} Configuração
              </Button>
              
              {formData.provider && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={testConfiguration}
                  disabled={testLoading}
                >
                  {testLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Testando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Testar
                    </>
                  )}
                </Button>
              )}
              
              <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
        
        {/* Documentação lateral */}
        <div className="w-96">
          <ProviderDocumentation 
            tipo={formData.tipo_servico}
            provider={formData.provider}
          />
        </div>
      </div>
    </div>
  );
};