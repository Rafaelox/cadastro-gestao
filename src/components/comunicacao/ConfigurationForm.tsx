import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { ConfiguracaoComunicacao } from "@/types/comunicacao";
import { ConfiguracaoFormFields } from "./ConfiguracaoFormFields";
import { ProviderDocumentation } from "./ProviderDocumentation";
import { useCommunicationValidation } from "@/hooks/useCommunicationValidation";

interface ConfigurationFormProps {
  configuracao?: ConfiguracaoComunicacao;
  onSave: (config: ConfiguracaoComunicacao) => void;
  onCancel: () => void;
  getIcon: (tipo: string) => JSX.Element;
}

export const ConfigurationForm = ({ configuracao, onSave, onCancel, getIcon }: ConfigurationFormProps) => {
  const [formData, setFormData] = useState<ConfiguracaoComunicacao>(
    configuracao || {
      tipo_servico: 'email',
      provider: '',
      api_key: '',
      api_secret: '',
      webhook_url: '',
      configuracoes_extras: {},
      ativo: true,
    }
  );
  const [validationResult, setValidationResult] = useState<any>(null);
  const { validateConfiguration } = useCommunicationValidation();

  // Real-time validation
  useEffect(() => {
    if (formData.provider) {
      const result = validateConfiguration(formData);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [formData, validateConfiguration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-7xl max-h-[90vh] flex gap-6">
        {/* Main form */}
        <Card className="flex-1 overflow-auto">
          <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {configuracao ? 'Editar' : 'Nova'} Configuração de {formData.tipo_servico.toUpperCase()}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Configure seu provedor de {formData.tipo_servico} para envio de mensagens
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getIcon(formData.tipo_servico)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service type selector */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <Label className="text-base font-medium">Tipo de Serviço</Label>
                  <Select
                    value={formData.tipo_servico}
                    onValueChange={(value: any) => 
                      setFormData({ ...formData, tipo_servico: value, provider: '' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Validation indicators */}
              {validationResult && (
                <div className="space-y-3">
                  {validationResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Erros de configuração:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {validationResult.errors.map((error: string, index: number) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Avisos:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {validationResult.warnings.map((warning: string, index: number) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResult.isValid && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Configuração válida! Você pode salvar e testar esta configuração.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Dynamic form fields */}
              <ConfiguracaoFormFields 
                formData={formData} 
                setFormData={setFormData} 
              />

              {/* Action buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="flex-1"
                  disabled={validationResult && !validationResult.isValid}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {configuracao ? 'Atualizar' : 'Salvar'} Configuração
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  onClick={onCancel}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Documentation sidebar */}
        <div className="w-96">
          <ProviderDocumentation 
            tipo={formData.tipo_servico}
            provider={formData.provider}
          />
        </div>
      </div>
    </div>
  );
};