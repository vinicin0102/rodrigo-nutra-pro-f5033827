import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AICreative = () => {
  const [product, setProduct] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState({
    hook: "",
    retention: "",
    value: "",
    cta: ""
  });
  const { toast } = useToast();

  const generateCreative = () => {
    setGenerating(true);
    
    setTimeout(() => {
      setResult({
        hook: `🚨 PARE DE SCROLLAR! Você está a 1 minuto de descobrir o segredo que mudou a vida de 50.000 pessoas...`,
        retention: `Sabe aquele momento que você olha no espelho e pensa "preciso mudar"? Pois é, eu também já passei por isso.

Testei TUDO que você pode imaginar, gastei fortunas em produtos que não funcionaram... até descobrir ${product}.

E não, não é mais uma promessa milagrosa. É diferente. MUITO diferente.`,
        value: `Vou te contar 3 motivos pelos quais ${product} funciona quando tudo mais falhou:

1️⃣ Fórmula desenvolvida por especialistas com 20 anos de experiência
2️⃣ Ingredientes 100% naturais e cientificamente comprovados
3️⃣ Mais de 50.000 clientes satisfeitos com resultados em 30 dias

Não é mágica. É ciência aplicada para dar resultado REAL na sua vida.`,
        cta: `⏰ ATENÇÃO: Temos apenas 47 unidades restantes com 40% OFF

Clica no link AGORA e garanta o seu antes que acabe! 👇

[SEU LINK AQUI]

P.S: Oferta válida só até hoje às 23:59. Não perca essa chance!`
      });
      setGenerating(false);
      toast({
        title: "Criativo gerado com sucesso! 🎉",
        description: "Seu roteiro está pronto para uso.",
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado! ✓",
      description: "Texto copiado para a área de transferência.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <Lightbulb className="w-16 h-16 mx-auto text-accent drop-shadow-[0_0_20px_hsl(var(--accent))]" />
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-fire">
            IA de Criativo
          </h1>
          <p className="text-muted-foreground">
            Roteiros completos para vídeos e anúncios que convertem
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Informações do Criativo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Produto/Serviço</Label>
              <Input
                id="product"
                placeholder="Ex: Suplemento Termogênico Elite"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>

            <Button 
              onClick={generateCreative}
              disabled={!product || generating}
              className="w-full gradient-fire hover:opacity-90"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Roteiro...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Gerar Roteiro Completo
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result.hook && (
          <div className="space-y-4">
            <Card className="hover-lift border-2 border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">1. Gancho Inicial</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Primeiros 3 segundos - prenda a atenção!</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(result.hook)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{result.hook}</p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">2. Retenção do Lead</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Mantenha o espectador assistindo</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(result.retention)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={result.retention}
                  readOnly
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-accent/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">3. Geração de Valor</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Mostre por que vale a pena</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(result.value)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={result.value}
                  readOnly
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">4. Chamada para Ação</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Finalize com urgência e clareza</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(result.cta)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={result.cta}
                  readOnly
                  className="min-h-[130px]"
                />
              </CardContent>
            </Card>

            <Button 
              variant="outline" 
              className="w-full border-primary/50"
              onClick={generateCreative}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar Nova Versão
            </Button>
          </div>
        )}

        <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                Estrutura de Vídeo que Converte
              </h3>
              <div className="space-y-3 text-sm ml-7">
                <div>
                  <p className="font-semibold text-foreground">0-3s: Gancho</p>
                  <p className="text-muted-foreground">Pare o scroll imediatamente</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">3-15s: Retenção</p>
                  <p className="text-muted-foreground">Crie conexão emocional</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">15-45s: Valor</p>
                  <p className="text-muted-foreground">Mostre benefícios concretos</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">45-60s: CTA</p>
                  <p className="text-muted-foreground">Urgência e ação clara</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AICreative;
