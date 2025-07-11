// Centralized type definitions for the application

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

export interface HistoricoItem extends Historico {
  consultor_nome?: string;
  servico_nome?: string;
  cliente_nome?: string;
  forma_pagamento_nome?: string;
}

// Auth types
export type TipoPermissao = 'master' | 'gerente' | 'secretaria' | 'user';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  permissao: TipoPermissao;
  ativo: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Filter types
export interface ClienteFilters {
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  categoria_id?: number;
  origem_id?: number;
  ativo?: boolean;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface HistoricoFilters {
  clienteId?: number;
  consultorId?: number;
  data_inicio?: string;
  data_fim?: string;
}