// Application constants

export const APP_CONFIG = {
  name: 'Cadastro Fácil Gestão',
  version: '1.0.0',
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100]
  }
} as const;

export const PERMISSIONS = {
  master: {
    canManageUsers: true,
    canManageSettings: true,
    canViewReports: true,
    canManagePayments: true,
    canDeleteRecords: true
  },
  gerente: {
    canManageUsers: true,
    canManageSettings: true,
    canViewReports: true,
    canManagePayments: true,
    canDeleteRecords: false
  },
  secretaria: {
    canManageUsers: false,
    canManageSettings: false,
    canViewReports: true,
    canManagePayments: true,
    canDeleteRecords: false
  },
  user: {
    canManageUsers: false,
    canManageSettings: false,
    canViewReports: false,
    canManagePayments: false,
    canDeleteRecords: false
  }
} as const;

export const STATUS_OPTIONS = {
  agenda: {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    cancelado: 'Cancelado',
    realizado: 'Realizado'
  },
  pagamento: {
    pendente: 'Pendente',
    pago: 'Pago',
    cancelado: 'Cancelado'
  }
} as const;

export const VALIDATION_RULES = {
  cpf: {
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    message: 'CPF deve estar no formato XXX.XXX.XXX-XX'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email deve estar em formato válido'
  },
  telefone: {
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    message: 'Telefone deve estar no formato (XX) XXXXX-XXXX'
  },
  cep: {
    pattern: /^\d{5}-\d{3}$/,
    message: 'CEP deve estar no formato XXXXX-XXX'
  }
} as const;