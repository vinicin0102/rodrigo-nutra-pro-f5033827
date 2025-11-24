import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AudioRecorder } from "@/components/community/AudioRecorder";
import { MediaUpload } from "@/components/community/MediaUpload";
import { EmojiPicker } from "@/components/community/EmojiPicker";
import { TypingIndicator } from "@/components/community/TypingIndicator";
import { OnlineMembers } from "@/components/community/OnlineMembers";

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
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    // Debug: verificar mensagens
    console.log('Mensagens carregadas:', messages.length, messages);
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

  const handleAudioRecorded = async (audioBlob: Blob) => {
    setPendingAudio(audioBlob);
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
    if ((!newMessage.trim() && !pendingImage && !pendingAudio) || !user) return;

    try {
      let audioUrl = null;
      if (pendingAudio) {
        audioUrl = await uploadAudio(pendingAudio);
      }

      const { error } = await supabase
        .from('community_messages')
        .insert({
          user_id: user.id,
          content: newMessage.trim() || '',
          image_url: pendingImage,
          audio_url: audioUrl,
        });

      if (error) throw error;

      setNewMessage("");
      setPendingImage(null);
      setPendingAudio(null);

      // Clear typing indicator
      await supabase
        .from('typing_indicators')
        .delete()
        .eq('user_id', user.id)
        .eq('channel', 'community');

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handlePlayAudio = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setPlayingAudio(audioUrl);
      audioRef.current.onended = () => setPlayingAudio(null);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col fixed inset-0 md:relative md:pb-8 md:pt-24 overflow-hidden">
      <Navigation />
      
      {/* Mobile Header */}
      <div className="md:hidden pt-safe-top md:pt-2 pb-2 px-3 border-b border-border bg-background flex-shrink-0">
        <h1 className="text-lg font-bold text-gradient-fire">
          Comunidade
        </h1>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Grupo de conversa
        </p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block max-w-6xl mx-auto w-full px-4 pt-6">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-fire">
            Comunidade Aberta
          </h1>
          <p className="text-muted-foreground text-sm">
            Grupo de conversa da comunidade
          </p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-0 md:px-4 flex gap-4 h-full w-full flex-1 min-h-0 md:pb-6">
        {/* Sidebar - Members */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <OnlineMembers />
        </div>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col min-w-0 w-full h-full">
          {/* Messages Area */}
          <div className="flex-1 bg-muted/30 md:rounded-t-lg border-t md:border border-border overflow-hidden flex flex-col min-h-0" style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex-1 overflow-y-auto overscroll-contain" ref={scrollRef} style={{ scrollBehavior: 'smooth', position: 'relative', zIndex: 2, WebkitOverflowScrolling: 'touch' }}>
              <div className="px-2 py-2 md:px-4 md:py-4 space-y-1.5 md:space-y-4" style={{ position: 'relative', zIndex: 3, paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
                {loading ? (
                  <div className="text-center text-muted-foreground py-8 text-sm md:text-base">
                    Carregando mensagens...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-sm md:text-base">
                    Seja o primeiro a enviar uma mensagem! 👋
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwn = message.user_id === user?.id;
                    const username = message.profiles?.username || 'Usuário';
                    const initials = username.split(' ').map(n => n[0]).join('').toUpperCase();
                    const avatarUrl = message.profiles?.avatar_url;
                    
                    return (
                      <div
                        key={message.id}
                        className="flex gap-2 md:gap-2 items-start"
                        style={{
                          flexDirection: isOwn ? 'row-reverse' : 'row',
                          marginBottom: '2px',
                          opacity: 1,
                          visibility: 'visible'
                        }}
                      >
                        <Avatar 
                          className={cn(
                            "flex-shrink-0 w-8 h-8 md:w-9 md:h-9",
                            "border-2",
                            isOwn ? "border-primary/30" : "border-gray-300"
                          )}
                        >
                          <AvatarImage 
                            src={avatarUrl || undefined} 
                            alt={username}
                            className="object-cover"
                          />
                          <AvatarFallback
                            className={cn(
                              "text-[11px] md:text-[13px] font-bold w-full h-full",
                              isOwn ? "bg-gradient-fire text-white" : "bg-gray-200 text-gray-700"
                            )}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div
                          className={cn(
                            "flex flex-col gap-0.5",
                            "max-w-[75%] md:max-w-[70%]",
                            isOwn ? "items-end" : "items-start"
                          )}
                        >
                          <span
                            className={cn(
                              "text-[11px] md:text-[13px] font-semibold px-1",
                              isOwn ? "text-primary" : "text-gray-500"
                            )}
                          >
                            {isOwn ? 'Você' : username}
                          </span>
                          <div
                            className={cn(
                              "rounded-2xl px-2.5 py-1.5 md:px-3 md:py-2",
                              "break-words max-w-full",
                              isOwn 
                                ? "bg-gradient-fire shadow-sm" 
                                : "bg-white border border-gray-200 shadow-sm"
                            )}
                          >
                            {message.content && (
                              <p
                                className={cn(
                                  "text-sm leading-relaxed whitespace-pre-wrap",
                                  "break-words overflow-wrap-break-word",
                                  isOwn ? "text-white" : "text-black",
                                  "m-0 font-normal block opacity-100"
                                )}
                              >
                                {message.content}
                              </p>
                            )}
                            {message.image_url && (
                              <img 
                                src={message.image_url} 
                                alt="Mensagem"
                                style={{
                                  borderRadius: '8px',
                                  marginTop: message.content ? '8px' : '0',
                                  maxWidth: '100%',
                                  height: 'auto'
                                }}
                              />
                            )}
                            {message.audio_url && (
                              <button
                                onClick={() => handlePlayAudio(message.audio_url!)}
                                style={{
                                  marginTop: (message.content || message.image_url) ? '8px' : '0',
                                  padding: '4px 8px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: isOwn ? '#ffffff' : '#000000',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                {playingAudio === message.audio_url ? (
                                  <Pause style={{ width: '16px', height: '16px' }} />
                                ) : (
                                  <Play style={{ width: '16px', height: '16px' }} />
                                )}
                                <span>Áudio</span>
                              </button>
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-[10px] md:text-[11px] text-gray-400 px-1"
                            )}
                          >
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <TypingIndicator />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSendMessage}
            className="bg-background border-t md:border md:border-t-0 border-border md:rounded-b-lg p-2 md:p-4 flex-shrink-0"
            style={{ 
              paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
              paddingTop: '8px'
            }}
          >
            {/* Preview attachments */}
            {(pendingImage || pendingAudio) && (
              <div className="mb-2 flex gap-2 flex-wrap">
                {pendingImage && (
                  <div className="relative">
                    <img 
                      src={pendingImage} 
                      alt="Preview" 
                      className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 md:h-6 md:w-6"
                      onClick={() => setPendingImage(null)}
                    >
                      <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    </Button>
                  </div>
                )}
                {pendingAudio && (
                  <div className="flex items-center gap-2 bg-muted px-2 py-1.5 md:px-3 md:py-2 rounded-lg">
                    <Play className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm">Áudio gravado</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 md:h-6 md:w-6"
                      onClick={() => setPendingAudio(null)}
                    >
                      <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-1.5 md:gap-2 items-center">
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
                placeholder="Digite sua mensagem..."
                className="flex-1 text-sm md:text-base h-9 md:h-10"
                autoFocus={false}
              />
              <Button 
                type="submit"
                disabled={!newMessage.trim() && !pendingImage && !pendingAudio}
                className="gradient-fire hover:opacity-90 h-9 w-9 md:h-10 md:w-10 p-0"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Community;
