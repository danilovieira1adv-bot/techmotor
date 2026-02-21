import { db } from "./db";
import {
  clients, vehicles, serviceOrders, parts, inspections, machining, finalAssembly, knowledgeBase,
  type Client, type InsertClient,
  type Vehicle, type InsertVehicle,
  type ServiceOrder, type InsertServiceOrder, type UpdateServiceOrder,
  type Part, type InsertPart,
  type Inspection, type InsertInspection,
  type KnowledgeBase, type InsertKnowledgeBase
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  
  // Service Orders
  getServiceOrders(): Promise<ServiceOrder[]>;
  getServiceOrder(id: number): Promise<ServiceOrder | undefined>;
  createServiceOrder(so: InsertServiceOrder): Promise<ServiceOrder>;
  updateServiceOrder(id: number, updates: UpdateServiceOrder): Promise<ServiceOrder>;

  // Parts
  getParts(): Promise<Part[]>;
  createPart(part: InsertPart): Promise<Part>;

  // Inspections
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: number, updates: Partial<InsertInspection>): Promise<Inspection>;

  // Knowledge Base
  getKnowledgeBase(): Promise<KnowledgeBase[]>;
  createKnowledgeBaseItem(kb: InsertKnowledgeBase): Promise<KnowledgeBase>;
}

export class DatabaseStorage implements IStorage {
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }
  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client).returning();
    return created;
  }

  async getServiceOrders(): Promise<ServiceOrder[]> {
    return await db.select().from(serviceOrders);
  }
  async getServiceOrder(id: number): Promise<ServiceOrder | undefined> {
    const [so] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return so;
  }
  async createServiceOrder(so: InsertServiceOrder): Promise<ServiceOrder> {
    const [created] = await db.insert(serviceOrders).values(so).returning();
    return created;
  }
  async updateServiceOrder(id: number, updates: UpdateServiceOrder): Promise<ServiceOrder> {
    const [updated] = await db.update(serviceOrders).set(updates).where(eq(serviceOrders.id, id)).returning();
    return updated;
  }

  async getParts(): Promise<Part[]> {
    return await db.select().from(parts);
  }
  async createPart(part: InsertPart): Promise<Part> {
    const [created] = await db.insert(parts).values(part).returning();
    return created;
  }

  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const [created] = await db.insert(inspections).values(inspection).returning();
    return created;
  }
  async updateInspection(id: number, updates: Partial<InsertInspection>): Promise<Inspection> {
    const [updated] = await db.update(inspections).set(updates).where(eq(inspections.id, id)).returning();
    return updated;
  }

  async getKnowledgeBase(): Promise<KnowledgeBase[]> {
    return await db.select().from(knowledgeBase);
  }
  async createKnowledgeBaseItem(kb: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [created] = await db.insert(knowledgeBase).values(kb).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
