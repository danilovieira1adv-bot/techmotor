import { Router } from 'express';
import { db } from './db';
import { tenants, subscriptions, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// Rota POST /api/tenants/register - Cadastro de nova retífica
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, telefone, nome_retifica, plano = 'basico' } = req.body;

    // Validação básica
    if (!nome || !email || !senha || !nome_retifica) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: nome, email, senha, nome_retifica' 
      });
    }

    // Verificar se email já existe
    const existingTenant = await db.select().from(tenants).where(eq(tenants.email, email));
    if (existingTenant.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criar slug único
    const slug = nome_retifica.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Criar tenant
    const [newTenant] = await db.insert(tenants).values({
      name: nome_retifica,
      email: email,
      passwordHash: senhaHash,
      slug: slug,
      status: 'trial',
      subscriptionPlan: plano,
      phone: telefone || ''
    }).returning();

    // Criar assinatura inicial (14 dias grátis)
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + 14);

    // Valores dos planos
    const planValues = {
      basico: 97.00,
      profissional: 197.00,
      enterprise: 397.00
    };

    await db.insert(subscriptions).values({
      tenantId: newTenant.id,
      plano: plano,
      status: 'active',
      valor: '0.00', // Grátis nos primeiros 14 dias
      dataInicio: dataInicio,
      dataFim: dataFim
    });

    // Criar usuário admin para o tenant
    await db.insert(users).values({
      tenantId: newTenant.id,
      name: nome,
      email: email,
      passwordHash: senhaHash,
      role: 'admin'
    });

    // Gerar token JWT
    const token = jwt.sign(
      {
        tenantId: newTenant.id,
        email: newTenant.email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'techmotor-jwt-secret-2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Retífica cadastrada com sucesso! 14 dias grátis ativados.',
      tenant: {
        id: newTenant.id,
        nome: newTenant.name,
        email: newTenant.email,
        plano: newTenant.subscriptionPlan,
        slug: newTenant.slug,
        telefone: newTenant.phone
      },
      token: token,
      subscription: {
        plano: plano,
        status: 'active',
        data_fim: dataFim.toISOString().split('T')[0]
      }
    });

  } catch (error: any) {
    console.error('Erro ao cadastrar tenant:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota POST /api/tenants/login - Login de tenant
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar tenant
    const tenantResult = await db.select().from(tenants).where(eq(tenants.email, email));
    if (tenantResult.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const tenant = tenantResult[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, tenant.passwordHash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar se tenant está ativo
    if (tenant.status !== 'active' && tenant.status !== 'trial') {
      return res.status(403).json({ error: 'Conta desativada ou suspensa' });
    }

    // Buscar assinatura atual
    const subscriptionResult = await db.select().from(subscriptions)
      .where(eq(subscriptions.tenantId, tenant.id))
      .orderBy(subscriptions.createdAt);

    const activeSubscription = subscriptionResult.find(sub => 
      sub.status === 'active' && new Date(sub.dataFim) > new Date()
    );

    // Gerar token JWT
    const token = jwt.sign(
      {
        tenantId: tenant.id,
        email: tenant.email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'techmotor-jwt-secret-2024',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      tenant: {
        id: tenant.id,
        nome: tenant.name,
        email: tenant.email,
        plano: tenant.subscriptionPlan,
        status: tenant.status,
        slug: tenant.slug,
        telefone: tenant.phone
      },
      token: token,
      subscription: activeSubscription || null
    });

  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota GET /api/tenants/me - Ver dados do tenant atual
router.get('/me', async (req, res) => {
  try {
    // Verificar autenticação
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techmotor-jwt-secret-2024') as any;

    const tenantResult = await db.select().from(tenants).where(eq(tenants.id, decoded.tenantId));
    if (tenantResult.length === 0) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }

    const tenant = tenantResult[0];

    // Buscar assinatura atual
    const subscriptionResult = await db.select().from(subscriptions)
      .where(eq(subscriptions.tenantId, tenant.id))
      .orderBy(subscriptions.createdAt);

    const activeSubscription = subscriptionResult.find(sub => 
      sub.status === 'active' && new Date(sub.dataFim) > new Date()
    );

    res.json({
      success: true,
      tenant: {
        id: tenant.id,
        nome: tenant.name,
        email: tenant.email,
        plano: tenant.subscriptionPlan,
        status: tenant.status,
        slug: tenant.slug,
        telefone: tenant.phone,
        createdAt: tenant.createdAt
      },
      subscription: activeSubscription || null,
      hasActiveSubscription: !!activeSubscription
    });

  } catch (error: any) {
    console.error('Erro ao buscar tenant:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota GET /api/tenants - Listar todos os tenants (apenas para desenvolvimento)
router.get('/', async (req, res) => {
  try {
    const tenantsList = await db.select().from(tenants);
    res.json({ 
      success: true,
      tenants: tenantsList 
    });
  } catch (error: any) {
    console.error('Erro ao listar tenants:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

export default router;