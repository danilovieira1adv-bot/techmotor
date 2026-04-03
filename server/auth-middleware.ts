import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { subscriptions } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Middleware para verificar token JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secreto_aqui_altere_em_producao', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    
    // Adicionar informações do usuário à requisição
    (req as any).user = user;
    next();
  });
};

// Middleware para verificar assinatura ativa (TAREFA 2)
export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user || !user.tenantId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Buscar assinatura ativa
    const subscriptionResult = await db.select().from(subscriptions)
      .where(eq(subscriptions.tenantId, user.tenantId))
      .orderBy(subscriptions.createdAt);

    const activeSubscription = subscriptionResult.find(sub => 
      sub.status === 'active' && new Date(sub.dataFim) > new Date()
    );

    if (!activeSubscription) {
      return res.status(403).json({ 
        error: 'Assinatura necessária', 
        message: 'Renove sua assinatura para continuar usando o sistema',
        planos: [
          { nome: 'Básico', valor: 97.00, periodo: 'mês', recursos: ['Até 50 veículos/mês', '1 usuário', 'Relatórios básicos'] },
          { nome: 'Profissional', valor: 197.00, periodo: 'mês', recursos: ['Veículos ilimitados', 'Até 5 usuários', 'Relatórios avançados'] },
          { nome: 'Enterprise', valor: 397.00, periodo: 'mês', recursos: ['Veículos ilimitados', 'Usuários ilimitados', 'Suporte 24/7'] }
        ]
      });
    }

    // Adicionar informações da assinatura à requisição
    (req as any).subscription = activeSubscription;
    next();

  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar permissões de admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  
  next();
};

// Middleware para obter tenantId de qualquer requisição
export const getTenantContext = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user && user.tenantId) {
    (req as any).tenantId = user.tenantId;
  }
  
  next();
};

// Helper para gerar token JWT
export const generateToken = (tenantId: string, email: string, role: string = 'user') => {
  return jwt.sign(
    { tenantId, email, role },
    process.env.JWT_SECRET || 'seu_jwt_secreto_aqui_altere_em_producao',
    { expiresIn: '7d' }
  );
};

// Helper para verificar senha
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Helper para hash de senha
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

import bcrypt from 'bcryptjs';