// Proxy temporário para compatibilidade - REMOVER após migração completa
import { databaseClient } from '@/lib/database-client';

const createChainableQuery = (): any => ({
  data: [],
  error: null,
  eq: (column: string, value: any) => createChainableQuery(),
  order: (column: string, options?: any) => createChainableQuery(),
  limit: (count: number) => createChainableQuery(),
  maybeSingle: () => ({ data: null, error: null }),
  single: () => ({ data: null, error: null }),
  count: 0,
  gte: (column: string, value: any) => createChainableQuery(),
  lte: (column: string, value: any) => createChainableQuery(),
  in: (column: string, values: any[]) => createChainableQuery(),
  select: (columns?: string) => createChainableQuery(),
  ilike: (column: string, value: any) => createChainableQuery(),
  not: (column: string, operator: string, value: any) => createChainableQuery()
});

const createQueryBuilder = (table: string) => ({
  select: (columns = '*') => createChainableQuery(),
  insert: (data: any) => ({
    data: null,
    error: null,
    select: () => ({ data: null, error: null })
  }),
  update: (data: any) => ({
    data: null,
    error: null,
    eq: (column: string, value: any) => ({ data: null, error: null })
  }),
  delete: () => ({
    data: null,
    error: null,
    eq: (column: string, value: any) => ({ data: null, error: null })
  }),
  eq: (column: string, value: any) => createChainableQuery(),
  order: (column: string, options?: any) => createChainableQuery(),
  limit: (count: number) => createChainableQuery(),
  maybeSingle: () => ({ data: null, error: null })
});

export const supabase = {
  from: createQueryBuilder,
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => ({ data: null, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
      remove: (paths: string[]) => ({ data: null, error: null })
    })
  },
  rpc: (functionName: string, params?: any) => ({ data: null, error: null }),
  auth: {
    getUser: () => ({ data: { user: null }, error: null }),
    signOut: () => ({ error: null }),
    resetPasswordForEmail: (email: string, options?: any) => ({ error: null }),
    signUp: (options: any) => ({ data: null, error: null })
  },
  functions: {
    invoke: (functionName: string, options?: any) => ({ data: null, error: null })
  }
};

// Adicionar métodos Supabase ao databaseClient temporariamente
Object.assign(databaseClient, {
  from: createQueryBuilder,
  storage: supabase.storage,
  rpc: supabase.rpc,
  auth: supabase.auth
});

// Re-export database client
export { databaseClient };