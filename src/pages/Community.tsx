import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Play, Loader2 } from "lucide-react";
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
  const [isSending, setIsSending] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [loading]);

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
  };

  const uploadAudio = async (audioBlob: Blob): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const getExtension = (mimeType: string): string => {
      if (mimeType.includes('mp4')) return 'mp4';
      if (mimeType.includes('aac')) return 'aac';
      if (mimeType.includes('ogg')) return 'ogg';
      if (mimeType.includes('webm')) return 'webm';
      if (mimeType.includes('wav')) return 'wav';
      return 'webm';
    };

    const extension = getExtension(audioBlob.type);
    const fileName = `${user.id}/${Date.now()}.${extension}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('community-media')
      .upload(fileName, audioBlob, {
        contentType: audioBlob.type
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('community-media')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSending) return;

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para enviar mensagens",
        variant: "destructive",
      });
      return;
    }

    if (!newMessage.trim() && !pendingImage && !pendingAudio) {
      return;
    }

    setIsSending(true);

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
      if (pendingAudioUrl) {
        URL.revokeObjectURL(pendingAudioUrl);
        setPendingAudioUrl(null);
      }

      await supabase
        .from('typing_indicators')
        .delete()
        .eq('user_id', user.id)
        .eq('channel', 'community');

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getUserColor = (userId: string) => {
    const colors = [
      '#FF6B9D', '#FFB84D', '#A78BFA', '#60A5FA', 
      '#34D399', '#F87171', '#FCD34D', '#C084FC',
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col md:pt-16 bg-white">
      <Navigation />
      
      <div className="flex-1 min-h-0 flex px-4 py-4 md:py-6 pb-32 md:pb-8">
        <div className="max-w-4xl mx-auto flex gap-4 flex-1 min-h-0 w-full">
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="text-center space-y-2 mb-6 flex-shrink-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gradient-fire">
                Comunidade Aberta
              </h1>
              <p className="text-muted-foreground text-sm">
                Grupo de conversa da comunidade
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0 rounded-lg overflow-hidden mb-4" style={{ backgroundColor: '#FAFAFA' }}>
              <ScrollArea className="h-full overscroll-contain">
                <div ref={scrollRef} className="p-4 space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-orange-500">
                      Carregando mensagens...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Seja o primeiro a enviar uma mensagem! 👋
                    </div>
                  ) : (
                    messages.map((message, idx) => {
                      const isOwn = message.user_id === user?.id;
                      const username = message.profiles?.username || 'Usuário';
                      const initials = username.split(' ').map(n => n[0]).join('').toUpperCase();
                      const userColor = getUserColor(message.user_id);
                      
                      const prevMessage = idx > 0 ? messages[idx - 1] : null;
                      const showAvatar = !prevMessage || prevMessage.user_id !== message.user_id;

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-2 items-end mb-1",
                            isOwn ? "justify-end" : "justify-start"
                          )}
                        >
                          {/* Avatar apenas para mensagens de outros */}
                          {!isOwn && (
                            showAvatar ? (
                              <Avatar className="w-6 h-6 flex-shrink-0 ring-2 ring-white/10">
                                <AvatarImage src={message.profiles?.avatar_url || ''} />
                                <AvatarFallback style={{ backgroundColor: userColor }} className="text-white font-semibold text-xs">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-6 flex-shrink-0" />
                            )
                          )}
                          
                          <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                            {/* Nome apenas para mensagens de outros */}
                            {!isOwn && showAvatar && (
                              <span className="text-[10px] font-semibold mb-0.5 px-1 text-amber-600">
                                {username}
                              </span>
                            )}
                            
                            {/* Balão da mensagem */}
                            <div 
                              className={cn(
                                "rounded-lg px-2.5 py-1.5 max-w-[70%] md:max-w-sm relative pb-4",
                                isOwn ? "rounded-br-none" : "rounded-bl-none"
                              )}
                              style={{ 
                                background: isOwn 
                                  ? 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)'
                                  : '#F9FAFB'
                              }}
                            >
                              {message.content && (
                                <p className={cn("text-xs leading-relaxed break-words", isOwn ? "text-white" : "text-gray-700")}>
                                  {message.content}
                                </p>
                              )}
                              {message.image_url && (
                                <img 
                                  src={message.image_url} 
                                  alt="Mensagem"
                                  className="rounded-lg mt-2 max-w-[200px] h-auto"
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
                              
                              {/* Timestamp dentro do balão */}
                              <span className={cn("text-[9px] absolute bottom-1 right-2 flex items-center gap-1", isOwn ? "text-orange-100" : "text-gray-500")}>
                                {formatTime(message.created_at)}
                                {isOwn && <span className="text-white/90">✓✓</span>}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
              <TypingIndicator />
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="flex-shrink-0 rounded-lg p-3 space-y-2 bg-slate-50 border border-slate-200"
            >
              {/* Preview attachments */}
              {(pendingImage || pendingAudioUrl) && (
                <div className="flex gap-2 flex-wrap">
                  {pendingImage && (
                    <div className="relative">
                      <img src={pendingImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => setPendingImage(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {pendingAudioUrl && (
                    <div className="relative bg-purple-600/20 rounded-lg p-3 flex items-center gap-2">
                      <audio src={pendingAudioUrl} controls className="h-8" />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded-full hover:bg-purple-600/30"
                        onClick={handleRerecordAudio}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded-full hover:bg-red-600/30"
                        onClick={() => {
                          if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
                          setPendingAudio(null);
                          setPendingAudioUrl(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Botões de mídia + Input + Enviar (tudo inline) */}
              <div className="flex gap-2 items-center">
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
                  className="flex-1 h-10 text-sm bg-white border-gray-300 text-gray-800 placeholder:text-gray-400"
                  autoFocus
                />
                
                <Button 
                  type="submit"
                  disabled={isSending || (!newMessage.trim() && !pendingImage && !pendingAudio)}
                  className="h-10 w-10 flex-shrink-0 rounded-full bg-orange-500 hover:bg-orange-600"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
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