import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Recibo, TipoRecibo } from '@/types/recibo';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, Eye } from 'lucide-react';
import { generateReciboNormalPDF, generateReciboDoacaoPDF } from './ReciboPDFGenerator';

export function RecibosList() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [tiposRecibo, setTiposRecibo] = useState<TipoRecibo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recibosResult, tiposResult] = await Promise.all([
        supabase
          .from('recibos')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('tipos_recibo')
          .select('*')
          .eq('ativo', true),
      ]);

      if (recibosResult.data) setRecibos(recibosResult.data as any[]);
      if (tiposResult.data) setTiposRecibo(tiposResult.data as TipoRecibo[]);
    } catch (error) {
      console.error('Erro ao carregar recibos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de recibos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (recibo: Recibo) => {
    try {
      const tipoRecibo = tiposRecibo.find(t => t.id === recibo.tipo_recibo_id);
      
      if (tipoRecibo?.template === 'doacao') {
        generateReciboDoacaoPDF(recibo);
      } else {
        generateReciboNormalPDF(recibo);
      }
      
      toast({
        title: 'Sucesso',
        description: 'PDF gerado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar PDF do recibo',
        variant: 'destructive',
      });
    }
  };

  const getTipoReciboNome = (tipoId: number) => {
    const tipo = tiposRecibo.find(t => t.id === tipoId);
    return tipo?.nome || 'N/A';
  };

  const getTipoReciboBadge = (tipoId: number) => {
    const tipo = tiposRecibo.find(t => t.id === tipoId);
    const variant = tipo?.template === 'doacao' ? 'secondary' : 'default';
    return <Badge variant={variant}>{getTipoReciboNome(tipoId)}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando recibos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recibos Gerados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recibos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum recibo encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recibos.map((recibo) => (
                  <TableRow key={recibo.id}>
                    <TableCell className="font-medium">
                      {recibo.numero_recibo}
                    </TableCell>
                    <TableCell>
                      {getTipoReciboBadge(recibo.tipo_recibo_id)}
                    </TableCell>
                    <TableCell>
                      {recibo.dados_cliente?.nome || 'N/A'}
                    </TableCell>
                    <TableCell>
                      R$ {recibo.valor.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(recibo.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(recibo)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}