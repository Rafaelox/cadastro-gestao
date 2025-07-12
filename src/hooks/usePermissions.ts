import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { 
    usuario,
    user,
    isMaster, 
    isGerente, 
    isSecretaria, 
    isUser,
    isConsultor,
    canManageUsers,
    canManageSettings,
    canViewReports,
    canManagePayments
  } = useAuth();

  // Permissões simplificadas - dar acesso total para adm@rpedro.net
  const isAdminMaster = user?.email === 'adm@rpedro.net';

  const permissions = {
    // Gerenciamento de usuários
    canCreateUser: isAdminMaster,
    canEditUser: isAdminMaster,
    canDeleteUser: isAdminMaster,
    canChangeUserPermissions: isAdminMaster,

    // Configurações do sistema
    canManageServices: isAdminMaster,
    canManageConsultants: isAdminMaster,
    canManageCategories: isAdminMaster,
    canManagePaymentMethods: isAdminMaster,

    // Agenda e atendimentos
    canCreateAppointment: isAdminMaster,
    canEditAppointment: isAdminMaster,
    canDeleteAppointment: isAdminMaster,
    canViewAllAppointments: isAdminMaster,

    // Clientes
    canCreateClient: isAdminMaster,
    canEditClient: isAdminMaster,
    canDeleteClient: isAdminMaster,
    canViewAllClients: isAdminMaster,
    canViewMyClients: isAdminMaster,

    // Pagamentos
    canCreatePayment: isAdminMaster,
    canEditPayment: isAdminMaster,
    canDeletePayment: isAdminMaster,
    canViewAllPayments: isAdminMaster,

    // Relatórios
    canViewFinancialReports: isAdminMaster,
    canExportReports: isAdminMaster,
    canViewAuditLogs: isAdminMaster,

    // Comissões
    canViewCommissions: isAdminMaster,
    canManageCommissions: isAdminMaster,
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
      if (isAdminMaster) return 'master';
      if (isGerente) return 'gerente';
      if (isSecretaria) return 'secretaria';
      return 'user';
    }
  };
};