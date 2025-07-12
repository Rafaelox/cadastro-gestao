import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente administrativo
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Buscar usuários da tabela profiles que não existem no auth.users
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, senha_temp, nome, permissao')
      .eq('ativo', true)
      .not('email', 'is', null)

    if (profilesError) {
      throw profilesError
    }

    const results = []

    for (const profile of profiles || []) {
      try {
        // Verificar se o usuário já existe no auth.users
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(profile.id)
        
        if (existingUser.user) {
          results.push({
            email: profile.email,
            status: 'exists',
            message: 'Usuário já existe no auth.users'
          })
          continue
        }

        // Criar usuário no auth.users
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          user_id: profile.id,
          email: profile.email,
          password: profile.senha_temp || 'TempPassword123!',
          email_confirm: true,
          user_metadata: {
            nome: profile.nome,
            permissao: profile.permissao
          }
        })

        if (createError) {
          results.push({
            email: profile.email,
            status: 'error',
            message: createError.message
          })
        } else {
          results.push({
            email: profile.email,
            status: 'created',
            message: 'Usuário criado com sucesso',
            user_id: newUser.user?.id
          })
        }
      } catch (error) {
        results.push({
          email: profile.email,
          status: 'error',
          message: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        migrated_users: results.filter(r => r.status === 'created').length,
        existing_users: results.filter(r => r.status === 'exists').length,
        errors: results.filter(r => r.status === 'error').length,
        details: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})