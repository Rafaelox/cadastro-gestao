// Serviço de autenticação para VPS (sem Supabase)
import { query } from '@/lib/database-vps';

export interface User {
  id: string;
  nome: string;
  email: string;
  permissao: 'master' | 'gerente' | 'secretaria' | 'user';
  ativo: boolean;
  ultimo_login?: Date;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  session_token?: string;
  message: string;
}

export interface SessionValidation {
  valid: boolean;
  user?: User;
}

class AuthService {
  
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const result = await query(
        'SELECT * FROM login_user($1, $2)',
        [email, password]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Email ou senha incorretos'
        };
      }

      const row = result.rows[0];
      
      if (!row.success) {
        return {
          success: false,
          message: row.message || 'Erro no login'
        };
      }

      return {
        success: true,
        user: {
          id: row.user_id,
          nome: row.nome,
          email: row.email,
          permissao: row.permissao,
          ativo: true
        },
        session_token: row.session_token,
        message: row.message
      };

    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  async validateSession(token: string): Promise<SessionValidation> {
    try {
      const result = await query(
        'SELECT * FROM validate_session($1)',
        [token]
      );

      if (result.rows.length === 0 || !result.rows[0].valid) {
        return { valid: false };
      }

      const row = result.rows[0];

      return {
        valid: true,
        user: {
          id: row.user_id,
          nome: row.nome,
          email: row.email,
          permissao: row.permissao,
          ativo: true
        }
      };

    } catch (error) {
      console.error('Erro na validação de sessão:', error);
      return { valid: false };
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      await query(
        'UPDATE user_sessions SET is_active = false WHERE session_token = $1',
        [token]
      );
      return true;
    } catch (error) {
      console.error('Erro no logout:', error);
      return false;
    }
  }

  async createUser(userData: {
    nome: string;
    email: string;
    senha: string;
    permissao?: string;
  }): Promise<{ success: boolean; message: string; user_id?: string }> {
    try {
      const { nome, email, senha, permissao = 'user' } = userData;

      // Verificar se email já existe
      const existingUser = await query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return {
          success: false,
          message: 'Email já está em uso'
        };
      }

      // Criar usuário
      const result = await query(
        'INSERT INTO usuarios (nome, email, senha, permissao) VALUES ($1, $2, $3, $4) RETURNING id',
        [nome, email, senha, permissao]
      );

      return {
        success: true,
        message: 'Usuário criado com sucesso',
        user_id: result.rows[0].id
      };

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  async updateUser(userId: string, userData: {
    nome?: string;
    email?: string;
    senha?: string;
    permissao?: string;
    ativo?: boolean;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      if (updates.length === 0) {
        return { success: false, message: 'Nenhum campo para atualizar' };
      }

      values.push(userId);
      const query_text = `
        UPDATE usuarios 
        SET ${updates.join(', ')}, updated_at = now() 
        WHERE id = $${paramCount}
      `;

      await query(query_text, values);

      return {
        success: true,
        message: 'Usuário atualizado com sucesso'
      };

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      await query(
        'UPDATE usuarios SET ativo = false WHERE id = $1',
        [userId]
      );

      return {
        success: true,
        message: 'Usuário desativado com sucesso'
      };

    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  async listUsers(): Promise<User[]> {
    try {
      const result = await query(
        'SELECT id, nome, email, permissao, ativo, ultimo_login FROM usuarios WHERE ativo = true ORDER BY nome'
      );

      return result.rows.map(row => ({
        id: row.id,
        nome: row.nome,
        email: row.email,
        permissao: row.permissao,
        ativo: row.ativo,
        ultimo_login: row.ultimo_login
      }));

    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return [];
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar senha atual
      const userResult = await query(
        'SELECT senha FROM usuarios WHERE id = $1 AND ativo = true',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      // Verificar senha atual (a função crypt será usada na trigger)
      const passwordCheck = await query(
        'SELECT id FROM usuarios WHERE id = $1 AND senha = crypt($2, senha)',
        [userId, oldPassword]
      );

      if (passwordCheck.rows.length === 0) {
        return { success: false, message: 'Senha atual incorreta' };
      }

      // Atualizar senha
      await query(
        'UPDATE usuarios SET senha = $1, updated_at = now() WHERE id = $2',
        [newPassword, userId]
      );

      return {
        success: true,
        message: 'Senha alterada com sucesso'
      };

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }
}

export const authService = new AuthService();