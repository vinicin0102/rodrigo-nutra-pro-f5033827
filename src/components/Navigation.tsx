import { Home, Users, Trophy, Gift, Sparkles, Lightbulb, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Users, label: "Comunidade", path: "/community" },
  { icon: Trophy, label: "Ranking", path: "/ranking" },
  { icon: Gift, label: "Prêmios", path: "/rewards" },
  { icon: Sparkles, label: "IA Copy", path: "/ai-copy" },
  { icon: Lightbulb, label: "IA Criativo", path: "/ai-creative" },
  { icon: MessageCircle, label: "Suporte", path: "/support" },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="flex justify-around md:justify-center md:gap-8 md:py-4 py-2 px-2 max-w-7xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className={cn("w-5 h-5 md:w-6 md:h-6", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]")} />
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
