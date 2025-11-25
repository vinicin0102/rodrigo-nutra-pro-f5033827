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

    // Detectar extensão correta baseada no tipo MIME
    const getExtension = (mimeType: string): string => {
      if (mimeType.includes('mp4')) return 'mp4';
      if (mimeType.includes('aac')) return 'aac';
      if (mimeType.includes('ogg')) return 'ogg';
      if (mimeType.includes('webm')) return 'webm';
      if (mimeType.includes('wav')) return 'wav';
      return 'webm'; // fallback
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

  // Gera cor consistente baseada no user_id
  const getUserColor = (userId: string) => {
    const colors = [
      '#FF6B9D', // Rosa
      '#FFB84D', // Amarelo/Laranja
      '#A78BFA', // Roxo
      '#60A5FA', // Azul
      '#34D399', // Verde
      '#F87171', // Vermelho
      '#FCD34D', // Amarelo
      '#C084FC', // Roxo claro
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col md:pt-16" style={{ backgroundColor: '#0A0A0A' }}>
      <Navigation />
      
      <div className="flex-1 min-h-0 flex px-4 py-4 md:py-6 pb-32 md:pb-8">
        <div className="max-w-4xl mx-auto flex gap-4 flex-1 min-h-0 w-full">
          {/* Main Chat */}
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
            <div className="flex-1 min-h-0 rounded-lg overflow-hidden mb-4" style={{ backgroundColor: '#0A0A0A' }}>
              <ScrollArea className="h-full overscroll-contain">
              <div ref={scrollRef} className="p-4 space-y-4">
                {loading ? (
                  <div className="text-center py-8" style={{ color: '#9CA3AF' }}>
                    Carregando mensagens...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8" style={{ color: '#9CA3AF' }}>
                    Seja o primeiro a enviar uma mensagem! 👋
                  </div>
                ) : (
                  messages.map((message, idx) => {
                    const isOwn = message.user_id === user?.id;
                    const username = message.profiles?.username || 'Usuário';
                    const initials = username.split(' ').map(n => n[0]).join('').toUpperCase();
                    const userColor = getUserColor(message.user_id);
                    
                    // Mostrar avatar apenas se for diferente da mensagem anterior
                    const prevMessage = idx > 0 ? messages[idx - 1] : null;
                    const showAvatar = !prevMessage || prevMessage.user_id !== message.user_id;

                    return (
                      <div
                        key={message.id}
                        className="flex gap-3 items-start"
                      >
                        {showAvatar ? (
                          <Avatar className="w-11 h-11 flex-shrink-0 ring-2 ring-white/10">
                            <AvatarImage src={message.profiles?.avatar_url || ''} />
                            <AvatarFallback style={{ backgroundColor: userColor }} className="text-white font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-11 flex-shrink-0" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          {showAvatar && (
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-base font-bold" style={{ color: userColor }}>
                                {username}
                              </span>
                            </div>
                          )}
                          
                          <div className="rounded-xl px-4 py-3 max-w-lg" style={{ backgroundColor: '#1F1F1F' }}>
                            {message.content && (
                              <p className="text-sm text-gray-100 leading-relaxed">{message.content}</p>
                            )}
                            {message.image_url && (
                              <img 
                                src={message.image_url} 
                                alt="Mensagem"
                                className="rounded-lg mt-3 max-w-xs h-auto"
                              />
                            )}
                            {message.audio_url && (
                              <div className="mt-2">
                                <AudioPlayer 
                                  audioUrl={message.audio_url} 
                                  isOwn={false}
                                />
                              </div>
                            )}
                          </div>
                          
                          <span className="text-xs text-gray-500 mt-2 inline-block">
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
              className="flex-shrink-0 rounded-lg p-4 min-h-[120px] flex flex-col justify-end space-y-3"
              style={{ backgroundColor: '#1F1F1F' }}
            >
            {/* Preview attachments */}
...
            {/* Botões de mídia */}
            <div className="flex gap-2 mb-2">
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
            </div>
            
            {/* Input + Enviar */}
            <div className="flex gap-2 items-end">
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
                className="flex-1 h-12 text-base bg-black/50 border-gray-700 text-gray-100 placeholder:text-gray-500"
                style={{ backgroundColor: '#0A0A0A' }}
                autoFocus
              />
              
              <Button 
                type="submit"
                disabled={!newMessage.trim() && !pendingImage && !pendingAudio}
                className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="w-5 h-5" />
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
