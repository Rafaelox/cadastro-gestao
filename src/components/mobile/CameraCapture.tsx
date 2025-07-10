import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Image, Trash2 } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onPhotoTaken: (photoUrl: string) => void;
  onPhotoRemoved?: () => void;
  existingPhotoUrl?: string;
  label?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoTaken,
  onPhotoRemoved,
  existingPhotoUrl,
  label = "Adicionar Foto"
}) => {
  const { takePhoto, selectFromGallery, uploadPhoto, isLoading } = useCamera();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingPhotoUrl || null);

  const handleTakePhoto = async () => {
    try {
      const dataUrl = await takePhoto();
      if (dataUrl) {
        setPreviewUrl(dataUrl);
        
        // Upload da foto
        const fileName = `atendimento_${Date.now()}.jpg`;
        const publicUrl = await uploadPhoto(dataUrl, fileName);
        
        onPhotoTaken(publicUrl);
        toast({
          title: "Foto capturada",
          description: "Foto salva com sucesso!",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao capturar foto. Verifique as permissões da câmera.",
      });
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const dataUrl = await selectFromGallery();
      if (dataUrl) {
        setPreviewUrl(dataUrl);
        
        // Upload da foto
        const fileName = `atendimento_${Date.now()}.jpg`;
        const publicUrl = await uploadPhoto(dataUrl, fileName);
        
        onPhotoTaken(publicUrl);
        toast({
          title: "Foto selecionada",
          description: "Foto salva com sucesso!",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao selecionar foto da galeria.",
      });
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoRemoved?.();
    toast({
      title: "Foto removida",
      description: "Foto removida com sucesso!",
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="font-medium">{label}</h3>
        
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemovePhoto}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-24 flex-col"
              onClick={handleTakePhoto}
              disabled={isLoading}
            >
              <Camera className="h-6 w-6 mb-2" />
              <span className="text-sm">Câmera</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="h-24 flex-col"
              onClick={handleSelectFromGallery}
              disabled={isLoading}
            >
              <Image className="h-6 w-6 mb-2" />
              <span className="text-sm">Galeria</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};