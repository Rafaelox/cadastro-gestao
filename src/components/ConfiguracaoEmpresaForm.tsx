import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConfiguracaoEmpresa } from '@/types/recibo';
import { Building2, Upload } from 'lucide-react';

const configuracaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo_pessoa: z.enum(['fisica', 'juridica']),
  cpf_cnpj: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  logo_url: z.string().optional(),
});

type ConfiguracaoFormData = z.infer<typeof configuracaoSchema>;

interface ConfiguracaoEmpresaFormProps {
  empresaData?: ConfiguracaoEmpresa | null;
  onSuccess?: () => void;
}

export function ConfiguracaoEmpresaForm({ empresaData, onSuccess }: ConfiguracaoEmpresaFormProps) {
  const [loading, setLoading] = useState(false);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoEmpresa | null>(null);
  const { toast } = useToast();

  const form = useForm<ConfiguracaoFormData>({
    resolver: zodResolver(configuracaoSchema),
    defaultValues: {
      nome: '',
      tipo_pessoa: 'fisica',
      cpf_cnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      logo_url: '',
    },
  });

  useEffect(() => {
    if (empresaData) {
      setConfiguracao(empresaData);
      form.reset({
        nome: empresaData.nome || '',
        tipo_pessoa: empresaData.tipo_pessoa as 'fisica' | 'juridica',
        cpf_cnpj: empresaData.cpf_cnpj || '',
        endereco: empresaData.endereco || '',
        cidade: empresaData.cidade || '',
        estado: empresaData.estado || '',
        cep: empresaData.cep || '',
        telefone: empresaData.telefone || '',
        email: empresaData.email || '',
        logo_url: empresaData.logo_url || '',
      });
    } else {
      loadConfiguracao();
    }
  }, [empresaData]);

  const loadConfiguracao = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_empresa')
        .select('*')
        .eq('ativo', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfiguracao(data as ConfiguracaoEmpresa);
        form.reset({
          nome: data.nome || '',
          tipo_pessoa: data.tipo_pessoa as 'fisica' | 'juridica',
          cpf_cnpj: data.cpf_cnpj || '',
          endereco: data.endereco || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: data.cep || '',
          telefone: data.telefone || '',
          email: data.email || '',
          logo_url: data.logo_url || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações da empresa',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: ConfiguracaoFormData) => {
    setLoading(true);
    try {
      console.log('Salvando configuração da empresa:', data);
      
      if (configuracao) {
        // Atualizar configuração existente
        console.log('Atualizando configuração existente com ID:', configuracao.id);
        const { data: result, error } = await supabase
          .from('configuracoes_empresa')
          .update(data)
          .eq('id', configuracao.id)
          .select();

        console.log('Resultado da atualização:', result);
        if (error) {
          console.error('Erro na atualização:', error);
          throw error;
        }
      } else {
        // Desativar empresas existentes primeiro
        console.log('Desativando empresas existentes...');
        const { error: deactivateError } = await supabase
          .from('configuracoes_empresa')
          .update({ ativo: false })
          .neq('id', 0);

        if (deactivateError) {
          console.error('Erro ao desativar empresas:', deactivateError);
        }

        // Criar nova configuração como ativa
        const insertData = {
          nome: data.nome,
          tipo_pessoa: data.tipo_pessoa,
          cpf_cnpj: data.cpf_cnpj || null,
          endereco: data.endereco || null,
          cidade: data.cidade || null,
          estado: data.estado || null,
          cep: data.cep || null,
          telefone: data.telefone || null,
          email: data.email || null,
          logo_url: data.logo_url || null,
          ativo: true
        };
        
        console.log('Inserindo nova configuração:', insertData);
        const { data: result, error } = await supabase
          .from('configuracoes_empresa')
          .insert(insertData)
          .select();

        console.log('Resultado da inserção:', result);
        if (error) {
          console.error('Erro na inserção:', error);
          throw error;
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Configurações da empresa salvas com sucesso',
      });

      if (onSuccess) {
        onSuccess();
      } else {
        loadConfiguracao();
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      
      let errorMessage = 'Erro ao salvar configurações da empresa';
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cliente-documentos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('cliente-documentos')
        .getPublicUrl(fileName);

      form.setValue('logo_url', data.publicUrl);
      
      toast({
        title: 'Sucesso',
        description: 'Logo carregado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload do logo',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Configurações da Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome / Razão Social *</Label>
              <Input
                id="nome"
                {...form.register('nome')}
                placeholder="Digite o nome ou razão social"
              />
              {form.formState.errors.nome && (
                <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_pessoa">Tipo de Pessoa</Label>
              <Select
                value={form.watch('tipo_pessoa')}
                onValueChange={(value) => form.setValue('tipo_pessoa', value as 'fisica' | 'juridica')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Pessoa Física</SelectItem>
                  <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">
                {form.watch('tipo_pessoa') === 'fisica' ? 'CPF' : 'CNPJ'}
              </Label>
              <Input
                id="cpf_cnpj"
                {...form.register('cpf_cnpj')}
                placeholder={form.watch('tipo_pessoa') === 'fisica' ? 'Digite o CPF' : 'Digite o CNPJ'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                {...form.register('telefone')}
                placeholder="Digite o telefone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="Digite o email"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                {...form.register('cep')}
                placeholder="Digite o CEP"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo</Label>
            <Textarea
              id="endereco"
              {...form.register('endereco')}
              placeholder="Digite o endereço completo"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                {...form.register('cidade')}
                placeholder="Digite a cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                {...form.register('estado')}
                placeholder="Digite o estado"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo da Empresa</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="logo-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload do Logo
              </Button>
              {form.watch('logo_url') && (
                <img
                  src={form.watch('logo_url')}
                  alt="Logo"
                  className="h-12 w-12 object-contain border rounded"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}