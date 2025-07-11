import { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Camera as CameraIcon, 
  FileText, 
  Upload, 
  Eye, 
  Trash2, 
  Download,
  Image as ImageIcon,
  FileImage,
  Plus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DocumentCaptureProps {
  clienteId: number;
  clienteNome: string;
  onDocumentAdded?: () => void;
}

interface DocumentoCliente {
  id: number;
  nome_documento: string;
  tipo_documento: string;
  url_arquivo: string;
  tamanho_arquivo: number;
  data_upload: string;
  observacoes?: string;
}

export const DocumentCapture = ({ clienteId, clienteNome, onDocumentAdded }: DocumentCaptureProps) => {
  const [documentos, setDocumentos] = useState<DocumentoCliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nomeDocumento, setNomeDocumento] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadDocumentos = async () => {
    try {
      const { data, error } = await supabase
        .from('cliente_documentos')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os documentos."
      });
    }
  };

  const capturePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        // Converter dataUrl para blob
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        setSelectedFile(file);
        setPreviewUrl(image.dataUrl);
        setNomeDocumento(`Foto - ${clienteNome} - ${new Date().toLocaleDateString()}`);
        setTipoDocumento('foto');
        setShowUploadForm(true);
      }
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível capturar a foto."
      });
    }
  };

  const selectFromGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        // Converter dataUrl para blob
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `imagem_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        setSelectedFile(file);
        setPreviewUrl(image.dataUrl);
        setNomeDocumento(`Imagem - ${clienteNome} - ${new Date().toLocaleDateString()}`);
        setTipoDocumento('foto');
        setShowUploadForm(true);
      }
    } catch (error) {
      console.error('Erro ao selecionar da galeria:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível selecionar a imagem."
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Detectar tipo do documento
      const fileType = file.type;
      let tipoDoc = 'documento';
      
      if (fileType.startsWith('image/')) tipoDoc = 'foto';
      else if (fileType === 'application/pdf') tipoDoc = 'pdf';
      else if (fileType.includes('word')) tipoDoc = 'doc';
      else if (fileType.includes('excel') || fileType.includes('spreadsheet')) tipoDoc = 'xlsx';
      
      setTipoDocumento(tipoDoc);
      setNomeDocumento(`${tipoDoc.toUpperCase()} - ${clienteNome} - ${new Date().toLocaleDateString()}`);
      
      // Preview para imagens
      if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
      
      setShowUploadForm(true);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      // Upload para o Storage
      const fileName = `${clienteId}/${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cliente-documentos')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('cliente-documentos')
        .getPublicUrl(fileName);

      // Salvar registro no banco
      const { error: dbError } = await supabase
        .from('cliente_documentos')
        .insert({
          cliente_id: clienteId,
          nome_documento: nomeDocumento,
          tipo_documento: tipoDocumento,
          url_arquivo: urlData.publicUrl,
          tamanho_arquivo: selectedFile.size,
          observacoes: observacoes || null
        });

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Documento salvo com sucesso!"
      });

      // Reset form
      setSelectedFile(null);
      setNomeDocumento("");
      setTipoDocumento("");
      setObservacoes("");
      setPreviewUrl(null);
      setShowUploadForm(false);
      
      loadDocumentos();
      onDocumentAdded?.();

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o documento."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (documentoId: number, fileName: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este documento?")) return;

    try {
      // Remover do storage
      const filePath = fileName.split('/').slice(-2).join('/'); // Pegar apenas cliente_id/filename
      await supabase.storage
        .from('cliente-documentos')
        .remove([filePath]);

      // Marcar como inativo no banco
      const { error } = await supabase
        .from('cliente_documentos')
        .update({ ativo: false })
        .eq('id', documentoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso!"
      });

      loadDocumentos();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o documento."
      });
    }
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'foto':
        return <ImageIcon className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileImage className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos de {clienteNome}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de Captura */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={capturePhoto} className="flex items-center gap-2">
            <CameraIcon className="h-4 w-4" />
            Capturar Foto
          </Button>
          
          <Button variant="outline" onClick={selectFromGallery} className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Da Galeria
          </Button>
          
          <Button variant="outline" asChild className="flex items-center gap-2">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-4 w-4" />
              Carregar Arquivo
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
              />
            </label>
          </Button>
          
          <Button variant="outline" onClick={loadDocumentos} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Ver Documentos
          </Button>
        </div>

        {/* Formulário de Upload */}
        {showUploadForm && (
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewUrl && (
                <div className="flex justify-center">
                  <img src={previewUrl} alt="Preview" className="max-w-full h-48 object-contain rounded-lg" />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Nome do Documento</Label>
                <Input
                  value={nomeDocumento}
                  onChange={(e) => setNomeDocumento(e.target.value)}
                  placeholder="Nome do documento"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foto">Foto</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">Documento Word</SelectItem>
                    <SelectItem value="xlsx">Planilha Excel</SelectItem>
                    <SelectItem value="documento">Outro Documento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações sobre o documento (opcional)"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={uploadDocument} disabled={isLoading || !nomeDocumento}>
                  {isLoading ? "Salvando..." : "Salvar Documento"}
                </Button>
                <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Documentos */}
        {documentos.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <h3 className="font-medium">Documentos Salvos</h3>
            <div className="space-y-2">
              {documentos.map((doc) => (
                <Card key={doc.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.tipo_documento)}
                      <div>
                        <p className="font-medium text-sm">{doc.nome_documento}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {doc.tipo_documento.toUpperCase()}
                          </Badge>
                          <span>{formatFileSize(doc.tamanho_arquivo)}</span>
                          <span>{new Date(doc.data_upload).toLocaleDateString()}</span>
                        </div>
                        {doc.observacoes && (
                          <p className="text-xs text-muted-foreground mt-1">{doc.observacoes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{doc.nome_documento}</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center">
                            {doc.tipo_documento === 'foto' ? (
                              <img src={doc.url_arquivo} alt={doc.nome_documento} className="max-w-full max-h-96 object-contain" />
                            ) : (
                              <div className="text-center p-8">
                                {getFileIcon(doc.tipo_documento)}
                                <p className="mt-2">Documento: {doc.nome_documento}</p>
                                <Button asChild className="mt-4">
                                  <a href={doc.url_arquivo} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-2" />
                                    Baixar/Visualizar
                                  </a>
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDocument(doc.id, doc.url_arquivo)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};