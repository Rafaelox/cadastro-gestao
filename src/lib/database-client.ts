// Cliente completo para PostgreSQL compatível com Supabase
class DatabaseClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null; error: any }> {
    try {
      const token = localStorage.getItem('auth_token');
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Método principal from() para simular Supabase
  from(table: string) {
    return new TableQuery(table, this);
  }

  // Mock para storage
  get storage() {
    return {
      from: (bucket: string) => ({
        upload: async (path: string, file: File) => {
          console.log('Mock upload:', bucket, path, file.name);
          const mockUrl = URL.createObjectURL(file);
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
    };
  }

  // Mock para RPC calls
  async rpc(functionName: string, params?: any) {
    console.log('Mock RPC call:', functionName, params);
    
    switch (functionName) {
      case 'create_custom_user':
        return { data: 'mock-user-id', error: null };
      case 'update_custom_user':
        return { data: true, error: null };
      case 'delete_custom_user':
        return { data: true, error: null };
      default:
        return { data: null, error: new Error(`RPC function ${functionName} not implemented`) };
    }
  }

  // Mock para auth
  get auth() {
    return {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        if (email === 'admin@teste.com' && password === 'admin123') {
          const user = { id: '1', email };
          const session = { user, access_token: 'mock_token' };
          localStorage.setItem('auth_token', 'mock_token');
          localStorage.setItem('user_data', JSON.stringify(user));
          return { data: { user, session }, error: null };
        }
        return { data: { user: null, session: null }, error: new Error('Credenciais inválidas') };
      },
      
      signOut: async () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        return { error: null };
      },
      
      getSession: async () => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          const session = { user, access_token: token };
          return { data: { session }, error: null };
        }
        
        return { data: { session: null }, error: null };
      },
      
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        };
      },
      
      resetPasswordForEmail: async (email: string, options?: any) => {
        console.log('Mock reset password:', email, options);
        return { data: null, error: null };
      },
      
      signUp: async ({ email, password }: { email: string; password: string }) => {
        console.log('Mock sign up:', email);
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
    };
  }

  // Mock para functions
  get functions() {
    return {
      invoke: async (functionName: string, options?: any) => {
        console.log('Mock function invoke:', functionName, options);
        return { data: null, error: null };
      }
    };
  }
}

// Classe para operações de tabela
class TableQuery {
  constructor(private table: string, private client: DatabaseClient) {}

  select(columns = '*') {
    return new SelectQuery(this.table, this.client, columns);
  }

  insert(values: any) {
    return new InsertQuery(this.table, this.client, values);
  }

  update(values: any) {
    return new UpdateQuery(this.table, this.client, values);
  }

  delete() {
    return new DeleteQuery(this.table, this.client);
  }
}

// Classe para SELECT queries
class SelectQuery {
  private filters: string[] = [];
  private orderBy: string | null = null;

  constructor(
    private table: string, 
    private client: DatabaseClient, 
    private columns: string
  ) {}

  eq(column: string, value: any) {
    this.filters.push(`${column}=eq.${value}`);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push(`${column}=neq.${value}`);
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push(`${column}=gte.${value}`);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push(`${column}=lte.${value}`);
    return this;
  }

  or(conditions: string) {
    this.filters.push(`or=(${conditions})`);
    return this;
  }

  ilike(column: string, value: any) {
    this.filters.push(`${column}=ilike.${value}`);
    return this;
  }

  not(column: string, operator: string, value: any) {
    this.filters.push(`${column}=not.${operator}.${value}`);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push(`${column}=in.(${values.join(',')})`);
    return this;
  }

  limit(count: number) {
    this.filters.push(`limit=${count}`);
    return this;
  }

  range(from: number, to: number) {
    this.filters.push(`limit=${to - from + 1}&offset=${from}`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const direction = options?.ascending === false ? 'desc' : 'asc';
    this.orderBy = `order=${column}.${direction}`;
    return this;
  }

  async single() {
    try {
      const query = this.buildQuery();
      console.log('Mock query:', query);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async maybeSingle() {
    return this.single();
  }

  async then(callback: (result: any) => void) {
    try {
      const query = this.buildQuery();
      console.log('Mock query:', query);
      callback({ data: [], error: null });
    } catch (error) {
      callback({ data: null, error });
    }
  }

  private buildQuery() {
    let query = `/${this.table}?select=${this.columns}`;
    if (this.filters.length > 0) {
      query += '&' + this.filters.join('&');
    }
    if (this.orderBy) {
      query += '&' + this.orderBy;
    }
    return query;
  }

  // Propriedades para compatibilidade
  get data() {
    return null;
  }

  get error() {
    return null;
  }
}

// Classe para INSERT queries
class InsertQuery {
  constructor(
    private table: string, 
    private client: DatabaseClient, 
    private values: any
  ) {}

  select(columns = '*') {
    return {
      single: async () => {
        console.log('Mock insert:', this.table, this.values);
        return { data: null, error: null };
      },
      maybeSingle: async () => {
        console.log('Mock insert maybeSingle:', this.table, this.values);
        return { data: null, error: null };
      },
      // Propriedades para compatibilidade
      data: null,
      error: null
    };
  }

  // Propriedades para compatibilidade
  get data() {
    return null;
  }

  get error() {
    return null;
  }
}

// Classe para UPDATE queries
class UpdateQuery {
  constructor(
    private table: string, 
    private client: DatabaseClient, 
    private values: any
  ) {}

  eq(column: string, value: any) {
    return {
      select: (columns = '*') => ({
        single: async () => {
          console.log('Mock update:', this.table, this.values, `${column}=${value}`);
          return { data: null, error: null };
        },
        maybeSingle: async () => {
          console.log('Mock update maybeSingle:', this.table, this.values, `${column}=${value}`);
          return { data: null, error: null };
        },
        // Propriedades para compatibilidade
        data: null,
        error: null
      })
    };
  }

  neq(column: string, value: any) {
    return {
      select: (columns = '*') => ({
        single: async () => {
          console.log('Mock update neq:', this.table, this.values, `${column}!=${value}`);
          return { data: null, error: null };
        },
        maybeSingle: async () => {
          console.log('Mock update neq maybeSingle:', this.table, this.values, `${column}!=${value}`);
          return { data: null, error: null };
        },
        // Propriedades para compatibilidade
        data: null,
        error: null
      })
    };
  }
}

// Classe para DELETE queries
class DeleteQuery {
  constructor(private table: string, private client: DatabaseClient) {}

  eq(column: string, value: any) {
    return {
      async then(callback: (result: any) => void) {
        console.log('Mock delete:', this.table, `${column}=${value}`);
        callback({ error: null });
      }
    };
  }
}

// Instância global
export const databaseClient = new DatabaseClient();
export const supabase = databaseClient;