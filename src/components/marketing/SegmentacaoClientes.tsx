import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Filter, Users, Search, Target, Download } from "lucide-react";
import type { Cliente, Categoria, Origem } from "@/types";
import { FiltroMarketing } from "@/types/comunicacao";
import { CampanhaForm } from "./CampanhaForm";

export const SegmentacaoClientes = () => {
  const [filtros, setFiltros] = useState<FiltroMarketing>({});
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalClientes, setTotalClientes] = useState(0);
  const { toast } = useToast();

  const loadMetadata = async () => {
    try {
      const [categoriasRes, origensRes] = await Promise.all([
        supabase.from('categorias').select('*').eq('ativo', true),
        supabase.from('origens').select('*').eq('ativo', true)
      ]);

      if (categoriasRes.error) throw categoriasRes.error;
      if (origensRes.error) throw origensRes.error;

      setCategorias(categoriasRes.data || []);
      setOrigens(origensRes.data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar metadados",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  const aplicarFiltros = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('clientes')
        .select('*, categorias(nome), origens(nome)', { count: 'exact' })
        .eq('ativo', true);

      // Aplicar filtros
      if (filtros.categoria_id && filtros.categoria_id.length > 0) {
        query = query.in('categoria_id', filtros.categoria_id);
      }

      if (filtros.origem_id && filtros.origem_id.length > 0) {
        query = query.in('origem_id', filtros.origem_id);
      }

      if (filtros.cidade && filtros.cidade.length > 0) {
        query = query.in('cidade', filtros.cidade);
      }

      if (filtros.recebe_email !== undefined) {
        query = query.eq('recebe_email', filtros.recebe_email);
      }

      if (filtros.recebe_sms !== undefined) {
        query = query.eq('recebe_sms', filtros.recebe_sms);
      }

      if (filtros.recebe_whatsapp !== undefined) {
        query = query.eq('recebe_whatsapp', filtros.recebe_whatsapp);
      }

      const { data, error, count } = await query.limit(100);

      if (error) throw error;

      setClientes(data || []);
      setTotalClientes(count || 0);

      toast({
        title: "Filtros aplicados",
        description: `${count || 0} clientes encontrados`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao aplicar filtros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({});
    setClientes([]);
    setTotalClientes(0);
  };

  const handleCategoriaChange = (categoriaId: number, checked: boolean) => {
    const novasCategorias = filtros.categoria_id || [];
    if (checked) {
      setFiltros({
        ...filtros,
        categoria_id: [...novasCategorias, categoriaId]
      });
    } else {
      setFiltros({
        ...filtros,
        categoria_id: novasCategorias.filter(id => id !== categoriaId)
      });
    }
  };

  const handleOrigemChange = (origemId: number, checked: boolean) => {
    const novasOrigens = filtros.origem_id || [];
    if (checked) {
      setFiltros({
        ...filtros,
        origem_id: [...novasOrigens, origemId]
      });
    } else {
      setFiltros({
        ...filtros,
        origem_id: novasOrigens.filter(id => id !== origemId)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Segmentação de Clientes</h2>
        <p className="text-muted-foreground">
          Filtre e segmente sua base de clientes para campanhas direcionadas
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Filtros */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Segmentação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Categorias */}
            <div>
              <Label className="text-sm font-medium">Categorias</Label>
              <div className="space-y-2 mt-2">
                {categorias.map((categoria) => (
                  <div key={categoria.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`categoria-${categoria.id}`}
                      checked={filtros.categoria_id?.includes(categoria.id!) || false}
                      onCheckedChange={(checked) => 
                        handleCategoriaChange(categoria.id!, checked as boolean)
                      }
                    />
                    <Label htmlFor={`categoria-${categoria.id}`} className="text-sm">
                      {categoria.nome}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Origens */}
            <div>
              <Label className="text-sm font-medium">Origens</Label>
              <div className="space-y-2 mt-2">
                {origens.map((origem) => (
                  <div key={origem.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`origem-${origem.id}`}
                      checked={filtros.origem_id?.includes(origem.id!) || false}
                      onCheckedChange={(checked) => 
                        handleOrigemChange(origem.id!, checked as boolean)
                      }
                    />
                    <Label htmlFor={`origem-${origem.id}`} className="text-sm">
                      {origem.nome}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferências de Comunicação */}
            <div>
              <Label className="text-sm font-medium">Preferências de Comunicação</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recebe_email"
                    checked={filtros.recebe_email === true}
                    onCheckedChange={(checked) => 
                      setFiltros({ ...filtros, recebe_email: checked ? true : undefined })
                    }
                  />
                  <Label htmlFor="recebe_email" className="text-sm">
                    Aceita Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recebe_sms"
                    checked={filtros.recebe_sms === true}
                    onCheckedChange={(checked) => 
                      setFiltros({ ...filtros, recebe_sms: checked ? true : undefined })
                    }
                  />
                  <Label htmlFor="recebe_sms" className="text-sm">
                    Aceita SMS
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recebe_whatsapp"
                    checked={filtros.recebe_whatsapp === true}
                    onCheckedChange={(checked) => 
                      setFiltros({ ...filtros, recebe_whatsapp: checked ? true : undefined })
                    }
                  />
                  <Label htmlFor="recebe_whatsapp" className="text-sm">
                    Aceita WhatsApp
                  </Label>
                </div>
              </div>
            </div>

            {/* Filtros Financeiros */}
            <div>
              <Label className="text-sm font-medium">Valor Gasto</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="Mín (R$)"
                  value={filtros.valor_minimo || ''}
                  onChange={(e) => setFiltros({ 
                    ...filtros, 
                    valor_minimo: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
                <Input
                  type="number"
                  placeholder="Máx (R$)"
                  value={filtros.valor_maximo || ''}
                  onChange={(e) => setFiltros({ 
                    ...filtros, 
                    valor_maximo: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={aplicarFiltros} 
                disabled={loading}
                className="flex-1"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Buscando...' : 'Aplicar Filtros'}
              </Button>
              <Button 
                variant="outline" 
                onClick={limparFiltros}
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes Segmentados ({totalClientes})
              </CardTitle>
              {clientes.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button size="sm" onClick={() => {
                    // TODO: Implementar criação de campanha com filtros
                    toast({
                      title: "Em desenvolvimento",
                      description: "Funcionalidade de criação de campanha será implementada em breve",
                    });
                  }}>
                    <Target className="h-4 w-4 mr-2" />
                    Criar Campanha
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {clientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground text-center">
                  Aplique filtros para segmentar sua base de clientes e criar campanhas direcionadas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientes.map((cliente) => (
                  <div key={cliente.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{cliente.nome}</p>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{cliente.email}</span>
                        <span>{cliente.telefone}</span>
                        {cliente.cidade && <span>• {cliente.cidade}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {cliente.recebe_email && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Aceita Email" />
                      )}
                      {cliente.recebe_sms && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Aceita SMS" />
                      )}
                      {cliente.recebe_whatsapp && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Aceita WhatsApp" />
                      )}
                    </div>
                  </div>
                ))}
                
                {totalClientes > 100 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Mostrando 100 de {totalClientes} clientes. Use filtros mais específicos para refinar os resultados.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Componente separado para o botão de criar campanha
const CriarCampanhaButton = ({ filtros }: { filtros: FiltroMarketing }) => {
  const [mostrarForm, setMostrarForm] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setMostrarForm(true)}>
        <Target className="h-4 w-4 mr-2" />
        Criar Campanha
      </Button>

      {mostrarForm && (
        <Dialog open={true} onOpenChange={(open) => {
          if (!open) setMostrarForm(false);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CampanhaForm
              filtrosSegmentacao={filtros}
              onSave={(campanha) => {
                // Implementar salvamento
                setMostrarForm(false);
              }}
              onCancel={() => setMostrarForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};