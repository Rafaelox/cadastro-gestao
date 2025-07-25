export interface FormaPagamento {
  id?: number;
  nome: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Consultor {
  id?: number;
  nome: string;
  email?: string;
  telefone?: string;
  comissao?: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Servico {
  id?: number;
  nome: string;
  descricao?: string;
  preco: number;
  categoria_id?: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Cliente {
  id: number;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
}

export interface CaixaFormProps {
  onSuccess?: () => void;
  atendimentoId?: number;
}