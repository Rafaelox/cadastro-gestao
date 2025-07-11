import { supabase } from "@/integrations/supabase/client";
import type { Cliente, ClienteFilters } from "@/types";

export const clientesService = {
  async getClientesByUser(usuario: any, filters?: ClienteFilters): Promise<Cliente[]> {
    let query = supabase
      .from('clientes')
      .select(`
        *,
        categoria:categorias(nome),
        origem:origens(nome)
      `);

    // Se o usuário é consultor, filtrar apenas clientes que ele atendeu
    if (usuario?.permissao === 'consultor' && usuario?.consultor_id) {
      // Buscar clientes que tiveram atendimento com este consultor
      const { data: atendimentos } = await supabase
        .from('historico')
        .select('cliente_id')
        .eq('consultor_id', usuario.consultor_id);
      
      if (atendimentos && atendimentos.length > 0) {
        const clienteIds = atendimentos.map(a => a.cliente_id);
        query = query.in('id', clienteIds);
      } else {
        // Se não há atendimentos, retornar lista vazia
        return [];
      }
    }

    // Aplicar filtros
    if (filters?.nome) {
      query = query.ilike('nome', `%${filters.nome}%`);
    }
    if (filters?.cpf) {
      query = query.ilike('cpf', `%${filters.cpf}%`);
    }
    if (filters?.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }
    if (filters?.telefone) {
      query = query.ilike('telefone', `%${filters.telefone}%`);
    }
    if (filters?.categoria_id) {
      query = query.eq('categoria_id', filters.categoria_id);
    }
    if (filters?.origem_id) {
      query = query.eq('origem_id', filters.origem_id);
    }
    if (filters?.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }

    // Ordenação
    const orderBy = filters?.orderBy || 'created_at';
    const orderDirection = filters?.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }

    return data || [];
  }
};