import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, HelpCircle, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support";
  timestamp: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Olá! Bem-vindo ao suporte do NutraHub Elite. Como posso ajudar você hoje?",
    sender: "support",
    timestamp: "10:30"
  }
];

const quickQuestions = [
  "Como ganhar mais pontos?",
  "Como resgatar prêmios?",
  "Como subir no ranking?",
  "Como usar as IAs?",
];

const Support = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");

    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Obrigado pela sua mensagem! Nossa equipe irá responder em breve. Tempo médio de resposta: 5 minutos.",
        sender: "support",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, supportMessage]);
    }, 1000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <MessageCircle className="w-16 h-16 mx-auto text-primary drop-shadow-[0_0_20px_hsl(var(--primary))]" />
          <h1 className="text-3xl md:text-4xl font-bold">Suporte Elite</h1>
          <p className="text-muted-foreground">
            Estamos aqui para ajudar você a ter sucesso
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="hover-lift">
            <CardContent className="pt-6 text-center space-y-2">
              <Zap className="w-8 h-8 mx-auto text-accent" />
              <p className="font-semibold">Resposta Rápida</p>
              <p className="text-sm text-muted-foreground">Média de 5 minutos</p>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="pt-6 text-center space-y-2">
              <MessageCircle className="w-8 h-8 mx-auto text-primary" />
              <p className="font-semibold">Chat ao Vivo</p>
              <p className="text-sm text-muted-foreground">24/7 disponível</p>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="pt-6 text-center space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-accent" />
              <p className="font-semibold">Base de Conhecimento</p>
              <p className="text-sm text-muted-foreground">100+ artigos</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-primary/20 h-[500px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              Chat de Suporte - Online
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={message.sender === "support" ? "gradient-fire text-white" : "bg-secondary"}>
                      {message.sender === "support" ? "S" : "V"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[70%] ${
                    message.sender === "user" ? "items-end" : ""
                  }`}>
                    <div className={`rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} className="gradient-fire">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-semibold">Como funciona o sistema de pontos?</p>
              <p className="text-sm text-muted-foreground">
                Você ganha pontos ao compartilhar resultados, interagir com a comunidade e atingir metas de vendas.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Posso trocar pontos por dinheiro?</p>
              <p className="text-sm text-muted-foreground">
                Os pontos podem ser trocados por prêmios na nossa loja, incluindo vouchers, produtos e mentorias exclusivas.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Como usar as IAs de Copy e Criativo?</p>
              <p className="text-sm text-muted-foreground">
                Acesse as abas específicas, preencha as informações do produto e gere conteúdo otimizado instantaneamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;
