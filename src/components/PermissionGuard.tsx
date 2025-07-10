import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermissions: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // Se true, requer todas as permissões. Se false, requer pelo menos uma
}

export const PermissionGuard = ({ 
  children, 
  requiredPermissions, 
  fallback,
  requireAll = false 
}: PermissionGuardProps) => {
  const { permissions, hasAnyPermission, hasAllPermissions } = usePermissions();

  const hasPermission = requireAll 
    ? hasAllPermissions(requiredPermissions as any)
    : hasAnyPermission(requiredPermissions as any);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="border-destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar esta funcionalidade.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

// Componente específico para botões de ação
interface ActionButtonGuardProps {
  children: ReactNode;
  requiredPermissions: string[];
  requireAll?: boolean;
}

export const ActionButtonGuard = ({ 
  children, 
  requiredPermissions, 
  requireAll = false 
}: ActionButtonGuardProps) => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  const hasPermission = requireAll 
    ? hasAllPermissions(requiredPermissions as any)
    : hasAnyPermission(requiredPermissions as any);

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
};