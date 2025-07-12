import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Settings, Eye } from 'lucide-react';

interface User {
  id: string;
  nome: string;
  email: string;
  permissao: string;
  ativo: boolean;
}

interface PageRoute {
  route: string;
  name: string;
  icon: React.ReactNode;
}

interface PagePermission {
  id?: string;
  user_id: string;
  page_route: string;
  page_name: string;
  can_access: boolean;
}

const systemPages: PageRoute[] = [
  { route: '/dashboard', name: 'Dashboard', icon: <Settings className="h-4 w-4" /> },
  { route: '/clientes', name: 'Clientes', icon: <Users className="h-4 w-4" /> },
  { route: '/agenda', name: 'Agenda', icon: <Users className="h-4 w-4" /> },
  { route: '/atendimentos', name: 'Atendimentos', icon: <Eye className="h-4 w-4" /> },
  { route: '/caixa', name: 'Caixa', icon: <Settings className="h-4 w-4" /> },
  { route: '/recibos', name: 'Recibos', icon: <Settings className="h-4 w-4" /> },
  { route: '/sistema', name: 'Sistema', icon: <Settings className="h-4 w-4" /> },
];

export const PagePermissions = () => {
  const { usuario } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(selectedUser);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, permissao, ativo')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    }
  };

  const loadUserPermissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('page_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Criar array com todas as páginas, marcando as que o usuário tem acesso
      const userPermissions = systemPages.map(page => {
        const existing = data?.find(p => p.page_route === page.route);
        return {
          id: existing?.id,
          user_id: userId,
          page_route: page.route,
          page_name: page.name,
          can_access: existing?.can_access || false
        };
      });

      setPermissions(userPermissions);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar permissões do usuário",
        variant: "destructive",
      });
    }
  };

  const updatePermission = async (pageRoute: string, canAccess: boolean) => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const permission = permissions.find(p => p.page_route === pageRoute);
      
      if (permission?.id) {
        // Atualizar existente
        const { error } = await supabase
          .from('page_permissions')
          .update({ 
            can_access: canAccess,
            updated_by: usuario?.id 
          })
          .eq('id', permission.id);

        if (error) throw error;
      } else {
        // Criar novo
        const { error } = await supabase
          .from('page_permissions')
          .insert({
            user_id: selectedUser,
            page_route: pageRoute,
            page_name: systemPages.find(p => p.route === pageRoute)?.name || pageRoute,
            can_access: canAccess,
            created_by: usuario?.id,
            updated_by: usuario?.id
          });

        if (error) throw error;
      }

      // Atualizar estado local
      setPermissions(prev => prev.map(p => 
        p.page_route === pageRoute 
          ? { ...p, can_access: canAccess }
          : p
      ));

      toast({
        title: "Sucesso",
        description: "Permissão atualizada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissão",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setAllPermissions = async (canAccess: boolean) => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      // Primeiro, deletar todas as permissões existentes do usuário
      await supabase
        .from('page_permissions')
        .delete()
        .eq('user_id', selectedUser);

      // Inserir novas permissões para todas as páginas
      const newPermissions = systemPages.map(page => ({
        user_id: selectedUser,
        page_route: page.route,
        page_name: page.name,
        can_access: canAccess,
        created_by: usuario?.id,
        updated_by: usuario?.id
      }));

      const { error } = await supabase
        .from('page_permissions')
        .insert(newPermissions);

      if (error) throw error;

      // Recarregar permissões
      await loadUserPermissions(selectedUser);

      toast({
        title: "Sucesso",
        description: `${canAccess ? 'Liberado' : 'Bloqueado'} acesso a todas as páginas`,
      });
    } catch (error) {
      console.error('Erro ao definir todas as permissões:', error);
      toast({
        title: "Erro",
        description: "Erro ao definir permissões",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Permissões por Página</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Acessos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Selecionar Usuário</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um usuário..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.nome} ({user.email}) - {user.permissao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={() => setAllPermissions(true)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Liberar Todas
                </Button>
                <Button 
                  onClick={() => setAllPermissions(false)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Bloquear Todas
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Página</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead className="text-center">Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.page_route}>
                      <TableCell className="flex items-center gap-2">
                        {systemPages.find(p => p.route === permission.page_route)?.icon}
                        <span className="font-medium">{permission.page_name}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {permission.page_route}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={permission.can_access}
                          onCheckedChange={(checked) => 
                            updatePermission(permission.page_route, checked)
                          }
                          disabled={isLoading}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};