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

  // Função auxiliar para buscar profile
  const fetchProfile = async (userId: string, userEmail: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, nome, permissao, ativo, consultor_id, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (profileData) {
        const usuarioData: Usuario = {
          id: profileData.id,
          nome: profileData.nome,
          email: userEmail,
          permissao: profileData.permissao as TipoPermissao,
          ativo: profileData.ativo
        };
        return usuarioData;
      }
    } catch (error) {
      console.error('Erro ao buscar profile:', error);
    }
    return null;
  };

  useEffect(() => {
    // Configurar listener do Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          fetchProfile(session.user.id, session.user.email || '').then(usuarioData => {
            if (usuarioData) {
              setUsuario(usuarioData);
              setUser(session.user);
              setSession(session);
              localStorage.setItem('user_data', JSON.stringify(usuarioData));
              localStorage.setItem('user_session', JSON.stringify(session));
            }
          });
        } else if (event === 'SIGNED_OUT') {
          setUsuario(null);
          setUser(null);
          setSession(null);
          localStorage.removeItem('user_data');
          localStorage.removeItem('user_session');
          localStorage.removeItem('usuario_logado');
          localStorage.removeItem('mock_session');
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '').then(usuarioData => {
          if (usuarioData) {
            setUsuario(usuarioData);
            setUser(session.user);
            setSession(session);
          }
          setIsLoading(false);
        });
      } else {
        // Fallback: verificar localStorage
        const usuarioSalvo = localStorage.getItem('user_data') || localStorage.getItem('usuario_logado');
        const sessionSalva = localStorage.getItem('user_session') || localStorage.getItem('mock_session');
        
        if (usuarioSalvo && sessionSalva) {
          try {
            const userData = JSON.parse(usuarioSalvo);
            const sessionData = JSON.parse(sessionSalva);
            setUsuario(userData);
            setUser(sessionData.user);
            setSession(sessionData);
          } catch (error) {
            localStorage.clear();
          }
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      // Tentar login com Supabase Auth nativo
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (authData.user && !authError) {
        const usuarioData = await fetchProfile(authData.user.id, authData.user.email || email);
        if (usuarioData) {
          setUsuario(usuarioData);
          setUser(authData.user);
          setSession(authData.session);
          localStorage.setItem('user_data', JSON.stringify(usuarioData));
          localStorage.setItem('user_session', JSON.stringify(authData.session));
          return true;
        }
      }

      // Fallback: sistema customizado
      const { data: customData, error: customError } = await supabase.rpc('custom_login', {
        user_email: email,
        user_password: senha
      });

      if (customError || !customData || customData.length === 0) {
        return false;
      }

      const userData = customData[0];
      const usuarioData: Usuario = {
        id: userData.id,
        nome: userData.nome,
        email: userData.email || email,
        permissao: userData.permissao as TipoPermissao,
        ativo: userData.ativo
      };
      
      const mockSession = {
        access_token: 'mock-token-' + userData.id,
        token_type: 'bearer' as const,
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        refresh_token: 'mock-refresh-' + userData.id,
        user: {
          id: userData.id,
          email: userData.email || email,
          aud: 'authenticated' as const,
          role: 'authenticated' as const,
          email_confirmed_at: new Date().toISOString(),
          phone_confirmed_at: null,
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: { permission: userData.permissao },
          user_metadata: { name: userData.nome },
          identities: [],
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString()
        }
      } as Session;

      setUsuario(usuarioData);
      setUser(mockSession.user);
      setSession(mockSession);
      localStorage.setItem('user_data', JSON.stringify(usuarioData));
      localStorage.setItem('user_session', JSON.stringify(mockSession));
      
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
    
    setUsuario(null);
    setUser(null);
    setSession(null);
    localStorage.clear();
  };

  const value = {
    usuario,
    user,
    session,
    login,
    logout,
    isAuthenticated: !!usuario && !!session,
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};