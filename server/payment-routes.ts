import { Router } from 'express';
import { paymentService, PLANS } from './payment-service';
import { authenticateToken, getTenantContext } from './auth-middleware';
import { z } from 'zod';

const router = Router();

// Schema de validação para criação de assinatura
const createSubscriptionSchema = z.object({
  planId: z.enum(['basic', 'professional', 'enterprise']),
  paymentToken: z.string().optional(),
  paymentMethod: z.enum(['credit_card', 'pix', 'boleto']).default('credit_card')
});

// Rotas públicas
router.get('/api/payment/plans', (req, res) => {
  res.json({
    plans: Object.values(PLANS),
    currency: 'BRL',
    trialDays: 14
  });
});

// Rotas protegidas
router.use(getTenantContext);

// Verificar status da assinatura
router.get('/api/payment/status', async (req, res) => {
  try {
    const tenantId = (req as any).tenantId;
    const subscription = await paymentService.getActiveSubscription(tenantId);
    const hasActive = await paymentService.hasActiveSubscription(tenantId);

    res.json({
      hasActiveSubscription: hasActive,
      subscription: subscription,
      currentPlan: subscription ? PLANS[subscription.plano] : null,
      message: hasActive ? 'Assinatura ativa' : 'Assinatura necessária'
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova assinatura
router.post('/api/payment/subscribe', async (req, res) => {
  try {
    const tenantId = (req as any).tenantId;
    const input = createSubscriptionSchema.parse(req.body);
    
    const plan = PLANS[input.planId];
    if (!plan) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    // Verificar se já tem assinatura ativa
    const hasActive = await paymentService.hasActiveSubscription(tenantId);
    if (hasActive) {
      return res.status(400).json({ error: 'Já existe uma assinatura ativa' });
    }

    // Processar pagamento
    const paymentSuccess = await paymentService.processPayment(
      tenantId,
      input.planId,
      plan.price,
      input.paymentToken || 'test_token'
    );

    if (!paymentSuccess) {
      return res.status(402).json({ error: 'Pagamento falhou' });
    }

    // Criar assinatura
    const subscription = await paymentService.createSubscription(
      tenantId,
      input.planId,
      input.paymentMethod
    );

    res.status(201).json({
      message: 'Assinatura criada com sucesso',
      subscription,
      plan: PLANS[input.planId]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancelar assinatura
router.post('/api/payment/cancel', async (req, res) => {
  try {
    const tenantId = (req as any).tenantId;
    const subscription = await paymentService.getActiveSubscription(tenantId);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada' });
    }

    await paymentService.cancelSubscription(subscription.id);
    
    res.json({
      message: 'Assinatura cancelada com sucesso',
      subscriptionId: subscription.id
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Renovar assinatura
router.post('/api/payment/renew', async (req, res) => {
  try {
    const tenantId = (req as any).tenantId;
    const subscription = await paymentService.getActiveSubscription(tenantId);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada' });
    }

    // Processar pagamento de renovação
    const plan = PLANS[subscription.plano];
    const paymentSuccess = await paymentService.processPayment(
      tenantId,
      subscription.plano,
      plan.price,
      'renewal_token'
    );

    if (!paymentSuccess) {
      return res.status(402).json({ error: 'Pagamento de renovação falhou' });
    }

    await paymentService.renewSubscription(subscription.id);
    
    res.json({
      message: 'Assinatura renovada com sucesso',
      subscriptionId: subscription.id
    });
  } catch (error) {
    console.error('Erro ao renovar assinatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Histórico de pagamentos
router.get('/api/payment/history', async (req, res) => {
  try {
    const tenantId = (req as any).tenantId;
    const history = await paymentService.getPaymentHistory(tenantId);
    
    res.json({
      history,
      total: history.length
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar limites de uso
router.get('/api/payment/limits/:resource', async (req, res) => {
  try {
    const tenantId = (req as any).tenantId;
    const resource = req.params.resource as 'users' | 'orders';
    const currentCount = parseInt(req.query.count as string) || 0;

    if (!['users', 'orders'].includes(resource)) {
      return res.status(400).json({ error: 'Recurso inválido' });
    }

    const withinLimits = await paymentService.checkUsageLimits(tenantId, resource, currentCount);
    
    res.json({
      resource,
      currentCount,
      withinLimits,
      message: withinLimits ? 'Dentro dos limites' : 'Limite excedido'
    });
  } catch (error) {
    console.error('Erro ao verificar limites:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;