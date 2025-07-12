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
  consultor_id?: number;
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
    ativo: true,
    consultor_id: undefined as number | undefined
  });
  const [consultores, setConsultores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carregar consultores
    const loadConsultores = async () => {
      const { data } = await supabase
        .from('consultores')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');
      
      if (data) {
        setConsultores(data);
      }
    };
    
    loadConsultores();
    
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        senha: '', // Não carregar senha por segurança
        permissao: usuario.permissao,
        ativo: usuario.ativo,
        consultor_id: usuario.consultor_id
      });
    }
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (usuario) {
        // Atualizar usuário existente
        const { data, error } = await supabase.rpc('update_custom_user', {
          user_id: usuario.id,
          user_name: formData.nome,
          user_email: formData.email,
          user_permission: formData.permissao,
          user_active: formData.ativo,
          user_password: formData.senha.trim() || null,
          user_consultor_id: formData.permissao === 'consultor' ? formData.consultor_id : null
        });

        if (error) throw error;

        if (data) {
          toast({
            title: "Usuário atualizado",
            description: "Usuário atualizado com sucesso.",
          });
        } else {
          throw new Error('Erro ao atualizar usuário');
        }
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

        const { data, error } = await supabase.rpc('create_custom_user', {
          user_name: formData.nome,
          user_email: formData.email,
          user_password: formData.senha,
          user_permission: formData.permissao,
          user_consultor_id: formData.permissao === 'consultor' ? formData.consultor_id : null
        });

        if (error) throw error;

        if (data) {
          toast({
            title: "Usuário criado",
            description: "Usuário criado com sucesso.",
          });
        } else {
          throw new Error('Erro ao criar usuário');
        }
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar usuário",
        description: error.message || "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
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
                  <SelectItem value="consultor">Consultor</SelectItem>
                  <SelectItem value="secretaria">Secretaria</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.permissao === 'consultor' && (
              <div className="space-y-2">
                <Label htmlFor="consultor_id">Consultor Associado *</Label>
                <Select
                  value={formData.consultor_id?.toString() || ''}
                  onValueChange={(value) => 
                    setFormData({ ...formData, consultor_id: value ? parseInt(value) : undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um consultor" />
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
            )}
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