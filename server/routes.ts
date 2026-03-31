import { validateUser, createUser, requireAuth } from "./auth";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db, pool } from "./db";
import { inspections } from "../shared/schema";
import { api } from "../shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup auth integration
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Setup chat integration (simulated whatsapp)
  registerChatRoutes(app);

  // Custom endpoints
  
  app.get(api.clients.list.path, isAuthenticated, async (req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });
  app.post(api.clients.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.clients.create.input.parse(req.body);
      const client = await storage.createClient(input);
      res.status(201).json(client);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.serviceOrders.list.path, isAuthenticated, async (req, res) => {
    const orders = await storage.getServiceOrders();
    res.json(orders);
  });
  app.get(api.serviceOrders.get.path, isAuthenticated, async (req, res) => {
    const order = await storage.getServiceOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  });
  app.post(api.serviceOrders.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.serviceOrders.create.input.parse(req.body);
      const order = await storage.createServiceOrder(input);
      res.status(201).json(order);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app.patch(api.serviceOrders.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.serviceOrders.update.input.parse(req.body);
      const order = await storage.updateServiceOrder(Number(req.params.id), input);
      res.json(order);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.parts.list.path, isAuthenticated, async (req, res) => {
    const p = await storage.getParts();
    res.json(p);
  });
  app.post(api.parts.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.parts.create.input.parse(req.body);
      const p = await storage.createPart(input);
      res.status(201).json(p);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/inspections", isAuthenticated, async (req, res) => {
    try {
      const result = await db.select().from(inspections);
      res.json(result);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ message: e.message });
    }
  });

  app.post(api.inspections.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.inspections.create.input.parse(req.body);
      const insp = await storage.createInspection(input);
      res.status(201).json(insp);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.inspections.analyze.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.inspections.analyze.input.parse(req.body);
      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: `Você é um especialista em retífica de motores diesel. Analise as medidas abaixo e emita um parecer técnico detalhado. Informe se está APROVADO ou REPROVADO, justificando com base nas tolerâncias técnicas. Medidas: ${JSON.stringify(input.measurements)}` }],
      });
      const aiReport = response.choices[0]?.message?.content || "Parecer não gerado.";
      const approved = aiReport.toLowerCase().includes("aprovado") && !aiReport.toLowerCase().includes("reprovado");
      res.json({ aiReport, approved });
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.knowledgeBase.list.path, isAuthenticated, async (req, res) => {
    const kb = await storage.getKnowledgeBase();
    res.json(kb);
  });
  app.post(api.knowledgeBase.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.knowledgeBase.create.input.parse(req.body);
      const kb = await storage.createKnowledgeBaseItem(input);
      res.status(201).json(kb);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // await seedDatabase(); // Desabilitado - tabelas já foram criadas manualmente




  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email e senha obrigatórios" });
      const user = await validateUser(email, password);
      if (!user) return res.status(401).json({ message: "Email ou senha inválidos" });
      (req.session as any).userId = user.id;
      (req.session as any).userName = user.name;
      (req.session as any).userEmail = user.email;
      (req.session as any).userRole = user.role;
      (req.session as any).tenantId = user.tenantId;
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req: any, res) => {
    if (!req.session?.userId) return res.status(401).json({ message: "Unauthorized" });
    res.json({
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail,
      role: req.session.userRole,
      tenantId: req.session.tenantId,
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const tenantId = "01fbaaea-5e38-4138-8281-54a6feec60dd";
      const user = await createUser(tenantId, name, email, password, role || "technician");
      res.status(201).json(user);
    } catch (e: any) {
      if (e.code === "23505") return res.status(400).json({ message: "Email já cadastrado" });
      res.status(500).json({ message: e.message });
    }
  });

  // Budget routes
  app.get("/api/budgets", isAuthenticated, async (req, res) => {
    try {
      const result = await pool.query("SELECT b.*, c.name as client_name FROM budgets b LEFT JOIN clients c ON b.client_id = c.id WHERE b.tenant_id = $1 ORDER BY b.created_at DESC", ["01fbaaea-5e38-4138-8281-54a6feec60dd"]);
      res.json(result.rows);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/budgets", isAuthenticated, async (req, res) => {
    try {
      const { clientId, serviceOrderId, items, discount, notes } = req.body;
      const total = items.reduce((sum: number, item: any) => sum + Number(item.total), 0);
      const result = await pool.query(
        "INSERT INTO budgets (tenant_id, client_id, service_order_id, total, discount, notes, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,'pending',NOW(),NOW()) RETURNING *",
        ["01fbaaea-5e38-4138-8281-54a6feec60dd", clientId, serviceOrderId || null, total, discount || 0, notes || null]
      );
      const budget = result.rows[0];
      for (const item of items) {
        await pool.query(
          "INSERT INTO budget_items (budget_id, type, description, quantity, unit_price, total) VALUES ($1,$2,$3,$4,$5,$6)",
          [budget.id, item.type, item.description, item.quantity, item.unitPrice, item.total]
        );
      }
      res.status(201).json(budget);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/budgets/:id/send-whatsapp", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT b.*, c.name as client_name, c.phone FROM budgets b LEFT JOIN clients c ON b.client_id = c.id WHERE b.id = $1", [id]);
      const budget = result.rows[0];
      if (!budget) return res.status(404).json({ message: "Budget not found" });
      const total = (Number(budget.total) - Number(budget.discount)).toFixed(2);
      const msg = "Orcamento TechMotor #" + budget.id + " - Total: R$ " + total + " - Para aprovar responda SIM";
      const phone = budget.phone ? budget.phone.replace(/\D/g, "") : "";
      const whatsappUrl = "https://wa.me/55" + phone + "?text=" + encodeURIComponent(msg);
      await pool.query("UPDATE budgets SET status='sent', updated_at=NOW() WHERE id=$1", [id]);
      res.json({ whatsappUrl, message: "Sent" });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/budgets/:id", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const result = await pool.query("UPDATE budgets SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *", [status, req.params.id]);
      res.json(result.rows[0]);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  return httpServer;
}

async function seedDatabase() {
  const clients = await storage.getClients();
  if (clients.length === 0) {
    const c1 = await storage.createClient({ name: "Transportadora Brasil", phone: "11999999999", whatsappOptIn: true });
    await storage.createKnowledgeBaseItem({ manufacturer: "Cummins", model: "ISF 2.8", infoType: "Torque", textContent: "Cabeçote: 60Nm + 90 graus" });
    await storage.createKnowledgeBaseItem({ manufacturer: "Mercedes", model: "OM 460", infoType: "Folga", textContent: "Bronzina de biela: 0.05 a 0.09mm" });
    await storage.createServiceOrder({ osNumber: "OS-2023-001", clientId: c1.id, status: "OPEN" });
  }
}