import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Flame, ShoppingBag, Smartphone, Trophy, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Reward {
  id: string;
  name: string;
  points: number;
  category: string;
  icon: any;
  available: number;
}

const rewards: Reward[] = [
  { id: "1", name: "Vale Compras R$ 100", points: 500, category: "Voucher", icon: ShoppingBag, available: 10 },
  { id: "2", name: "Mentoria Exclusiva Rodrigo", points: 1500, category: "Premium", icon: Star, available: 3 },
  { id: "3", name: "Kit Produtos Grátis", points: 800, category: "Produto", icon: Gift, available: 8 },
  { id: "4", name: "Fone Bluetooth Premium", points: 1200, category: "Eletrônico", icon: Smartphone, available: 5 },
  { id: "5", name: "Troféu Elite do Mês", points: 2000, category: "Conquista", icon: Trophy, available: 1 },
  { id: "6", name: "Vale Compras R$ 500", points: 2500, category: "Voucher", icon: ShoppingBag, available: 4 },
];

const Rewards = () => {
  const userPoints = 1350;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <Gift className="w-16 h-16 mx-auto text-accent drop-shadow-[0_0_20px_hsl(var(--accent))]" />
          <h1 className="text-3xl md:text-4xl font-bold">Loja de Prêmios</h1>
          <p className="text-muted-foreground">
            Troque seus pontos por prêmios incríveis
          </p>
        </div>

        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-fire flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seus Pontos</p>
                  <p className="text-2xl font-bold text-gradient-fire">{userPoints}</p>
                </div>
              </div>
              <Button variant="outline" className="border-primary/50">
                Ver Histórico
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Próximo nível</span>
                <span className="font-semibold">150 pts para o próximo</span>
              </div>
              <Progress value={90} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const Icon = reward.icon;
            const canRedeem = userPoints >= reward.points;
            
            return (
              <Card key={reward.id} className="hover-lift overflow-hidden">
                <div className={`h-2 ${canRedeem ? 'gradient-fire' : 'bg-muted'}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 rounded-lg gradient-elite flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge variant={canRedeem ? "default" : "secondary"} className={canRedeem ? "gradient-fire" : ""}>
                      {reward.available} disponíveis
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 text-lg">{reward.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{reward.category}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-primary" />
                      <span className="font-bold text-lg">{reward.points} pts</span>
                    </div>
                    {!canRedeem && (
                      <span className="text-sm text-muted-foreground">
                        Faltam {reward.points - userPoints} pts
                      </span>
                    )}
                  </div>
                  <Button 
                    className={canRedeem ? "w-full gradient-fire hover:opacity-90" : "w-full"}
                    disabled={!canRedeem}
                  >
                    {canRedeem ? "Resgatar Prêmio" : "Pontos Insuficientes"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Star className="w-12 h-12 text-accent flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Como Ganhar Mais Pontos</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Compartilhe seus resultados na comunidade
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Interaja com posts de outros membros
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Alcance metas de vendas mensais
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Ajude outros membros com dicas e conselhos
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Rewards;
