import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { databaseClient } from '@/lib/database-client';
import { useToast } from '@/hooks/use-toast';
import { TipoRecibo, ReciboFormData } from '@/types/recibo';
import { Receipt, FileText } from 'lucide-react';

const reciboSchema = z.object({
  tipo_recibo_id: z.number().min(1, 'Tipo de recibo é obrigatório'),
  pagamento_id: z.number().optional(),
  cliente_id: z.number().min(1, 'Cliente é obrigatório'),
  consultor_id: z.number().optional(),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  observacoes: z.string().optional(),
});

interface Cliente {
  id: number;
  nome: string;
}

interface Consultor {
  id: number;
  nome: string;
}

interface Pagamento {
  id: number;
  valor: number;
  valor_original: number;
  cliente_id: number;
  consultor_id: number;
  data_pagamento: string;
  parcelas?: Parcela[];
}

interface Parcela {
  id: number;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  status: string;
}

export function ReciboForm() {
  const [loading, setLoading] = useState(false);
  const [tiposRecibo, setTiposRecibo] = useState<TipoRecibo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null);
  const { toast } = useToast();

  const form = useForm<ReciboFormData>({
    resolver: zodResolver(reciboSchema),
    defaultValues: {
      descricao: '',
      observacoes: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Iniciando carregamento de dados...');
      
      const [tiposResult, clientesResult, consultoresResult, pagamentosResult] = await Promise.all([
        databaseClient.from('tipos_recibo').select('*').eq('ativo', true),
        databaseClient.from('clientes').select('id, nome').eq('ativo', true),
        databaseClient.from('consultores').select('id, nome').eq('ativo', true),
        databaseClient.from('pagamentos').select(`
          id, 
          valor, 
          valor_original, 
          cliente_id, 
          consultor_id, 
          data_pagamento,
          parcelas (
            id,
            numero_parcela,
            valor_parcela,
            data_vencimento,
            status
          )
        `),
      ]);

      console.log('Tipos de recibo carregados:', tiposResult);
      console.log('Clientes carregados:', clientesResult.data);
      console.log('Consultores carregados:', consultoresResult.data);
      console.log('Pagamentos carregados:', pagamentosResult.data);

      if (tiposResult.error) {
        console.error('Erro ao carregar tipos de recibo:', tiposResult.error);
      } else if (tiposResult.data) {
        console.log('Definindo tipos de recibo:', tiposResult.data);
        setTiposRecibo(tiposResult.data as TipoRecibo[]);
      }

      if (clientesResult.data) setClientes(clientesResult.data);
      if (consultoresResult.data) setConsultores(consultoresResult.data);
      if (pagamentosResult.data) setPagamentos(pagamentosResult.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados necessários',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: ReciboFormData) => {
    setLoading(true);
    try {
      // Buscar dados da empresa ativa usando a função do banco
      const { data: empresaResult, error: empresaError } = await databaseClient
        .rpc('get_empresa_ativa');

      if (empresaError) throw empresaError;

      const empresa = empresaResult?.[0];
      if (!empresa) {
        toast({
          title: 'Erro',
          description: 'Configure uma empresa ativa antes de gerar recibos. Acesse as Configurações > Empresas.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Empresa ativa encontrada:', empresa);

      // Buscar dados do cliente
      const { data: cliente } = await databaseClient
        .from('clientes')
        .select('*')
        .eq('id', data.cliente_id)
        .single();

      // Gerar número do recibo
      const { data: numeroRecibo } = await databaseClient
        .rpc('generate_numero_recibo');

      // Criar recibo
      const reciboData = {
        numero_recibo: numeroRecibo,
        tipo_recibo_id: data.tipo_recibo_id,
        pagamento_id: data.pagamento_id || null,
        cliente_id: data.cliente_id,
        consultor_id: data.consultor_id || null,
        valor: data.valor,
        descricao: data.descricao,
        observacoes: data.observacoes || null,
        dados_empresa: empresa,
        dados_cliente: cliente,
      };

      const { data: recibo, error } = await databaseClient
        .from('recibos')
        .insert(reciboData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Recibo ${numeroRecibo} gerado com sucesso`,
      });

      // Resetar formulário
      form.reset();
      
      // Gerar PDF
      await generateReciboPDF(recibo);
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar recibo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReciboPDF = async (recibo: any) => {
    try {
      // Buscar informações das parcelas se houver pagamento associado
      let parcelasInfo = null;
      if (recibo.pagamento_id) {
        const { data: parcelas } = await databaseClient
          .from('parcelas')
          .select('*')
          .eq('pagamento_id', recibo.pagamento_id)
          .order('numero_parcela');
        
        if (parcelas && parcelas.length > 0) {
          parcelasInfo = parcelas;
        }
      }

      const { generateReciboNormalPDF, generateReciboDoacaoPDF } = await import('./ReciboPDFGenerator');
      
      const tipoRecibo = tiposRecibo.find(t => t.id === recibo.tipo_recibo_id);
      
      // Adicionar informações das parcelas ao recibo
      const reciboComParcelas = {
        ...recibo,
        parcelas: parcelasInfo
      };
      
      if (tipoRecibo?.template === 'doacao') {
        generateReciboDoacaoPDF(reciboComParcelas);
      } else {
        generateReciboNormalPDF(reciboComParcelas);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar PDF do recibo',
        variant: 'destructive',
      });
    }
  };

  const handlePagamentoChange = (pagamentoId: string) => {
    const pagamento = pagamentos.find(p => p.id === parseInt(pagamentoId));
    if (pagamento) {
      setPagamentoSelecionado(pagamento);
      form.setValue('cliente_id', pagamento.cliente_id);
      form.setValue('consultor_id', pagamento.consultor_id);
      // Usar valor_original se disponível, senão usar valor
      form.setValue('valor', pagamento.valor_original || pagamento.valor);
      form.setValue('pagamento_id', pagamento.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Gerar Recibo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_recibo">Tipo de Recibo *</Label>
              <Select
                value={form.watch('tipo_recibo_id')?.toString() || ''}
                onValueChange={(value) => {
                  console.log('Selecionando tipo de recibo:', value);
                  form.setValue('tipo_recibo_id', parseInt(value));
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {tiposRecibo.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhum tipo de recibo disponível
                    </div>
                  ) : (
                    tiposRecibo.map((tipo) => (
                      <SelectItem 
                        key={tipo.id} 
                        value={tipo.id.toString()}
                        className="bg-background hover:bg-accent"
                      >
                        {tipo.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.tipo_recibo_id && (
                <p className="text-sm text-destructive">{form.formState.errors.tipo_recibo_id.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Tipos carregados: {tiposRecibo.length}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pagamento">Pagamento (Opcional)</Label>
              <Select onValueChange={handlePagamentoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {pagamentos.map((pagamento) => (
                    <SelectItem key={pagamento.id} value={pagamento.id.toString()}>
                      Pagamento #{pagamento.id} - R$ {(pagamento.valor_original || pagamento.valor).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Exibir detalhes das parcelas se um pagamento for selecionado */}
              {pagamentoSelecionado && pagamentoSelecionado.parcelas && pagamentoSelecionado.parcelas.length > 0 && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium mb-3">Parcelas do Pagamento #{pagamentoSelecionado.id}</h4>
                  <div className="text-sm mb-2">
                    <strong>Data do Pagamento:</strong> {new Date(pagamentoSelecionado.data_pagamento).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-sm mb-2">
                    <strong>Valor Total:</strong> R$ {(pagamentoSelecionado.valor_original || pagamentoSelecionado.valor).toFixed(2).replace('.', ',')}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Detalhamento das Parcelas:</div>
                    {pagamentoSelecionado.parcelas.map((parcela) => (
                      <div key={parcela.id} className="text-xs p-2 bg-background rounded border">
                        <span className="font-medium">Parcela {parcela.numero_parcela}:</span> R$ {parcela.valor_parcela.toFixed(2).replace('.', ',')} - 
                        Vencimento: {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')} - 
                        Status: <span className={`capitalize ${parcela.status === 'pago' ? 'text-green-600' : 'text-orange-600'}`}>
                          {parcela.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select
                value={form.watch('cliente_id')?.toString() || ''}
                onValueChange={(value) => form.setValue('cliente_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.cliente_id && (
                <p className="text-sm text-destructive">{form.formState.errors.cliente_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultor">Consultor (Opcional)</Label>
              <Select
                value={form.watch('consultor_id')?.toString() || ''}
                onValueChange={(value) => form.setValue('consultor_id', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o consultor" />
                </SelectTrigger>
                <SelectContent>
                  {consultores.map((consultor) => (
                    <SelectItem key={consultor.id} value={consultor.id.toString()}>
                      {consultor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                {...form.register('valor', { valueAsNumber: true })}
                placeholder="0,00"
              />
              {form.formState.errors.valor && (
                <p className="text-sm text-destructive">{form.formState.errors.valor.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              {...form.register('descricao')}
              placeholder="Descreva o serviço ou produto"
              rows={3}
            />
            {form.formState.errors.descricao && (
              <p className="text-sm text-destructive">{form.formState.errors.descricao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...form.register('observacoes')}
              placeholder="Observações adicionais"
              rows={2}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <FileText className="h-4 w-4 mr-2" />
              {loading ? 'Gerando...' : 'Gerar Recibo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}