// Proxy temporário para compatibilidade - REMOVER após migração completa
import { databaseClient } from '@/lib/database-client';

export const supabase = {
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
    eq: () => ({ data: [], error: null }),
    order: () => ({ data: [], error: null }),
    limit: () => ({ data: [], error: null }),
    maybeSingle: () => ({ data: null, error: null })
  }),
  storage: {
    from: () => ({
      upload: () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  },
  rpc: () => ({ data: null, error: null })
};

// Re-export database client
export { databaseClient };