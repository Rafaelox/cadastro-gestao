import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);

  const takePhoto = async () => {
    try {
      setIsLoading(true);

      if (!Capacitor.isNativePlatform()) {
        // Para desenvolvimento web, usar input file como fallback
        return await selectFromGallery();
      }

      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return image.dataUrl;
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      setIsLoading(true);

      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      return image.dataUrl;
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPhoto = async (dataUrl: string, fileName: string) => {
    try {
      setIsLoading(true);

      // Converter DataURL para Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('atendimento-fotos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('atendimento-fotos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    takePhoto,
    selectFromGallery,
    uploadPhoto,
    isLoading
  };
};