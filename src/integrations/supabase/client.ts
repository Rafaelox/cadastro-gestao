// Cliente PostgreSQL substituto para compatibilidade
// Este arquivo mantém a compatibilidade com o código existente

// Re-exportar o mock do Supabase
export { supabase } from '@/lib/mock-supabase';

// Tipos básicos para compatibilidade
export interface User {
  id: string;
  email: string;
}

export interface Session {
  user: User;
  access_token: string;
}

export type AuthError = Error;