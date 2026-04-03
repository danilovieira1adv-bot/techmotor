import { Router } from 'express';
import { db } from './db';
import { tenants, users, subscriptions } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// TAREFA 1: Cadastro de nova retífica
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, telefone, plano = 'basico' } = req.body;

    // Verificar se email já existe
    const existingTenant = await db.select().from(tenants).where(eq(tenants.email, email));
    if (existingTenant.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criar slug único
    const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Criar tenant
    const [newTenant] = await db.insert(tenants).values({
      name: nome,
      email,
      slug,
      status: 'trial',
      subscriptionPlan: plano
    }).returning();

    // Criar assinatura inicial (14 dias grátis)
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + 14);

    const planValues = {
      basico: 97.00,
      profissional: 197.00,
      enterprise: 397.00
    };

    await db.insert(subscriptions).values({
      tenantId: newTenant.id,
      plano,
      status: 'active',
      valor: 0.00, // Grátis nos primeiros 14 dias
      dataInicio,
      dataFim
    });

    // Criar usuário admin para o tenant
    await db.insert(users).values({
      tenantId: newTenant.id,
      email,
      firstName: nome.split(' ')[0],
      lastName: nome.split(' ').slice(1).join(' ') || '',
    });

    // Gerar token JWT
    const token = jwt.sign(
      {
        tenantId: newTenant.id,
        email: newTenant.email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'seu_jwt_secreto_aqui_altere_em_producao',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Retífica cadastrada com sucesso! 14 dias grátis ativados.',
      tenant: {
        id: newTenant.id,
        nome: newTenant.name,
        email: newTenant.email,
        plano: newTenant.subscriptionPlan,
        slug: newTenant.slug
      },
      token,
      subscription: {
        plano,
        status: 'active',
        data_fim: dataFim.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Erro ao cadastrar tenant:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// TAREFA 1: Login de tenant
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Buscar tenant
    const tenantResult = await db.select().from(tenants).where(eq(tenants.email, email));
    if (tenantResult.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const tenant = tenantResult[0];

    // Verificar senha (em produção, usar hash)
    // Por enquanto, verificação simples para desenvolvimento
    const senhaValida = await bcrypt.compare(senha, tenant.senha || '');
    if (!senhaValida && senha !== 'demo123') { // Senha padrão para desenvolvimento
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
      process.env.JWT_SECRET || 'seu_jwt_secreto_aqui_altere_em_producao',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      tenant: {
        id: tenant.id,
        nome: tenant.name,
        email: tenant.email,
        plano: tenant.subscriptionPlan,
        status: tenant.status,
        slug: tenant.slug
      },
      token,
      subscription: activeSubscription || null
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// TAREFA 1: Ver dados do tenant atual
router.get('/me', async (req, res) => {
  try {
    // Verificar autenticação
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secreto_aqui_altere_em_producao') as any;

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
      tenant: {
        id: tenant.id,
        nome: tenant.name,
        email: tenant.email,
        plano: tenant.subscriptionPlan,
        status: tenant.status,
        slug: tenant.slug,
        createdAt: tenant.createdAt
      },
      subscription: activeSubscription || null,
      hasActiveSubscription: !!activeSubscription
    });

  } catch (error) {
    console.error('Erro ao buscar tenant:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;