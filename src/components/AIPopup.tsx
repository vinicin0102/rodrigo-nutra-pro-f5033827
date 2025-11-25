import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AIPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIPopup = ({ open, onOpenChange }: AIPopupProps) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">✨ Assistentes IA</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button 
            variant="outline" 
            className="w-full h-24 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
            onClick={() => handleNavigate("/ai-copy")}
          >
            <FileText className="w-8 h-8 text-primary" />
            <span className="font-semibold">IA Copy</span>
            <span className="text-xs text-muted-foreground">Gere textos persuasivos</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-24 flex flex-col gap-2 hover:bg-accent/10 hover:border-accent transition-all"
            onClick={() => handleNavigate("/ai-creative")}
          >
            <Palette className="w-8 h-8 text-accent" />
            <span className="font-semibold">IA Criativo</span>
            <span className="text-xs text-muted-foreground">Crie artes e imagens</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
