export interface ConfiguracaoEmpresa {
  id: number;
  nome: string;
  tipo_pessoa: 'fisica' | 'juridica';
  cpf_cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  logo_url?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TipoRecibo {
  id: number;
  nome: string;
  template: 'normal' | 'doacao';
  ativo: boolean;
}

export interface Recibo {
  id: number;
  numero_recibo: string;
  tipo_recibo_id: number;
  pagamento_id?: number;
  cliente_id: number;
  consultor_id?: number;
  valor: number;
  descricao?: string;
  observacoes?: string;
  dados_empresa: ConfiguracaoEmpresa;
  dados_cliente: any;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ReciboFormData {
  tipo_recibo_id: number;
  pagamento_id?: number;
  cliente_id: number;
  consultor_id?: number;
  valor: number;
  descricao?: string;
  observacoes?: string;
}