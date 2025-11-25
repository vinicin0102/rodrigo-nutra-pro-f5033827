import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Gem, Calendar, Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiamondAnimation } from "@/components/DiamondAnimation";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  target_value: number;
  reward_points: number;
  icon: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  current_value: number;
  completed: boolean;
  completed_at: string | null;
}

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserChallenge>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showDiamondAnimation, setShowDiamondAnimation] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    if (user) {
      fetchChallenges();
      subscribeToUpdates();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      // Fetch active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from("challenges" as any)
        .select("*")
        .eq("active", true)
        .order("type", { ascending: true });

      if (challengesError) throw challengesError;

      const typedChallenges = (challengesData || []) as unknown as Challenge[];
      setChallenges(typedChallenges);

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_challenges" as any)
        .select("*")
        .eq("user_id", user?.id);

      if (progressError) throw progressError;

      const typedProgress = (progressData || []) as unknown as UserChallenge[];
      const progressMap = new Map(
        typedProgress.map(p => [p.challenge_id, p])
      );
      setUserProgress(progressMap);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel("challenge-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_challenges",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          const updated = payload.new as unknown as UserChallenge;
          
          // Check if challenge was just completed
          if (updated.completed && !userProgress.get(updated.challenge_id)?.completed) {
            // Find the challenge to get reward points
            const challenge = challenges.find(c => c.id === updated.challenge_id);
            if (challenge) {
              setEarnedPoints(challenge.reward_points);
              setShowDiamondAnimation(true);
            }
          }
          
          fetchChallenges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getProgress = (challengeId: string) => {
    return userProgress.get(challengeId);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Expirado";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d restantes`;
    if (hours > 0) return `${hours}h restantes`;
    return "Menos de 1h";
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const progress = getProgress(challenge.id);
    const currentValue = progress?.current_value || 0;
    const progressPercent = calculateProgress(currentValue, challenge.target_value);
    const isCompleted = progress?.completed || false;

    return (
      <Card
        key={challenge.id}
        className={cn(
          "hover-lift transition-all",
          isCompleted && "border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent"
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0",
              isCompleted 
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30" 
                : "bg-gradient-to-br from-slate-700 to-slate-800"
            )}>
              {isCompleted ? "✅" : challenge.icon || "🎯"}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-lg">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {challenge.description}
                  </p>
                </div>
                {isCompleted && (
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Progresso: {currentValue}/{challenge.target_value}
                  </span>
                  <span className="font-semibold">
                    {progressPercent.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={progressPercent} 
                  className={cn(
                    "h-3",
                    isCompleted && "bg-gradient-to-r from-cyan-500 to-blue-600"
                  )}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Gem className="w-4 h-4 text-cyan-500" />
                    <span className="font-semibold text-gradient-fire">
                      {challenge.reward_points} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {getTimeRemaining(challenge.end_date)}
                  </div>
                </div>
                
                <Badge variant={challenge.type === "weekly" ? "default" : "secondary"}>
                  {challenge.type === "weekly" ? "Semanal" : "Mensal"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const weeklyChallenges = challenges.filter(c => c.type === "weekly");
  const monthlyChallenges = challenges.filter(c => c.type === "monthly");
  const completedChallenges = challenges.filter(c => getProgress(c.id)?.completed);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
      <Navigation />

      {showDiamondAnimation && (
        <DiamondAnimation 
          points={earnedPoints} 
          onComplete={() => setShowDiamondAnimation(false)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-fire">
              Desafios & Missões
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete desafios e ganhe pontos de diamante! Quanto mais você participa, mais recompensas conquista.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{challenges.length}</p>
                  <p className="text-sm text-muted-foreground">Desafios Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-cyan-500" />
                <div>
                  <p className="text-2xl font-bold">{completedChallenges.length}</p>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Gem className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {completedChallenges.reduce((sum, c) => sum + c.reward_points, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Pontos Ganhos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges */}
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">
              Desafios Semanais
              <Badge variant="secondary" className="ml-2">
                {weeklyChallenges.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="monthly">
              Desafios Mensais
              <Badge variant="secondary" className="ml-2">
                {monthlyChallenges.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4 mt-6">
            {loading ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Carregando desafios...</p>
                </CardContent>
              </Card>
            ) : weeklyChallenges.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    Nenhum desafio semanal ativo no momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              weeklyChallenges.map(renderChallengeCard)
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4 mt-6">
            {loading ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Carregando desafios...</p>
                </CardContent>
              </Card>
            ) : monthlyChallenges.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    Nenhum desafio mensal ativo no momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              monthlyChallenges.map(renderChallengeCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Challenges;
