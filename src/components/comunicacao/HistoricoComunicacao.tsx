import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Smartphone, Search, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Comunicacao } from "@/types/comunicacao";
import { format } from "date-fns";

export const HistoricoComunicacao = () => {
  const [comunicacoes, setComunicacoes] = useState<Comunicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    status: 'todos',
    cliente: '',
  });
  const { toast } = useToast();

  const loadComunicacoes = async () => {
    try {
      let query = supabase
        .from('comunicacoes')
        .select(`
          *,
          clientes(nome),
          templates_comunicacao(nome)
        `)
        .order('data_envio', { ascending: false })
        .limit(100);

      if (filtros.tipo && filtros.tipo !== 'todos') {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros.status && filtros.status !== 'todos') {
        query = query.eq('status', filtros.status);
      }
      if (filtros.cliente) {
        query = query.ilike('clientes.nome', `%${filtros.cliente}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComunicacoes(data as Comunicacao[] || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de comunicações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComunicacoes();
  }, [filtros]);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'whatsapp': return <Smartphone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado':
      case 'entregue':
      case 'lido':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'erro':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'enviando':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'entregue': return 'bg-green-100 text-green-800';
      case 'lido': return 'bg-emerald-100 text-emerald-800';
      case 'erro': return 'bg-red-100 text-red-800';
      case 'enviando': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
    return <div>Carregando histórico...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Histórico de Comunicações</h2>
        <p className="text-muted-foreground">
          Visualize todas as comunicações enviadas
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                value={filtros.tipo}
                onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={filtros.status}
                onValueChange={(value) => setFiltros({ ...filtros, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="enviando">Enviando</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="lido">Lido</SelectItem>
                  <SelectItem value="erro">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente..."
                value={filtros.cliente}
                onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de comunicações */}
      {comunicacoes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma comunicação encontrada</h3>
            <p className="text-muted-foreground text-center">
              Não há comunicações que correspondam aos filtros selecionados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comunicacoes.map((comunicacao) => (
            <Card key={comunicacao.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2 mt-1">
                      {getIcon(comunicacao.tipo)}
                      {getStatusIcon(comunicacao.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTipoColor(comunicacao.tipo)}>
                          {comunicacao.tipo.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(comunicacao.status)}>
                          {comunicacao.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(comunicacao.data_envio), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium">
                          Para: {(comunicacao as any).clientes?.nome || 'Cliente não encontrado'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Destinatário: {comunicacao.destinatario}
                        </p>
                        {comunicacao.assunto && (
                          <p className="text-sm">
                            <span className="font-medium">Assunto:</span> {comunicacao.assunto}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {comunicacao.conteudo}
                        </p>
                        {comunicacao.erro_detalhe && (
                          <p className="text-sm text-red-600">
                            <span className="font-medium">Erro:</span> {comunicacao.erro_detalhe}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                    {comunicacao.custo && comunicacao.custo > 0 && (
                      <span>Custo: R$ {comunicacao.custo.toFixed(4)}</span>
                    )}
                    {(comunicacao as any).templates_comunicacao && (
                      <span>Template: {(comunicacao as any).templates_comunicacao.nome}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};