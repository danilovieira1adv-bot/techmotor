import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Zap, Users, BarChart, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function LandingPage() {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Gestão Completa",
      description: "Controle de clientes, veículos, ordens de serviço e peças em um só lugar."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Automação Inteligente",
      description: "QR codes, relatórios automáticos e integração com WhatsApp."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-tenancy",
      description: "Cada retífica tem seu espaço isolado com dados separados."
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      description: "Dashboard com métricas em tempo real e relatórios detalhados."
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Suporte Integrado",
      description: "Chat interno e notificações automáticas para melhor comunicação."
    }
  ];

  const plans = [
    {
      name: "Básico",
      price: "R$ 97",
      period: "/mês",
      features: [
        "Até 50 ordens/mês",
        "Gestão de clientes",
        "QR code básico",
        "Suporte por email",
        "1 usuário"
      ]
    },
    {
      name: "Profissional",
      price: "R$ 197",
      period: "/mês",
      popular: true,
      features: [
        "Ordens ilimitadas",
        "Multi-tenancy completo",
        "QR code avançado",
        "Integração WhatsApp",
        "Até 5 usuários",
        "Dashboard avançado",
        "Suporte prioritário"
      ]
    },
    {
      name: "Enterprise",
      price: "R$ 497",
      period: "/mês",
      features: [
        "Tudo do Profissional",
        "Usuários ilimitados",
        "API personalizada",
        "On-premise opcional",
        "Treinamento dedicado",
        "Suporte 24/7"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transforme sua <span className="text-blue-600">Retífica</span> com Gestão Inteligente
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            O RetíficaPro automatiza processos, organiza dados e aumenta a produtividade da sua oficina de usinagem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/register">Começar Gratuitamente</Link>
            </Button>
            <Button size="lg" variant="outline">
              <Link href="#features">Ver Funcionalidades</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Por que escolher o RetíficaPro?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-blue-200 transition-all">
              <CardHeader>
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Planos que cabem no seu negócio</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho da sua retífica. Todos incluem 14 dias grátis.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                    <Link href="/register">Escolher Plano</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-3xl">Pronto para revolucionar sua retífica?</CardTitle>
            <CardDescription className="text-lg">
              Junte-se a dezenas de retíficas que já automatizaram seus processos com o RetíficaPro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/register">Começar Agora - 14 Dias Grátis</Link>
              </Button>
              <Button size="lg" variant="outline">
                <Link href="/login">Já tem conta? Entrar</Link>
              </Button>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              Sem compromisso. Cancele quando quiser.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold">RetíficaPro</h3>
              <p className="text-gray-400">Gestão inteligente para retíficas</p>
            </div>
            <div className="text-gray-400 text-sm">
              <p>© 2026 RetíficaPro. Todos os direitos reservados.</p>
              <p className="mt-2">
                <Link href="/privacy" className="hover:text-white mr-4">Privacidade</Link>
                <Link href="/terms" className="hover:text-white">Termos</Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}