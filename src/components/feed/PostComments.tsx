import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

interface PostCommentsProps {
  postId: string;
  initialCount?: number;
}

export const PostComments = ({ postId, initialCount = 0 }: PostCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCount);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profilesData?.map(p => [p.id, p]));

      const commentsWithProfiles = commentsData?.map(comment => ({
        ...comment,
        profiles: profileMap.get(comment.user_id)
      })) || [];

      setComments(commentsWithProfiles);
      setCommentCount(commentsWithProfiles.length);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select()
        .single();

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      setComments(prev => [...prev, { ...data, profiles: profile || undefined }]);
      setCommentCount(prev => prev + 1);
      setNewComment("");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro ao comentar",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {commentCount > 0 ? `${commentCount} comentários` : 'Comentar'}
      </Button>

      {showComments && (
        <div className="space-y-3 pl-4 border-l-2 border-border">
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Seja o primeiro a comentar!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const username = comment.profiles?.username || 'Usuário';
                const initials = username.split(' ').map(n => n[0]).join('').toUpperCase();

                return (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.profiles?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <p className="font-semibold text-sm">{username}</p>
                        <p className="text-sm break-words">{comment.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-3">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              className="flex-1"
            />
            <Button 
              type="submit"
              size="icon"
              disabled={!newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
