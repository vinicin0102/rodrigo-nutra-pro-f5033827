import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flame, Heart, ThumbsUp, Share2, MessageCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  result: string;
  points: number;
  likes: number;
  timestamp: string;
  isLiked: boolean;
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: "Maria Silva",
    avatar: "",
    content: "Fechei R$ 15.000 essa semana com o combo detox! 🔥 Estratégia que aprendi aqui na comunidade funcionou demais!",
    result: "R$ 15.000",
    points: 150,
    likes: 24,
    timestamp: "2h atrás",
    isLiked: false,
  },
  {
    id: "2",
    author: "João Pedro",
    avatar: "",
    content: "Primeiro mês batendo meta! R$ 8.500 em vendas. Obrigado pela mentoria Rodrigo! 💪",
    result: "R$ 8.500",
    points: 85,
    likes: 18,
    timestamp: "5h atrás",
    isLiked: false,
  },
];

const Community = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPost, setNewPost] = useState("");
  const [animatingLike, setAnimatingLike] = useState<string | null>(null);

  const handleLike = (postId: string) => {
    setAnimatingLike(postId);
    setTimeout(() => setAnimatingLike(null), 600);
    
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + (post.isLiked ? -1 : 1), isLiked: !post.isLiked }
        : post
    ));
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    
    const post: Post = {
      id: Date.now().toString(),
      author: "Você",
      avatar: "",
      content: newPost,
      result: "",
      points: 0,
      likes: 0,
      timestamp: "Agora",
      isLiked: false,
    };
    
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-fire">
            Comunidade Elite
          </h1>
          <p className="text-muted-foreground">
            Compartilhe seus resultados e inspire outros vendedores
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <Textarea
              placeholder="Compartilhe seu resultado ou experiência..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                💡 Posts com resultados ganham mais pontos!
              </p>
              <Button 
                onClick={handlePost}
                className="gradient-fire hover:opacity-90"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover-lift overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback className="bg-gradient-fire text-white">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.author}</p>
                      <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                    </div>
                  </div>
                  {post.points > 0 && (
                    <Badge className="gradient-elite">
                      +{post.points} pts
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">{post.content}</p>
                
                {post.result && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Resultado</p>
                    <p className="text-2xl font-bold text-gradient-fire">{post.result}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "gap-2 transition-all",
                      post.isLiked && "text-primary"
                    )}
                  >
                    <Flame 
                      className={cn(
                        "w-5 h-5",
                        animatingLike === post.id && "fire-animation"
                      )} 
                    />
                    <span className="font-semibold">{post.likes}</span>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
