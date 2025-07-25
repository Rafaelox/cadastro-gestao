// Database client for PostgreSQL VPS
// This replaces the Supabase client completely

import { apiService } from '@/services/api.service';
import type {
  Cliente,
  Categoria,
  Origem,
  Servico,
  Consultor,
  FormaPagamento,
  Agenda,
  Historico,
  ClienteFilters
} from '@/types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class DatabaseClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:3000/api';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }

      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // ============================================
  // CLIENTES CRUD
  // ============================================

  async getClientes(filters: ClienteFilters = {}): Promise<ApiResponse<Cliente[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const endpoint = `/clientes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<Cliente[]>(endpoint);
  }

  async getClienteById(id: number): Promise<ApiResponse<Cliente>> {
    return this.request<Cliente>(`/clientes/${id}`);
  }

  async createCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Cliente>> {
    return this.request<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  }

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    return this.request<Cliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    });
  }

  async deleteCliente(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/clientes/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // CATEGORIAS CRUD
  // ============================================

  async getCategorias(): Promise<ApiResponse<Categoria[]>> {
    return this.request<Categoria[]>('/categorias');
  }

  async createCategoria(categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Categoria>> {
    return this.request<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(categoria),
    });
  }

  async updateCategoria(id: number, categoria: Partial<Categoria>): Promise<ApiResponse<Categoria>> {
    return this.request<Categoria>(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoria),
    });
  }

  async deleteCategoria(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/categorias/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // ORIGENS CRUD
  // ============================================

  async getOrigens(): Promise<ApiResponse<Origem[]>> {
    return this.request<Origem[]>('/origens');
  }

  async createOrigem(origem: Omit<Origem, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Origem>> {
    return this.request<Origem>('/origens', {
      method: 'POST',
      body: JSON.stringify(origem),
    });
  }

  async updateOrigem(id: number, origem: Partial<Origem>): Promise<ApiResponse<Origem>> {
    return this.request<Origem>(`/origens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(origem),
    });
  }

  async deleteOrigem(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/origens/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // SERVIÇOS CRUD
  // ============================================

  async getServicos(): Promise<ApiResponse<Servico[]>> {
    return this.request<Servico[]>('/servicos');
  }

  async getServicoById(id: number): Promise<ApiResponse<Servico>> {
    return this.request<Servico>(`/servicos/${id}`);
  }

  async createServico(servico: Omit<Servico, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Servico>> {
    return this.request<Servico>('/servicos', {
      method: 'POST',
      body: JSON.stringify(servico),
    });
  }

  async updateServico(id: number, servico: Partial<Servico>): Promise<ApiResponse<Servico>> {
    return this.request<Servico>(`/servicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(servico),
    });
  }

  async deleteServico(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/servicos/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // CONSULTORES CRUD
  // ============================================

  async getConsultores(): Promise<ApiResponse<Consultor[]>> {
    return this.request<Consultor[]>('/consultores');
  }

  async createConsultor(consultor: Omit<Consultor, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Consultor>> {
    return this.request<Consultor>('/consultores', {
      method: 'POST',
      body: JSON.stringify(consultor),
    });
  }

  async updateConsultor(id: number, consultor: Partial<Consultor>): Promise<ApiResponse<Consultor>> {
    return this.request<Consultor>(`/consultores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(consultor),
    });
  }

  async deleteConsultor(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/consultores/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // FORMAS DE PAGAMENTO CRUD
  // ============================================

  async getFormasPagamento(): Promise<ApiResponse<FormaPagamento[]>> {
    return this.request<FormaPagamento[]>('/formas-pagamento');
  }

  async createFormaPagamento(formaPagamento: Omit<FormaPagamento, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<FormaPagamento>> {
    return this.request<FormaPagamento>('/formas-pagamento', {
      method: 'POST',
      body: JSON.stringify(formaPagamento),
    });
  }

  async updateFormaPagamento(id: number, formaPagamento: Partial<FormaPagamento>): Promise<ApiResponse<FormaPagamento>> {
    return this.request<FormaPagamento>(`/formas-pagamento/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formaPagamento),
    });
  }

  async deleteFormaPagamento(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/formas-pagamento/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // AGENDA CRUD
  // ============================================

  async getAgenda(): Promise<ApiResponse<Agenda[]>> {
    return this.request<Agenda[]>('/agenda');
  }

  async createAgenda(agenda: Omit<Agenda, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Agenda>> {
    return this.request<Agenda>('/agenda', {
      method: 'POST',
      body: JSON.stringify(agenda),
    });
  }

  async updateAgenda(id: number, agenda: Partial<Agenda>): Promise<ApiResponse<Agenda>> {
    return this.request<Agenda>(`/agenda/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agenda),
    });
  }

  async deleteAgenda(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/agenda/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // HISTÓRICO CRUD
  // ============================================

  async getHistorico(filters: any = {}): Promise<ApiResponse<Historico[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const endpoint = `/historico${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<Historico[]>(endpoint);
  }

  async createHistorico(historico: any): Promise<ApiResponse<Historico>> {
    return this.request<Historico>('/historico', {
      method: 'POST',
      body: JSON.stringify(historico),
    });
  }

  async getAgendaById(id: number): Promise<ApiResponse<Agenda>> {
    return this.request<Agenda>(`/agenda/${id}`);
  }

  async getHistoricoById(id: number): Promise<ApiResponse<Historico>> {
    return this.request<Historico>(`/historico/${id}`);
  }

  async updateHistorico(id: number, historico: any): Promise<ApiResponse<Historico>> {
    return this.request<Historico>(`/historico/${id}`, {
      method: 'PUT',
      body: JSON.stringify(historico),
    });
  }

  // ============================================
  // PAGAMENTOS CRUD
  // ============================================

  async getPagamentos(filters: any = {}): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const endpoint = `/pagamentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<any[]>(endpoint);
  }

  async createPagamento(pagamento: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<{success: boolean, data: any}>('/api/pagamentos', {
        method: 'POST',
        body: JSON.stringify(pagamento),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      return { success: false, data: null, error: 'Erro ao criar pagamento' };
    }
  }

  // Usuários
  async getUsuarios(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.request<any[]>('/api/usuarios');
      return response.success ? { success: true, data: response.data || [] } : { success: false, data: [], error: 'Erro ao buscar dados' };
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return { success: false, data: [], error: 'Erro ao buscar usuários' };
    }
  }

  async createUsuario(usuario: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<{success: boolean, data: any}>('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(usuario),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return { success: false, data: null, error: 'Erro ao criar usuário' };
    }
  }

  async updateUsuario(id: number, usuario: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<{success: boolean, data: any}>(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(usuario),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, data: null, error: 'Erro ao atualizar usuário' };
    }
  }

  async deleteUsuario(id: number): Promise<ApiResponse<void>> {
    try {
      await this.request<void>(`/api/usuarios/${id}`, {
        method: 'DELETE',
      });
      return { success: true, data: undefined };
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return { success: false, data: undefined, error: 'Erro ao deletar usuário' };
    }
  }

  // Recibos
  async getRecibos(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.request<any[]>('/api/recibos');
      return response.success ? { success: true, data: response.data || [] } : { success: false, data: [], error: 'Erro ao buscar dados' };
    } catch (error) {
      console.error('Erro ao buscar recibos:', error);
      return { success: false, data: [], error: 'Erro ao buscar recibos' };
    }
  }

  async createRecibo(recibo: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<{success: boolean, data: any}>('/api/recibos', {
        method: 'POST',
        body: JSON.stringify(recibo),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar recibo:', error);
      return { success: false, data: null, error: 'Erro ao criar recibo' };
    }
  }
}

export const databaseClient = new DatabaseClient();