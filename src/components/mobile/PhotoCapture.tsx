import { useState } from 'react';
import { Camera, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCamera, PhotoResult } from '@/hooks/useCamera';
import { Capacitor } from '@capacitor/core';

interface PhotoCaptureProps {
  onPhotoTaken: (photo: PhotoResult) => void;
  folder: string;
  disabled?: boolean;
}

export const PhotoCapture = ({ onPhotoTaken, folder, disabled }: PhotoCaptureProps) => {
  const { takeAndUploadPhoto, isUploading } = useCamera();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    const result = await takeAndUploadPhoto(folder);
    if (result) {
      setPreviewUrl(result.url);
      onPhotoTaken(result);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Adicionar Foto</h3>
          {previewUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewUrl(null)}
            >
              Remover
            </Button>
          )}
        </div>

        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Foto capturada"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <Image className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              {Capacitor.isNativePlatform() ? 'Tire uma foto' : 'Selecione uma foto'}
            </p>
            <Button
              onClick={handleTakePhoto}
              disabled={disabled || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  {Capacitor.isNativePlatform() ? 'Tirar Foto' : 'Selecionar Foto'}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};