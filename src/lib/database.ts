// Configuração e funções para conectar ao banco PostgreSQL na VPS
import { toast } from "@/hooks/use-toast";

// Tipos TypeScript para as entidades
export interface Cliente {
  id?: number;
  nome: string;
  data_nascimento?: string;
  cpf?: string;
  cep?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  categoria_id?: number;
  origem_id?: number;
  ativo: boolean;
  recebe_email: boolean;
  recebe_whatsapp: boolean;
  recebe_sms: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  id?: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface Origem {
  id?: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface Usuario {
  id?: number;
  username: string;
  password_hash?: string;
  nome: string;
  email?: string;
  tipo_usuario: 'admin' | 'user';
  ativo: boolean;
  ultimo_login?: string;
}

// Configuração da API para conectar ao backend na VPS
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

class DatabaseService {
  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Database request error:', error);
      toast({
        title: "Erro na operação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ============================================
  // AUTENTICAÇÃO
  // ============================================

  async login(username: string, password: string): Promise<{ token: string; user: Usuario }> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }
    
    return response;
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  getCurrentUser(): Usuario | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.tipo_usuario === 'admin';
  }

  // ============================================
  // CLIENTES CRUD
  // ============================================

  async getClientes(filters: {
    nome?: string;
    cpf?: string;
    email?: string;
    categoria_id?: number;
    origem_id?: number;
    ativo?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Cliente[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/clientes?${params.toString()}`);
  }

  async getClienteById(id: number): Promise<Cliente> {
    return this.request(`/clientes/${id}`);
  }

  async createCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    return this.request('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  }

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    return this.request(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    });
  }

  async deleteCliente(id: number): Promise<void> {
    await this.request(`/clientes/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // CATEGORIAS CRUD
  // ============================================

  async getCategorias(): Promise<Categoria[]> {
    return this.request('/categorias');
  }

  async createCategoria(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
    return this.request('/categorias', {
      method: 'POST',
      body: JSON.stringify(categoria),
    });
  }

  async updateCategoria(id: number, categoria: Partial<Categoria>): Promise<Categoria> {
    return this.request(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoria),
    });
  }

  async deleteCategoria(id: number): Promise<void> {
    await this.request(`/categorias/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // ORIGENS CRUD
  // ============================================

  async getOrigens(): Promise<Origem[]> {
    return this.request('/origens');
  }

  async createOrigem(origem: Omit<Origem, 'id'>): Promise<Origem> {
    return this.request('/origens', {
      method: 'POST',
      body: JSON.stringify(origem),
    });
  }

  async updateOrigem(id: number, origem: Partial<Origem>): Promise<Origem> {
    return this.request(`/origens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(origem),
    });
  }

  async deleteOrigem(id: number): Promise<void> {
    await this.request(`/origens/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // BUSCA DE CEP
  // ============================================

  async buscarCep(cep: string): Promise<{
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
  }> {
    try {
      // Remove caracteres não numéricos
      const cepLimpo = cep.replace(/\D/g, '');
      
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw error;
    }
  }

  // ============================================
  // ESTATÍSTICAS
  // ============================================

  async getEstatisticas(): Promise<{
    total_clientes: number;
    clientes_ativos: number;
    clientes_inativos: number;
    por_categoria: { categoria: string; total: number }[];
    por_origem: { origem: string; total: number }[];
  }> {
    return this.request('/estatisticas');
  }
}

// Instância singleton do serviço
export const db = new DatabaseService();

// Funções utilitárias
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};