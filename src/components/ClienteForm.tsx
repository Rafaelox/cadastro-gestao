import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { db, Cliente, Categoria, Origem, formatCPF, formatCEP, formatPhone, validateCPF, validateEmail } from "@/lib/database";
import { Save, Search, X } from "lucide-react";

interface ClienteFormProps {
  cliente?: Cliente;
  onSave: () => void;
  onCancel: () => void;
}

export const ClienteForm = ({ cliente, onSave, onCancel }: ClienteFormProps) => {
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: '',
    cpf: '',
    cep: '',
    endereco: '',
    telefone: '',
    email: '',
    categoria_id: undefined,
    origem_id: undefined,
    ativo: true,
    recebe_email: true,
    recebe_whatsapp: true,
    recebe_sms: false,
    ...cliente
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  useEffect(() => {
    loadSelectData();
  }, []);

  const loadSelectData = async () => {
    try {
      const [categoriasData, origensData] = await Promise.all([
        db.getCategorias(),
        db.getOrigens()
      ]);
      setCategorias(categoriasData);
      setOrigens(origensData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCEP(value);
    handleInputChange('cep', formatted);
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    handleInputChange('cpf', formatted);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleInputChange('telefone', formatted);
  };

  const buscarCep = async () => {
    if (!formData.cep) {
      toast({
        title: "CEP necessário",
        description: "Digite um CEP para buscar o endereço",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingCep(true);
    try {
      const endereco = await db.buscarCep(formData.cep);
      const enderecoCompleto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}/${endereco.uf}`;
      handleInputChange('endereco', enderecoCompleto);
      toast({
        title: "CEP encontrado",
        description: "Endereço preenchido automaticamente",
      });
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: error instanceof Error ? error.message : "CEP não encontrado",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCep(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.nome?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do cliente é obrigatório",
        variant: "destructive",
      });
      return false;
    }

    if (formData.cpf && !validateCPF(formData.cpf)) {
      toast({
        title: "CPF inválido",
        description: "O CPF informado não é válido",
        variant: "destructive",
      });
      return false;
    }

    if (formData.email && !validateEmail(formData.email)) {
      toast({
        title: "Email inválido",
        description: "O email informado não é válido",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (cliente?.id) {
        await db.updateCliente(cliente.id, formData);
        toast({
          title: "Cliente atualizado",
          description: "Os dados do cliente foram atualizados com sucesso",
        });
      } else {
        await db.createCliente(formData as Omit<Cliente, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: "Cliente cadastrado",
          description: "Cliente cadastrado com sucesso",
        });
      }
      onSave();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">
              {cliente ? 'Editar Cliente' : 'Novo Cliente'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {cliente ? 'Atualize os dados do cliente' : 'Cadastre um novo cliente no sistema'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
              Dados Pessoais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-foreground">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome completo do cliente"
                  className="bg-background/50 border-border"
                  disabled={isLoading}
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-foreground">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleCpfChange(e.target.value)}
                  placeholder="000.000.000-00"
                  className="bg-background/50 border-border"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-foreground">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="bg-background/50 border-border"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                className="bg-background/50 border-border"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
              Endereço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-foreground">
                  CEP
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    className="bg-background/50 border-border flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={buscarCep}
                    disabled={isLoading || isLoadingCep}
                    className="px-3"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="endereco" className="text-foreground">
                  Endereço Completo
                </Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Rua, número, bairro, cidade/UF"
                  className="bg-background/50 border-border"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Classificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
              Classificação
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Categoria</Label>
                <Select
                  value={formData.categoria_id?.toString()}
                  onValueChange={(value) => handleInputChange('categoria_id', parseInt(value))}
                >
                  <SelectTrigger className="bg-background/50 border-border">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id!.toString()}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Origem</Label>
                <Select
                  value={formData.origem_id?.toString()}
                  onValueChange={(value) => handleInputChange('origem_id', parseInt(value))}
                >
                  <SelectTrigger className="bg-background/50 border-border">
                    <SelectValue placeholder="Selecione uma origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {origens.map((origem) => (
                      <SelectItem key={origem.id} value={origem.id!.toString()}>
                        {origem.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
              Configurações
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="ativo" className="text-foreground">
                  Cliente Ativo
                </Label>
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => handleInputChange('ativo', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="recebe_email" className="text-foreground">
                  Recebe Email
                </Label>
                <Switch
                  id="recebe_email"
                  checked={formData.recebe_email}
                  onCheckedChange={(checked) => handleInputChange('recebe_email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="recebe_whatsapp" className="text-foreground">
                  Recebe WhatsApp
                </Label>
                <Switch
                  id="recebe_whatsapp"
                  checked={formData.recebe_whatsapp}
                  onCheckedChange={(checked) => handleInputChange('recebe_whatsapp', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="recebe_sms" className="text-foreground">
                  Recebe SMS
                </Label>
                <Switch
                  id="recebe_sms"
                  checked={formData.recebe_sms}
                  onCheckedChange={(checked) => handleInputChange('recebe_sms', checked)}
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : cliente ? 'Atualizar' : 'Cadastrar'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="border-border hover:bg-muted/50"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};