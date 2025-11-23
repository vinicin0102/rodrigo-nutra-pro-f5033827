import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Users, Sparkles, TrendingUp, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4 py-8">
          <Badge className="gradient-elite text-lg px-4 py-1">
            Bem-vindo ao Elite
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="text-gradient-fire">NutraHub Elite</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comunidade exclusiva de vendedores de alto desempenho em encapsulados
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/community">
              <Button size="lg" className="gradient-fire hover:opacity-90 text-lg">
                Entrar na Comunidade
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/ai-copy">
              <Button size="lg" variant="outline" className="border-primary/50 text-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Testar IA Grátis
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="hover-lift border-2 border-primary/20">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full gradient-fire flex items-center justify-center">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl">1.250</h3>
              <p className="text-sm text-muted-foreground">Seus Pontos</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-2 border-accent/20">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full gradient-elite flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl">#12</h3>
              <p className="text-sm text-muted-foreground">Ranking Geral</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-2 border-primary/20">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="font-bold text-xl">R$ 45K</h3>
              <p className="text-sm text-muted-foreground">Vendas do Mês</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-2 border-accent/20">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl">Ouro</h3>
              <p className="text-sm text-muted-foreground">Seu Nível</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/community">
            <Card className="hover-lift h-full border-2 border-primary/30 cursor-pointer transition-all hover:border-primary/60">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg gradient-fire flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Comunidade Elite</h3>
                    <p className="text-sm text-muted-foreground">Compartilhe resultados e inspire</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Conecte-se com outros vendedores de alto desempenho, compartilhe suas conquistas e aprenda estratégias vencedoras.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-primary" />
                  <span className="font-semibold">+50 pontos por post com resultado</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/ranking">
            <Card className="hover-lift h-full border-2 border-accent/30 cursor-pointer transition-all hover:border-accent/60">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg gradient-elite flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Ranking & Prêmios</h3>
                    <p className="text-sm text-muted-foreground">Conquiste placas exclusivas</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Suba no ranking mensal e conquiste placas de faturamento. Troque pontos por prêmios incríveis e mentorias exclusivas.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="font-semibold">Próxima placa: Platina (R$ 100K)</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/ai-copy">
            <Card className="hover-lift h-full border-2 border-primary/30 cursor-pointer transition-all hover:border-primary/60">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">IA de Copy</h3>
                    <p className="text-sm text-muted-foreground">Anúncios persuasivos em segundos</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Crie títulos matadores, descrições completas e copies que convertem usando inteligência artificial avançada.
                </p>
                <Badge variant="secondary">Powered by AI</Badge>
              </CardContent>
            </Card>
          </Link>

          <Link to="/ai-creative">
            <Card className="hover-lift h-full border-2 border-accent/30 cursor-pointer transition-all hover:border-accent/60">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-yellow-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">IA de Criativo</h3>
                    <p className="text-sm text-muted-foreground">Roteiros completos de vídeo</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Gere ganchos, retenção, valor e CTAs profissionais para seus vídeos de vendas em minutos.
                </p>
                <Badge variant="secondary">Powered by AI</Badge>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Comece Agora Sua Jornada Elite</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Junte-se a centenas de vendedores que já estão transformando suas vendas com nossas ferramentas de IA e comunidade exclusiva.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link to="/community">
                  <Button size="lg" className="gradient-fire hover:opacity-90">
                    <Users className="w-5 h-5 mr-2" />
                    Entrar na Comunidade
                  </Button>
                </Link>
                <Link to="/support">
                  <Button size="lg" variant="outline" className="border-primary/50">
                    Falar com Suporte
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
