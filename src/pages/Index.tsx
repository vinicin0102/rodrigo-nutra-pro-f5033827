import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PostReactions } from "@/components/feed/PostReactions";
import { PostComments } from "@/components/feed/PostComments";
import { DiamondAnimation } from "@/components/DiamondAnimation";
import { cn } from "@/lib/utils";

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
  const [showDiamondAnimation, setShowDiamondAnimation] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
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
      setShowCreatePost(false);
      
      setEarnedPoints(50);
      setShowDiamondAnimation(true);
      
      toast.success("Post publicado!");
      fetchPosts();
    } catch (error: any) {
      toast.error("Erro ao publicar");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Agora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-16">
      <Navigation />
      
      {showDiamondAnimation && (
        <DiamondAnimation 
          points={earnedPoints} 
          onComplete={() => setShowDiamondAnimation(false)}
        />
      )}
      
      {/* Header estilo Instagram */}
      <header className="fixed top-16 md:top-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient-fire">NutraHub</h1>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowCreatePost(!showCreatePost)}
            >
              <Heart className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto pt-28 md:pt-28">
        {/* Criar Post - Expandível */}
        {showCreatePost && (
          <div className="bg-background border-b border-border p-4 space-y-3">
            <Textarea
              placeholder="Compartilhe seus resultados..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[80px] resize-none border-none focus-visible:ring-0"
            />
            
            {pendingImage && (
              <div className="relative">
                <img 
                  src={pendingImage} 
                  alt="Preview" 
                  className="w-full aspect-square object-cover rounded-lg"
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
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button 
                onClick={handleCreatePost}
                disabled={loading || (!newPost.trim() && !pendingImage)}
                className="gradient-fire"
              >
                Publicar
              </Button>
            </div>
          </div>
        )}

        {/* Feed de Posts - Estilo Instagram */}
        <div className="space-y-0">
          {posts.map((post) => {
            const likesCount = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);
            
            return (
              <article key={post.id} className="bg-background border-b border-border">
                {/* Header do Post */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 rounded-full blur-sm"></div>
                      <Avatar className="relative w-10 h-10 ring-2 ring-background">
                        <AvatarImage src={post.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-fire text-white text-xs">
                          {(post.username || "U").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{post.username || "Usuário"}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>

                {/* Imagem do Post (largura total) */}
                {post.image_url && (
                  <div className="w-full aspect-square bg-muted">
                    <img 
                      src={post.image_url} 
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Resultado de vendas em destaque */}
                {post.result_amount && (
                  <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-accent/10">
                    <p className="text-xs text-muted-foreground mb-1">💰 Resultado de Vendas</p>
                    <p className="text-xl font-bold text-gradient-fire">
                      R$ {post.result_amount.toLocaleString("pt-BR")}
                    </p>
                  </div>
                )}

                {/* Ações do Post */}
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex gap-4">
                    <PostReactions 
                      postId={post.id}
                      initialReactions={post.reactions}
                      userReactions={post.user_reactions}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bookmark className="w-5 h-5" />
                  </Button>
                </div>

                {/* Curtidas */}
                {likesCount > 0 && (
                  <p className="px-4 pb-2 text-sm font-semibold">
                    {likesCount} {likesCount === 1 ? 'curtida' : 'curtidas'}
                  </p>
                )}

                {/* Legenda */}
                {post.content && (
                  <p className="px-4 pb-2 text-sm">
                    <span className="font-semibold">{post.username}</span>{' '}
                    {post.content}
                  </p>
                )}

                {/* Comentários */}
                <div className="px-4 pb-3">
                  <PostComments 
                    postId={post.id}
                    initialCount={post.comments_count}
                  />
                </div>
              </article>
            );
          })}

          {posts.length === 0 && (
            <div className="text-center py-20 px-4">
              <p className="text-muted-foreground">
                Seja o primeiro a compartilhar! 🚀
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;