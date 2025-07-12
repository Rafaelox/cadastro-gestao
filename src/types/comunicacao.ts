export interface ConfiguracaoComunicacao {
  id?: number;
  tipo_servico: 'sms' | 'email' | 'whatsapp';
  provider: string;
  api_key?: string;
  api_secret?: string;
  webhook_url?: string;
  configuracoes_extras?: Record<string, any>;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface TemplateComunicacao {
  id?: number;
  nome: string;
  tipo: 'sms' | 'email' | 'whatsapp';
  assunto?: string;
  conteudo: string;
  variaveis?: Record<string, string>;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CampanhaMarketing {
  id?: number;
  nome: string;
  descricao?: string;
  tipo_comunicacao: 'sms' | 'email' | 'whatsapp';
  template_id?: number;
  filtros: Record<string, any>;
  data_agendamento?: string;
  data_execucao?: string;
  status: 'rascunho' | 'agendada' | 'executando' | 'finalizada' | 'cancelada';
  total_destinatarios: number;
  total_enviados: number;
  total_sucesso: number;
  total_erro: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Comunicacao {
  id?: number;
  cliente_id: number;
  campanha_id?: number;
  template_id?: number;
  tipo: 'sms' | 'email' | 'whatsapp';
  destinatario: string;
  assunto?: string;
  conteudo: string;
  status: 'enviando' | 'enviado' | 'entregue' | 'lido' | 'erro';
  erro_detalhe?: string;
  external_id?: string;
  custo?: number;
  data_envio: string;
  data_entrega?: string;
  data_leitura?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CampanhaAutomatica {
  id?: number;
  nome: string;
  tipo_trigger: 'aniversario' | 'primeira_compra' | 'sem_movimento';
  template_id: number;
  dias_antes?: number;
  dias_depois?: number;
  filtros?: Record<string, any>;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface FiltroMarketing {
  categoria_id?: number[];
  origem_id?: number[];
  valor_minimo?: number;
  valor_maximo?: number;
  ultima_consulta_dias?: number;
  aniversario_mes?: number[];
  sexo?: string;
  idade_minima?: number;
  idade_maxima?: number;
  cidade?: string[];
  recebe_sms?: boolean;
  recebe_email?: boolean;
  recebe_whatsapp?: boolean;
}