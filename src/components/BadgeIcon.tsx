import { Medal, Award, Trophy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const badgeConfig: Record<string, { icon: typeof Medal; color: string; glow?: boolean }> = {
  first_post: { icon: Medal, color: '#FFD700', glow: true },      // Ouro
  posts_10: { icon: Award, color: '#CD7F32' },                     // Bronze
  posts_50: { icon: Award, color: '#C0C0C0' },                     // Prata
  posts_100: { icon: Trophy, color: '#FFD700', glow: true },       // Ouro especial
  likes_10: { icon: Medal, color: '#FF6B9D' },                     // Rosa
  likes_50: { icon: Medal, color: '#FF8C00' },                     // Laranja
  likes_100: { icon: Medal, color: '#00BFFF', glow: true },        // Azul diamante
  first_comment: { icon: Medal, color: '#10B981' },                // Verde
  comments_10: { icon: Medal, color: '#14B8A6' },                  // Teal
  comments_50: { icon: Medal, color: '#06B6D4' },                  // Cyan
  streak_7: { icon: Medal, color: '#EF4444' },                     // Vermelho fogo
  streak_30: { icon: Medal, color: '#8B5CF6', glow: true },        // Roxo
};

interface BadgeIconProps {
  type: string;
  name: string;
  size?: number;
  animationDelay?: number;
}

export const BadgeIcon = ({ type, name, size = 16, animationDelay = 0 }: BadgeIconProps) => {
  const config = badgeConfig[type] || { icon: Medal, color: '#9CA3AF' };
  const Icon = config.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex animate-badge-pop"
            style={{ 
              animationDelay: `${animationDelay}ms`,
              animationFillMode: 'backwards'
            }}
          >
            <Icon 
              size={size} 
              style={{ 
                color: config.color,
                filter: config.glow ? `drop-shadow(0 0 4px ${config.color})` : undefined
              }} 
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-medium">{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
