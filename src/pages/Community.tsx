import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

const Community = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('community-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchMessageProfile(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageProfile = async (newMsg: Message) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', newMsg.user_id)
        .single();

      setMessages(prev => [...prev, { ...newMsg, profiles: profile || undefined }]);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert({
          user_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24 flex flex-col">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-160px)] w-full">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-fire">
            Comunidade Aberta
          </h1>
          <p className="text-muted-foreground text-sm">
            Grupo de conversa da comunidade
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-muted/30 rounded-t-lg border border-border overflow-hidden">
          <ScrollArea className="h-full">
            <div ref={scrollRef} className="p-4 space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground py-8">
                  Carregando mensagens...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Seja o primeiro a enviar uma mensagem! 👋
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.user_id === user?.id;
                  const username = message.profiles?.username || 'Usuário';
                  const initials = username.split(' ').map(n => n[0]).join('').toUpperCase();

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2 items-start",
                        isOwn && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarImage src={message.profiles?.avatar_url || ''} />
                        <AvatarFallback className={cn(
                          "text-xs",
                          isOwn ? "bg-gradient-fire text-white" : "bg-muted"
                        )}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={cn(
                        "flex flex-col max-w-[70%]",
                        isOwn && "items-end"
                      )}>
                        <span className="text-xs font-semibold mb-1 px-1">
                          {isOwn ? 'Você' : username}
                        </span>
                        <div className={cn(
                          "rounded-2xl px-4 py-2 break-words",
                          isOwn 
                            ? "bg-gradient-fire text-white rounded-tr-sm" 
                            : "bg-background border border-border rounded-tl-sm"
                        )}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 px-1">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSendMessage}
          className="bg-background border border-t-0 border-border rounded-b-lg p-4 flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            autoFocus
          />
          <Button 
            type="submit"
            disabled={!newMessage.trim()}
            className="gradient-fire hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Community;
