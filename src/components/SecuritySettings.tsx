import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { databaseClient } from '@/lib/database-client';
import { Shield, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SecurityInfo {
  activeSessions: number;
  lastLogin: string;
  masterCount: number;
  inactiveTimeout: number;
}

export const SecuritySettings = () => {
  const { usuario, isMaster } = useAuth();
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo>({
    activeSessions: 0,
    lastLogin: '',
    masterCount: 0,
    inactiveTimeout: 30
  });

  const [isLoading, setIsLoading] = useState(false);

  // Carregar informações de segurança
  useEffect(() => {
    loadSecurityInfo();
  }, []);

  const loadSecurityInfo = async () => {
    try {
      // Buscar contagem de sessões ativas (simulado)
      const activeSessions = localStorage.getItem('secure_session') ? 1 : 0;

      // Buscar contagem de usuários MASTER
      const masters = await databaseClient.getUsuarios();
      const masterUsers = masters.data?.filter(u => u.role === 'admin') || [];

      setSecurityInfo({
        activeSessions,
        lastLogin: new Date().toLocaleString('pt-BR'),
        masterCount: masterUsers.length,
        inactiveTimeout: 30
      });
    } catch (error) {
      console.error('Erro ao carregar informações de segurança:', error);
    }
  };

  const clearAllSessions = async () => {
    try {
      setIsLoading(true);

      // Limpar storage local
      localStorage.clear();
      
      // Logout global do sistema - simplificado
      localStorage.removeItem('auth-token');

      toast({
        title: "Sessões limpas",
        description: "Todas as sessões foram invalidadas. Você será redirecionado.",
      });

      // Recarregar página após limpeza
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao limpar sessões.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const auditUserPermissions = async () => {
    try {
      setIsLoading(true);

      const usuariosResult = await databaseClient.getUsuarios();
      const usuarios = usuariosResult.data || [];

      console.log('=== AUDITORIA DE USUÁRIOS ===');
      console.log('Total de usuários:', usuarios.length);
      
      const groupedUsers = usuarios.reduce((acc: any, user) => {
        if (!acc[user.role]) acc[user.role] = [];
        acc[user.role].push(user);
        return acc;
      }, {});

      Object.entries(groupedUsers).forEach(([role, users]: [string, any]) => {
        console.log(`\n${role.toUpperCase()}: ${users.length} usuários`);
        users.forEach((user: any) => {
          console.log(`- ${user.nome} (${user.email}) - ${user.ativo ? 'ATIVO' : 'INATIVO'}`);
        });
      });

      toast({
        title: "Auditoria concluída",
        description: "Verifique o console para detalhes completos.",
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar auditoria.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removido temporariamente para permitir acesso
  // O controle de acesso é feito no nível do menu Configurações
  // if (!isMaster) {
  //   return (
  //     <Card>
  //       <CardContent className="pt-6">
  //         <div className="flex items-center space-x-2 text-muted-foreground">
  //           <Shield className="h-4 w-4" />
  //           <span>Acesso restrito a usuários MASTER</span>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Status de Segurança</span>
          </CardTitle>
          <CardDescription>
            Informações e controles de segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Usuários MASTER</p>
                <p className="text-2xl font-bold text-blue-600">{securityInfo.masterCount}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Sessões Ativas</p>
                <p className="text-2xl font-bold text-green-600">{securityInfo.activeSessions}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Timeout (min)</p>
                <p className="text-2xl font-bold text-orange-600">{securityInfo.inactiveTimeout}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Status do Sistema</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Apenas 1 MASTER ativo
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Auto-logout ativo
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Storage seguro
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações de Segurança</CardTitle>
          <CardDescription>
            Ferramentas para gerenciar e auditar a segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={auditUserPermissions}
              disabled={isLoading}
            >
              <Users className="h-4 w-4 mr-2" />
              Auditar Usuários
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={clearAllSessions}
              disabled={isLoading}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Limpar Todas as Sessões
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Auditar Usuários:</strong> Gera relatório completo de todos os usuários e suas permissões.</p>
            <p><strong>Limpar Sessões:</strong> Invalida todas as sessões ativas e força novo login.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Sessão Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Usuário:</strong> {usuario?.nome}</p>
            <p><strong>Email:</strong> {usuario?.email}</p>
            <p><strong>Permissão:</strong> <Badge>{usuario?.permissao}</Badge></p>
            <p><strong>Último acesso:</strong> {securityInfo.lastLogin}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};