import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  permissao: 'admin' | 'user';
  ativo: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
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
        permissao: data.permissao as 'admin' | 'user',
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
    isAdmin: usuario?.permissao === 'admin'
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};