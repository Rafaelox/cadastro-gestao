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

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Buscar dados do usuário na tabela usuarios
          const { data: userData } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', session.user.email)
            .eq('ativo', true)
            .single();

          if (userData) {
            const usuarioData: Usuario = {
              id: userData.id,
              nome: userData.nome,
              email: userData.email,
              permissao: userData.permissao as TipoPermissao,
              ativo: userData.ativo,
              consultor_id: userData.consultor_id
            };
            setUsuario(usuarioData);
          }
        } else {
          setUsuario(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      // Primeiro verificar se o usuário existe na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .eq('ativo', true)
        .single();

      if (userError || !userData) {
        return false;
      }

      // Fazer login no Supabase Auth usando um token temporário
      // Como não temos senha do auth, vamos usar signInAnonymously e depois atualizar
      const { error: signInError } = await supabase.auth.signInAnonymously();
      
      if (signInError) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setUser(null);
    setSession(null);
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
    return <div>Carregando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};