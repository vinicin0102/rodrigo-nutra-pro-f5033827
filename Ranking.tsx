import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RankingUser {
  position: number;
  name: string;
  points: number;
  sales: string;
  level: string;
  progress: number;
}

const rankings: RankingUser[] = [
  { position: 1, name: "Maria Silva", points: 2450, sales: "R$ 125.000", level: "Diamante", progress: 95 },
  { position: 2, name: "João Pedro", points: 2180, sales: "R$ 98.000", level: "Platina", progress: 85 },
  { position: 3, name: "Ana Costa", points: 1950, sales: "R$ 87.500", level: "Ouro", progress: 78 },
  { position: 4, name: "Carlos Lima", points: 1720, sales: "R$ 76.000", level: "Prata", progress: 68 },
  { position: 5, name: "Beatriz Souza", points: 1580, sales: "R$ 65.000", level: "Bronze", progress: 62 },
];

const levelBadges = {
  "Diamante": "gradient-elite",
  "Platina": "bg-gradient-to-r from-slate-300 to-slate-400",
  "Ouro": "bg-gradient-to-r from-yellow-400 to-yellow-600",
  "Prata": "bg-gradient-to-r from-gray-300 to-gray-400",
  "Bronze": "bg-gradient-to-r from-amber-600 to-amber-700",
};

const Ranking = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <Trophy className="w-16 h-16 mx-auto text-accent drop-shadow-[0_0_20px_hsl(var(--accent))]" />
          <h1 className="text-3xl md:text-4xl font-bold">Ranking Elite</h1>
          <p className="text-muted-foreground">
            Top vendedores do mês - Conquiste sua placa!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {rankings.slice(0, 3).map((user, idx) => {
            const icons = [Trophy, Medal, Award];
            const Icon = icons[idx];
            const colors = ["text-accent", "text-slate-400", "text-amber-600"];
            
            return (
              <Card key={user.position} className="relative overflow-hidden hover-lift">
                <div className={`absolute top-0 left-0 right-0 h-1 ${idx === 0 ? 'gradient-elite' : idx === 1 ? 'bg-slate-400' : 'bg-amber-600'}`} />
                <CardHeader className="text-center pb-4">
                  <Icon className={`w-12 h-12 mx-auto ${colors[idx]} drop-shadow-lg`} />
                  <CardTitle className="text-lg">{user.position}º Lugar</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <Avatar className="w-20 h-20 mx-auto border-4 border-primary/20">
                    <AvatarFallback className="gradient-fire text-white text-xl">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">{user.name}</p>
                    <Badge className={levelBadges[user.level as keyof typeof levelBadges]}>
                      {user.level}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <Flame className="w-4 h-4 text-primary" />
                      <span className="font-bold">{user.points} pontos</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Faturamento: <span className="font-semibold text-foreground">{user.sales}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Ranking Completo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rankings.map((user) => (
              <div key={user.position} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  user.position <= 3 ? 'gradient-fire' : 'bg-secondary'
                } text-white font-bold text-lg`}>
                  {user.position}
                </div>
                
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-fire text-white">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.sales}</p>
                    </div>
                    <Badge className={levelBadges[user.level as keyof typeof levelBadges]}>
                      {user.level}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold">{user.points} pts</span>
                    </div>
                    <Progress value={user.progress} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Trophy className="w-12 h-12 text-accent flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Placas de Faturamento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-600" />
                    <span>Bronze: R$ 50.000+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-400" />
                    <span>Prata: R$ 75.000+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500" />
                    <span>Ouro: R$ 100.000+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-400" />
                    <span>Platina: R$ 150.000+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded gradient-elite" />
                    <span>Diamante: R$ 200.000+</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ranking;
