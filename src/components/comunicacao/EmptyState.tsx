import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, Smartphone, Settings } from "lucide-react";

interface EmptyStateProps {
  onAddConfiguration: (tipo: 'email' | 'sms' | 'whatsapp') => void;
}

export const EmptyState = ({ onAddConfiguration }: EmptyStateProps) => {
  return (
    <div className="min-h-[500px] flex items-center justify-center">
      <Card className="max-w-2xl w-full border-dashed border-2 border-border/50 bg-gradient-to-br from-card via-card to-muted/20">
        <CardContent className="p-12 text-center">
          <div className="space-y-6">
            {/* Animated icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse"></div>
              <div className="relative rounded-full bg-primary/10 p-4 border border-primary/20">
                <Settings className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">Configure seus canais de comunicação</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Conecte seus provedores de Email, SMS e WhatsApp para começar a enviar mensagens automatizadas aos seus clientes.
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Button 
                onClick={() => onAddConfiguration('email')}
                variant="default" 
                size="lg"
                className="flex flex-col items-center gap-3 h-auto py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Mail className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Configurar Email</div>
                  <div className="text-xs opacity-90">SMTP, SendGrid, etc.</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => onAddConfiguration('sms')}
                variant="default" 
                size="lg"
                className="flex flex-col items-center gap-3 h-auto py-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <MessageSquare className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Configurar SMS</div>
                  <div className="text-xs opacity-90">Twilio, Zenvia, etc.</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => onAddConfiguration('whatsapp')}
                variant="default" 
                size="lg"
                className="flex flex-col items-center gap-3 h-auto py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Smartphone className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Configurar WhatsApp</div>
                  <div className="text-xs opacity-90">Business API</div>
                </div>
              </Button>
            </div>
            
            {/* Help link */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Precisa de ajuda? <Button variant="link" className="h-auto p-0 text-primary">Consulte nossa documentação</Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};