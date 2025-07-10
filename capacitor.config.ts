import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.06071bdf43af427aa037b84c121841e1',
  appName: 'cadastro-facil-gestao-ok',
  webDir: 'dist',
  server: {
    url: "https://06071bdf-43af-427a-a037-b84c121841e1.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    StatusBar: {
      style: 'DARK'
    }
  }
};

export default config;