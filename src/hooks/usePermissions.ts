import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { 
    usuario, 
    isMaster, 
    isGerente, 
    isSecretaria, 
    isUser,
    canManageUsers,
    canManageSettings,
    canViewReports,
    canManagePayments
  } = useAuth();

  // Controles específicos de permissões para formulários
  const permissions = {
    // Gerenciamento de usuários
    canCreateUser: isMaster || isGerente,
    canEditUser: isMaster || isGerente,
    canDeleteUser: isMaster,
    canChangeUserPermissions: isMaster,

    // Configurações do sistema
    canManageServices: isMaster || isGerente,
    canManageConsultants: isMaster || isGerente,
    canManageCategories: isMaster || isGerente,
    canManagePaymentMethods: isMaster || isGerente,

    // Agenda e atendimentos
    canCreateAppointment: canManagePayments,
    canEditAppointment: canManagePayments,
    canDeleteAppointment: isMaster || isGerente,
    canViewAllAppointments: canViewReports,

    // Clientes
    canCreateClient: canManagePayments,
    canEditClient: canManagePayments,
    canDeleteClient: isMaster || isGerente,
    canViewAllClients: canViewReports,

    // Pagamentos
    canCreatePayment: canManagePayments,
    canEditPayment: canManagePayments,
    canDeletePayment: isMaster || isGerente,
    canViewAllPayments: canViewReports,

    // Relatórios
    canViewFinancialReports: canViewReports,
    canExportReports: canViewReports,
    canViewAuditLogs: isMaster || isGerente,

    // Comissões
    canViewCommissions: canViewReports,
    canManageCommissions: isMaster || isGerente,
  };

  return {
    usuario,
    permissions,
    // Funções auxiliares
    hasAnyPermission: (permissionList: (keyof typeof permissions)[]) => {
      return permissionList.some(permission => permissions[permission]);
    },
    hasAllPermissions: (permissionList: (keyof typeof permissions)[]) => {
      return permissionList.every(permission => permissions[permission]);
    },
    getUserLevel: () => {
      if (isMaster) return 'master';
      if (isGerente) return 'gerente';
      if (isSecretaria) return 'secretaria';
      return 'user';
    }
  };
};