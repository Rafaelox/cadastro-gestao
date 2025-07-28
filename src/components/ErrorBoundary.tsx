import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ErrorBoundary: Erro capturado:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary: Detalhes do erro:', {
      error,
      errorInfo,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({ 
      error, 
      errorInfo,
      hasError: true 
    });
  }

  handleReset = () => {
    console.log('🔄 ErrorBoundary: Resetando aplicação...');
    
    // Limpar localStorage
    try {
      localStorage.clear();
      console.log('✅ localStorage limpo');
    } catch (e) {
      console.error('❌ Erro ao limpar localStorage:', e);
    }
    
    // Reset do estado
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    // Recarregar página
    window.location.reload();
  };

  handleClearStorage = () => {
    console.log('🗑️ ErrorBoundary: Limpando apenas o storage...');
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      console.log('✅ Dados de autenticação limpos');
      
      // Reset do estado sem recarregar
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    } catch (e) {
      console.error('❌ Erro ao limpar storage:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                🚨 Erro na Aplicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground">
                A aplicação encontrou um erro inesperado e precisa ser reiniciada.
              </p>

              {this.state.error && (
                <div className="bg-muted p-3 rounded-md">
                  <h3 className="font-semibold text-sm mb-2">Detalhes do erro:</h3>
                  <code className="text-xs text-muted-foreground block break-all">
                    {this.state.error.message}
                  </code>
                  {process.env.NODE_ENV === 'development' && this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">Stack trace</summary>
                      <pre className="text-xs text-muted-foreground mt-1 overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={this.handleClearStorage}
                  variant="outline"
                  className="w-full"
                >
                  🗑️ Limpar Dados e Tentar Novamente
                </Button>
                
                <Button 
                  onClick={this.handleReset}
                  className="w-full"
                >
                  🔄 Recarregar Aplicação
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Se o problema persistir, entre em contato com o suporte técnico.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}