import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConfiguracaoComunicacao } from "@/types/comunicacao";
import { Send, CheckCircle, XCircle, Clock } from "lucide-react";

interface TesteConfiguracaoProps {
  configuracao: ConfiguracaoComunicacao;
  onClose: () => void;
}

export const TesteConfiguracao = ({ configuracao, onClose }: TesteConfiguracaoProps) => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<'sucesso' | 'erro' | null>(null);
  const [destinatario, setDestinatario] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const { toast } = useToast();

  const executarTeste = async () => {
    if (!destinatario || !mensagem) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o destinatário e a mensagem para teste",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-communication', {
        body: {
          configId: configuracao.id,
          destinatario,
          assunto: configuracao.tipo_servico === 'email' ? assunto : undefined,
          mensagem
        }
      });

      if (error) {
        throw error;
      }

      if (data.sucesso) {
        setResultado('sucesso');
        toast({
          title: "Teste realizado com sucesso!",
          description: `${configuracao.tipo_servico.toUpperCase()} enviado para ${destinatario}`,
        });
      } else {
        setResultado('erro');
        toast({
          title: "Erro no teste",
          description: data.erro || "Falha na configuração ou credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setResultado('erro');
      toast({
        title: "Erro no teste",
        description: error.message || "Falha ao testar a configuração",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholders = () => {
    switch (configuracao.tipo_servico) {
      case 'email':
        return {
          destinatario: 'usuario@exemplo.com',
          assunto: 'Teste de configuração',
          mensagem: 'Esta é uma mensagem de teste para verificar se sua configuração de email está funcionando corretamente.'
        };
      case 'sms':
        return {
          destinatario: '+5511999999999',
          assunto: '',
          mensagem: 'Teste SMS: Sua configuração está funcionando!'
        };
      case 'whatsapp':
        return {
          destinatario: '+5511999999999',
          assunto: '',
          mensagem: 'Olá! Esta é uma mensagem de teste do WhatsApp Business.'
        };
      default:
        return { destinatario: '', assunto: '', mensagem: '' };
    }
  };

  const placeholders = getPlaceholders();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Testar Configuração {configuracao.tipo_servico.toUpperCase()}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Envie uma mensagem de teste para verificar se sua configuração está funcionando
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Destinatário *</Label>
            <Input
              type={configuracao.tipo_servico === 'email' ? 'email' : 'text'}
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              placeholder={placeholders.destinatario}
              disabled={loading}
            />
          </div>

          {configuracao.tipo_servico === 'email' && (
            <div>
              <Label>Assunto</Label>
              <Input
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder={placeholders.assunto}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <Label>Mensagem *</Label>
            <Textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder={placeholders.mensagem}
              className="min-h-[120px]"
              disabled={loading}
            />
          </div>

          {/* Resultado do teste */}
          {resultado && (
            <div className={`p-4 rounded-lg border flex items-center gap-3 ${
              resultado === 'sucesso' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {resultado === 'sucesso' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">
                  {resultado === 'sucesso' ? 'Teste realizado com sucesso!' : 'Falha no teste'}
                </p>
                <p className="text-sm">
                  {resultado === 'sucesso' 
                    ? 'Sua configuração está funcionando corretamente.' 
                    : 'Verifique suas credenciais e configurações.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Informações da configuração */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Configuração atual:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Provider:</strong> {configuracao.provider}</p>
              <p><strong>Tipo:</strong> {configuracao.tipo_servico}</p>
              <p><strong>Status:</strong> {configuracao.ativo ? 'Ativo' : 'Inativo'}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={executarTeste}
              disabled={loading || !destinatario || !mensagem}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Enviando teste...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Teste
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};