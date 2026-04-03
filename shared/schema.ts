import { pgTable, text, serial, timestamp, boolean, integer, jsonb, varchar, uuid, primaryKey, unique, decimal, date } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Tabela para Tenants (Retíficas)
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  slug: text('slug').unique().notNull(),
  status: text('status').default('active').notNull(),
  subscriptionPlan: text('subscription_plan').default('free').notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela para Subscriptions (Assinaturas)
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  plano: text('plano').notNull(),
  status: text('status').default('active'),
  valor: decimal('valor', { precision: 10, scale: 2 }).notNull(),
  dataInicio: date('data_inicio').notNull(),
  dataFim: date('data_fim').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela para Users (Usuários por Tenant)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('technician'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    uniqueTenantEmail: unique('users_tenant_email_unique').on(table.tenantId, table.email),
  }
});

// Tabelas do negócio
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  whatsappOptIn: boolean('whatsapp_opt_in').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  chassis: text('chassis').notNull(),
  plate: text('plate'),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year'),
  engineType: text('engine_type'),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'no action', onUpdate: 'no action' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const serviceOrders = pgTable('service_orders', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  osNumber: text('os_number').notNull(),
  openDate: timestamp('open_date').defaultNow(),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'no action', onUpdate: 'no action' }),
  vehicleId: integer('vehicle_id').references(() => vehicles.id, { onDelete: 'no action', onUpdate: 'no action' }),
  status: text('status').default('OPEN').notNull(),
  budgetApproved: boolean('budget_approved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    osNumberUnique: unique('service_orders_os_number_unique').on(table.tenantId, table.osNumber),
  }
});

export const inspections = pgTable('inspections', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  partId: integer('part_id'),
  technician: text('technician'),
  measurements: jsonb('measurements'),
  photos: jsonb('photos'),
  aiReport: text('ai_report'),
  approved: boolean('approved'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const knowledgeBase = pgTable('knowledge_base', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  manufacturer: text('manufacturer'),
  model: text('model'),
  component: text('component'),
  infoType: text('info_type'),
  torqueData: jsonb('torque_data'),
  clearanceData: jsonb('clearance_data'),
  videoUrl: text('video_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const machining = pgTable('machining', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  inspectionId: integer('inspection_id'),
  operations: jsonb('operations'),
  finalMeasurements: jsonb('final_measurements'),
  approved: boolean('approved'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const parts = pgTable('parts', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  serviceOrderId: integer('service_order_id').references(() => serviceOrders.id, { onDelete: 'cascade' }),
  type: text('type'),
  serialNumber: text('serial_number'),
  brand: text('brand'),
  model: text('model'),
  qrCode: text('qr_code'),
  status: text('status').default('pending_inspection'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const motors = pgTable('motors', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year'),
  power: integer('power'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: integer('user_id'),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  clientId: integer('client_id').references(() => clients.id),
  userId: integer('user_id'),
  status: text('status').default('active'),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  conversationId: integer('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  senderType: text('sender_type').notNull(), // 'user', 'client', 'system'
  senderId: integer('sender_id'),
  content: text('content').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
// Insert Schemas (Drizzle createInsertSchema)
import { createInsertSchema } from 'drizzle-zod';

export const insertClientSchema = createInsertSchema(clients);
export const insertServiceOrderSchema = createInsertSchema(serviceOrders);
export const insertPartSchema = createInsertSchema(parts);
export const insertInspectionSchema = createInsertSchema(inspections);
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase);
export const insertVehicleSchema = createInsertSchema(vehicles);
export const insertUserSchema = createInsertSchema(users);
export const insertTenantSchema = createInsertSchema(tenants);
