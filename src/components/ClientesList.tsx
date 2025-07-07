import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { db, Cliente, Categoria, Origem } from "@/lib/database";
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";

interface ClientesListProps {
  onEdit: (cliente: Cliente) => void;
  onNew: () => void;
}

export const ClientesList = ({ onEdit, onNew }: ClientesListProps) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    nome: '',
    cpf: '',
    email: '',
    categoria_id: '',
    origem_id: '',
    ativo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadClientes();
  }, [filters]);

  const loadData = async () => {
    try {
      const [categoriasData, origensData] = await Promise.all([
        db.getCategorias(),
        db.getOrigens()
      ]);
      setCategorias(categoriasData);
      setOrigens(origensData);
      await loadClientes();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadClientes = async () => {
    setIsLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const clientesData = await db.getClientes({
        ...cleanFilters,
        categoria_id: cleanFilters.categoria_id ? parseInt(cleanFilters.categoria_id) : undefined,
        origem_id: cleanFilters.origem_id ? parseInt(cleanFilters.origem_id) : undefined,
        ativo: cleanFilters.ativo ? cleanFilters.ativo === 'true' : undefined
      });
      
      setClientes(clientesData);
    } catch (error) {
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
      await db.deleteCliente(id);
      toast({
        title: "Cliente excluído",
        description: "Cliente removido com sucesso",
      });
      loadClientes();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o cliente",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      nome: '',
      cpf: '',
      email: '',
      categoria_id: '',
      origem_id: '',
      ativo: ''
    });
  };

  const getCategoriaNome = (categoriaId?: number) => {
    return categorias.find(c => c.id === categoriaId)?.nome || '-';
  };

  const getOrigemNome = (origemId?: number) => {
    return origens.find(o => o.id === origemId)?.nome || '-';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">
                Clientes Cadastrados
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie todos os clientes do sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-border hover:bg-muted/50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button
                onClick={onNew}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filtros */}
        {showFilters && (
          <CardContent className="border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Nome</Label>
                <Input
                  placeholder="Buscar por nome"
                  value={filters.nome}
                  onChange={(e) => handleFilterChange('nome', e.target.value)}
                  className="bg-background/50 border-border h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-foreground">CPF</Label>
                <Input
                  placeholder="000.000.000-00"
                  value={filters.cpf}
                  onChange={(e) => handleFilterChange('cpf', e.target.value)}
                  className="bg-background/50 border-border h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-foreground">Email</Label>
                <Input
                  placeholder="email@exemplo.com"
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="bg-background/50 border-border h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-foreground">Categoria</Label>
                <Select
                  value={filters.categoria_id}
                  onValueChange={(value) => handleFilterChange('categoria_id', value)}
                >
                  <SelectTrigger className="bg-background/50 border-border h-9">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id!.toString()}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-foreground">Origem</Label>
                <Select
                  value={filters.origem_id}
                  onValueChange={(value) => handleFilterChange('origem_id', value)}
                >
                  <SelectTrigger className="bg-background/50 border-border h-9">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {origens.map((origem) => (
                      <SelectItem key={origem.id} value={origem.id!.toString()}>
                        {origem.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-foreground">Status</Label>
                <Select
                  value={filters.ativo}
                  onValueChange={(value) => handleFilterChange('ativo', value)}
                >
                  <SelectTrigger className="bg-background/50 border-border h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-border hover:bg-muted/50"
              >
                Limpar Filtros
              </Button>
              <Button
                size="sm"
                onClick={loadClientes}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Carregando clientes...</p>
            </CardContent>
          </Card>
        ) : clientes.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </CardContent>
          </Card>
        ) : (
          clientes.map((cliente) => (
            <Card key={cliente.id} className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {cliente.nome}
                      </h3>
                      <Badge 
                        variant={cliente.ativo ? "default" : "secondary"}
                        className={cliente.ativo ? "bg-success text-white" : ""}
                      >
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p><strong>CPF:</strong> {cliente.cpf || '-'}</p>
                        <p><strong>Email:</strong> {cliente.email || '-'}</p>
                      </div>
                      <div>
                        <p><strong>Telefone:</strong> {cliente.telefone || '-'}</p>
                        <p><strong>CEP:</strong> {cliente.cep || '-'}</p>
                      </div>
                      <div>
                        <p><strong>Categoria:</strong> {getCategoriaNome(cliente.categoria_id)}</p>
                        <p><strong>Origem:</strong> {getOrigemNome(cliente.origem_id)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs">
                      {cliente.recebe_email && (
                        <Badge variant="outline" className="border-border">Email</Badge>
                      )}
                      {cliente.recebe_whatsapp && (
                        <Badge variant="outline" className="border-border">WhatsApp</Badge>
                      )}
                      {cliente.recebe_sms && (
                        <Badge variant="outline" className="border-border">SMS</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(cliente)}
                      className="border-border hover:bg-muted/50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cliente.id!)}
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};