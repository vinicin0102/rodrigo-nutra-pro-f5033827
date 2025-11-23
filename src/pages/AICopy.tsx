import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AICopy = () => {
  const [product, setProduct] = useState("");
  const [target, setTarget] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState({
    title: "",
    subtitle: "",
    description: ""
  });
  const { toast } = useToast();

  const generateCopy = () => {
    setGenerating(true);
    
    setTimeout(() => {
      setResult({
        title: `${product}: Transforme Sua Vida em 30 Dias! 🔥`,
        subtitle: `Descubra como ${target} estão alcançando resultados incríveis com ${product}`,
        description: `Você está cansado de promessas vazias? 

Apresentamos ${product} - a solução definitiva que ${target} estão usando para transformar suas vidas!

✅ Resultados comprovados em 30 dias
✅ Fórmula 100% natural e segura
✅ Aprovado por milhares de clientes satisfeitos
✅ Garantia de 7 dias - risco zero!

Não perca esta oportunidade ÚNICA de fazer parte do grupo seleto que já está vivendo a transformação.

🎁 BÔNUS EXCLUSIVO: Compre hoje e ganhe acesso ao grupo VIP com dicas diárias!

⏰ ATENÇÃO: Oferta válida por tempo limitado!`
      });
      setGenerating(false);
      toast({
        title: "Copy gerada com sucesso! 🎉",
        description: "Sua copy está pronta para uso.",
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
          <Sparkles className="w-16 h-16 mx-auto text-primary drop-shadow-[0_0_20px_hsl(var(--primary))]" />
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-fire">
            IA de Copy
          </h1>
          <p className="text-muted-foreground">
            Crie anúncios persuasivos em segundos com inteligência artificial
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Nome do Produto</Label>
              <Input
                id="product"
                placeholder="Ex: Detox Premium Plus"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target">Público-Alvo</Label>
              <Input
                id="target"
                placeholder="Ex: Mulheres de 25-45 anos que querem emagrecer"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>

            <Button 
              onClick={generateCopy}
              disabled={!product || !target || generating}
              className="w-full gradient-fire hover:opacity-90"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Copy...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Copy Completa
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result.title && (
          <div className="space-y-4">
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Título Principal</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(result.title)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gradient-fire">{result.title}</p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Subtítulo</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(result.subtitle)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.subtitle}</p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Descrição Completa</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(result.description)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={result.description}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Button 
              variant="outline" 
              className="w-full border-primary/50"
              onClick={generateCopy}
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
                <Sparkles className="w-5 h-5 text-accent" />
                Dicas para uma Copy Matadora
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                <li>• Use números e dados específicos</li>
                <li>• Foque nos benefícios, não nas características</li>
                <li>• Crie senso de urgência e escassez</li>
                <li>• Adicione prova social (depoimentos)</li>
                <li>• Termine com uma chamada para ação clara</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AICopy;
