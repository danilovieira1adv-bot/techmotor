import { db } from "./db";
import {
  clients, vehicles, serviceOrders, parts, inspections, machining, finalAssembly, knowledgeBase,
  type Client, type InsertClient,
  type Vehicle, type InsertVehicle,
  type ServiceOrder, type InsertServiceOrder, type UpdateServiceOrder,
  type Part, type InsertPart,
  type Inspection, type InsertInspection,
  type KnowledgeBase, type InsertKnowledgeBase
} from "../shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getClients(tenantId: string): Promise<Client[]>;
  createClient(tenantId: string, client: InsertClient): Promise<Client>;
  getServiceOrders(tenantId: string): Promise<ServiceOrder[]>;
  getServiceOrder(tenantId: string, id: number): Promise<ServiceOrder | undefined>;
  createServiceOrder(tenantId: string, so: InsertServiceOrder): Promise<ServiceOrder>;
  updateServiceOrder(tenantId: string, id: number, updates: UpdateServiceOrder): Promise<ServiceOrder>;
  getParts(tenantId: string): Promise<Part[]>;
  createPart(tenantId: string, part: InsertPart): Promise<Part>;
  createInspection(tenantId: string, inspection: InsertInspection): Promise<Inspection>;
  updateInspection(tenantId: string, id: number, updates: Partial<InsertInspection>): Promise<Inspection>;
  getKnowledgeBase(): Promise<KnowledgeBase[]>;
  createKnowledgeBaseItem(kb: InsertKnowledgeBase): Promise<KnowledgeBase>;
}

export class DatabaseStorage implements IStorage {
  async getClients(tenantId: string): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.tenantId, tenantId));
  }
  async createClient(tenantId: string, client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values({ ...client, tenantId }).returning();
    return created;
  }
  async getServiceOrders(tenantId: string): Promise<ServiceOrder[]> {
    return await db.select().from(serviceOrders).where(eq(serviceOrders.tenantId, tenantId));
  }
  async getServiceOrder(tenantId: string, id: number): Promise<ServiceOrder | undefined> {
    const [so] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return so;
  }
  async createServiceOrder(tenantId: string, so: InsertServiceOrder): Promise<ServiceOrder> {
    const [created] = await db.insert(serviceOrders).values({ ...so, tenantId }).returning();
    return created;
  }
  async updateServiceOrder(tenantId: string, id: number, updates: UpdateServiceOrder): Promise<ServiceOrder> {
    const [updated] = await db.update(serviceOrders).set(updates).where(eq(serviceOrders.id, id)).returning();
    return updated;
  }
  async getParts(tenantId: string): Promise<Part[]> {
    return await db.select().from(parts).where(eq(parts.tenantId, tenantId));
  }
  async createPart(tenantId: string, part: InsertPart): Promise<Part> {
    const [created] = await db.insert(parts).values({ ...part, tenantId }).returning();
    return created;
  }
  async createInspection(tenantId: string, inspection: InsertInspection): Promise<Inspection> {
    const [created] = await db.insert(inspections).values({ ...inspection, tenantId }).returning();
    return created;
  }
  async updateInspection(tenantId: string, id: number, updates: Partial<InsertInspection>): Promise<Inspection> {
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