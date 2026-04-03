import { Router } from 'express';
import tenantsRouter from './tenants-api';
import { authenticateToken, checkSubscription, getTenantContext } from './auth-middleware';

// Rotas públicas (sem autenticação)
export const publicRoutes = Router();
publicRoutes.use('/api/tenants', tenantsRouter);

// Rotas protegidas (com autenticação e subscription)
export const protectedRoutes = Router();

// Exemplo de rota protegida com subscription
protectedRoutes.get('/api/vehicles', checkSubscription, async (req, res) => {
  try {
    const tenantId = (req as any).tenantId;
    // Implementar lógica para buscar veículos do tenant
    res.json({ 
      message: 'Veículos do tenant',
      tenantId,
      vehicles: [] 
    });
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar status da assinatura
protectedRoutes.get('/api/subscription/status', async (req, res) => {
  try {
    const user = (req as any).user;
    const subscription = (req as any).subscription;
    
    res.json({
      hasActiveSubscription: !!subscription,
      subscription: subscription || null,
      tenantId: user?.tenantId,
      message: subscription ? 'Assinatura ativa' : 'Assinatura necessária'
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Landing page routes (TAREFA 3)
export const landingRoutes = Router();

landingRoutes.get('/api/landing/info', (req, res) => {
  res.json({
    title: 'RetíficaPro - Sistema de Gestão para Retíficas',
    description: 'Gerencie sua retífica com eficiência. Controle de veículos, clientes, financeiro e muito mais.',
    features: [
      'Controle completo de veículos',
      'Gestão de clientes e histórico',
      'Financeiro integrado',
      'Relatórios detalhados',
      'Multi-usuários com diferentes níveis de acesso',
      'Acesso via qualquer dispositivo'
    ],
    plans: [
      {
        name: 'Básico',
        price: 97,
        period: 'mês',
        features: ['Até 50 veículos/mês', '1 usuário', 'Relatórios básicos', 'Suporte por email'],
        popular: false
      },
      {
        name: 'Profissional',
        price: 197,
        period: 'mês',
        features: ['Veículos ilimitados', 'Até 5 usuários', 'Relatórios avançados', 'Suporte prioritário', 'Integração API'],
        popular: true
      },
      {
        name: 'Enterprise',
        price: 397,
        period: 'mês',
        features: ['Veículos ilimitados', 'Usuários ilimitados', 'Relatórios personalizados', 'Suporte 24/7', 'API completa', 'Treinamento personalizado'],
        popular: false
      }
    ],
    cta: {
      text: 'Teste grátis por 14 dias',
      url: '/register',
      buttonText: 'Começar agora'
    }
  });
});

// Rota de registro (landing page)
landingRoutes.post('/api/register', async (req, res) => {
  try {
    // Esta rota redireciona para a rota de registro de tenants
    // Em produção, poderia ter lógica adicional para landing page
    res.json({
      message: 'Redirecionando para cadastro...',
      redirectTo: '/api/tenants/register'
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});