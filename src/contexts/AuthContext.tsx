import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import type { Usuario, TipoPermissao } from '@/types';

interface AuthContextType {
  usuario: Usuario | null;
  user: User | null;
  session: Session | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isMaster: boolean;
  isGerente: boolean;
  isSecretaria: boolean;
  isUser: boolean;
  isConsultor: boolean;
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
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Função para buscar dados do perfil do usuário
  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, permissao, ativo, consultor_id, created_at, updated_at, email')
        .eq('id', userId)
        .eq('ativo', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      if (data) {
        const usuarioData: Usuario = {
          id: data.id,
          nome: data.nome,
          email: data.email || userEmail || '',
          permissao: data.permissao as TipoPermissao,
          ativo: data.ativo
        };
        return usuarioData;
      }
    } catch (error) {
      console.error('Erro na função fetchProfile:', error);
    }
    return null;
  };

  // Configurar autenticação com timeout
  useEffect(() => {
    let mounted = true;
    let loadingTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('Iniciando autenticação...');
        setIsLoading(true);

        // Timeout de segurança para evitar loading infinito
        loadingTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('Timeout na inicialização da auth');
            setIsLoading(false);
          }
        }, 10000); // 10 segundos

        // Verificar sessão atual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          throw error;
        }

        if (currentSession?.user && mounted) {
          console.log('Sessão encontrada, definindo states...');
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Buscar perfil sem bloquear
          setIsProfileLoading(true);
          const profile = await fetchProfile(currentSession.user.id, currentSession.user.email || '');
          
          if (profile && mounted) {
            setUsuario(profile);
            console.log('Perfil carregado com sucesso');
          } else {
            console.warn('Perfil não encontrado ou usuário inativo');
          }
          setIsProfileLoading(false);
        } else {
          console.log('Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        console.error('Erro na inicialização da auth:', error);
      } finally {
        clearTimeout(loadingTimeout);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Buscar perfil sem setTimeout
          setIsProfileLoading(true);
          fetchProfile(session.user.id, session.user.email || '').then(profile => {
            if (profile && mounted) {
              setUsuario(profile);
            }
            if (mounted) {
              setIsProfileLoading(false);
            }
          });
        } else if (event === 'SIGNED_OUT') {
          setUsuario(null);
          setIsProfileLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Função de login simplificada
  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      console.log('Tentando fazer login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        console.error('Erro no login:', error.message);
        return false;
      }

      if (data.user && data.session) {
        console.log('Login realizado com sucesso');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  // Função de logout simplificada
  const logout = async () => {
    try {
      console.log('Fazendo logout...');
      
      await supabase.auth.signOut();
      
      // Limpar estados locais
      setUser(null);
      setSession(null);
      setUsuario(null);
      
      // Limpar localStorage
      localStorage.clear();
      
      // Redirecionar para home
      window.location.href = '/';
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpar estados e redirecionar
      setUser(null);
      setSession(null);
      setUsuario(null);
      window.location.href = '/';
    }
  };

  // Auto-logout por inatividade (simplificado)
  useEffect(() => {
    if (!usuario) return;

    const inactivityTimer = setTimeout(() => {
      console.log('Sessão expirada por inatividade');
      logout();
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearTimeout(inactivityTimer);
  }, [usuario]);

  const value = {
    usuario,
    user,
    session,
    login,
    logout,
    isLoading,
    isProfileLoading,
    isAuthenticated: !!session && !!user, // Base authentication on session
    isMaster: usuario?.permissao === 'master',
    isGerente: usuario?.permissao === 'gerente',
    isSecretaria: usuario?.permissao === 'secretaria',
    isUser: usuario?.permissao === 'user',
    isConsultor: usuario?.permissao === 'consultor',
    canManageUsers: ['master', 'gerente'].includes(usuario?.permissao || ''),
    canManageSettings: ['master', 'gerente'].includes(usuario?.permissao || ''),
    canViewReports: ['master', 'gerente', 'secretaria'].includes(usuario?.permissao || ''),
    canManagePayments: ['master', 'gerente', 'secretaria', 'consultor'].includes(usuario?.permissao || ''),
  };

  // Mostrar loading durante inicialização
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};