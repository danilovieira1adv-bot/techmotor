import { Router } from 'express';
import { authenticateToken } from './auth-middleware';

export const publicRoutes = Router();
export const protectedRoutes = Router();

// Health check
publicRoutes.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RetíficaPro API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Landing page info
publicRoutes.get('/api/landing/info', (req, res) => {
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
      { name: 'Básico', price: 97, period: 'mês', features: ['Até 50 veículos/mês', '1 usuário', 'Relatórios básicos', 'Suporte por email'], popular: false },
      { name: 'Profissional', price: 197, period: 'mês', features: ['Veículos ilimitados', 'Até 5 usuários', 'Relatórios avançados', 'Suporte prioritário', 'Integração API'], popular: true },
      { name: 'Enterprise', price: 397, period: 'mês', features: ['Veículos ilimitados', 'Usuários ilimitados', 'Relatórios personalizados', 'Suporte 24/7', 'API completa', 'Treinamento personalizado'], popular: false }
    ],
    cta: { text: 'Teste grátis por 14 dias', url: '/register', buttonText: 'Começar agora' }
  });
});

// Planos de pagamento
publicRoutes.get('/api/payment/plans', (req, res) => {
  res.json({
    plans: [
      { id: 'basic', name: 'Básico', price: 97, period: 'monthly', features: ['Até 50 ordens/mês', 'Gestão de clientes', 'QR code básico', 'Suporte por email', '1 usuário'], maxUsers: 1, maxOrders: 50 },
      { id: 'professional', name: 'Profissional', price: 197, period: 'monthly', features: ['Ordens ilimitadas', 'Multi-tenancy completo', 'QR code avançado', 'Integração WhatsApp', 'Até 5 usuários', 'Dashboard avançado', 'Suporte prioritário'], maxUsers: 5, maxOrders: -1 },
      { id: 'enterprise', name: 'Enterprise', price: 497, period: 'monthly', features: ['Tudo do Profissional', 'Usuários ilimitados', 'API personalizada', 'On-premise opcional', 'Treinamento dedicado', 'Suporte 24/7'], maxUsers: -1, maxOrders: -1 }
    ],
    currency: 'BRL',
    trialDays: 14
  });
});

// Registro de tenant

// Login de tenant

// Rotas protegidas (com autenticação individual)
protectedRoutes.get('/api/protected/example', authenticateToken, (req, res) => {
  const user = (req as any).user;
  res.json({ message: 'Rota protegida funcionando', user });
});

protectedRoutes.get('/api/payment/status', authenticateToken, (req, res) => {
  const user = (req as any).user;
  res.json({
    status: 'active',
    plan: 'professional',
    tenantId: user?.tenantId || 'mock-tenant-id-123',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
});
