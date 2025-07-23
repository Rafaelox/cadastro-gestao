// Mock completo do Supabase para desenvolvimento local

// Tipos básicos
interface MockUser {
  id: string;
  email: string;
}

interface MockSession {
  user: MockUser;
  access_token: string;
}

// Mock response sempre retorna sucesso para desenvolvimento
const mockResponse = {
  data: null,
  error: null
};

// Cliente mock que simula todas as operações do Supabase
export const supabase = {
  // Auth methods
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('Mock auth login:', email);
      if (email === 'admin@teste.com' && password === 'admin123') {
        const user: MockUser = { id: '1', email };
        const session: MockSession = { user, access_token: 'mock_token' };
        localStorage.setItem('auth_token', 'mock_token');
        localStorage.setItem('user_data', JSON.stringify(user));
        return { data: { user, session }, error: null };
      }
      return { data: { user: null, session: null }, error: new Error('Credenciais inválidas') };
    },
    
    signOut: async (options?: { scope?: 'global' | 'local' }) => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return { error: null };
    },
    
    getSession: async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        const session: MockSession = { user, access_token: token };
        return { data: { session }, error: null };
      }
      
      return { data: { session: null }, error: null };
    },
    
    onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    },
    
    resetPasswordForEmail: async (email: string, options?: any) => {
      console.log('Mock reset password:', email);
      return { data: null, error: null };
    },
    
    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      console.log('Mock sign up:', email, options);
      return { data: { user: null, session: null }, error: null };
    },
    
    getUser: async () => {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return { data: { user }, error: null };
      }
      return { data: { user: null }, error: null };
    }
  },

  // Database operations
  from: (table: string) => ({
    select: (columns = '*', options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) => {
      const query = {
        eq: (column: string, value: any) => query,
        neq: (column: string, value: any) => query,
        gte: (column: string, value: any) => query,
        lte: (column: string, value: any) => query,
        ilike: (column: string, value: any) => query,
        or: (conditions: string) => query,
        not: (column: string, operator: string, value: any) => query,
        in: (column: string, values: any[]) => query,
        limit: (count: number) => query,
        range: (from: number, to: number) => query,
        order: (column: string, options?: { ascending?: boolean }) => query,
        single: async () => mockResponse,
        maybeSingle: async () => mockResponse,
        then: async (callback: (result: any) => void) => {
          console.log('Mock select from:', table, options);
          // Return count if requested
          if (options?.count) {
            callback({ data: [], count: 0, error: null });
          } else {
            callback({ data: [], error: null });
          }
        },
        data: null,
        error: null,
        count: 0
      };
      return query;
    },
    
    insert: (values: any) => ({
      select: (columns = '*') => ({
        single: async () => {
          console.log('Mock insert into:', table, values);
          return mockResponse;
        },
        maybeSingle: async () => {
          console.log('Mock insert into:', table, values);
          return mockResponse;
        },
        data: null,
        error: null
      }),
      data: null,
      error: null
    }),
    
    update: (values: any) => ({
      eq: (column: string, value: any) => ({
        select: (columns = '*') => ({
          single: async () => {
            console.log('Mock update:', table, values);
            return mockResponse;
          },
          maybeSingle: async () => {
            console.log('Mock update:', table, values);
            return mockResponse;
          },
          data: null,
          error: null
        }),
        data: null,
        error: null
      }),
      neq: (column: string, value: any) => ({
        select: (columns = '*') => ({
          single: async () => {
            console.log('Mock update neq:', table, values);
            return mockResponse;
          },
          maybeSingle: async () => {
            console.log('Mock update neq:', table, values);
            return mockResponse;
          },
          data: null,
          error: null
        }),
        data: null,
        error: null
      })
    }),
    
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: async (callback: (result: any) => void) => {
          console.log('Mock delete from:', table);
          callback({ error: null });
        }
      })
    })
  }),

  // Storage mock
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File | Blob, options?: any) => {
        console.log('Mock upload:', bucket, path, file, options);
        const mockUrl = file instanceof File ? URL.createObjectURL(file) : URL.createObjectURL(file);
        return { data: { path: mockUrl }, error: null };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: path }
      }),
      remove: async (paths: string[]) => {
        console.log('Mock remove:', paths);
        return { data: null, error: null };
      }
    })
  },

  // RPC functions
  rpc: async (functionName: string, params?: any) => {
    console.log('Mock RPC call:', functionName, params);
    
    switch (functionName) {
      case 'create_custom_user':
        return { data: 'mock-user-id', error: null };
      case 'update_custom_user':
        return { data: true, error: null };
      case 'delete_custom_user':
        return { data: true, error: null };
      default:
        return { data: null, error: null };
    }
  },

  // Functions
  functions: {
    invoke: async (functionName: string, options?: any) => {
      console.log('Mock function invoke:', functionName, options);
      return { data: null, error: null };
    }
  }
};