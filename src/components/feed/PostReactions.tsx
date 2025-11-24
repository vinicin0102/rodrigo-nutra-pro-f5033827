import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Reaction {
  type: 'like' | 'love' | 'laugh' | 'wow' | 'fire';
  count: number;
  userReacted: boolean;
}

interface PostReactionsProps {
  postId: string;
  initialReactions?: Record<string, number>;
  userReactions?: string[];
}

const reactionEmojis = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  fire: '🔥'
};

export const PostReactions = ({ postId, initialReactions = {}, userReactions = [] }: PostReactionsProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Record<string, Reaction>>(() => {
    const result: Record<string, Reaction> = {};
    Object.entries(reactionEmojis).forEach(([type]) => {
      result[type] = {
        type: type as any,
        count: initialReactions[type] || 0,
        userReacted: userReactions.includes(type)
      };
    });
    return result;
  });

  const handleReaction = async (reactionType: keyof typeof reactionEmojis) => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para reagir",
        variant: "destructive",
      });
      return;
    }

    const currentReaction = reactions[reactionType];
    const isRemoving = currentReaction.userReacted;

    // Optimistic update
    setReactions(prev => ({
      ...prev,
      [reactionType]: {
        ...prev[reactionType],
        count: isRemoving ? prev[reactionType].count - 1 : prev[reactionType].count + 1,
        userReacted: !isRemoving
      }
    }));

    try {
      if (isRemoving) {
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('reaction', reactionType);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction: reactionType
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      
      // Revert optimistic update
      setReactions(prev => ({
        ...prev,
        [reactionType]: {
          ...prev[reactionType],
          count: isRemoving ? prev[reactionType].count + 1 : prev[reactionType].count - 1,
          userReacted: isRemoving
        }
      }));

      toast({
        title: "Erro ao reagir",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Object.entries(reactionEmojis).map(([type, emoji]) => {
        const reaction = reactions[type];
        if (reaction.count === 0 && !reaction.userReacted) return null;

        return (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            onClick={() => handleReaction(type as keyof typeof reactionEmojis)}
            className={cn(
              "h-8 px-2 gap-1",
              reaction.userReacted && "bg-primary/10 text-primary"
            )}
          >
            <span>{emoji}</span>
            {reaction.count > 0 && (
              <span className="text-xs font-medium">{reaction.count}</span>
            )}
          </Button>
        );
      })}
      
      {/* Add reaction button */}
      <div className="relative group">
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <span>➕</span>
        </Button>
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex gap-1 bg-popover border border-border rounded-lg p-2 shadow-lg">
          {Object.entries(reactionEmojis).map(([type, emoji]) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={() => handleReaction(type as keyof typeof reactionEmojis)}
              className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
