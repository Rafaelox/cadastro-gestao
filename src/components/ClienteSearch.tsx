import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, Phone, Mail, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Cliente {
  id: number;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
}

interface ClienteSearchProps {
  onClienteSelect: (cliente: Cliente) => void;
  selectedClienteId?: number;
  placeholder?: string;
  className?: string;
}

export const ClienteSearch = ({ 
  onClienteSelect, 
  selectedClienteId, 
  placeholder = "Pesquisar cliente...",
  className 
}: ClienteSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    if (selectedClienteId) {
      loadClienteById(selectedClienteId);
    }
  }, [selectedClienteId]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchClientes();
    } else {
      setClientes([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const loadClienteById = async (clienteId: number) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, cpf, telefone, email')
        .eq('id', clienteId)
        .eq('ativo', true)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSelectedCliente(data);
        setSearchTerm(data.nome);
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
    }
  };

  const searchClientes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, cpf, telefone, email')
        .eq('ativo', true)
        .or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('nome')
        .limit(10);

      if (error) throw error;
      setClientes(data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Erro ao pesquisar clientes:', error);
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setSearchTerm(cliente.nome);
    setShowResults(false);
    onClienteSelect(cliente);
  };

  const clearSelection = () => {
    setSelectedCliente(null);
    setSearchTerm("");
    setShowResults(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center space-x-2">
        <User className="h-4 w-4" />
        <span>Cliente *</span>
      </Label>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          {selectedCliente && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              ×
            </Button>
          )}
        </div>

        {showResults && clientes.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-auto">
            <CardContent className="p-2">
              {clientes.map((cliente) => (
                <Button
                  key={cliente.id}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => handleClienteSelect(cliente)}
                >
                  <div className="text-left space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{cliente.nome}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {cliente.cpf && (
                        <div className="flex items-center space-x-2">
                          <FileText className="h-3 w-3" />
                          <span>CPF: {cliente.cpf}</span>
                        </div>
                      )}
                      {cliente.telefone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3" />
                          <span>{cliente.telefone}</span>
                        </div>
                      )}
                      {cliente.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3" />
                          <span>{cliente.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {showResults && clientes.length === 0 && !isLoading && searchTerm.length >= 2 && (
          <Card className="absolute z-50 w-full mt-1">
            <CardContent className="p-4 text-center text-muted-foreground">
              Nenhum cliente encontrado
            </CardContent>
          </Card>
        )}
      </div>

      {selectedCliente && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedCliente.nome}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                {selectedCliente.cpf && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-3 w-3" />
                    <span>CPF: {selectedCliente.cpf}</span>
                  </div>
                )}
                {selectedCliente.telefone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3" />
                    <span>{selectedCliente.telefone}</span>
                  </div>
                )}
                {selectedCliente.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3" />
                    <span>{selectedCliente.email}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};