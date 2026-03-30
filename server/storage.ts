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

const DEFAULT_TENANT_ID = "01fbaaea-5e38-4138-8281-54a6feec60dd";

export interface IStorage {
  getClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  getServiceOrders(): Promise<ServiceOrder[]>;
  getServiceOrder(id: number): Promise<ServiceOrder | undefined>;
  createServiceOrder(so: InsertServiceOrder): Promise<ServiceOrder>;
  updateServiceOrder(id: number, updates: UpdateServiceOrder): Promise<ServiceOrder>;
  getParts(): Promise<Part[]>;
  createPart(part: InsertPart): Promise<Part>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: number, updates: Partial<InsertInspection>): Promise<Inspection>;
  getKnowledgeBase(): Promise<KnowledgeBase[]>;
  createKnowledgeBaseItem(kb: InsertKnowledgeBase): Promise<KnowledgeBase>;
}

export class DatabaseStorage implements IStorage {
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.tenantId, DEFAULT_TENANT_ID));
  }
  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values({ ...client, tenantId: DEFAULT_TENANT_ID }).returning();
    return created;
  }
  async getServiceOrders(): Promise<ServiceOrder[]> {
    return await db.select().from(serviceOrders).where(eq(serviceOrders.tenantId, DEFAULT_TENANT_ID));
  }
  async getServiceOrder(id: number): Promise<ServiceOrder | undefined> {
    const [so] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return so;
  }
  async createServiceOrder(so: InsertServiceOrder): Promise<ServiceOrder> {
    const [created] = await db.insert(serviceOrders).values({ ...so, tenantId: DEFAULT_TENANT_ID }).returning();
    return created;
  }
  async updateServiceOrder(id: number, updates: UpdateServiceOrder): Promise<ServiceOrder> {
    const [updated] = await db.update(serviceOrders).set(updates).where(eq(serviceOrders.id, id)).returning();
    return updated;
  }
  async getParts(): Promise<Part[]> {
    return await db.select().from(parts).where(eq(parts.tenantId, DEFAULT_TENANT_ID));
  }
  async createPart(part: InsertPart): Promise<Part> {
    const [created] = await db.insert(parts).values({ ...part, tenantId: DEFAULT_TENANT_ID }).returning();
    return created;
  }
  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const [created] = await db.insert(inspections).values({ ...inspection, tenantId: DEFAULT_TENANT_ID }).returning();
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
