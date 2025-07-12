import { supabase } from '@/integrations/supabase/client';

export const migrateUsersToAuth = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('migrate-users');
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao migrar usuários:', error);
    throw error;
  }
};

export const createUserWithAuth = async (userData: {
  name: string;
  email: string;
  password: string;
  permission?: string;
  consultorId?: number;
}) => {
  try {
    // Usar a API administrativa para criar usuário no auth.users
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          nome: userData.name,
          permissao: userData.permission || 'user'
        }
      }
    });

    if (authError) {
      throw authError;
    }

    // Se o usuário foi criado com sucesso, atualizar o profile
    if (authUser.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome: userData.name,
          email: userData.email,
          permissao: userData.permission || 'user',
          consultor_id: userData.consultorId
        })
        .eq('id', authUser.user.id);

      if (profileError) {
        console.error('Erro ao atualizar profile:', profileError);
      }
    }

    return authUser;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};