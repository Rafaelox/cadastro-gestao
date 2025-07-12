import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import type { Usuario, TipoPermissao } from '@/types';

// Storage seguro para mobile/web
const secureStorage = {
  async setItem(key: string, value: string) {
    try {
      // Usar localStorage para web, SecureStorage será implementado no mobile
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Erro ao salvar no storage:', error);
    }
  },
  
  async getItem(key: string) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Erro ao ler do storage:', error);
      return null;
    }
  },
  
  async removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover do storage:', error);
    }
  },
  
  async clear() {
    try {
      // Limpar apenas chaves relacionadas à autenticação
      const authKeys = ['secure_session', 'user_data', 'user_session', 'usuario_logado', 'mock_session'];
      authKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
    }
  }
};

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

  // Função para buscar dados do perfil do usuário
  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, permissao, ativo, consultor_id, created_at, updated_at, email')
        .eq('id', userId)
        .eq('ativo', true)
        .single();

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

  // Função para criar sessão segura
  const createSecureSession = async (user: User, profile: Usuario) => {
    try {
      const sessionData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        usuario: profile,
        timestamp: new Date().getTime(),
        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).getTime() // 8 horas
      };

      await secureStorage.setItem('secure_session', JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('Erro ao criar sessão segura:', error);
      return false;
    }
  };

  // Função para validar sessão armazenada
  const validateStoredSession = async () => {
    try {
      const storedSession = await secureStorage.getItem('secure_session');
      if (!storedSession) return null;

      const sessionData = JSON.parse(storedSession);
      const now = new Date().getTime();

      // Verificar se a sessão expirou
      if (now > sessionData.expires_at) {
        await secureStorage.removeItem('secure_session');
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Erro ao validar sessão armazenada:', error);
      await secureStorage.removeItem('secure_session');
      return null;
    }
  };

  // Configurar autenticação
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // 1. Verificar sessão do Supabase primeiro
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        
        if (supabaseSession?.user && mounted) {
          const profile = await fetchProfile(supabaseSession.user.id, supabaseSession.user.email || '');
          if (profile && mounted) {
            setSession(supabaseSession);
            setUser(supabaseSession.user);
            setUsuario(profile);
            await createSecureSession(supabaseSession.user, profile);
          }
        } else {
          // 2. Se não há sessão Supabase, verificar sessão armazenada (fallback temporário)
          const storedSession = await validateStoredSession();
          if (storedSession && mounted) {
            setUsuario(storedSession.usuario);
            // Para sessões customizadas, não definir session/user do Supabase
          }
        }
      } catch (error) {
        console.error('Erro na inicialização da auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Listener para mudanças de autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email || '');
          if (profile && mounted) {
            setUsuario(profile);
            await createSecureSession(session.user, profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUsuario(null);
          await secureStorage.clear();
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Função de login APENAS com Supabase Auth (removido custom_login)
  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Login apenas com Supabase Auth nativo
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        console.error('Erro no login:', error.message);
        return false;
      }

      if (data.user && data.session) {
        // O listener onAuthStateChange cuidará do resto
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout seguro
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Limpar storage seguro
      await secureStorage.clear();
      
      // Logout do Supabase
      await supabase.auth.signOut();
      
      // Limpar estados
      setUser(null);
      setSession(null);
      setUsuario(null);
      
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoading(false);
      // Força reload para garantir limpeza completa
      window.location.href = '/';
    }
  };

  // Auto-logout por inatividade (30 minutos)
  useEffect(() => {
    if (!usuario) return;

    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('Sessão expirada por inatividade');
        logout();
      }, 30 * 60 * 1000); // 30 minutos
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Configurar listeners de atividade
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Iniciar timer
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [usuario]);

  const value = {
    usuario,
    user,
    session,
    login,
    logout,
    isLoading,
    isAuthenticated: !!usuario,
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