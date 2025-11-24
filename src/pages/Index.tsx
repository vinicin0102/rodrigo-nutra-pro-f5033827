import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PostReactions } from "@/components/feed/PostReactions";
import { PostComments } from "@/components/feed/PostComments";

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
  reactions?: Record<string, number>;
  user_reactions?: string[];
  comments_count?: number;
}

const Index = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Fetch additional data for each post
      const postsWithData = await Promise.all(
        (postsData || []).map(async (post) => {
          const [profileData, reactionsData, commentsData] = await Promise.all([
            supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", post.user_id)
              .single(),
            supabase
              .from("post_reactions")
              .select("reaction, user_id")
              .eq("post_id", post.id),
            supabase
              .from("post_comments")
              .select("id", { count: "exact" })
              .eq("post_id", post.id)
          ]);

          // Aggregate reactions
          const reactions: Record<string, number> = {};
          const userReactions: string[] = [];
          
          reactionsData.data?.forEach(r => {
            reactions[r.reaction] = (reactions[r.reaction] || 0) + 1;
            if (r.user_id === user?.id) {
              userReactions.push(r.reaction);
            }
          });

          return {
            ...post,
            username: profileData.data?.username || "Usuário",
            avatar_url: profileData.data?.avatar_url,
            reactions,
            user_reactions: userReactions,
            comments_count: commentsData.count || 0
          };
        })
      );

      setPosts(postsWithData);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 5MB)");
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(data.path);

      setPendingImage(publicUrl);
      toast.success("Imagem carregada!");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erro ao carregar imagem");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async () => {
    if ((!newPost.trim() && !pendingImage) || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: newPost,
        image_url: pendingImage,
        points_earned: 50,
      });

      if (error) throw error;
      
      setNewPost("");
      setPendingImage(null);
      toast.success("Post publicado! +50 pontos!");
      fetchPosts();
    } catch (error: any) {
      toast.error("Erro ao publicar post");
    } finally {
      setLoading(false);
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
            
            {pendingImage && (
              <div className="relative">
                <img 
                  src={pendingImage} 
                  alt="Preview" 
                  className="w-full max-h-64 object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setPendingImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  💰 50 pontos por post
                </p>
              </div>
              <Button 
                onClick={handleCreatePost}
                className="gradient-fire hover:opacity-90"
                disabled={loading || (!newPost.trim() && !pendingImage)}
              >
                <Flame className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => {
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

                  {post.content && (
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}

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

                  <div className="pt-2 border-t border-border/50 space-y-3">
                    <PostReactions 
                      postId={post.id}
                      initialReactions={post.reactions}
                      userReactions={post.user_reactions}
                    />
                    <PostComments 
                      postId={post.id}
                      initialCount={post.comments_count}
                    />
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
