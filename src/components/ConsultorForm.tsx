import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Phone, Mail, MapPin, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/database";
import type { Consultor } from "@/types";

interface ConsultorFormProps {
  onSuccess?: () => void;
  editingConsultor?: Consultor | null;
}

interface ConsultorFormData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  percentual_comissao: number;
  ativo: boolean;
}

export const ConsultorForm = ({ onSuccess, editingConsultor }: ConsultorFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ConsultorFormData>({
    defaultValues: editingConsultor ? {
      nome: editingConsultor.nome,
      cpf: editingConsultor.cpf || "",
      email: editingConsultor.email || "",
      telefone: editingConsultor.telefone || "",
      cep: editingConsultor.cep || "",
      endereco: editingConsultor.endereco || "",
      bairro: editingConsultor.bairro || "",
      cidade: editingConsultor.cidade || "",
      estado: editingConsultor.estado || "",
      percentual_comissao: editingConsultor.percentual_comissao,
      ativo: editingConsultor.ativo,
    } : {
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
      cep: "",
      endereco: "",
      bairro: "",
      cidade: "",
      estado: "",
      percentual_comissao: 0,
      ativo: true,
    }
  });

  const watchCep = watch("cep");

  const buscarCep = async (cep: string) => {
    if (cep.length === 8) {
      setIsLoadingCep(true);
      try {
        const endereco = await db.buscarCep(cep);
        setValue("endereco", endereco.logradouro);
        setValue("bairro", endereco.bairro);
        setValue("cidade", endereco.localidade);
        setValue("estado", endereco.uf);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao buscar CEP",
          description: "CEP não encontrado ou inválido.",
        });
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const onSubmit = async (data: ConsultorFormData) => {
    setIsLoading(true);
    try {
      if (editingConsultor) {
        await db.updateConsultor(editingConsultor.id!, data);
        toast({
          title: "Consultor atualizado",
          description: "Os dados do consultor foram atualizados com sucesso.",
        });
      } else {
        await db.createConsultor(data);
        toast({
          title: "Consultor criado",
          description: "O consultor foi criado com sucesso.",
        });
      }
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Save className="h-5 w-5" />
          <span>{editingConsultor ? "Editar Consultor" : "Novo Consultor"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  {...register("nome", { required: "Nome é obrigatório" })}
                  placeholder="Nome completo do consultor"
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  {...register("cpf")}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Contato</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...register("telefone")}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Endereço</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    {...register("cep")}
                    placeholder="00000-000"
                    onBlur={(e) => buscarCep(e.target.value.replace(/\D/g, ''))}
                  />
                  {isLoadingCep && (
                    <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
                  )}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  {...register("endereco")}
                  placeholder="Rua, número"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  {...register("bairro")}
                  placeholder="Bairro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  {...register("cidade")}
                  placeholder="Cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  {...register("estado")}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Comissão */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Percent className="h-4 w-4" />
              <span>Comissão</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="percentual_comissao">Percentual de Comissão (%)</Label>
                <Input
                  id="percentual_comissao"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register("percentual_comissao", { 
                    required: "Percentual de comissão é obrigatório",
                    valueAsNumber: true,
                    min: { value: 0, message: "Percentual deve ser maior ou igual a 0" },
                    max: { value: 100, message: "Percentual deve ser menor ou igual a 100" }
                  })}
                  placeholder="0.00"
                />
                {errors.percentual_comissao && (
                  <p className="text-sm text-destructive">{errors.percentual_comissao.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    {...register("ativo")}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="ativo">Ativo</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{editingConsultor ? "Atualizar" : "Salvar"}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};