import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Heart, MessageCircle, Share2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  result_amount: number | null;
  points_earned: number;
  likes_count: number;
  created_at: string;
  username?: string;
  avatar_url?: string | null;
  post_likes: Array<{ user_id: string }>;
}

const Index = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [animatingLike, setAnimatingLike] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*, post_likes (user_id)")
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      // Fetch profiles for each post
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", post.user_id)
            .single();

          return {
            ...post,
            username: profile?.username || "Usuário",
            avatar_url: profile?.avatar_url,
          };
        })
      );

      setPosts(postsWithProfiles);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: newPost,
        points_earned: 50,
      });

      if (error) throw error;
      
      setNewPost("");
      toast.success("Post publicado! +50 pontos!");
      fetchPosts();
    } catch (error: any) {
      toast.error("Erro ao publicar post");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    const isLiked = post?.post_likes.some(like => like.user_id === user.id);

    setAnimatingLike(postId);
    setTimeout(() => setAnimatingLike(null), 600);

    try {
      if (isLiked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase.from("post_likes").insert({
          post_id: postId,
          user_id: user.id,
        });
      }
      
      fetchPosts();
    } catch (error: any) {
      console.error("Error toggling like:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Agora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    return `${Math.floor(seconds / 86400)}d atrás`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2 py-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-fire">
            Feed da Comunidade
          </h1>
          <p className="text-muted-foreground">
            Compartilhe seus resultados e inspire a comunidade
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <Textarea
              placeholder="Compartilhe seu resultado de vendas..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                💰 Ganhe 50 pontos por post + 10 pontos por curtida
              </p>
              <Button 
                onClick={handleCreatePost}
                className="gradient-fire hover:opacity-90"
                disabled={loading}
              >
                <Flame className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = post.post_likes.some(like => like.user_id === user?.id);
            
            return (
              <Card key={post.id} className="hover-lift overflow-hidden border-2 border-border/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={post.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-fire text-white">
                        {(post.username || "U").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.username || "Usuário"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>

                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="Post image"
                      className="w-full rounded-lg object-cover max-h-96"
                    />
                  )}

                  {post.result_amount && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Resultado de Vendas
                      </p>
                      <p className="text-2xl font-bold text-gradient-fire">
                        R$ {post.result_amount.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={cn(
                        "gap-2 transition-all",
                        isLiked && "text-primary"
                      )}
                    >
                      <Flame 
                        className={cn(
                          "w-5 h-5",
                          animatingLike === post.id && "fire-animation"
                        )} 
                      />
                      <span className="font-semibold">{post.likes_count}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Comentar
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="gap-2 ml-auto">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {posts.length === 0 && (
            <Card className="border-2 border-dashed border-border/50">
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">
                  Seja o primeiro a compartilhar seus resultados! 🚀
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
