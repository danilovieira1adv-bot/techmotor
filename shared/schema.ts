import { pgTable, text, serial, timestamp, boolean, integer, jsonb, varchar, uuid, primaryKey, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Tabela para Tenants (Retíficas)
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(), // Usar UUID para ID do tenant
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(), // Identificador único e amigável para URLs
  status: text('status').default('active').notNull(), // Ex: 'active', 'inactive', 'trial', 'suspended'
  subscriptionPlan: text('subscription_plan').default('free').notNull(), // Ex: 'free', 'basic', 'premium'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Adicionado tenantId
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  whatsappOptIn: boolean('whatsapp_opt_in').default(false),
});

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Adicionado tenantId
  chassis: text('chassis').notNull(),
  plate: text('plate'),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year'),
  engineType: text('engine_type'),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'no action', onUpdate: 'no action' }),
});

export const serviceOrders = pgTable('service_orders', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Adicionado tenantId
  osNumber: text('os_number').notNull(),
  openDate: timestamp('open_date').defaultNow(),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'no action', onUpdate: 'no action' }),
  vehicleId: integer('vehicle_id').references(() => vehicles.id, { onDelete: 'no action', onUpdate: 'no action' }),
  status: text('status').default('OPEN').notNull(), // OPEN, IN_PROGRESS, WAITING_APPROVAL, COMPLETED, CANCELLED
  budgetApproved: boolean('budget_approved').default(false),
}, (table) => {
  return {
    osNumberUnique: unique('service_orders_os_number_unique').on(table.tenantId, table.osNumber), // Unique por tenant
  }
});

export const inspections = pgTable('inspections', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Adicionado tenantId
  osId: integer('os_id').references(() => serviceOrders.id, { onDelete: 'no action', onUpdate: 'no action' }),
  date: timestamp('date').defaultNow(),
  technicianId: text('technician_id'), // Considerando que users ainda não tem tenant_id ou pode ser externo
  measurementsJson: jsonb('measurements_json'),
  photosJson: jsonb('photos_json'),
  aiReport: text('ai_report'),
  approved: boolean('approved').default(false),
});

export const knowledgeBase = pgTable('knowledge_base', {
  id: serial('id').primaryKey(),
  // tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Descomente se a KB for por tenant
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  infoType: text('info_type').notNull(),
  contentText: text('content_text'),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
});

export const machining = pgTable('machining', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Adicionado tenantId
  inspectionId: integer('inspection_id').references(() => inspections.id, { onDelete: 'no action', onUpdate: 'no action' }),
  operation: text('operation').notNull(),
  postMeasurements: jsonb('post_measurements'),
  torquesApplied: jsonb('torques_applied'),
  date: timestamp('date').defaultNow(),
});

export const motors = pgTable('motors', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Adicionado tenantId
  serialNumber: text('serial_number'),
  type: text('type'), // Ex: 'Motor de partida', 'Alternador', 'Motor de limpador', etc.
  vehicleId: integer('vehicle_id').references(() => vehicles.id, { onDelete: 'no action', onUpdate: 'no action' }),
});

export const parts = pgTable('parts', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Adicionado tenantId
  type: text('type').notNull(), // Ex: 'Rotor', 'Estator', 'Carcaça', 'Rolamento'
  originalIdentifier: text('original_identifier'), // Código do fabricante
  internalQrCode: text('internal_qr_code').notNull(), // QR Code interno para rastreamento
  motorId: integer('motor_id').references(() => motors.id, { onDelete: 'no action', onUpdate: 'no action' }),
  osId: integer('os_id').references(() => serviceOrders.id, { onDelete: 'no action', onUpdate: 'no action' }),
});

export const sessions = pgTable('sessions', {
  sid: varchar('sid').primaryKey().notNull(),
  sess: jsonb('sess').notNull(),
  expire: timestamp('expire').notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(), // ID do usuário agora é UUID
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Adicionado tenantId, não pode ser nulo
  email: varchar('email').notNull(), // Email agora não pode ser nulo
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  profileImageUrl: varchar('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    // A unicidade do e-mail é agora por tenant. Ex: "user@example.com" pode existir em tenant A e tenant B
    tenantEmailUnique: unique('users_tenant_email_unique').on(table.tenantId, table.email),
  }
});

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Adicionado tenantId
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }), // Adicionado tenantId
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade', onUpdate: 'no action' }),
  role: text('role').notNull(), // e.g., 'user', 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const insertClientSchema = createInsertSchema(clients).omit({ tenantId: true, id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles);
export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({ tenantId: true, id: true, createdAt: true, updatedAt: true });
export const insertPartSchema = createInsertSchema(parts).omit({ tenantId: true, id: true, createdAt: true });
export const insertInspectionSchema = createInsertSchema(inspections).omit({ tenantId: true, id: true, createdAt: true });
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase);

export type InsertClient = typeof clients.$inferInsert;
export type SelectClient = typeof clients.$inferSelect;
export type InsertServiceOrder = typeof serviceOrders.$inferInsert;
export type SelectServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
export type SelectVehicle = typeof vehicles.$inferSelect;

export const finalAssembly = pgTable('final_assembly', {
  id: serial('id').primaryKey(),
  serviceOrderId: integer('service_order_id').references(() => serviceOrders.id, { onDelete: 'cascade' }),
  notes: text('notes'),
  approved: boolean('approved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = typeof serviceOrders.$inferInsert;
export type UpdateServiceOrder = Partial<InsertServiceOrder>;
export type Part = typeof parts.$inferSelect;
export type InsertPart = typeof parts.$inferInsert;
export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = typeof inspections.$inferInsert;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;
