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

  // Sistema de permissões baseado em níveis de usuário
  const isAdminMaster = user?.email === 'adm@rpedro.net' || isMaster;

  const permissions = {
    // Gerenciamento de usuários - Master e Gerente
    canCreateUser: isAdminMaster || isGerente,
    canEditUser: isAdminMaster || isGerente,
    canDeleteUser: isAdminMaster,
    canChangeUserPermissions: isAdminMaster,

    // Configurações do sistema - Master e Gerente
    canManageServices: isAdminMaster || isGerente,
    canManageConsultants: isAdminMaster || isGerente,
    canManageCategories: isAdminMaster || isGerente,
    canManagePaymentMethods: isAdminMaster || isGerente,

    // Agenda e atendimentos - Todos menos User básico
    canCreateAppointment: isAdminMaster || isGerente || isSecretaria || isConsultor,
    canEditAppointment: isAdminMaster || isGerente || isSecretaria,
    canDeleteAppointment: isAdminMaster || isGerente,
    canViewAllAppointments: isAdminMaster || isGerente || isSecretaria,

    // Clientes - Todos podem ver, criar e editar
    canCreateClient: isAdminMaster || isGerente || isSecretaria || isConsultor,
    canEditClient: isAdminMaster || isGerente || isSecretaria || isConsultor,
    canDeleteClient: isAdminMaster || isGerente,
    canViewAllClients: isAdminMaster || isGerente || isSecretaria || isConsultor,
    canViewMyClients: true, // Todos podem ver seus próprios clientes

    // Pagamentos - Master, Gerente e Secretaria
    canCreatePayment: isAdminMaster || isGerente || isSecretaria,
    canEditPayment: isAdminMaster || isGerente,
    canDeletePayment: isAdminMaster,
    canViewAllPayments: isAdminMaster || isGerente || isSecretaria,

    // Relatórios - Master e Gerente
    canViewFinancialReports: isAdminMaster || isGerente,
    canExportReports: isAdminMaster || isGerente,
    canViewAuditLogs: isAdminMaster,

    // Comissões - Todos podem ver suas próprias, Master e Gerente podem gerenciar
    canViewCommissions: true,
    canManageCommissions: isAdminMaster || isGerente,
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