import { pgTable, text, serial, timestamp, boolean, integer, decimal, uuid, unique } from 'drizzle-orm/pg-core';
import { tenants } from './schema';

// TAREFA 2: Tabela de subscriptions (assinaturas)
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  plano: text('plano').notNull(), // 'basico', 'profissional', 'enterprise'
  status: text('status').default('active').notNull(), // 'active', 'cancelled', 'expired', 'pending'
  valor: decimal('valor', { precision: 10, scale: 2 }).notNull(),
  dataInicio: timestamp('data_inicio').notNull(),
  dataFim: timestamp('data_fim').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    // Garantir que um tenant tenha apenas uma assinatura ativa por vez
    uniqueActiveSubscription: unique('subscriptions_unique_active').on(table.tenantId, table.status)
      .where(sql`status = 'active'`),
  }
});

import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;