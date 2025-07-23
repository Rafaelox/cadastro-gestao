// Cliente para PostgreSQL no frontend
class DatabaseClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // Em produção, usar variável de ambiente ou endpoint da API
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Método para simular Supabase.from()
  from(table: string) {
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const data = await this.request(`/${table}?${column}=eq.${value}&select=${columns}`);
              return { data: data[0] || null, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
          async then(callback: (result: any) => void) {
            try {
              const data = await this.request(`/${table}?${column}=eq.${value}&select=${columns}`);
              callback({ data, error: null });
            } catch (error) {
              callback({ data: null, error });
            }
          }
        }),
        order: (column: string, options?: { ascending?: boolean }) => ({
          async then(callback: (result: any) => void) {
            try {
              const direction = options?.ascending === false ? 'desc' : 'asc';
              const data = await this.request(`/${table}?select=${columns}&order=${column}.${direction}`);
              callback({ data, error: null });
            } catch (error) {
              callback({ data: null, error });
            }
          }
        }),
        async then(callback: (result: any) => void) {
          try {
            const data = await this.request(`/${table}?select=${columns}`);
            callback({ data, error: null });
          } catch (error) {
            callback({ data: null, error });
          }
        }
      }),
      insert: (values: any) => ({
        select: (columns = '*') => ({
          single: async () => {
            try {
              const data = await this.request(`/${table}`, {
                method: 'POST',
                body: JSON.stringify(values),
              });
              return { data, error: null };
            } catch (error) {
              return { data: null, error };
            }
          }
        })
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          select: (columns = '*') => ({
            single: async () => {
              try {
                const data = await this.request(`/${table}?${column}=eq.${value}`, {
                  method: 'PATCH',
                  body: JSON.stringify(values),
                });
                return { data, error: null };
              } catch (error) {
                return { data: null, error };
              }
            }
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          async then(callback: (result: any) => void) {
            try {
              await this.request(`/${table}?${column}=eq.${value}`, {
                method: 'DELETE',
              });
              callback({ error: null });
            } catch (error) {
              callback({ error });
            }
          }
        })
      })
    };
  }
}

// Instância global para compatibilidade com Supabase
export const databaseClient = new DatabaseClient();

// Para compatibilidade com código existente
export const supabase = databaseClient;