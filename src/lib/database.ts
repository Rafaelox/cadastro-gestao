// Database service - Updated to use PostgreSQL VPS
import { databaseClient } from "./database-client";
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
} from "@/types";

class DatabaseService {
  // ============================================
  // CLIENTES CRUD
  // ============================================

  async getClientes(filters: ClienteFilters = {}): Promise<Cliente[]> {
    const response = await databaseClient.getClientes(filters);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar clientes');
    }

    return response.data || [];
  }

  async getClienteById(id: number): Promise<Cliente | null> {
    const response = await databaseClient.getClienteById(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar cliente');
    }

    return response.data || null;
  }

  async createCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    const response = await databaseClient.createCliente(cliente);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar cliente');
    }

    if (!response.data) {
      throw new Error('Erro ao criar cliente');
    }

    return response.data;
  }

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    const response = await databaseClient.updateCliente(id, cliente);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar cliente');
    }

    if (!response.data) {
      throw new Error('Cliente não encontrado para atualização');
    }

    return response.data;
  }

  async deleteCliente(id: number): Promise<void> {
    const response = await databaseClient.deleteCliente(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar cliente');
    }
  }

  // ============================================
  // CATEGORIAS CRUD
  // ============================================

  async getCategorias(): Promise<Categoria[]> {
    const response = await databaseClient.getCategorias();
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar categorias');
    }

    return response.data || [];
  }

  async createCategoria(categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<Categoria> {
    const response = await databaseClient.createCategoria(categoria);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar categoria');
    }

    return response.data!;
  }

  async updateCategoria(id: number, categoria: Partial<Categoria>): Promise<Categoria> {
    const response = await databaseClient.updateCategoria(id, categoria);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar categoria');
    }

    return response.data!;
  }

  async deleteCategoria(id: number): Promise<void> {
    const response = await databaseClient.deleteCategoria(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar categoria');
    }
  }

  // ============================================
  // ORIGENS CRUD
  // ============================================

  async getOrigens(): Promise<Origem[]> {
    const response = await databaseClient.getOrigens();
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar origens');
    }

    return response.data || [];
  }

  async createOrigem(origem: Omit<Origem, 'id' | 'created_at' | 'updated_at'>): Promise<Origem> {
    const response = await databaseClient.createOrigem(origem);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar origem');
    }

    return response.data!;
  }

  async updateOrigem(id: number, origem: Partial<Origem>): Promise<Origem> {
    const response = await databaseClient.updateOrigem(id, origem);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar origem');
    }

    return response.data!;
  }

  async deleteOrigem(id: number): Promise<void> {
    const response = await databaseClient.deleteOrigem(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar origem');
    }
  }

  // ============================================
  // SERVIÇOS CRUD
  // ============================================

  async getServicos(): Promise<Servico[]> {
    const response = await databaseClient.getServicos();
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar serviços');
    }

    return response.data || [];
  }

  async getServicoById(id: number): Promise<Servico | null> {
    const response = await databaseClient.getServicoById(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar serviço');
    }

    return response.data || null;
  }

  async createServico(servico: Omit<Servico, 'id' | 'created_at' | 'updated_at'>): Promise<Servico> {
    const response = await databaseClient.createServico(servico);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar serviço');
    }

    return response.data!;
  }

  async updateServico(id: number, servico: Partial<Servico>): Promise<Servico> {
    const response = await databaseClient.updateServico(id, servico);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar serviço');
    }

    return response.data!;
  }

  async deleteServico(id: number): Promise<void> {
    const response = await databaseClient.deleteServico(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar serviço');
    }
  }

  // ============================================
  // CONSULTORES CRUD
  // ============================================

  async getConsultores(): Promise<Consultor[]> {
    const response = await databaseClient.getConsultores();
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar consultores');
    }

    return response.data || [];
  }

  async createConsultor(consultor: Omit<Consultor, 'id' | 'created_at' | 'updated_at'>): Promise<Consultor> {
    const response = await databaseClient.createConsultor(consultor);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar consultor');
    }

    return response.data!;
  }

  async updateConsultor(id: number, consultor: Partial<Consultor>): Promise<Consultor> {
    const response = await databaseClient.updateConsultor(id, consultor);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar consultor');
    }

    return response.data!;
  }

  async deleteConsultor(id: number): Promise<void> {
    const response = await databaseClient.deleteConsultor(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar consultor');
    }
  }

  // ============================================
  // FORMAS DE PAGAMENTO CRUD
  // ============================================

  async getFormasPagamento(): Promise<FormaPagamento[]> {
    const response = await databaseClient.getFormasPagamento();
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar formas de pagamento');
    }

    return response.data || [];
  }

  async createFormaPagamento(formaPagamento: Omit<FormaPagamento, 'id' | 'created_at' | 'updated_at'>): Promise<FormaPagamento> {
    const response = await databaseClient.createFormaPagamento(formaPagamento);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar forma de pagamento');
    }

    return response.data!;
  }

  async updateFormaPagamento(id: number, formaPagamento: Partial<FormaPagamento>): Promise<FormaPagamento> {
    const response = await databaseClient.updateFormaPagamento(id, formaPagamento);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar forma de pagamento');
    }

    return response.data!;
  }

  async deleteFormaPagamento(id: number): Promise<void> {
    const response = await databaseClient.deleteFormaPagamento(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar forma de pagamento');
    }
  }

  // ============================================
  // AGENDA CRUD
  // ============================================

  async getAgenda(): Promise<Agenda[]> {
    const response = await databaseClient.getAgenda();
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar agenda');
    }

    return response.data || [];
  }

  async createAgenda(agenda: Omit<Agenda, 'id' | 'created_at' | 'updated_at'>): Promise<Agenda> {
    const response = await databaseClient.createAgenda(agenda);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar agendamento');
    }

    return response.data!;
  }

  async updateAgenda(id: number, agenda: Partial<Agenda>): Promise<Agenda> {
    const response = await databaseClient.updateAgenda(id, agenda);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar agendamento');
    }

    return response.data!;
  }

  async deleteAgenda(id: number): Promise<void> {
    const response = await databaseClient.deleteAgenda(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar agendamento');
    }
  }

  // ============================================
  // HISTÓRICO CRUD
  // ============================================

  async getHistorico(filters: {
    servico_id?: number;
    data_inicio?: string;
    data_fim?: string;
  } = {}): Promise<any[]> {
    const response = await databaseClient.getHistorico(filters);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar histórico');
    }

    return response.data || [];
  }

  async createHistorico(historico: any): Promise<any> {
    const response = await databaseClient.createHistorico(historico);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar histórico');
    }

    return response.data!;
  }

  // ============================================
  // PAGAMENTOS CRUD
  // ============================================

  async getPagamentos(filters: any = {}): Promise<any[]> {
    const response = await databaseClient.getPagamentos(filters);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar pagamentos');
    }

    return response.data || [];
  }

  async createPagamento(pagamento: any): Promise<any> {
    const response = await databaseClient.createPagamento(pagamento);
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar pagamento');
    }

    return response.data!;
  }

  // CEP lookup function for compatibility
  async buscarCep(cep: string) {
    return buscarCep(cep);
  }
}

export const databaseService = new DatabaseService();

// Legacy exports for backward compatibility
export const db = databaseService;
export { databaseService as default };

// Helper functions for forms
export const formatCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCEP = (cep: string): string => {
  return cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  // Simplified CPF validation - you can add more complex validation here
  return !cleanCPF.split('').every(digit => digit === cleanCPF[0]);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// CEP lookup function
export const buscarCep = async (cep: string) => {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return {
      cep: data.cep,
      endereco: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf
    };
  } catch (error) {
    throw new Error('Erro ao buscar CEP');
  }
};