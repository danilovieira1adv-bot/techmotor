// Servidor de teste rápido para APIs do RetíficaPro
import express from 'express';
const app = express();
const PORT = 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// ========== LANDING PAGE API ==========
app.get('/api/landing/info', (req, res) => {
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

// ========== TENANTS API ==========
app.post('/api/tenants/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  
  res.status(201).json({
    message: 'Tenant criado com sucesso',
    tenant: {
      id: 'mock-tenant-id-123',
      name,
      email,
      phone: phone || '',
      subscription_plan: 'free',
      status: 'trial',
      created_at: new Date().toISOString()
    },
    user: {
      id: 'mock-user-id-456',
      name: 'Administrador',
      email,
      role: 'admin'
    }
  });
});

app.post('/api/tenants/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  // Mock de autenticação
  res.json({
    token: 'mock-jwt-token-123456',
    user: {
      id: 'mock-user-id-456',
      name: 'Administrador',
      email,
      role: 'admin',
      tenantId: 'mock-tenant-id-123'
    }
  });
});

// ========== PAYMENT API ==========
app.get('/api/payment/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'basic',
        name: 'Básico',
        price: 97,
        period: 'monthly',
        features: [
          'Até 50 ordens/mês',
          'Gestão de clientes',
          'QR code básico',
          'Suporte por email',
          '1 usuário'
        ],
        maxUsers: 1,
        maxOrders: 50
      },
      {
        id: 'professional',
        name: 'Profissional',
        price: 197,
        period: 'monthly',
        features: [
          'Ordens ilimitadas',
          'Multi-tenancy completo',
          'QR code avançado',
          'Integração WhatsApp',
          'Até 5 usuários',
          'Dashboard avançado',
          'Suporte prioritário'
        ],
        maxUsers: 5,
        maxOrders: -1
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 497,
        period: 'monthly',
        features: [
          'Tudo do Profissional',
          'Usuários ilimitados',
          'API personalizada',
          'On-premise opcional',
          'Treinamento dedicado',
          'Suporte 24/7'
        ],
        maxUsers: -1,
        maxOrders: -1
      }
    ],
    currency: 'BRL',
    trialDays: 14
  });
});

// Middleware de autenticação mock
const mockAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }
  
  // Mock user data
  req.user = {
    id: 'mock-user-id-456',
    name: 'Administrador',
    email: 'admin@retifica.com',
    role: 'admin',
    tenantId: 'mock-tenant-id-123'
  };
  
  next();
};

app.get('/api/payment/status', mockAuth, (req, res) => {
  res.json({
    hasActiveSubscription: true,
    subscription: {
      id: 1,
      tenantId: 'mock-tenant-id-123',
      plano: 'professional',
      status: 'active',
      valor: 197.00,
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    currentPlan: {
      id: 'professional',
      name: 'Profissional',
      price: 197,
      period: 'monthly'
    },
    message: 'Assinatura ativa'
  });
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RetíficaPro API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/landing/info',
      '/api/tenants/register',
      '/api/tenants/login',
      '/api/payment/plans',
      '/api/payment/status',
      '/api/health'
    ]
  });
});

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.path,
    method: req.method
  });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📡 Endpoints disponíveis:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/landing/info`);
  console.log(`   GET  http://localhost:${PORT}/api/payment/plans`);
  console.log(`   POST http://localhost:${PORT}/api/tenants/register`);
  console.log(`   POST http://localhost:${PORT}/api/tenants/login`);
  console.log(`   GET  http://localhost:${PORT}/api/payment/status (com Authorization: Bearer token)`);
  console.log('');
  console.log('📝 Exemplos de uso:');
  console.log(`   curl http://localhost:${PORT}/api/landing/info`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/tenants/register -H "Content-Type: application/json" -d '{"name":"Minha Retífica","email":"teste@retifica.com","password":"senha123"}'`);
});