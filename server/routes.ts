import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
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
