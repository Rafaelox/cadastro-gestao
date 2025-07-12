import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Trash2, Send, Zap } from "lucide-react";
import { ConfiguracaoComunicacao } from "@/types/comunicacao";

interface ConfigurationCardProps {
  config: ConfiguracaoComunicacao;
  showPassword: boolean;
  onTogglePassword: () => void;
  onEdit: () => void;
  onTest: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
  getIcon: (tipo: string) => JSX.Element;
}

export const ConfigurationCard = ({
  config,
  showPassword,
  onTogglePassword,
  onEdit,
  onTest,
  onDelete,
  onToggleActive,
  getIcon
}: ConfigurationCardProps) => {
  return (
    <Card className="relative group hover:shadow-lg transition-all duration-200 border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      {/* Status indicator */}
      <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
        config.ativo ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'
      }`}></div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${
            config.tipo_servico === 'email' ? 'bg-blue-50 border-blue-200 text-blue-700' :
            config.tipo_servico === 'sms' ? 'bg-green-50 border-green-200 text-green-700' :
            'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {getIcon(config.tipo_servico)}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg capitalize font-semibold">{config.tipo_servico}</CardTitle>
            <p className="text-sm text-muted-foreground">{config.provider}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.ativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {config.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <Switch
            checked={config.ativo}
            onCheckedChange={onToggleActive}
          />
        </div>
        
        {/* API Key display */}
        {config.api_key && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-3 w-3" />
              API Key
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
              <code className="text-sm text-muted-foreground flex-1 font-mono">
                {showPassword ? config.api_key : '••••••••••••••••'}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePassword}
                className="h-8 w-8 p-0"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onTest}
            className="hover:bg-blue-500 hover:text-white transition-all duration-200"
            disabled={!config.ativo}
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};