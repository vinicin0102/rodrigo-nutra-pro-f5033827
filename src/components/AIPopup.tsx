import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Palette, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";

interface AIPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIPopup = ({ open, onOpenChange }: AIPopupProps) => {
  const navigate = useNavigate();
  const { isPremium, loading } = useSubscription();

  const handleNavigate = (path: string) => {
    if (!isPremium) {
      return; // Don't navigate if not premium
    }
    onOpenChange(false);
    navigate(path);
  };

  if (loading) {
    return null;
  }

  if (!isPremium) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">✨ Assistentes IA</DialogTitle>
            <DialogDescription className="text-center">
              Recurso exclusivo para membros Premium
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center space-y-4">
            <Lock className="w-16 h-16 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Faça upgrade para acessar os assistentes de IA e criar conteúdos incríveis!
            </p>
            <Button 
              className="gradient-fire w-full"
              onClick={() => {
                onOpenChange(false);
                navigate('/profile');
              }}
            >
              Fazer Upgrade para Premium
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
            ✨ Assistentes IA
            <Badge variant="default" className="text-xs">Premium</Badge>
          </DialogTitle>
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
