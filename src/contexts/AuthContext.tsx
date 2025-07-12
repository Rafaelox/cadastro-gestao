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

  console.log('AuthProvider estado atual:', { user: user?.email, session: !!session, isLoading });

  // Configurar autenticação simplificada
  useEffect(() => {
    console.log('Iniciando configuração de auth...');
    
    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, 'User:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Buscar dados do usuário na tabela profiles
        if (session?.user) {
          // Buscar perfil do usuário
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                setUsuario({
                  id: profile.id,
                  nome: profile.nome,
                  email: profile.email || session.user.email || '',
                  permissao: profile.permissao as TipoPermissao,
                  ativo: profile.ativo
                });
              } else {
                // Se não encontrou perfil, criar um básico
                setUsuario({
                  id: session.user.id,
                  nome: session.user.email?.split('@')[0] || 'Usuário',
                  email: session.user.email || '',
                  permissao: 'user',
                  ativo: true
                });
              }
            });
        } else {
          setUsuario(null);
        }
      }
    );

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão inicial:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Buscar perfil do usuário na inicialização
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUsuario({
                id: profile.id,
                nome: profile.nome,
                email: profile.email || session.user.email || '',
                permissao: profile.permissao as TipoPermissao,
                ativo: profile.ativo
              });
            } else {
              // Se não encontrou perfil, criar um básico
              setUsuario({
                id: session.user.id,
                nome: session.user.email?.split('@')[0] || 'Usuário',
                email: session.user.email || '',
                permissao: 'user',
                ativo: true
              });
            }
          });
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
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

  // Removido auto-logout por simplicidade

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
    // Permissões baseadas no nível do usuário
    canManageUsers: usuario?.permissao === 'master' || usuario?.permissao === 'gerente',
    canManageSettings: usuario?.permissao === 'master' || usuario?.permissao === 'gerente',
    canViewReports: usuario?.permissao === 'master' || usuario?.permissao === 'gerente',
    canManagePayments: usuario?.permissao === 'master' || usuario?.permissao === 'gerente',
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