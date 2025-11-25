import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, ArrowRight, Gem } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  target_value: number;
  reward_points: number;
  icon: string | null;
}

interface UserChallenge {
  challenge_id: string;
  current_value: number;
  completed: boolean;
}

export const ChallengesWidget = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserChallenge>>(new Map());

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const { data: challengesData } = await supabase
        .from("challenges" as any)
        .select("id, title, target_value, reward_points, icon")
        .eq("active", true)
        .eq("type", "weekly")
        .limit(3);

      const { data: progressData } = await supabase
        .from("user_challenges" as any)
        .select("challenge_id, current_value, completed")
        .eq("user_id", user?.id);

      if (challengesData) {
        setChallenges(challengesData as unknown as Challenge[]);
      }

      if (progressData) {
        const progressMap = new Map(
          (progressData as unknown as UserChallenge[]).map(p => [p.challenge_id, p])
        );
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  if (challenges.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Desafios da Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => {
          const progress = userProgress.get(challenge.id);
          const current = progress?.current_value || 0;
          const percent = Math.min((current / challenge.target_value) * 100, 100);
          const isCompleted = progress?.completed || false;

          return (
            <div
              key={challenge.id}
              className={cn(
                "space-y-2 p-3 rounded-lg border transition-all",
                isCompleted 
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-cyan-500/30" 
                  : "bg-muted/30 border-border/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{challenge.icon || "🎯"}</span>
                  <span className="font-medium text-sm">{challenge.title}</span>
                </div>
                {isCompleted && <span className="text-xs font-semibold text-cyan-500">✓ Completo</span>}
              </div>
              
              <div className="space-y-1">
                <Progress value={percent} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {current}/{challenge.target_value}
                  </span>
                  <div className="flex items-center gap-1">
                    <Gem className="w-3 h-3 text-cyan-500" />
                    <span className="font-semibold text-gradient-fire">
                      {challenge.reward_points}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <Link to="/challenges">
          <Button variant="outline" className="w-full group">
            Ver Todos os Desafios
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
