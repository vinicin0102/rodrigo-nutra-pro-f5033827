import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AudioRecorder } from "@/components/community/AudioRecorder";
import { MediaUpload } from "@/components/community/MediaUpload";
import { EmojiPicker } from "@/components/community/EmojiPicker";
import { TypingIndicator } from "@/components/community/TypingIndicator";
import { OnlineMembers } from "@/components/community/OnlineMembers";
import { AudioPlayer } from "@/components/community/AudioPlayer";
import { RotateCcw } from "lucide-react";

interface Message {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  audio_url: string | null;
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
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
    
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
          fetchMessageProfile(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('community_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profilesData?.map(p => [p.id, p]));

      const messagesWithProfiles = messagesData?.map(msg => ({
        ...msg,
        profiles: profileMap.get(msg.user_id) || undefined
      })) || [];

      setMessages(messagesWithProfiles);
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

  const handleTyping = () => {
    if (!user) return;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    supabase
      .from('typing_indicators')
      .upsert({
        user_id: user.id,
        channel: 'community',
        created_at: new Date().toISOString()
      })
      .then();

    const timeout = setTimeout(() => {
      supabase
        .from('typing_indicators')
        .delete()
        .eq('user_id', user.id)
        .eq('channel', 'community')
        .then();
    }, 3000);

    setTypingTimeout(timeout);
  };

  const handleAudioRecorded = async (audioBlob: Blob | null) => {
    // Limpar URL anterior se existir
    if (pendingAudioUrl) {
      URL.revokeObjectURL(pendingAudioUrl);
    }
    
    setPendingAudio(audioBlob);
    if (audioBlob) {
      setPendingAudioUrl(URL.createObjectURL(audioBlob));
    } else {
      setPendingAudioUrl(null);
    }
  };

  const handleRerecordAudio = () => {
    if (pendingAudioUrl) {
      URL.revokeObjectURL(pendingAudioUrl);
    }
    setPendingAudio(null);
    setPendingAudioUrl(null);
    // O AudioRecorder vai iniciar uma nova gravação automaticamente
  };

  const uploadAudio = async (audioBlob: Blob): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileName = `${user.id}/${Date.now()}.webm`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('community-media')
      .upload(fileName, audioBlob);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('community-media')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 handleSendMessage called');
    console.log('📊 State:', { 
      user: user?.id, 
      newMessage: newMessage.length, 
      pendingImage: !!pendingImage, 
      pendingAudio: !!pendingAudio 
    });

    if (!user) {
      console.error('❌ No user - returning early');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para enviar mensagens",
        variant: "destructive",
      });
      return;
    }

    if (!newMessage.trim() && !pendingImage && !pendingAudio) {
      console.log('⚠️ No content to send - returning early');
      return;
    }

    try {
      console.log('✅ Starting message send...');
      let audioUrl = null;
      if (pendingAudio) {
        console.log('🎵 Uploading audio...');
        audioUrl = await uploadAudio(pendingAudio);
        console.log('✅ Audio uploaded:', audioUrl);
      }

      console.log('💾 Inserting message to database...');
      const { error } = await supabase
        .from('community_messages')
        .insert({
          user_id: user.id,
          content: newMessage.trim() || '',
          image_url: pendingImage,
          audio_url: audioUrl,
        });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Message sent successfully!');
      setNewMessage("");
      setPendingImage(null);
      setPendingAudio(null);
      if (pendingAudioUrl) {
        URL.revokeObjectURL(pendingAudioUrl);
        setPendingAudioUrl(null);
      }

      // Clear typing indicator
      await supabase
        .from('typing_indicators')
        .delete()
        .eq('user_id', user.id)
        .eq('channel', 'community');

    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col md:pt-24">
      <Navigation />
      
      <div className="flex-1 min-h-0 flex px-4 py-4 md:py-6 pb-16 md:pb-6">
        <div className="max-w-6xl mx-auto flex gap-4 flex-1 min-h-0 w-full">
          {/* Sidebar - Members */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <OnlineMembers />
          </div>

          {/* Main Chat */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="text-center space-y-2 mb-4 flex-shrink-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gradient-fire">
                Comunidade Aberta
              </h1>
              <p className="text-muted-foreground text-sm">
                Grupo de conversa da comunidade
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0 bg-muted/30 rounded-t-lg border border-border overflow-hidden">
              <ScrollArea className="h-full overscroll-contain">
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
                            "rounded-2xl px-4 py-3 break-words backdrop-blur-sm transition-all hover:scale-[1.02]",
                            isOwn 
                              ? "bg-gradient-to-br from-cyan-500/90 to-blue-600/90 text-white rounded-tr-sm shadow-lg shadow-cyan-500/30 border border-white/20" 
                              : "bg-gradient-to-br from-slate-800/90 to-slate-700/90 text-white border border-slate-600/50 rounded-tl-sm shadow-lg"
                          )}>
                            {message.content && (
                              <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                            )}
                            {message.image_url && (
                              <img 
                                src={message.image_url} 
                                alt="Mensagem"
                                className="rounded-lg mt-2 max-w-full h-auto"
                              />
                            )}
                            {message.audio_url && (
                              <div className="mt-2">
                                <AudioPlayer 
                                  audioUrl={message.audio_url} 
                                  isOwn={isOwn}
                                />
                              </div>
                            )}
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
              <TypingIndicator />
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="flex-shrink-0 bg-background border border-t-0 border-border rounded-b-lg p-4"
            >
            {/* Preview attachments */}
            {(pendingImage || pendingAudio) && (
              <div className="mb-2 flex gap-2">
                {pendingImage && (
                  <div className="relative">
                    <img 
                      src={pendingImage} 
                      alt="Preview" 
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => setPendingImage(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {pendingAudio && pendingAudioUrl && (
                  <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg flex-1">
                    <div className="flex-1 min-w-0">
                      <AudioPlayer audioUrl={pendingAudioUrl} isOwn={true} />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={handleRerecordAudio}
                      title="Regravar"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => {
                        if (pendingAudioUrl) {
                          URL.revokeObjectURL(pendingAudioUrl);
                        }
                        setPendingAudio(null);
                        setPendingAudioUrl(null);
                      }}
                      title="Remover"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <MediaUpload 
                onImageSelected={setPendingImage}
                disabled={!!pendingImage}
              />
              <AudioRecorder 
                onAudioRecorded={handleAudioRecorded}
                disabled={!!pendingAudio}
              />
              <EmojiPicker 
                onEmojiSelect={(emoji) => setNewMessage(prev => prev + emoji)}
              />
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                autoFocus
              />
              <Button 
                type="submit"
                disabled={!newMessage.trim() && !pendingImage && !pendingAudio}
                className="gradient-fire hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
