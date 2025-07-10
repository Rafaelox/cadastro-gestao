import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TipoPermissao = 'master' | 'gerente' | 'secretaria' | 'user';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  permissao: TipoPermissao;
  ativo: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isMaster: boolean;
  isGerente: boolean;
  isSecretaria: boolean;
  isUser: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe usuário logado no localStorage
    const usuarioSalvo = localStorage.getItem('usuario_logado');
    if (usuarioSalvo) {
      try {
        setUsuario(JSON.parse(usuarioSalvo));
      } catch (error) {
        localStorage.removeItem('usuario_logado');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .eq('ativo', true)
        .single();

      if (error || !data) {
        return false;
      }

      const usuarioData: Usuario = {
        id: data.id,
        nome: data.nome,
        email: data.email,
        permissao: data.permissao as TipoPermissao,
        ativo: data.ativo
      };

      setUsuario(usuarioData);
      localStorage.setItem('usuario_logado', JSON.stringify(usuarioData));
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario_logado');
  };

  const value = {
    usuario,
    login,
    logout,
    isAuthenticated: !!usuario,
    isMaster: usuario?.permissao === 'master',
    isGerente: usuario?.permissao === 'gerente',
    isSecretaria: usuario?.permissao === 'secretaria',
    isUser: usuario?.permissao === 'user',
    canManageUsers: ['master', 'gerente'].includes(usuario?.permissao || ''),
    canManageSettings: ['master', 'gerente'].includes(usuario?.permissao || ''),
    canViewReports: ['master', 'gerente', 'secretaria'].includes(usuario?.permissao || ''),
    canManagePayments: ['master', 'gerente', 'secretaria'].includes(usuario?.permissao || ''),
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};