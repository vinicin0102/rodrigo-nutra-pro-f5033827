import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MediaUploadProps {
  onImageSelected: (url: string) => void;
  disabled?: boolean;
}

export const MediaUpload = ({ onImageSelected, disabled }: MediaUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('community-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community-media')
        .getPublicUrl(data.path);

      onImageSelected(publicUrl);
      
      toast({
        title: "Imagem enviada!",
        description: "Sua imagem foi carregada com sucesso",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Tente novamente",
        variant: "destructive",
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="h-10 w-10 bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/30 text-blue-400 disabled:opacity-50"
        title="Enviar imagem"
      >
        <Image className="h-5 w-5" />
      </Button>
    </>
  );
};
