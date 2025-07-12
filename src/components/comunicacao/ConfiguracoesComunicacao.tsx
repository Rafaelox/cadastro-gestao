import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Smartphone, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { ConfiguracaoComunicacao } from "@/types/comunicacao";

export const ConfiguracoesComunicacao = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoComunicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  const [mostrarSenhas, setMostrarSenhas] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const loadConfiguracoes = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_comunicacao')
        .select('*')
        .order('tipo_servico', { ascending: true });

      if (error) throw error;
      setConfiguracoes(data as ConfiguracaoComunicacao[] || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
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

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'email': return <Mail className="h-5 w-5" />;
      case 'sms': return <MessageSquare className="h-5 w-5" />;
      case 'whatsapp': return <Smartphone className="h-5 w-5" />;
      default: return <MessageSquare className="h-5 w-5" />;
    }
  };

  const toggleMostrarSenha = (id: number) => {
    setMostrarSenhas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Configurações de Comunicação</h2>
        <Button onClick={() => setEditando(0)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {configuracoes.map((config) => (
          <Card key={config.id} className="relative">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center gap-2">
                {getIcon(config.tipo_servico)}
                <CardTitle className="text-lg capitalize">{config.tipo_servico}</CardTitle>
              </div>
              <div className="ml-auto flex gap-2">
                <Switch
                  checked={config.ativo}
                  onCheckedChange={(checked) => 
                    salvarConfiguracao({ ...config, ativo: checked })
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Provider</Label>
                <p className="text-sm text-muted-foreground">{config.provider}</p>
              </div>
              
              {config.api_key && (
                <div>
                  <Label className="text-sm font-medium">API Key</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground flex-1">
                      {mostrarSenhas[config.id!] 
                        ? config.api_key 
                        : '••••••••••••••••'
                      }
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMostrarSenha(config.id!)}
                    >
                      {mostrarSenhas[config.id!] ? 
                        <EyeOff className="h-4 w-4" /> : 
                        <Eye className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditando(config.id!)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => excluirConfiguracao(config.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editando !== null && (
        <ConfiguracaoForm
          configuracao={editando === 0 ? undefined : configuracoes.find(c => c.id === editando)}
          onSave={salvarConfiguracao}
          onCancel={() => setEditando(null)}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {configuracao ? 'Editar' : 'Nova'} Configuração
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Serviço</Label>
              <Select
                value={formData.tipo_servico}
                onValueChange={(value: any) => 
                  setFormData({ ...formData, tipo_servico: value })
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
            
            <div>
              <Label>Provider</Label>
              <Input
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Ex: SendGrid, Twilio"
                required
              />
            </div>
          </div>

          <div>
            <Label>API Key</Label>
            <Input
              type="password"
              value={formData.api_key || ''}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              placeholder="Sua API Key"
            />
          </div>

          <div>
            <Label>API Secret (opcional)</Label>
            <Input
              type="password"
              value={formData.api_secret || ''}
              onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
              placeholder="Sua API Secret"
            />
          </div>

          <div>
            <Label>Webhook URL (opcional)</Label>
            <Input
              value={formData.webhook_url || ''}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              placeholder="https://seu-webhook.com"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label>Ativo</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">Salvar</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};