import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// User types for PostgreSQL VPS
interface User {
  id: string;
  email: string;
  nome?: string;
  permissao?: string;
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  usuario: User | null;
  user: User | null; 
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isMaster: boolean;
  isGerente: boolean;
  isSecretaria: boolean;
  isUser: boolean;
  isConsultor: boolean;
  hasAdminAccess: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewReports: boolean;
  canManagePayments: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Iniciando configuração de auth PostgreSQL...');
    
    // Verificar sessão atual no localStorage com timeout
    const checkSession = async () => {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout na verificação de sessão, prosseguindo sem autenticação');
        setIsLoading(false);
      }, 3000); // 3 segundos de timeout

      try {
        console.log('📋 Verificando localStorage...');
        
        // Verificar se localStorage está disponível
        if (typeof Storage === 'undefined') {
          console.warn('⚠️ localStorage não disponível');
          clearTimeout(timeout);
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        console.log('🔍 Token encontrado:', !!token);
        console.log('🔍 UserData encontrado:', !!userData);
        
        if (token && userData) {
          console.log('🔄 Parseando dados do usuário...');
          const parsedUser = JSON.parse(userData);
          
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setSession({
              user: { id: parsedUser.id, email: parsedUser.email },
              access_token: token
            });
            setUser({ id: parsedUser.id, email: parsedUser.email });
            setUsuario(parsedUser);
            console.log('✅ Sessão restaurada:', parsedUser.email);
          } else {
            console.warn('⚠️ Dados do usuário inválidos, limpando...');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        } else {
          console.log('ℹ️ Nenhuma sessão encontrada');
        }
        
        clearTimeout(timeout);
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        // Limpar dados inválidos
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        } catch (storageError) {
          console.error('❌ Erro ao limpar localStorage:', storageError);
        }
        clearTimeout(timeout);
      } finally {
        console.log('🏁 Verificação de sessão concluída');
        setIsLoading(false);
      }
    };

    // Adicionar delay pequeno para evitar problemas de inicialização
    const initTimer = setTimeout(() => {
      checkSession();
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
  }, []);

  // Função de login para PostgreSQL
  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      console.log('Tentando fazer login PostgreSQL...');
      setIsLoading(true);
      
      // Simular API call para autenticação (será substituído por API real)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        console.error('Erro no login - resposta inválida');
        return false;
      }

      const data = await response.json();
      
      if (data.success && data.usuario && data.token) {
        // Armazenar dados da sessão
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.usuario));
        
        setSession({
          user: { id: data.usuario.id, email: data.usuario.email },
          access_token: data.token
        });
        setUser({ id: data.usuario.id, email: data.usuario.email });
        setUsuario(data.usuario);
        
        console.log('Login PostgreSQL realizado com sucesso');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no login PostgreSQL:', error);
      // Para desenvolvimento, usar login mock
      if (email === 'admin@teste.com' && senha === 'admin123') {
        const mockUser: User = {
          id: '1',
          nome: 'Administrador',
          email: 'admin@teste.com',
          permissao: 'master'
        };
        
        localStorage.setItem('auth_token', 'mock_token_' + Date.now());
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        
        setSession({
          user: { id: mockUser.id, email: mockUser.email },
          access_token: 'mock_token_' + Date.now()
        });
        setUser({ id: mockUser.id, email: mockUser.email });
        setUsuario(mockUser);
        
        console.log('Login mock realizado com sucesso');
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout PostgreSQL
  const logout = async () => {
    try {
      console.log('Fazendo logout PostgreSQL...');
      
      // Chamar API de logout se disponível
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.log('API de logout não disponível, continuando...');
        }
      }
      
      // Limpar dados locais
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      setUser(null);
      setSession(null);
      setUsuario(null);
      
      // React Router irá automaticamente redirecionar para login quando não autenticado
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpar estados 
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setSession(null);
      setUsuario(null);
    }
  };

  const value = {
    usuario,
    user,
    session,
    login,
    logout,
    isLoading,
    isAuthenticated: !!session && !!user,
    isMaster: user?.email === 'adm@rpedro.net' || usuario?.permissao === 'master',
    isGerente: usuario?.permissao === 'gerente',
    isSecretaria: usuario?.permissao === 'secretaria',
    isUser: usuario?.permissao === 'user',
    isConsultor: usuario?.permissao === 'consultor',
    hasAdminAccess: usuario?.permissao === 'master' || usuario?.permissao === 'gerente',
    // Permissões baseadas no nível do usuário
    canManageUsers: usuario?.permissao === 'master' || usuario?.permissao === 'gerente',
    canManageSettings: usuario?.permissao === 'master' || usuario?.permissao === 'gerente',
    canViewReports: usuario?.permissao === 'master' || usuario?.permissao === 'gerente',
    canManagePayments: usuario?.permissao === 'master' || usuario?.permissao === 'gerente',
  };

  // Mostrar loading durante inicialização com timeout de segurança
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando aplicação...</p>
          <div className="text-xs text-muted-foreground text-center max-w-md">
            <p>Verificando sessão e inicializando componentes</p>
            <p className="mt-2">Se esta tela persistir, recarregue a página</p>
          </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};