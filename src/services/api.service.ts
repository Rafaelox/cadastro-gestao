// Serviço de API para PostgreSQL
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Método para testar conectividade sem autenticação
  async testConnection(): Promise<any> {
    const url = `${this.baseUrl}/test`;
    console.log('🔍 Testando API em:', url);
    console.log('🔍 URL base configurada:', this.baseUrl);
    
    try {
      const response = await fetch(url);
      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      
      // Capturar o texto bruto da resposta
      const responseText = await response.text();
      console.log('📄 Resposta bruta:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Resposta: ${responseText}`);
      }

      // Tentar fazer parse do JSON
      try {
        const jsonData = JSON.parse(responseText);
        console.log('✅ JSON válido:', jsonData);
        return jsonData;
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        throw new Error(`A resposta não é um JSON válido. Conteúdo recebido: "${responseText.substring(0, 200)}..."`);
      }
    } catch (networkError: any) {
      console.error('❌ Erro de rede:', networkError);
      throw new Error(`Erro de conectividade: ${networkError.message}`);
    }
  }

  // Clientes
  async getClientes(filters?: any) {
    return this.request('/clientes', {
      method: 'GET',
    });
  }

  async createCliente(data: any) {
    return this.request('/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCliente(id: string, data: any) {
    return this.request(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCliente(id: string) {
    return this.request(`/clientes/${id}`, {
      method: 'DELETE',
    });
  }

  // Agenda
  async getAgenda(filters?: any) {
    return this.request('/agenda', {
      method: 'GET',
    });
  }

  async createAgenda(data: any) {
    return this.request('/agenda', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Histórico
  async getHistorico(filters?: any) {
    return this.request('/historico', {
      method: 'GET',
    });
  }

  async createHistorico(data: any) {
    return this.request('/historico', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Pagamentos
  async getPagamentos(filters?: any) {
    return this.request('/pagamentos', {
      method: 'GET',
    });
  }

  async createPagamento(data: any) {
    return this.request('/pagamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Configurações
  async getCategorias() {
    return this.request('/categorias');
  }

  async getOrigens() {
    return this.request('/origens');
  }

  async getServicos() {
    return this.request('/servicos');
  }

  async getConsultores() {
    return this.request('/consultores');
  }

  async getFormasPagamento() {
    return this.request('/formas-pagamento');
  }
}

export const apiService = new ApiService();