export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agenda: {
        Row: {
          cliente_id: number
          comissao_consultor: number
          consultor_id: number
          created_at: string
          created_by: string | null
          data_agendamento: string
          id: number
          observacoes: string | null
          servico_id: number
          status: string
          updated_at: string
          updated_by: string | null
          valor_servico: number
        }
        Insert: {
          cliente_id: number
          comissao_consultor?: number
          consultor_id: number
          created_at?: string
          created_by?: string | null
          data_agendamento: string
          id?: number
          observacoes?: string | null
          servico_id: number
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor_servico?: number
        }
        Update: {
          cliente_id?: number
          comissao_consultor?: number
          consultor_id?: number
          created_at?: string
          created_by?: string | null
          data_agendamento?: string
          id?: number
          observacoes?: string | null
          servico_id?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor_servico?: number
        }
        Relationships: [
          {
            foreignKeyName: "agenda_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "consultores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          changed_fields: string[] | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: number
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: number
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      cliente_documentos: {
        Row: {
          ativo: boolean
          cliente_id: number
          created_at: string
          data_upload: string
          id: number
          nome_documento: string
          observacoes: string | null
          tamanho_arquivo: number | null
          tipo_documento: string
          updated_at: string
          uploaded_by: string | null
          url_arquivo: string
        }
        Insert: {
          ativo?: boolean
          cliente_id: number
          created_at?: string
          data_upload?: string
          id?: number
          nome_documento: string
          observacoes?: string | null
          tamanho_arquivo?: number | null
          tipo_documento: string
          updated_at?: string
          uploaded_by?: string | null
          url_arquivo: string
        }
        Update: {
          ativo?: boolean
          cliente_id?: number
          created_at?: string
          data_upload?: string
          id?: number
          nome_documento?: string
          observacoes?: string | null
          tamanho_arquivo?: number | null
          tipo_documento?: string
          updated_at?: string
          uploaded_by?: string | null
          url_arquivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean
          bairro: string | null
          categoria_id: number | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          foto_url: string | null
          id: number
          nome: string
          origem_id: number | null
          recebe_email: boolean
          recebe_sms: boolean
          recebe_whatsapp: boolean
          telefone: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          categoria_id?: number | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: number
          nome: string
          origem_id?: number | null
          recebe_email?: boolean
          recebe_sms?: boolean
          recebe_whatsapp?: boolean
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          categoria_id?: number | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: number
          nome?: string
          origem_id?: number | null
          recebe_email?: boolean
          recebe_sms?: boolean
          recebe_whatsapp?: boolean
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "origens"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes: {
        Row: {
          cliente_nome: string
          consultor_id: number
          created_at: string
          created_by: string | null
          data_operacao: string
          id: number
          observacoes: string | null
          pagamento_id: number | null
          percentual_comissao: number
          servico_nome: string
          tipo_operacao: string
          updated_at: string
          updated_by: string | null
          valor_comissao: number
          valor_servico: number
        }
        Insert: {
          cliente_nome: string
          consultor_id: number
          created_at?: string
          created_by?: string | null
          data_operacao?: string
          id?: number
          observacoes?: string | null
          pagamento_id?: number | null
          percentual_comissao?: number
          servico_nome: string
          tipo_operacao?: string
          updated_at?: string
          updated_by?: string | null
          valor_comissao?: number
          valor_servico?: number
        }
        Update: {
          cliente_nome?: string
          consultor_id?: number
          created_at?: string
          created_by?: string | null
          data_operacao?: string
          id?: number
          observacoes?: string | null
          pagamento_id?: number | null
          percentual_comissao?: number
          servico_nome?: string
          tipo_operacao?: string
          updated_at?: string
          updated_by?: string | null
          valor_comissao?: number
          valor_servico?: number
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "consultores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_empresa: {
        Row: {
          ativo: boolean
          cep: string | null
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string
          created_by: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: number
          logo_url: string | null
          nome: string
          telefone: string | null
          tipo_pessoa: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: never
          logo_url?: string | null
          nome: string
          telefone?: string | null
          tipo_pessoa: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: never
          logo_url?: string | null
          nome?: string
          telefone?: string | null
          tipo_pessoa?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      consultores: {
        Row: {
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: number
          nome: string
          percentual_comissao: number
          telefone: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: number
          nome: string
          percentual_comissao?: number
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: number
          nome?: string
          percentual_comissao?: number
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      formas_pagamento: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: number
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: number
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: number
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      historico: {
        Row: {
          agenda_id: number
          cliente_id: number
          comissao_consultor: number
          consultor_id: number
          created_at: string
          data_agendamento: string | null
          data_atendimento: string
          forma_pagamento: number | null
          fotos_urls: string[] | null
          id: number
          observacoes_atendimento: string | null
          procedimentos_realizados: string | null
          servico_id: number
          updated_at: string
          valor_final: number | null
          valor_servico: number
        }
        Insert: {
          agenda_id: number
          cliente_id: number
          comissao_consultor?: number
          consultor_id: number
          created_at?: string
          data_agendamento?: string | null
          data_atendimento: string
          forma_pagamento?: number | null
          fotos_urls?: string[] | null
          id?: number
          observacoes_atendimento?: string | null
          procedimentos_realizados?: string | null
          servico_id: number
          updated_at?: string
          valor_final?: number | null
          valor_servico?: number
        }
        Update: {
          agenda_id?: number
          cliente_id?: number
          comissao_consultor?: number
          consultor_id?: number
          created_at?: string
          data_agendamento?: string | null
          data_atendimento?: string
          forma_pagamento?: number | null
          fotos_urls?: string[] | null
          id?: number
          observacoes_atendimento?: string | null
          procedimentos_realizados?: string | null
          servico_id?: number
          updated_at?: string
          valor_final?: number | null
          valor_servico?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_historico_agenda"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_historico_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_historico_consultor"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "consultores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_historico_forma_pagamento"
            columns: ["forma_pagamento"]
            isOneToOne: false
            referencedRelation: "formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_historico_servico"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      origens: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: number
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: number
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          atendimento_id: number
          cliente_id: number
          consultor_id: number
          created_at: string
          created_by: string | null
          data_pagamento: string
          forma_pagamento_id: number
          id: number
          numero_parcelas: number | null
          observacoes: string | null
          servico_id: number
          tipo_transacao: string
          updated_at: string
          updated_by: string | null
          valor: number
          valor_original: number | null
        }
        Insert: {
          atendimento_id: number
          cliente_id: number
          consultor_id: number
          created_at?: string
          created_by?: string | null
          data_pagamento?: string
          forma_pagamento_id: number
          id?: number
          numero_parcelas?: number | null
          observacoes?: string | null
          servico_id: number
          tipo_transacao: string
          updated_at?: string
          updated_by?: string | null
          valor?: number
          valor_original?: number | null
        }
        Update: {
          atendimento_id?: number
          cliente_id?: number
          consultor_id?: number
          created_at?: string
          created_by?: string | null
          data_pagamento?: string
          forma_pagamento_id?: number
          id?: number
          numero_parcelas?: number | null
          observacoes?: string | null
          servico_id?: number
          tipo_transacao?: string
          updated_at?: string
          updated_by?: string | null
          valor?: number
          valor_original?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "consultores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      parcelas: {
        Row: {
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          id: number
          numero_parcela: number
          observacoes: string | null
          pagamento_id: number
          status: string
          updated_at: string
          valor_parcela: number
        }
        Insert: {
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          id?: number
          numero_parcela: number
          observacoes?: string | null
          pagamento_id: number
          status?: string
          updated_at?: string
          valor_parcela?: number
        }
        Update: {
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          id?: number
          numero_parcela?: number
          observacoes?: string | null
          pagamento_id?: number
          status?: string
          updated_at?: string
          valor_parcela?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          consultor_id: number | null
          created_at: string
          email: string | null
          id: string
          nome: string
          permissao: string
          senha_temp: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          consultor_id?: number | null
          created_at?: string
          email?: string | null
          id: string
          nome: string
          permissao?: string
          senha_temp?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          consultor_id?: number | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          permissao?: string
          senha_temp?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "consultores"
            referencedColumns: ["id"]
          },
        ]
      }
      recibos: {
        Row: {
          cliente_id: number
          consultor_id: number | null
          created_at: string
          created_by: string | null
          dados_cliente: Json | null
          dados_empresa: Json | null
          descricao: string | null
          id: number
          numero_recibo: string
          observacoes: string | null
          pagamento_id: number | null
          pdf_url: string | null
          tipo_recibo_id: number
          updated_at: string
          updated_by: string | null
          valor: number
        }
        Insert: {
          cliente_id: number
          consultor_id?: number | null
          created_at?: string
          created_by?: string | null
          dados_cliente?: Json | null
          dados_empresa?: Json | null
          descricao?: string | null
          id?: never
          numero_recibo: string
          observacoes?: string | null
          pagamento_id?: number | null
          pdf_url?: string | null
          tipo_recibo_id: number
          updated_at?: string
          updated_by?: string | null
          valor: number
        }
        Update: {
          cliente_id?: number
          consultor_id?: number | null
          created_at?: string
          created_by?: string | null
          dados_cliente?: Json | null
          dados_empresa?: Json | null
          descricao?: string | null
          id?: never
          numero_recibo?: string
          observacoes?: string | null
          pagamento_id?: number | null
          pdf_url?: string | null
          tipo_recibo_id?: number
          updated_at?: string
          updated_by?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "recibos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recibos_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "consultores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recibos_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recibos_tipo_recibo_id_fkey"
            columns: ["tipo_recibo_id"]
            isOneToOne: false
            referencedRelation: "tipos_recibo"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          descricao: string | null
          duracao_minutos: number
          id: number
          nome: string
          preco: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          duracao_minutos?: number
          id?: number
          nome: string
          preco?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          duracao_minutos?: number
          id?: number
          nome?: string
          preco?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tipos_recibo: {
        Row: {
          ativo: boolean
          created_at: string
          id: number
          nome: string
          template: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: never
          nome: string
          template: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: never
          nome?: string
          template?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_auth_user_and_profile: {
        Args: {
          p_email: string
          p_password: string
          p_nome: string
          p_consultor_id?: number
          p_permissao?: string
        }
        Returns: string
      }
      create_custom_user: {
        Args: {
          p_nome: string
          p_email: string
          p_password: string
          p_permissao?: string
          p_consultor_id?: number
        }
        Returns: {
          success: boolean
          user_id: string
          message: string
        }[]
      }
      custom_login: {
        Args: { p_email: string; p_password: string }
        Returns: {
          success: boolean
          user_id: string
          profile_data: Json
          message: string
        }[]
      }
      delete_custom_user: {
        Args: { p_user_id: string }
        Returns: {
          success: boolean
          message: string
        }[]
      }
      generate_numero_recibo: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_email: string
        }[]
      }
      get_empresa_ativa: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          nome: string
          tipo_pessoa: string
          cpf_cnpj: string
          endereco: string
          cidade: string
          estado: string
          cep: string
          telefone: string
          email: string
          logo_url: string
          ativo: boolean
          created_at: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      update_custom_user: {
        Args: {
          p_user_id: string
          p_nome: string
          p_email: string
          p_permissao: string
          p_ativo: boolean
          p_password?: string
          p_consultor_id?: number
        }
        Returns: {
          success: boolean
          message: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
