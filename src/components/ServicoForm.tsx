import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { db, Servico } from "@/lib/database";

interface ServicoFormData {
  nome: string;
  descricao: string;
  preco: string;
  duracao_minutos: string;
  ativo: boolean;
}

interface ServicoFormProps {
  servicoId?: number;
  onSuccess?: () => void;
}

export function ServicoForm({ servicoId, onSuccess }: ServicoFormProps) {
  const [formData, setFormData] = useState<ServicoFormData>({
    nome: "",
    descricao: "",
    preco: "",
    duracao_minutos: "60",
    ativo: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (servicoId) {
      loadServicoData();
    }
  }, [servicoId]);

  const loadServicoData = async () => {
    if (!servicoId) return;
    
    setLoadingData(true);
    try {
      const servico = await db.getServicoById(servicoId);
      if (servico) {
        setFormData({
          nome: servico.nome,
          descricao: servico.descricao || "",
          preco: servico.preco.toString(),
          duracao_minutos: servico.duracao_minutos.toString(),
          ativo: servico.ativo,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar serviço:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do serviço.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (servicoId) {
        await db.updateServico(servicoId, {
          nome: formData.nome,
          descricao: formData.descricao || null,
          preco: parseFloat(formData.preco),
          duracao_minutos: parseInt(formData.duracao_minutos),
          ativo: formData.ativo,
        });

        toast({
          title: "Sucesso!",
          description: "Serviço atualizado com sucesso.",
        });
      } else {
        await db.createServico({
          nome: formData.nome,
          descricao: formData.descricao || null,
          preco: parseFloat(formData.preco),
          duracao_minutos: parseInt(formData.duracao_minutos),
          ativo: formData.ativo,
        });

        toast({
          title: "Sucesso!",
          description: "Serviço cadastrado com sucesso.",
        });

        // Reset form only on create
        setFormData({
          nome: "",
          descricao: "",
          preco: "",
          duracao_minutos: "60",
          ativo: true,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast({
        title: "Erro",
        description: `Erro ao ${servicoId ? 'atualizar' : 'cadastrar'} serviço. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ServicoFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loadingData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Carregando dados do serviço...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{servicoId ? "Editar Serviço" : "Cadastrar Serviço"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Nome do serviço"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => handleInputChange("preco", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracao">Duração (minutos) *</Label>
            <Input
              id="duracao"
              type="number"
              min="1"
              value={formData.duracao_minutos}
              onChange={(e) => handleInputChange("duracao_minutos", e.target.value)}
              placeholder="60"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descrição do serviço"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange("ativo", checked)}
            />
            <Label htmlFor="ativo">Serviço ativo</Label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (servicoId ? "Atualizando..." : "Cadastrando...") : (servicoId ? "Atualizar Serviço" : "Cadastrar Serviço")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}