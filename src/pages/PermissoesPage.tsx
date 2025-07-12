import React from 'react';
import { PagePermissions } from '@/components/PagePermissions';
import { UserMigration } from '@/components/UserMigration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PermissoesPage = () => {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="permissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="migration">Migração de Usuários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="permissions">
          <PagePermissions />
        </TabsContent>
        
        <TabsContent value="migration">
          <UserMigration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PermissoesPage;