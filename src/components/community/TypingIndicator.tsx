import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingUser {
  username: string;
}

export const TypingIndicator = () => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    const fetchTypingUsers = async () => {
      const { data } = await supabase
        .from('typing_indicators')
        .select(`
          user_id,
          profiles!user_id (
            username
          )
        `)
        .gte('created_at', new Date(Date.now() - 3000).toISOString());

      if (data) {
        const users = data
          .map(t => ({
            username: (t.profiles as any)?.username || 'Usuário'
          }))
          .filter(u => u.username);
        setTypingUsers(users);
      }
    };

    fetchTypingUsers();

    const channel = supabase
      .channel('typing-indicators')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators'
        },
        () => {
          fetchTypingUsers();
        }
      )
      .subscribe();

    const interval = setInterval(fetchTypingUsers, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  if (typingUsers.length === 0) return null;

  const displayText = typingUsers.length === 1
    ? `${typingUsers[0].username} está digitando...`
    : `${typingUsers.length} pessoas estão digitando...`;

  return (
    <div className="px-4 py-2 text-xs text-muted-foreground italic">
      {displayText}
    </div>
  );
};
