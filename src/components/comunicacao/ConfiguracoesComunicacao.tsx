import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Smartphone, Plus } from "lucide-react";
import { ConfiguracaoComunicacao } from "@/types/comunicacao";
import { ConfigurationCard } from "./ConfigurationCard";
import { EmptyState } from "./EmptyState";
import { ConfigurationForm } from "./ConfigurationForm";
import { TesteConfiguracao } from "./TesteConfiguracao";

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
      {/* Header */}
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
        <EmptyState onAddConfiguration={adicionarConfiguracaoPadrao} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {configuracoes.map((config) => (
            <ConfigurationCard
              key={config.id}
              config={config}
              showPassword={mostrarSenhas[config.id!] || false}
              onTogglePassword={() => toggleMostrarSenha(config.id!)}
              onEdit={() => setEditando(config.id!)}
              onTest={() => setTestando(config)}
              onDelete={() => excluirConfiguracao(config.id!)}
              onToggleActive={(checked) => 
                salvarConfiguracao({ ...config, ativo: checked })
              }
              getIcon={getIcon}
            />
          ))}
        </div>
      )}

      {editando !== null && (
        <ConfigurationForm
          configuracao={editando === 0 ? undefined : configuracoes.find(c => c.id === editando)}
          onSave={salvarConfiguracao}
          onCancel={() => setEditando(null)}
          getIcon={getIcon}
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