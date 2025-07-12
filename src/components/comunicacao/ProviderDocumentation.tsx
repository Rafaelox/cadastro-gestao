import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, Key, Settings } from "lucide-react";

interface ProviderDocumentationProps {
  tipo: 'email' | 'sms' | 'whatsapp';
  provider?: string;
}

export const ProviderDocumentation = ({ tipo, provider }: ProviderDocumentationProps) => {
  const getProviderInfo = () => {
    const providerData: Record<string, Record<string, any>> = {
      email: {
        'SendGrid': {
          name: 'SendGrid',
          description: 'Plataforma de email transacional confiável e escalável',
          links: [
            { label: 'Criar API Key', url: 'https://app.sendgrid.com/settings/api_keys', icon: Key },
            { label: 'Documentação', url: 'https://docs.sendgrid.com/', icon: BookOpen },
            { label: 'Verificar Domínio', url: 'https://app.sendgrid.com/settings/sender_auth', icon: Settings }
          ],
          requirements: ['API Key', 'Domínio verificado (recomendado)'],
          features: ['Entregabilidade alta', 'Analytics detalhados', 'Templates'],
          pricing: 'Gratuito até 100 emails/dia'
        },
        'SMTP': {
          name: 'SMTP Personalizado',
          description: 'Configure qualquer servidor SMTP (Gmail, Outlook, servidor próprio)',
          links: [
            { label: 'Configurar Gmail SMTP', url: 'https://support.google.com/mail/answer/7126229', icon: Settings },
            { label: 'Configurar Outlook SMTP', url: 'https://support.microsoft.com/office', icon: Settings },
          ],
          requirements: ['Servidor SMTP', 'Credenciais de autenticação', 'Porta (25, 465, 587)'],
          features: ['Controle total', 'Qualquer provedor', 'Configuração flexível'],
          pricing: 'Depende do provedor'
        },
        'Mailgun': {
          name: 'Mailgun',
          description: 'API de email para desenvolvedores com ferramentas avançadas',
          links: [
            { label: 'Criar API Key', url: 'https://app.mailgun.com/app/api_keys', icon: Key },
            { label: 'Documentação', url: 'https://documentation.mailgun.com/', icon: BookOpen },
          ],
          requirements: ['API Key', 'Domínio'],
          features: ['Validação de email', 'Logs detalhados', 'Webhooks'],
          pricing: 'Gratuito até 5,000 emails/mês'
        }
      },
      sms: {
        'Twilio': {
          name: 'Twilio SMS',
          description: 'Plataforma líder em comunicação programática',
          links: [
            { label: 'Console Twilio', url: 'https://console.twilio.com/', icon: Settings },
            { label: 'Documentação SMS', url: 'https://www.twilio.com/docs/sms', icon: BookOpen },
            { label: 'Comprar Número', url: 'https://console.twilio.com/us1/develop/phone-numbers/manage/search', icon: Key }
          ],
          requirements: ['Account SID', 'Auth Token', 'Número de telefone'],
          features: ['Cobertura global', 'Webhooks', 'Analytics'],
          pricing: 'Pay-per-use (varia por país)'
        },
        'Zenvia': {
          name: 'Zenvia',
          description: 'Plataforma brasileira de comunicação multicanal',
          links: [
            { label: 'Portal Zenvia', url: 'https://app.zenvia.com/', icon: Settings },
            { label: 'Documentação API', url: 'https://zenvia.github.io/zenvia-openapi-spec/', icon: BookOpen },
          ],
          requirements: ['API Token', 'Conta ativa'],
          features: ['Foco no Brasil', 'Suporte local', 'Múltiplos canais'],
          pricing: 'Planos mensais'
        }
      },
      whatsapp: {
        'Meta WhatsApp Business': {
          name: 'Meta WhatsApp Business API',
          description: 'API oficial do WhatsApp para empresas',
          links: [
            { label: 'Meta Business', url: 'https://business.facebook.com/', icon: Settings },
            { label: 'Documentação', url: 'https://developers.facebook.com/docs/whatsapp', icon: BookOpen },
            { label: 'Criar App', url: 'https://developers.facebook.com/apps/', icon: Key }
          ],
          requirements: ['Business Account', 'Aplicativo aprovado', 'Phone Number ID'],
          features: ['Templates aprovados', 'Mensagens em massa', 'Webhooks'],
          pricing: 'Pay-per-conversation'
        },
        'Twilio WhatsApp': {
          name: 'Twilio WhatsApp',
          description: 'WhatsApp Business API via Twilio',
          links: [
            { label: 'Console Twilio', url: 'https://console.twilio.com/', icon: Settings },
            { label: 'WhatsApp Docs', url: 'https://www.twilio.com/docs/whatsapp', icon: BookOpen },
          ],
          requirements: ['Account SID', 'Auth Token', 'Sandbox ou número aprovado'],
          features: ['Integração simples', 'Sandbox para testes', 'Suporte Twilio'],
          pricing: 'Pay-per-message'
        }
      }
    };

    return providerData[tipo]?.[provider || ''] || null;
  };

  const info = getProviderInfo();

  if (!info || !provider) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-6 text-center text-muted-foreground">
          <BookOpen className="h-8 w-8 mx-auto mb-2" />
          <p>Selecione um provider para ver a documentação</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {info.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{info.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Links úteis */}
        <div>
          <h4 className="font-medium mb-2">Links úteis:</h4>
          <div className="space-y-2">
            {info.links.map((link: any, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <link.icon className="h-4 w-4 mr-2" />
                  {link.label}
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
            ))}
          </div>
        </div>

        {/* Requisitos */}
        <div>
          <h4 className="font-medium mb-2">Requisitos:</h4>
          <div className="flex flex-wrap gap-2">
            {info.requirements.map((req: string, index: number) => (
              <Badge key={index} variant="secondary">
                {req}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recursos */}
        <div>
          <h4 className="font-medium mb-2">Recursos:</h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {info.features.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-sm">Preços:</h4>
          <p className="text-sm text-muted-foreground">{info.pricing}</p>
        </div>
      </CardContent>
    </Card>
  );
};