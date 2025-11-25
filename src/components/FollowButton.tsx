import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

export const FollowButton = ({ 
  userId, 
  variant = "default", 
  size = "sm",
  showIcon = true 
}: FollowButtonProps) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && userId !== user.id) {
      checkFollowStatus();
    }
  }, [user, userId]);

  const checkFollowStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleToggleFollow = async () => {
    if (!user || userId === user.id) return;

    setLoading(true);
    try {
      if (isFollowing) {
        // Deixar de seguir
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);

        if (error) throw error;
        setIsFollowing(false);
        toast.success("Deixou de seguir");
      } else {
        // Seguir
        const { error } = await supabase
          .from("followers")
          .insert({
            follower_id: user.id,
            following_id: userId,
          });

        if (error) throw error;
        setIsFollowing(true);
        toast.success("Agora você está seguindo");
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast.error("Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  };

  // Não mostrar botão se for o próprio usuário
  if (!user || userId === user.id) return null;

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={loading}
      className="gap-2"
    >
      {showIcon && (isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
      {isFollowing ? "Seguindo" : "Seguir"}
    </Button>
  );
};