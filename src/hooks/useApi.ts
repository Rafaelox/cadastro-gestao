// Generic hook for API operations with loading and error states

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ApiResponse } from '@/types';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null
  });
  
  const { toast } = useToast();

  const execute = useCallback(async (
    apiCall: () => Promise<ApiResponse<T>>,
    options: UseApiOptions = {}
  ) => {
    const { onSuccess, onError, showToast = true } = options;
    
    setState({ data: null, isLoading: true, error: null });

    try {
      const response = await apiCall();
      
      if (response.success && response.data !== undefined) {
        setState({ data: response.data, isLoading: false, error: null });
        onSuccess?.(response.data);
        
        if (showToast) {
          toast({
            title: "Sucesso",
            description: "Operação realizada com sucesso",
          });
        }
      } else {
        const errorMessage = response.error || 'Erro desconhecido';
        setState({ data: null, isLoading: false, error: errorMessage });
        onError?.(errorMessage);
        
        if (showToast) {
          toast({
            title: "Erro",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado';
      setState({ data: null, isLoading: false, error: errorMessage });
      onError?.(errorMessage);
      
      if (showToast) {
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}