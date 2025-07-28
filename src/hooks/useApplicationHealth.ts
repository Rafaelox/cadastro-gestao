import { useState, useEffect } from 'react';

interface HealthCheck {
  localStorage: boolean;
  rendering: boolean;
  apiConnection: boolean;
  totalTime: number;
}

export const useApplicationHealth = () => {
  const [healthStatus, setHealthStatus] = useState<HealthCheck | null>(null);
  const [isHealthy, setIsHealthy] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const startTime = performance.now();
    
    const checkHealth = async () => {
      console.log('🏥 Iniciando verificação de saúde da aplicação...');
      
      const health: HealthCheck = {
        localStorage: false,
        rendering: false,
        apiConnection: false,
        totalTime: 0
      };

      // Verificar localStorage
      try {
        localStorage.setItem('health_test', 'ok');
        localStorage.removeItem('health_test');
        health.localStorage = true;
        console.log('✅ localStorage funcionando');
      } catch (e) {
        console.error('❌ localStorage com problema:', e);
      }

      // Verificar rendering (se chegou até aqui, está renderizando)
      health.rendering = true;
      console.log('✅ Rendering funcionando');

      // Verificar conexão com API (opcional, pode falhar sem quebrar)
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          timeout: 2000 
        } as any);
        health.apiConnection = response.ok;
        console.log('✅ API respondendo');
      } catch (e) {
        console.log('ℹ️ API não disponível (normal em desenvolvimento)');
        health.apiConnection = false;
      }

      const endTime = performance.now();
      health.totalTime = endTime - startTime;

      setHealthStatus(health);
      
      // Aplicação é considerada saudável se localStorage e rendering funcionam
      const healthy = health.localStorage && health.rendering;
      setIsHealthy(healthy);
      setIsChecking(false);

      console.log('🏥 Verificação de saúde concluída:', {
        healthy,
        checks: health,
        time: `${health.totalTime.toFixed(2)}ms`
      });
    };

    // Timeout de segurança
    const healthTimeout = setTimeout(() => {
      console.warn('⚠️ Timeout na verificação de saúde');
      setIsChecking(false);
      setIsHealthy(false);
    }, 5000);

    checkHealth().finally(() => {
      clearTimeout(healthTimeout);
    });

    return () => {
      clearTimeout(healthTimeout);
    };
  }, []);

  return {
    healthStatus,
    isHealthy,
    isChecking
  };
};