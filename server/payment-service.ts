import { db } from './db';
import { subscriptions } from '../shared/schema';
import { eq, and, gte } from 'drizzle-orm';

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  maxUsers: number;
  maxOrders: number;
}

export const PLANS: Record<string, PaymentPlan> = {
  basic: {
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
  professional: {
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
    maxOrders: -1 // ilimitado
  },
  enterprise: {
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
    maxUsers: -1, // ilimitado
    maxOrders: -1  // ilimitado
  }
};

export class PaymentService {
  /**
   * Cria uma nova assinatura para um tenant
   */
  async createSubscription(tenantId: string, planId: string, paymentMethod: string = 'manual') {
    const plan = PLANS[planId];
    if (!plan) {
      throw new Error(`Plano ${planId} não encontrado`);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 30 dias

    const subscription = await db.insert(subscriptions).values({
      tenantId,
      plano: planId,
      status: 'active',
      valor: plan.price,
      dataInicio: startDate,
      dataFim: endDate
    }).returning();

    return subscription[0];
  }

  /**
   * Verifica se um tenant tem assinatura ativa
   */
  async hasActiveSubscription(tenantId: string): Promise<boolean> {
    const today = new Date();
    
    const activeSubs = await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, 'active'),
          gte(subscriptions.dataFim, today)
        )
      )
      .limit(1);

    return activeSubs.length > 0;
  }

  /**
   * Obtém a assinatura ativa de um tenant
   */
  async getActiveSubscription(tenantId: string) {
    const today = new Date();
    
    const activeSubs = await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, 'active'),
          gte(subscriptions.dataFim, today)
        )
      )
      .orderBy(subscriptions.dataFim)
      .limit(1);

    return activeSubs[0] || null;
  }

  /**
   * Cancela uma assinatura
   */
  async cancelSubscription(subscriptionId: number) {
    await db.update(subscriptions)
      .set({ status: 'cancelled' })
      .where(eq(subscriptions.id, subscriptionId));
  }

  /**
   * Renova uma assinatura
   */
  async renewSubscription(subscriptionId: number) {
    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!subscription[0]) {
      throw new Error('Assinatura não encontrada');
    }

    const newEndDate = new Date(subscription[0].dataFim);
    newEndDate.setMonth(newEndDate.getMonth() + 1);

    await db.update(subscriptions)
      .set({ 
        dataFim: newEndDate,
        status: 'active'
      })
      .where(eq(subscriptions.id, subscriptionId));
  }

  /**
   * Verifica limites de uso baseado no plano
   */
  async checkUsageLimits(tenantId: string, resource: 'users' | 'orders', currentCount: number): Promise<boolean> {
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) {
      return false; // Sem assinatura ativa
    }

    const plan = PLANS[subscription.plano];
    if (!plan) {
      return false;
    }

    const limit = resource === 'users' ? plan.maxUsers : plan.maxOrders;
    
    // -1 significa ilimitado
    if (limit === -1) {
      return true;
    }

    return currentCount < limit;
  }

  /**
   * Simula processamento de pagamento
   */
  async processPayment(tenantId: string, planId: string, amount: number, paymentToken: string): Promise<boolean> {
    // Em produção, integraria com gateway de pagamento (Mercado Pago, Stripe, etc.)
    console.log(`Processando pagamento para tenant ${tenantId}: R$ ${amount} (plano: ${planId})`);
    
    // Simulação: sempre retorna sucesso para testes
    return true;
  }

  /**
   * Obtém histórico de pagamentos de um tenant
   */
  async getPaymentHistory(tenantId: string) {
    return await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .orderBy(subscriptions.dataInicio);
  }
}

export const paymentService = new PaymentService();