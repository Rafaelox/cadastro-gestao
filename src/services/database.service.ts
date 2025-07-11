// Database service with improved error handling and type safety
import { supabase } from "@/integrations/supabase/client";
import type { 
  Cliente, 
  Categoria, 
  Origem, 
  Servico, 
  Consultor, 
  FormaPagamento,
  ClienteFilters,
  ApiResponse 
} from "@/types";

class DatabaseService {
  private async handleRequest<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await operation();
      
      if (error) {
        console.error('Database error:', error);
        return {
          success: false,
          error: error.message || 'Erro na operação do banco de dados'
        };
      }

      return {
        success: true,
        data: data || undefined
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        success: false,
        error: 'Erro inesperado na operação'
      };
    }
  }

  // ============================================
  // CLIENTES CRUD
  // ============================================

  async getClientes(filters: ClienteFilters = {}): Promise<ApiResponse<Cliente[]>> {
    return this.handleRequest(async () => {
      let query = supabase
        .from('clientes')
        .select('*');

      // Apply filters
      if (filters.nome) {
        query = query.ilike('nome', `%${filters.nome}%`);
      }
      if (filters.cpf) {
        query = query.ilike('cpf', `%${filters.cpf}%`);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.telefone) {
        query = query.ilike('telefone', `%${filters.telefone}%`);
      }
      if (filters.categoria_id) {
        query = query.eq('categoria_id', filters.categoria_id);
      }
      if (filters.origem_id) {
        query = query.eq('origem_id', filters.origem_id);
      }
      if (filters.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      // Apply ordering
      const orderBy = filters.orderBy || 'created_at';
      const ascending = filters.orderDirection === 'asc';
      query = query.order(orderBy, { ascending });

      return await query;
    });
  }

  async getClienteById(id: number): Promise<ApiResponse<Cliente>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    });
  }

  async createCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Cliente>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('clientes')
        .insert(cliente)
        .select()
        .single();
    });
  }

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('clientes')
        .update(cliente)
        .eq('id', id)
        .select()
        .single();
    });
  }

  async deleteCliente(id: number): Promise<ApiResponse<void>> {
    return this.handleRequest(async () => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      return { data: null, error };
    });
  }

  // ============================================
  // CATEGORIAS CRUD
  // ============================================

  async getCategorias(): Promise<ApiResponse<Categoria[]>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('categorias')
        .select('*')
        .order('nome');
    });
  }

  async createCategoria(categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Categoria>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('categorias')
        .insert(categoria)
        .select()
        .single();
    });
  }

  async updateCategoria(id: number, categoria: Partial<Categoria>): Promise<ApiResponse<Categoria>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('categorias')
        .update(categoria)
        .eq('id', id)
        .select()
        .single();
    });
  }

  async deleteCategoria(id: number): Promise<ApiResponse<void>> {
    return this.handleRequest(async () => {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
      
      return { data: null, error };
    });
  }

  // ============================================
  // ORIGENS CRUD
  // ============================================

  async getOrigens(): Promise<ApiResponse<Origem[]>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('origens')
        .select('*')
        .order('nome');
    });
  }

  async createOrigem(origem: Omit<Origem, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Origem>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('origens')
        .insert(origem)
        .select()
        .single();
    });
  }

  async updateOrigem(id: number, origem: Partial<Origem>): Promise<ApiResponse<Origem>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('origens')
        .update(origem)
        .eq('id', id)
        .select()
        .single();
    });
  }

  async deleteOrigem(id: number): Promise<ApiResponse<void>> {
    return this.handleRequest(async () => {
      const { error } = await supabase
        .from('origens')
        .delete()
        .eq('id', id);
      
      return { data: null, error };
    });
  }

  // ============================================
  // SERVIÇOS CRUD
  // ============================================

  async getServicos(): Promise<ApiResponse<Servico[]>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('servicos')
        .select('*')
        .order('nome');
    });
  }

  async getServicoById(id: number): Promise<ApiResponse<Servico>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('servicos')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    });
  }

  async createServico(servico: Omit<Servico, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Servico>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('servicos')
        .insert(servico)
        .select()
        .single();
    });
  }

  async updateServico(id: number, servico: Partial<Servico>): Promise<ApiResponse<Servico>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('servicos')
        .update(servico)
        .eq('id', id)
        .select()
        .single();
    });
  }

  async deleteServico(id: number): Promise<ApiResponse<void>> {
    return this.handleRequest(async () => {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);
      
      return { data: null, error };
    });
  }

  // ============================================
  // CONSULTORES CRUD
  // ============================================

  async getConsultores(): Promise<ApiResponse<Consultor[]>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('consultores')
        .select('*')
        .order('nome');
    });
  }

  async createConsultor(consultor: Omit<Consultor, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Consultor>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('consultores')
        .insert(consultor)
        .select()
        .single();
    });
  }

  async updateConsultor(id: number, consultor: Partial<Consultor>): Promise<ApiResponse<Consultor>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('consultores')
        .update(consultor)
        .eq('id', id)
        .select()
        .single();
    });
  }

  async deleteConsultor(id: number): Promise<ApiResponse<void>> {
    return this.handleRequest(async () => {
      const { error } = await supabase
        .from('consultores')
        .delete()
        .eq('id', id);
      
      return { data: null, error };
    });
  }

  // ============================================
  // FORMAS DE PAGAMENTO CRUD
  // ============================================

  async getFormasPagamento(): Promise<ApiResponse<FormaPagamento[]>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('formas_pagamento')
        .select('*')
        .order('ordem');
    });
  }

  async createFormaPagamento(formaPagamento: Omit<FormaPagamento, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<FormaPagamento>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('formas_pagamento')
        .insert(formaPagamento)
        .select()
        .single();
    });
  }

  async updateFormaPagamento(id: number, formaPagamento: Partial<FormaPagamento>): Promise<ApiResponse<FormaPagamento>> {
    return this.handleRequest(async () => {
      return await supabase
        .from('formas_pagamento')
        .update(formaPagamento)
        .eq('id', id)
        .select()
        .single();
    });
  }

  async deleteFormaPagamento(id: number): Promise<ApiResponse<void>> {
    return this.handleRequest(async () => {
      const { error } = await supabase
        .from('formas_pagamento')
        .delete()
        .eq('id', id);
      
      return { data: null, error };
    });
  }
}

export const databaseService = new DatabaseService();