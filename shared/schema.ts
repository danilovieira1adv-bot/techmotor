import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  whatsappOptIn: boolean("whatsapp_opt_in").default(false),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  chassis: text("chassis").notNull(),
  plate: text("plate"),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  engineType: text("engine_type"),
  clientId: integer("client_id").references(() => clients.id),
});

export const serviceOrders = pgTable("service_orders", {
  id: serial("id").primaryKey(),
  osNumber: text("os_number").notNull().unique(),
  openDate: timestamp("open_date").defaultNow(),
  clientId: integer("client_id").references(() => clients.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  status: text("status").notNull().default("OPEN"),
  budgetApproved: boolean("budget_approved").default(false),
});

export const motors = pgTable("motors", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number"),
  type: text("type"),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
});

export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  originalIdentifier: text("original_identifier"),
  internalQrCode: text("internal_qr_code").notNull(),
  motorId: integer("motor_id").references(() => motors.id),
  osId: integer("os_id").references(() => serviceOrders.id),
});

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  osId: integer("os_id").references(() => serviceOrders.id),
  date: timestamp("date").defaultNow(),
  technicianId: text("technician_id"),
  measurementsJson: jsonb("measurements_json"),
  photosJson: jsonb("photos_json"),
  aiReport: text("ai_report"),
  approved: boolean("approved").default(false),
});

export const machining = pgTable("machining", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").references(() => inspections.id),
  operation: text("operation").notNull(),
  postMeasurements: jsonb("post_measurements"),
  torquesApplied: jsonb("torques_applied"),
  date: timestamp("date").defaultNow(),
});

export const finalAssembly = pgTable("final_assembly", {
  id: serial("id").primaryKey(),
  osId: integer("os_id").references(() => serviceOrders.id),
  checklistJson: jsonb("checklist_json"),
  completionDate: timestamp("completion_date").defaultNow(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(),
  model: text("model").notNull(),
  infoType: text("info_type").notNull(),
  textContent: text("content_text"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
});

export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true });
export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({ id: true, openDate: true });
export const insertPartSchema = createInsertSchema(parts).omit({ id: true });
export const insertInspectionSchema = createInsertSchema(inspections).omit({ id: true, date: true });
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({ id: true });

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;
export type UpdateServiceOrder = Partial<InsertServiceOrder>;

export type Part = typeof parts.$inferSelect;
export type InsertPart = z.infer<typeof insertPartSchema>;

export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
