import { useState, useEffect } from 'react';

// Hook para storage seguro compatível com web e mobile
export const useSecureStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Função para ler do storage
  const readValue = async (): Promise<T> => {
    try {
      // Para web, usar localStorage
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return initialValue;
    } catch (error) {
      console.error(`Erro ao ler ${key} do storage:`, error);
      return initialValue;
    }
  };

  // Inicializar o valor
  useEffect(() => {
    const initializeValue = async () => {
      try {
        const value = await readValue();
        setStoredValue(value);
      } catch (error) {
        console.error('Erro ao inicializar storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeValue();
  }, [key]);

  // Função para salvar no storage
  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Salvar no localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar ${key} no storage:`, error);
    }
  };

  // Função para remover do storage
  const removeValue = async () => {
    try {
      setStoredValue(initialValue);
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover ${key} do storage:`, error);
    }
  };

  return {
    value: storedValue,
    setValue,
    removeValue,
    isLoading
  };
};

// Utilitário para limpeza completa do storage de autenticação
export const clearAuthStorage = async () => {
  try {
    const authKeys = [
      'secure_session',
      'user_data', 
      'user_session',
      'usuario_logado',
      'mock_session'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Storage de autenticação limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar storage de autenticação:', error);
  }
};

// Validador de sessão com timeout
export const validateSession = (sessionData: any, timeoutHours: number = 8): boolean => {
  if (!sessionData) return false;
  
  try {
    const now = new Date().getTime();
    const sessionTime = sessionData.timestamp || 0;
    const maxAge = timeoutHours * 60 * 60 * 1000; // horas em ms
    
    return (now - sessionTime) < maxAge;
  } catch (error) {
    console.error('Erro ao validar sessão:', error);
    return false;
  }
};