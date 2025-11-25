import { Home, Users, Trophy, Gift, Sparkles, MessageCircle, LogOut, User, Target } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Notifications } from "./Notifications";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  mobile?: boolean;
}

const NavItem = ({ to, icon: Icon, children, mobile }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
        mobile ? "flex-col text-xs" : "text-sm",
        isActive
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]")} />
      <span className={mobile ? "text-xs" : ""}>{children}</span>
    </Link>
  );
};

export const Navigation = () => {
  const { signOut, isDiamond } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h2 className="text-xl font-bold text-gradient-fire">NutraHub Elite</h2>
              <div className="flex gap-1">
                <NavItem to="/" icon={Home}>Início</NavItem>
                <NavItem to="/community" icon={Users}>Comunidade</NavItem>
                <NavItem to="/ranking" icon={Trophy}>Ranking</NavItem>
                <NavItem to="/challenges" icon={Target}>Desafios</NavItem>
                <NavItem to="/rewards" icon={Gift}>Prêmios</NavItem>
                <NavItem to="/profile" icon={User}>Perfil</NavItem>
                {isDiamond && (
                  <>
                    <NavItem to="/ai-copy" icon={Sparkles}>IA Copy</NavItem>
                    <NavItem to="/ai-creative" icon={Sparkles}>IA Criativo</NavItem>
                  </>
                )}
                <NavItem to="/support" icon={MessageCircle}>Suporte</NavItem>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Notifications />
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          <NavItem to="/" icon={Home} mobile>Início</NavItem>
          <NavItem to="/community" icon={Users} mobile>Comunidade</NavItem>
          <NavItem to="/challenges" icon={Target} mobile>Desafios</NavItem>
          <NavItem to="/profile" icon={User} mobile>Perfil</NavItem>
          <NavItem to="/support" icon={MessageCircle} mobile>Suporte</NavItem>
        </div>
      </nav>
    </>
  );
};
