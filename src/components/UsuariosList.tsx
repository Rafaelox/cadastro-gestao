import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { TipoPermissao } from "@/types";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  permissao: TipoPermissao;
  ativo: boolean;
  created_at: string;
}

interface UsuariosListProps {
  onEdit: (usuario: Usuario) => void;
  onAdd: () => void;
}

export const UsuariosList = ({ onEdit, onAdd }: UsuariosListProps) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { canManageUsers } = useAuth();

  const loadUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nome');

      if (error) throw error;

      setUsuarios((data || []).map((user: any) => ({
        id: user.id,
        nome: user.nome,
        email: user.email || 'email@exemplo.com',
        permissao: user.permissao as TipoPermissao,
        ativo: user.ativo,
        created_at: user.created_at
      })));
    } catch (error) {
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('delete_custom_user', {
        user_id: id
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Usuário excluído",
          description: "Usuário desativado com sucesso.",
        });
        loadUsuarios();
      } else {
        throw new Error('Não foi possível excluir o usuário');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ativo: !ativo })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: ativo ? "Usuário desativado" : "Usuário ativado",
        description: `Usuário ${ativo ? 'desativado' : 'ativado'} com sucesso.`,
      });

      loadUsuarios();
    } catch (error) {
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do usuário.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Usuários do Sistema</span>
          </CardTitle>
          {canManageUsers && (
            <Button onClick={onAdd} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Usuário</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {usuarios.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum usuário encontrado.
          </p>
        ) : (
          <div className="space-y-4">
            {usuarios.map((usuario) => (
              <Card key={usuario.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold">{usuario.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {usuario.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={usuario.permissao === 'master' ? 'default' : 'secondary'}
                          className="flex items-center space-x-1"
                        >
                          <Shield className="h-3 w-3" />
                          <span>{
                            usuario.permissao === 'master' ? 'Master' :
                            usuario.permissao === 'gerente' ? 'Gerente' :
                            usuario.permissao === 'secretaria' ? 'Secretaria' : 'Usuário'
                          }</span>
                        </Badge>
                        <Badge 
                          variant={usuario.ativo ? 'default' : 'destructive'}
                        >
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {canManageUsers && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(usuario)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={usuario.ativo ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleStatus(usuario.id, usuario.ativo)}
                      >
                        {usuario.ativo ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(usuario.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};