import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ConfiguracaoComunicacao } from "@/types/comunicacao";

interface ConfiguracaoFormFieldsProps {
  formData: ConfiguracaoComunicacao;
  setFormData: (data: ConfiguracaoComunicacao) => void;
}

export const ConfiguracaoFormFields = ({ formData, setFormData }: ConfiguracaoFormFieldsProps) => {
  const updateExtras = (key: string, value: any) => {
    setFormData({
      ...formData,
      configuracoes_extras: {
        ...formData.configuracoes_extras,
        [key]: value
      }
    });
  };

  const getExtrasValue = (key: string, defaultValue: any = '') => {
    return formData.configuracoes_extras?.[key] || defaultValue;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const renderEmailFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Provider de Email</Label>
          <Select
            value={formData.provider}
            onValueChange={(value) => setFormData({ ...formData, provider: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SendGrid">SendGrid</SelectItem>
              <SelectItem value="Mailgun">Mailgun</SelectItem>
              <SelectItem value="SMTP">SMTP Personalizado</SelectItem>
              <SelectItem value="Amazon SES">Amazon SES</SelectItem>
              <SelectItem value="Postmark">Postmark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>API Key *</Label>
          <Input
            type="password"
            value={formData.api_key || ''}
            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
            placeholder="Sua API Key do provider"
            required
          />
        </div>
      </div>

      {formData.provider === 'SMTP' && (
        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
          <div className="col-span-2">
            <h4 className="font-medium mb-3">Configurações SMTP</h4>
          </div>
          
          <div>
            <Label>Servidor SMTP *</Label>
            <Input
              value={getExtrasValue('smtp_host')}
              onChange={(e) => updateExtras('smtp_host', e.target.value)}
              placeholder="smtp.gmail.com"
              required
            />
          </div>
          
          <div>
            <Label>Porta *</Label>
            <Select
              value={getExtrasValue('smtp_port', '587')}
              onValueChange={(value) => updateExtras('smtp_port', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 (Sem criptografia)</SelectItem>
                <SelectItem value="587">587 (STARTTLS)</SelectItem>
                <SelectItem value="465">465 (SSL/TLS)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Email de autenticação *</Label>
            <Input
              type="email"
              value={getExtrasValue('smtp_user')}
              onChange={(e) => updateExtras('smtp_user', e.target.value)}
              placeholder="seu-email@dominio.com"
              required
            />
          </div>
          
          <div>
            <Label>Senha *</Label>
            <Input
              type="password"
              value={getExtrasValue('smtp_password')}
              onChange={(e) => updateExtras('smtp_password', e.target.value)}
              placeholder="Senha do email"
              required
            />
          </div>
          
          <div className="col-span-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={getExtrasValue('smtp_secure', true)}
                onCheckedChange={(checked) => updateExtras('smtp_secure', checked)}
              />
              <Label>Usar TLS/SSL</Label>
            </div>
          </div>
        </div>
      )}

      <div>
        <Label>Email remetente padrão</Label>
        <Input
          type="email"
          value={getExtrasValue('from_email')}
          onChange={(e) => updateExtras('from_email', e.target.value)}
          placeholder="noreply@suaempresa.com"
        />
      </div>
      
      <div>
        <Label>Nome do remetente</Label>
        <Input
          value={getExtrasValue('from_name')}
          onChange={(e) => updateExtras('from_name', e.target.value)}
          placeholder="Sua Empresa"
        />
      </div>
    </div>
  );

  const renderSMSFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Provider de SMS</Label>
          <Select
            value={formData.provider}
            onValueChange={(value) => setFormData({ ...formData, provider: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Twilio">Twilio</SelectItem>
              <SelectItem value="Zenvia">Zenvia</SelectItem>
              <SelectItem value="TotalVoice">TotalVoice</SelectItem>
              <SelectItem value="Movile">Movile</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>API Key/Token *</Label>
          <Input
            type="password"
            value={formData.api_key || ''}
            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
            placeholder="Sua API Key"
            required
          />
        </div>
      </div>

      {formData.provider === 'Twilio' && (
        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
          <div className="col-span-2">
            <h4 className="font-medium mb-3">Configurações Twilio</h4>
          </div>
          
          <div>
            <Label>Account SID *</Label>
            <Input
              value={getExtrasValue('account_sid')}
              onChange={(e) => updateExtras('account_sid', e.target.value)}
              placeholder="AC..."
              required
            />
          </div>
          
          <div>
            <Label>Auth Token *</Label>
            <Input
              type="password"
              value={formData.api_secret || ''}
              onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
              placeholder="Auth Token"
              required
            />
          </div>
          
          <div className="col-span-2">
            <Label>Número do remetente</Label>
            <Input
              value={getExtrasValue('from_number')}
              onChange={(e) => updateExtras('from_number', e.target.value)}
              placeholder="+5511999999999"
            />
          </div>
        </div>
      )}

      {formData.provider === 'Zenvia' && (
        <div className="p-4 border rounded-lg bg-muted/20">
          <h4 className="font-medium mb-3">Configurações Zenvia</h4>
          <div>
            <Label>Número do remetente</Label>
            <Input
              value={getExtrasValue('from_number')}
              onChange={(e) => updateExtras('from_number', e.target.value)}
              placeholder="Sua empresa"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderWhatsAppFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Provider WhatsApp</Label>
          <Select
            value={formData.provider}
            onValueChange={(value) => setFormData({ ...formData, provider: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Twilio WhatsApp">Twilio WhatsApp</SelectItem>
              <SelectItem value="Meta WhatsApp Business">Meta WhatsApp Business</SelectItem>
              <SelectItem value="Zenvia WhatsApp">Zenvia WhatsApp</SelectItem>
              <SelectItem value="TakeBlip">TakeBlip</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>API Token *</Label>
          <Input
            type="password"
            value={formData.api_key || ''}
            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
            placeholder="Token de acesso"
            required
          />
        </div>
      </div>

      {formData.provider === 'Meta WhatsApp Business' && (
        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
          <div className="col-span-2">
            <h4 className="font-medium mb-3">Configurações Meta Business API</h4>
          </div>
          
          <div>
            <Label>Phone Number ID *</Label>
            <Input
              value={getExtrasValue('phone_number_id')}
              onChange={(e) => updateExtras('phone_number_id', e.target.value)}
              placeholder="ID do número de telefone"
              required
            />
          </div>
          
          <div>
            <Label>Business Account ID</Label>
            <Input
              value={getExtrasValue('business_account_id')}
              onChange={(e) => updateExtras('business_account_id', e.target.value)}
              placeholder="ID da conta business"
            />
          </div>
          
          <div className="col-span-2">
            <Label>Webhook URL</Label>
            <Input
              value={formData.webhook_url || ''}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              placeholder="https://seu-webhook.com/whatsapp"
            />
          </div>
        </div>
      )}

      {formData.provider === 'Twilio WhatsApp' && (
        <div className="p-4 border rounded-lg bg-muted/20">
          <h4 className="font-medium mb-3">Configurações Twilio WhatsApp</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>WhatsApp From Number</Label>
              <Input
                value={getExtrasValue('whatsapp_from')}
                onChange={(e) => updateExtras('whatsapp_from', e.target.value)}
                placeholder="whatsapp:+5511999999999"
              />
            </div>
            
            <div>
              <Label>Account SID</Label>
              <Input
                value={getExtrasValue('account_sid')}
                onChange={(e) => updateExtras('account_sid', e.target.value)}
                placeholder="AC..."
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <Label>Observações sobre uso</Label>
        <Textarea
          value={getExtrasValue('notes')}
          onChange={(e) => updateExtras('notes', e.target.value)}
          placeholder="Informações importantes sobre esta configuração..."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {formData.tipo_servico === 'email' && renderEmailFields()}
      {formData.tipo_servico === 'sms' && renderSMSFields()}
      {formData.tipo_servico === 'whatsapp' && renderWhatsAppFields()}
    </div>
  );
};