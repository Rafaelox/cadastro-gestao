import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestRequest {
  configId: number;
  destinatario: string;
  assunto?: string;
  mensagem: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { configId, destinatario, assunto, mensagem }: TestRequest = await req.json()

    // Buscar configuração
    const { data: config, error: configError } = await supabaseClient
      .from('configuracoes_comunicacao')
      .select('*')
      .eq('id', configId)
      .single()

    if (configError) {
      throw new Error('Configuração não encontrada')
    }

    if (!config.ativo) {
      throw new Error('Configuração está inativa')
    }

    let resultado: any = { sucesso: false, erro: '' }

    // Testar baseado no tipo de serviço
    switch (config.tipo_servico) {
      case 'email':
        resultado = await testarEmail(config, destinatario, assunto, mensagem)
        break
      case 'sms':
        resultado = await testarSMS(config, destinatario, mensagem)
        break
      case 'whatsapp':
        resultado = await testarWhatsApp(config, destinatario, mensagem)
        break
      default:
        throw new Error('Tipo de serviço não suportado')
    }

    // Registrar teste no banco
    await supabaseClient
      .from('comunicacoes')
      .insert([{
        cliente_id: 1, // ID fictício para teste
        tipo: config.tipo_servico,
        destinatario,
        assunto: assunto || '',
        conteudo: mensagem,
        status: resultado.sucesso ? 'entregue' : 'erro',
        erro_detalhe: resultado.erro || null,
        external_id: resultado.id || null
      }])

    return new Response(
      JSON.stringify(resultado),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no teste:', error)
    return new Response(
      JSON.stringify({ sucesso: false, erro: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function testarEmail(config: any, destinatario: string, assunto: string, mensagem: string) {
  const extras = config.configuracoes_extras || {}
  
  try {
    if (config.provider === 'SendGrid') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: destinatario }],
            subject: assunto || 'Teste de Configuração',
          }],
          from: {
            email: extras.from_email || 'teste@exemplo.com',
            name: extras.from_name || 'Sistema de Testes'
          },
          content: [{
            type: 'text/plain',
            value: mensagem
          }]
        })
      })

      if (response.ok) {
        return { sucesso: true, id: response.headers.get('X-Message-Id') }
      } else {
        const errorData = await response.text()
        return { sucesso: false, erro: `SendGrid Error: ${errorData}` }
      }
    }

    // Simular outros provedores
    return { sucesso: true, id: `test_${Date.now()}` }

  } catch (error) {
    return { sucesso: false, erro: `Email Error: ${error.message}` }
  }
}

async function testarSMS(config: any, destinatario: string, mensagem: string) {
  const extras = config.configuracoes_extras || {}
  
  try {
    if (config.provider === 'Twilio') {
      const accountSid = extras.account_sid
      const authToken = config.api_secret
      const fromNumber = extras.from_number

      if (!accountSid || !authToken) {
        return { sucesso: false, erro: 'Credenciais Twilio incompletas' }
      }

      const credentials = btoa(`${accountSid}:${authToken}`)
      
      const formData = new FormData()
      formData.append('To', destinatario)
      formData.append('From', fromNumber || '+1234567890')
      formData.append('Body', mensagem)

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
          },
          body: formData
        }
      )

      if (response.ok) {
        const data = await response.json()
        return { sucesso: true, id: data.sid }
      } else {
        const errorData = await response.text()
        return { sucesso: false, erro: `Twilio Error: ${errorData}` }
      }
    }

    // Simular outros provedores
    return { sucesso: true, id: `sms_test_${Date.now()}` }

  } catch (error) {
    return { sucesso: false, erro: `SMS Error: ${error.message}` }
  }
}

async function testarWhatsApp(config: any, destinatario: string, mensagem: string) {
  const extras = config.configuracoes_extras || {}
  
  try {
    if (config.provider === 'Meta WhatsApp Business') {
      const phoneNumberId = extras.phone_number_id
      
      if (!phoneNumberId) {
        return { sucesso: false, erro: 'Phone Number ID não configurado' }
      }

      const response = await fetch(
        `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: destinatario,
            type: 'text',
            text: { body: mensagem }
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        return { sucesso: true, id: data.messages?.[0]?.id }
      } else {
        const errorData = await response.text()
        return { sucesso: false, erro: `Meta API Error: ${errorData}` }
      }
    }

    // Simular outros provedores
    return { sucesso: true, id: `whatsapp_test_${Date.now()}` }

  } catch (error) {
    return { sucesso: false, erro: `WhatsApp Error: ${error.message}` }
  }
}