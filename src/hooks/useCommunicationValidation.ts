import { ConfiguracaoComunicacao } from "@/types/comunicacao";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const useCommunicationValidation = () => {
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateEmailConfiguration = (config: ConfiguracaoComunicacao): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.provider) {
      errors.push("Provider de email é obrigatório");
    }

    if (!config.api_key) {
      errors.push("API Key é obrigatória");
    }

    if (config.provider === 'SMTP') {
      const extras = config.configuracoes_extras || {};
      
      if (!extras.smtp_host) {
        errors.push("Servidor SMTP é obrigatório");
      }
      
      if (!extras.smtp_port) {
        errors.push("Porta SMTP é obrigatória");
      }
      
      if (!extras.smtp_user) {
        errors.push("Email de autenticação é obrigatório");
      } else if (!validateEmail(extras.smtp_user)) {
        errors.push("Email de autenticação inválido");
      }
      
      if (!extras.smtp_password) {
        errors.push("Senha SMTP é obrigatória");
      }
    }

    const fromEmail = config.configuracoes_extras?.from_email;
    if (fromEmail && !validateEmail(fromEmail)) {
      errors.push("Email remetente inválido");
    }

    if (!fromEmail) {
      warnings.push("Recomendamos configurar um email remetente padrão");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const validateSMSConfiguration = (config: ConfiguracaoComunicacao): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.provider) {
      errors.push("Provider de SMS é obrigatório");
    }

    if (!config.api_key) {
      errors.push("API Key/Token é obrigatório");
    }

    if (config.provider === 'Twilio') {
      const extras = config.configuracoes_extras || {};
      
      if (!extras.account_sid) {
        errors.push("Account SID do Twilio é obrigatório");
      }
      
      if (!config.api_secret) {
        errors.push("Auth Token do Twilio é obrigatório");
      }

      const fromNumber = extras.from_number;
      if (fromNumber && !validatePhone(fromNumber)) {
        errors.push("Número do remetente inválido");
      }
    }

    if (config.provider === 'Zenvia') {
      const fromNumber = config.configuracoes_extras?.from_number;
      if (!fromNumber) {
        warnings.push("Recomendamos configurar um número/nome de remetente");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const validateWhatsAppConfiguration = (config: ConfiguracaoComunicacao): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.provider) {
      errors.push("Provider de WhatsApp é obrigatório");
    }

    if (!config.api_key) {
      errors.push("API Token é obrigatório");
    }

    if (config.provider === 'Meta WhatsApp Business') {
      const extras = config.configuracoes_extras || {};
      
      if (!extras.phone_number_id) {
        errors.push("Phone Number ID é obrigatório para Meta Business API");
      }

      if (config.webhook_url && !validateURL(config.webhook_url)) {
        errors.push("URL do webhook inválida");
      }
    }

    if (config.provider === 'Twilio WhatsApp') {
      const extras = config.configuracoes_extras || {};
      
      const whatsappFrom = extras.whatsapp_from;
      if (whatsappFrom && !whatsappFrom.startsWith('whatsapp:+')) {
        warnings.push("O número WhatsApp do Twilio deve começar com 'whatsapp:+'");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const validateConfiguration = (config: ConfiguracaoComunicacao): ValidationResult => {
    switch (config.tipo_servico) {
      case 'email':
        return validateEmailConfiguration(config);
      case 'sms':
        return validateSMSConfiguration(config);
      case 'whatsapp':
        return validateWhatsAppConfiguration(config);
      default:
        return {
          isValid: false,
          errors: ['Tipo de serviço inválido'],
          warnings: []
        };
    }
  };

  const getRequiredFields = (config: ConfiguracaoComunicacao): string[] => {
    const baseFields = ['provider', 'api_key'];
    
    if (config.tipo_servico === 'email' && config.provider === 'SMTP') {
      return [...baseFields, 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password'];
    }
    
    if (config.tipo_servico === 'sms' && config.provider === 'Twilio') {
      return [...baseFields, 'account_sid', 'api_secret'];
    }
    
    if (config.tipo_servico === 'whatsapp' && config.provider === 'Meta WhatsApp Business') {
      return [...baseFields, 'phone_number_id'];
    }
    
    return baseFields;
  };

  return {
    validateConfiguration,
    validateEmail,
    validatePhone,
    validateURL,
    getRequiredFields
  };
};