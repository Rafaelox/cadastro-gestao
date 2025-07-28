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
    // Use environment variable for API URL, fallback to relative URL for production
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    console.log('🔧 DatabaseClient initialized with baseUrl:', this.baseUrl);
    console.log('🔧 Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('🔧 Current hostname:', window.location.hostname);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      };

      const fullUrl = `${this.baseUrl}${endpoint}`;
      console.log(`🌐 Making request to: ${fullUrl}`);
      console.log(`🔑 Token exists: ${!!token}`);

      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      console.log(`📡 Response status: ${response.status} for ${fullUrl}`);
      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ Request failed: ${response.status} for ${fullUrl}`, data);
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }

      console.log(`✅ Request successful for ${fullUrl}`, data);
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      const fullUrl = `${this.baseUrl}${endpoint}`;
      console.error(`💥 Network error for ${fullUrl}:`, error);
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
    console.log('🎯 DatabaseClient: Calling getCategorias()');
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
    console.log('🎯 DatabaseClient: Calling getOrigens()');
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
    console.log('🎯 DatabaseClient: Calling getServicos()');
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
    console.log('🎯 DatabaseClient: Calling getConsultores()');
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
    console.log('🎯 DatabaseClient: Calling getFormasPagamento()');
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
      const response = await this.request<{success: boolean, data: any}>('/pagamentos', {
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
      const response = await this.request<any[]>('/usuarios');
      return response.success ? { success: true, data: response.data || [] } : { success: false, data: [], error: 'Erro ao buscar dados' };
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return { success: false, data: [], error: 'Erro ao buscar usuários' };
    }
  }

  async createUsuario(usuario: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<{success: boolean, data: any}>('/usuarios', {
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
      const response = await this.request<{success: boolean, data: any}>(`/usuarios/${id}`, {
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
      await this.request<void>(`/usuarios/${id}`, {
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
      const response = await this.request<any[]>('/recibos');
      return response.success ? { success: true, data: response.data || [] } : { success: false, data: [], error: 'Erro ao buscar dados' };
    } catch (error) {
      console.error('Erro ao buscar recibos:', error);
      return { success: false, data: [], error: 'Erro ao buscar recibos' };
    }
  }

  async createRecibo(recibo: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<{success: boolean, data: any}>('/recibos', {
        method: 'POST',
        body: JSON.stringify(recibo),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar recibo:', error);
      return { success: false, data: null, error: 'Erro ao criar recibo' };
    }
  }

  // Audit Logs
  async getAuditLogs(filters?: any): Promise<ApiResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });
      }
      const url = params.toString() ? `/audit_logs?${params.toString()}` : '/audit_logs';
      const response = await this.request<any[]>(url);
      return response.success ? { success: true, data: response.data || [] } : { success: false, data: [], error: 'Erro ao buscar dados' };
    } catch (error) {
      console.error('Erro ao buscar audit logs:', error);
      return { success: false, data: [], error: 'Erro ao buscar audit logs' };
    }
  }

  // Comissões
  async getComissoes(filters?: any): Promise<ApiResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });
      }
      const url = params.toString() ? `/comissoes?${params.toString()}` : '/comissoes';
      const response = await this.request<any[]>(url);
      return response.success ? { success: true, data: response.data || [] } : { success: false, data: [], error: 'Erro ao buscar dados' };
    } catch (error) {
      console.error('Erro ao buscar comissões:', error);
      return { success: false, data: [], error: 'Erro ao buscar comissões' };
    }
  }

  // Configurações Empresa
  async getConfiguracaoEmpresa(): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<any>('/configuracao/empresa');
      return response.success ? { success: true, data: response.data } : { success: false, data: null, error: 'Erro ao buscar dados' };
    } catch (error) {
      console.error('Erro ao buscar configuração empresa:', error);
      return { success: false, data: null, error: 'Erro ao buscar configuração empresa' };
    }
  }

  async createConfiguracaoEmpresa(config: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<{success: boolean, data: any}>('/configuracao/empresa', {
        method: 'POST',
        body: JSON.stringify(config),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar configuração empresa:', error);
      return { success: false, data: null, error: 'Erro ao criar configuração empresa' };
    }
  }

  async updateConfiguracaoEmpresa(id: number, config: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<{success: boolean, data: any}>(`/configuracao/empresa/${id}`, {
        method: 'PUT',
        body: JSON.stringify(config),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar configuração empresa:', error);
      return { success: false, data: null, error: 'Erro ao atualizar configuração empresa' };
    }
  }

  // File Upload (versão corrigida)
  async uploadFileToStorage(file: File, bucket: string = 'uploads'): Promise<{path: string; url: string}> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/storage/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Erro no upload do arquivo');
    }

    const result = await response.json();
    return result.data;
  }

  async getPublicUrlFromStorage(path: string, bucket: string = 'uploads'): Promise<string> {
    return `${this.baseUrl}/storage/${bucket}/${path}`;
  }

  // RPC Functions
  async rpc(functionName: string, params?: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<{success: boolean, data: any}>('/rpc', {
        method: 'POST',
        body: JSON.stringify({ function: functionName, params }),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao executar RPC:', error);
      return { success: false, data: null, error: 'Erro ao executar RPC' };
    }
  }

  // Tipos Recibo
  async getTiposRecibo(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.request<any[]>('/tipos-recibo');
      return response.success ? { success: true, data: response.data || [] } : { success: false, data: [], error: 'Erro ao buscar dados' };
    } catch (error) {
      console.error('Erro ao buscar tipos recibo:', error);
      return { success: false, data: [], error: 'Erro ao buscar tipos recibo' };
    }
  }

  // Parcelas
  async getParcelas(filters?: any): Promise<ApiResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });
      }
      const url = params.toString() ? `/parcelas?${params.toString()}` : '/parcelas';
      const response = await this.request<any[]>(url);
      return response.success ? { success: true, data: response.data || [] } : { success: false, data: [], error: 'Erro ao buscar dados' };
    } catch (error) {
      console.error('Erro ao buscar parcelas:', error);
      return { success: false, data: [], error: 'Erro ao buscar parcelas' };
    }
  }

  async createParcela(parcela: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<{success: boolean, data: any}>('/parcelas', {
        method: 'POST',
        body: JSON.stringify(parcela),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar parcela:', error);
      return { success: false, data: null, error: 'Erro ao criar parcela' };
    }
  }

  // ============================================
  // MÉTODOS ADICIONAIS PARA MIGRAÇÃO
  // ============================================

  // Método para contar registros de uma tabela
  async getTableCount(tableName: string): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await this.request<{ count: number }>(`/${tableName}/count`);
      return response;
    } catch (error: any) {
      return { success: false, data: { count: 0 }, error: error.message };
    }
  }

  // Método para buscar clientes segmentados
  async getClientesSegmentados(filtros: any): Promise<ApiResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id.join(','));
      if (filtros.origem_id) params.append('origem_id', filtros.origem_id.join(','));
      if (filtros.recebe_email !== undefined) params.append('recebe_email', filtros.recebe_email.toString());
      if (filtros.recebe_sms !== undefined) params.append('recebe_sms', filtros.recebe_sms.toString());
      if (filtros.recebe_whatsapp !== undefined) params.append('recebe_whatsapp', filtros.recebe_whatsapp.toString());
      
      const endpoint = `/clientes/segmentados${params.toString() ? `?${params.toString()}` : ''}`;
      return this.request<any[]>(endpoint);
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  }

  // Método para templates de comunicação
  async getTemplatesComunicacao(): Promise<ApiResponse<any[]>> {
    try {
      return this.request<any[]>('/templates-comunicacao');
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  }

  // Método para upload de arquivos (versão simplificada)
  async uploadFile(file: File): Promise<{ path?: string; error?: string }> {
    try {
      // Simular upload local para desenvolvimento
      const fileName = `${Date.now()}-${file.name}`;
      return { path: fileName, error: undefined };
    } catch (error: any) {
      return { path: undefined, error: error.message };
    }
  }

  // Método para obter URL pública
  getPublicUrl(path: string, bucket?: string): string {
    // Simular URL pública
    return `${this.baseUrl}/storage/${bucket || 'default'}/${path}`;
  }
}

export const databaseClient = new DatabaseClient();