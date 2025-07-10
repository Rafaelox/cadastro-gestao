export interface FormaPagamento {
  id: number;
  nome: string;
}

export interface Consultor {
  id: number;
  nome: string;
}

export interface Servico {
  id: number;
  nome: string;
  preco: number;
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