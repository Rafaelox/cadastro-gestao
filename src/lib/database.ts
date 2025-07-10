import { supabase } from "@/integrations/supabase/client";

// Interfaces
export interface Cliente {
  id?: number;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  categoria_id?: number;
  origem_id?: number;
  recebe_email: boolean;
  recebe_whatsapp: boolean;
  recebe_sms: boolean;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  id?: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Origem {
  id?: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Servico {
  id?: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Consultor {
  id?: number;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  percentual_comissao: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FormaPagamento {
  id?: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  ordem: number;
  created_at?: string;
  updated_at?: string;
}

export interface Agenda {
  id?: number;
  cliente_id: number;
  consultor_id: number;
  servico_id: number;
  data_agendamento: string;
  status: string;
  observacoes?: string;
  valor_servico: number;
  comissao_consultor: number;
  created_at?: string;
  updated_at?: string;
}

export interface Historico {
  id?: number;
  agenda_id: number;
  cliente_id: number;
  consultor_id: number;
  servico_id: number;
  data_agendamento?: string;
  data_atendimento: string;
  valor_servico: number;
  valor_final?: number;
  comissao_consultor: number;
  forma_pagamento?: number;
  observacoes_atendimento?: string;
  procedimentos_realizados?: string;
  created_at?: string;
  updated_at?: string;
}

class DatabaseService {
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
    let query = supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.nome) {
      query = query.ilike('nome', `%${filters.nome}%`);
    }
    if (filters.cpf) {
      query = query.ilike('cpf', `%${filters.cpf}%`);
    }
    if (filters.email) {
      query = query.ilike('email', `%${filters.email}%`);
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

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async getClienteById(id: number): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Erro ao criar cliente');
    }

    return data;
  }

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Cliente não encontrado para atualização');
    }

    return data;
  }

  async deleteCliente(id: number): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // ============================================
  // CATEGORIAS CRUD
  // ============================================

  async getCategorias(): Promise<Categoria[]> {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async createCategoria(categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<Categoria> {
    const { data, error } = await supabase
      .from('categorias')
      .insert(categoria)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateCategoria(id: number, categoria: Partial<Categoria>): Promise<Categoria> {
    const { data, error } = await supabase
      .from('categorias')
      .update(categoria)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteCategoria(id: number): Promise<void> {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // ============================================
  // ORIGENS CRUD
  // ============================================

  async getOrigens(): Promise<Origem[]> {
    const { data, error } = await supabase
      .from('origens')
      .select('*')
      .order('nome');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async createOrigem(origem: Omit<Origem, 'id' | 'created_at' | 'updated_at'>): Promise<Origem> {
    const { data, error } = await supabase
      .from('origens')
      .insert(origem)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateOrigem(id: number, origem: Partial<Origem>): Promise<Origem> {
    const { data, error } = await supabase
      .from('origens')
      .update(origem)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteOrigem(id: number): Promise<void> {
    const { error } = await supabase
      .from('origens')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // ============================================
  // SERVIÇOS CRUD
  // ============================================

  async getServicos(): Promise<Servico[]> {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .order('nome');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async getServicoById(id: number): Promise<Servico | null> {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createServico(servico: Omit<Servico, 'id' | 'created_at' | 'updated_at'>): Promise<Servico> {
    const { data, error } = await supabase
      .from('servicos')
      .insert(servico)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateServico(id: number, servico: Partial<Servico>): Promise<Servico> {
    const { data, error } = await supabase
      .from('servicos')
      .update(servico)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteServico(id: number): Promise<void> {
    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // ============================================
  // CONSULTORES CRUD
  // ============================================

  async getConsultores(): Promise<Consultor[]> {
    const { data, error } = await supabase
      .from('consultores')
      .select('*')
      .order('nome');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async createConsultor(consultor: Omit<Consultor, 'id' | 'created_at' | 'updated_at'>): Promise<Consultor> {
    const { data, error } = await supabase
      .from('consultores')
      .insert(consultor)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateConsultor(id: number, consultor: Partial<Consultor>): Promise<Consultor> {
    const { data, error } = await supabase
      .from('consultores')
      .update(consultor)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteConsultor(id: number): Promise<void> {
    const { error } = await supabase
      .from('consultores')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // ============================================
  // FORMAS DE PAGAMENTO CRUD
  // ============================================

  async getFormasPagamento(): Promise<FormaPagamento[]> {
    const { data, error } = await supabase
      .from('formas_pagamento')
      .select('*')
      .order('ordem');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async createFormaPagamento(formaPagamento: Omit<FormaPagamento, 'id' | 'created_at' | 'updated_at'>): Promise<FormaPagamento> {
    const { data, error } = await supabase
      .from('formas_pagamento')
      .insert(formaPagamento)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateFormaPagamento(id: number, formaPagamento: Partial<FormaPagamento>): Promise<FormaPagamento> {
    const { data, error } = await supabase
      .from('formas_pagamento')
      .update(formaPagamento)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteFormaPagamento(id: number): Promise<void> {
    const { error } = await supabase
      .from('formas_pagamento')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // ============================================
  // AGENDA CRUD
  // ============================================

  async getAgenda(): Promise<Agenda[]> {
    const { data, error } = await supabase
      .from('agenda')
      .select('*')
      .order('data_agendamento', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async createAgenda(agenda: Omit<Agenda, 'id' | 'created_at' | 'updated_at'>): Promise<Agenda> {
    const { data, error } = await supabase
      .from('agenda')
      .insert(agenda)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateAgenda(id: number, agenda: Partial<Agenda>): Promise<Agenda> {
    const { data, error } = await supabase
      .from('agenda')
      .update(agenda)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteAgenda(id: number): Promise<void> {
    const { error } = await supabase
      .from('agenda')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
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
    let query = supabase
      .from('historico')
      .select(`
        *,
        clientes(nome),
        consultores(nome),
        servicos(nome),
        formas_pagamento(nome)
      `)
      .order('data_atendimento', { ascending: false });

    if (filters.servico_id) {
      query = query.eq('servico_id', filters.servico_id);
    }
    if (filters.data_inicio) {
      query = query.gte('data_atendimento', filters.data_inicio);
    }
    if (filters.data_fim) {
      query = query.lte('data_atendimento', filters.data_fim);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Mapear os dados para estrutura esperada pelos componentes
    return (data || []).map((item: any) => ({
      ...item,
      cliente_nome: item.clientes?.nome || '',
      consultor_nome: item.consultores?.nome || '',
      servico_nome: item.servicos?.nome || '',
      forma_pagamento_nome: item.formas_pagamento?.nome || ''
    }));
  }

  // Getter para acessar supabase diretamente quando necessário
  get supabase() {
    return supabase;
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
    try {
      // Total de clientes
      const { count: totalClientes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      // Clientes ativos
      const { count: clientesAtivos } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Clientes inativos
      const { count: clientesInativos } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', false);

      // Por categoria
      const { data: porCategoria } = await supabase
        .from('clientes')
        .select(`
          categoria_id,
          categorias!inner(nome)
        `);

      // Por origem
      const { data: porOrigem } = await supabase
        .from('clientes')
        .select(`
          origem_id,
          origens!inner(nome)
        `);

      // Agrupar por categoria
      const categoriasGroup = porCategoria?.reduce((acc: any, item: any) => {
        const categoria = item.categorias?.nome || 'Sem categoria';
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {}) || {};

      // Agrupar por origem
      const origensGroup = porOrigem?.reduce((acc: any, item: any) => {
        const origem = item.origens?.nome || 'Sem origem';
        acc[origem] = (acc[origem] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        total_clientes: totalClientes || 0,
        clientes_ativos: clientesAtivos || 0,
        clientes_inativos: clientesInativos || 0,
        por_categoria: Object.entries(categoriasGroup).map(([categoria, total]) => ({
          categoria,
          total: total as number
        })),
        por_origem: Object.entries(origensGroup).map(([origem, total]) => ({
          origem,
          total: total as number
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total_clientes: 0,
        clientes_ativos: 0,
        clientes_inativos: 0,
        por_categoria: [],
        por_origem: []
      };
    }
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