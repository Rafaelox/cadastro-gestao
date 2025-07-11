import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";  
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { TipoPermissao } from "@/types";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  permissao: TipoPermissao;
  ativo: boolean;
}

interface UsuarioFormProps {
  usuario?: Usuario | null;
  onSuccess: () => void;
}

export const UsuarioForm = ({ usuario, onSuccess }: UsuarioFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    permissao: 'user' as TipoPermissao,
    ativo: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        senha: '', // Não carregar senha por segurança
        permissao: usuario.permissao,
        ativo: usuario.ativo
      });
    }
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (usuario) {
        // Atualizar usuário existente
        const updateData: any = {
          nome: formData.nome,
          email: formData.email,
          permissao: formData.permissao,
          ativo: formData.ativo
        };

        // Só atualizar senha se foi informada
        if (formData.senha.trim()) {
          updateData.senha = formData.senha;
        }

        const { error } = await supabase
          .from('usuarios')
          .update(updateData)
          .eq('id', usuario.id);

        if (error) throw error;

        toast({
          title: "Usuário atualizado",
          description: "Usuário atualizado com sucesso.",
        });
      } else {
        // Criar novo usuário
        if (!formData.senha.trim()) {
          toast({
            title: "Senha obrigatória",
            description: "A senha é obrigatória para novos usuários.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from('usuarios')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Usuário criado",
          description: "Usuário criado com sucesso.",
        });
      }

      onSuccess();
    } catch (error: any) {
      if (error.message?.includes('duplicate key')) {
        toast({
          title: "Email já existe",
          description: "Este email já está sendo usado por outro usuário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar usuário",
          description: "Não foi possível salvar o usuário.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>{usuario ? 'Editar Usuário' : 'Novo Usuário'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">
                Senha {usuario ? '(deixe em branco para não alterar)' : '*'}
              </Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required={!usuario}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="permissao">Permissão</Label>
              <Select
                value={formData.permissao}
                onValueChange={(value: TipoPermissao) => 
                  setFormData({ ...formData, permissao: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="secretaria">Secretaria</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo">Usuário ativo</Label>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>{isLoading ? "Salvando..." : "Salvar"}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};