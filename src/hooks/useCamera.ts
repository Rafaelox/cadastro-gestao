import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { databaseClient } from '@/lib/database-client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export interface PhotoResult {
  url: string;
  path: string;
}

export const useCamera = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const checkCameraPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      return true; // Web sempre tem permissão
    }

    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'granted') {
        const requestResult = await Camera.requestPermissions();
        return requestResult.camera === 'granted';
      }
      return true;
    } catch (error) {
      console.error('Erro ao verificar permissões da câmera:', error);
      return false;
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    try {
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        toast({
          title: "Permissão negada",
          description: "É necessário permitir o acesso à câmera para tirar fotos.",
          variant: "destructive",
        });
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1024,
        height: 1024,
        correctOrientation: true,
      });

      return image.dataUrl || null;
    } catch (error: any) {
      if (error.message !== 'User cancelled photos app') {
        toast({
          title: "Erro ao tirar foto",
          description: "Não foi possível capturar a foto. Tente novamente.",
          variant: "destructive",
        });
      }
      return null;
    }
  };

  const selectFromGallery = async (): Promise<string | null> => {
    try {
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        toast({
          title: "Permissão negada",
          description: "É necessário permitir o acesso à galeria para selecionar fotos.",
          variant: "destructive",
        });
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 1024,
        height: 1024,
        correctOrientation: true,
      });

      return image.dataUrl || null;
    } catch (error: any) {
      if (error.message !== 'User cancelled photos app') {
        toast({
          title: "Erro ao selecionar foto",
          description: "Não foi possível selecionar a foto. Tente novamente.",
          variant: "destructive",
        });
      }
      return null;
    }
  };

  const uploadPhoto = async (
    dataUrl: string, 
    folder: string, 
    filename?: string
  ): Promise<PhotoResult | null> => {
    setIsUploading(true);
    
    try {
      // Converter dataUrl para blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Gerar nome único se não fornecido
      const finalFilename = filename || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      const filePath = `${folder}/${finalFilename}`;

      // Simular upload local para desenvolvimento
      const file = new File([blob], finalFilename, { type: 'image/jpeg' });
      const uploadResult = await databaseClient.uploadFile(file);

      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      // Obter URL pública
      const publicUrl = databaseClient.getPublicUrl(filePath, 'atendimento-fotos');

      return {
        url: publicUrl,
        path: filePath
      };

    } catch (error: any) {
      console.error('Erro ao fazer upload da foto:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a foto. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const takeAndUploadPhoto = async (
    folder: string, 
    filename?: string
  ): Promise<PhotoResult | null> => {
    const dataUrl = await takePhoto();
    if (!dataUrl) return null;

    return await uploadPhoto(dataUrl, folder, filename);
  };

  return {
    takePhoto,
    selectFromGallery,
    uploadPhoto,
    takeAndUploadPhoto,
    isUploading,
    isLoading: isUploading,
    checkCameraPermissions
  };
};