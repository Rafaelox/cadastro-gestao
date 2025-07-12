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
    // Verificar se existe usuário logado no localStorage
    const usuarioSalvo = localStorage.getItem('usuario_logado');
    const sessionSalva = localStorage.getItem('mock_session');
    
    if (usuarioSalvo && sessionSalva) {
      try {
        const userData = JSON.parse(usuarioSalvo);
        const sessionData = JSON.parse(sessionSalva);
        
        setUsuario(userData);
        setUser(sessionData.user);
        setSession(sessionData);
      } catch (error) {
        localStorage.removeItem('usuario_logado');
        localStorage.removeItem('mock_session');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      // Usar a função de login customizada
      const { data, error } = await supabase.rpc('custom_login', {
        p_email: email,
        p_password: senha
      });

      if (error) throw error;

      const loginResult = data?.[0];
      if (!loginResult?.success) {
        return false;
      }

      // Extrair dados do usuário do resultado
      const profileData = loginResult.profile_data as any;
      const usuarioData: Usuario = {
        id: profileData.id,
        nome: profileData.nome,
        email: profileData.email,
        permissao: profileData.permissao as TipoPermissao,
        ativo: profileData.ativo,
        consultor_id: profileData.consultor_id
      };

      // Simular uma sessão válida
      const mockSession = {
        user: { id: profileData.id, email: profileData.email },
        access_token: 'mock_token',
        refresh_token: 'mock_refresh',
        expires_in: 3600,
        token_type: 'bearer'
      } as Session;

      setUsuario(usuarioData);
      setUser(mockSession.user as User);
      setSession(mockSession);
      
      // Salvar no localStorage para persistência
      localStorage.setItem('usuario_logado', JSON.stringify(usuarioData));
      localStorage.setItem('mock_session', JSON.stringify(mockSession));

      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    setUsuario(null);
    setUser(null);
    setSession(null);
    localStorage.removeItem('usuario_logado');
    localStorage.removeItem('mock_session');
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