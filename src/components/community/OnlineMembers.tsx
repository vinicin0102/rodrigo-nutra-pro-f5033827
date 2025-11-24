import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

interface Member {
  id: string;
  username: string;
  avatar_url: string | null;
}

export const OnlineMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .order('username');

    if (data) {
      setMembers(data);
    }
  };

  return (
    <div className="bg-muted/30 rounded-lg border border-border p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">
          Membros da Comunidade ({members.length})
        </h3>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {members.map((member) => {
            const initials = member.username
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase();

            return (
              <div key={member.id} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar_url || ''} />
                  <AvatarFallback className="text-xs bg-muted">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.username}
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
