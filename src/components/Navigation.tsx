import { Home, Users, Trophy, Gift, Sparkles, MessageCircle, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Notifications } from "./Notifications";
import { AIPopup } from "./AIPopup";
import { useState, useEffect } from "react";

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
  const { signOut, isDiamond, user } = useAuth();
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();
    
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
  };

  const userInitials = profile?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <>
      {/* Mobile Header */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <h2 className="text-lg font-bold text-gradient-fire">NutraHub Elite</h2>
          <div className="flex items-center gap-2">
            <Notifications />
            <Button variant="ghost" size="icon" asChild>
              <Link to="/support">
                <MessageCircle className="w-5 h-5" />
              </Link>
            </Button>
            <Link to="/profile">
              <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </nav>

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
                <NavItem to="/rewards" icon={Gift}>Prêmios</NavItem>
                {isDiamond && (
                  <>
                    <NavItem to="/ai-copy" icon={Sparkles}>IA Copy</NavItem>
                    <NavItem to="/ai-creative" icon={Sparkles}>IA Criativo</NavItem>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Notifications />
              <Button variant="ghost" size="icon" asChild>
                <Link to="/support">
                  <MessageCircle className="w-5 h-5" />
                </Link>
              </Button>
              <Link to="/profile">
                <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around p-2">
          <NavItem to="/" icon={Home} mobile>Início</NavItem>
          <NavItem to="/rewards" icon={Gift} mobile>Prêmios</NavItem>
          <NavItem to="/community" icon={Users} mobile>Comunidade</NavItem>
          <NavItem to="/ranking" icon={Trophy} mobile>Ranking</NavItem>
          
          {/* Botão FAB laranja - IA */}
          <Button 
            onClick={() => setShowAIPopup(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </Button>
        </div>
      </nav>

      <AIPopup open={showAIPopup} onOpenChange={setShowAIPopup} />
    </>
  );
};
