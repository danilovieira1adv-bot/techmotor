import { Router } from 'express';
import { db } from './db';
import { tenants, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

// Tabela para tokens de reset de senha (vamos criar dinamicamente)
interface PasswordResetToken {
  id: string;
  tenantId: string;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

// Em produção, isso seria uma tabela no banco
const passwordResetTokens = new Map<string, PasswordResetToken>();

// Rota POST /api/auth/forgot-password - Solicitar reset de senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Buscar tenant pelo email
    const tenantResult = await db.select().from(tenants).where(eq(tenants.email, email));
    if (tenantResult.length === 0) {
      // Por segurança, não revelamos se o email existe ou não
      return res.json({
        success: true,
        message: 'Se o email existir em nosso sistema, enviaremos instruções de recuperação.',
        // Em produção, não mostraríamos o token
        token: 'simulated-for-development' // Apenas para desenvolvimento
      });
    }

    const tenant = tenantResult[0];

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenId = crypto.randomBytes(16).toString('hex');
    
    // Expira em 1 hora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Salvar token (em produção, salvaria no banco)
    passwordResetTokens.set(tokenId, {
      id: tokenId,
      tenantId: tenant.id,
      email: tenant.email,
      token: resetToken,
      expiresAt,
      used: false,
      createdAt: new Date()
    });

    // Limpar tokens expirados periodicamente
    cleanupExpiredTokens();

    // Em produção, enviaríamos email com link contendo o token
    // Por enquanto, retornamos o token para desenvolvimento
    const resetLink = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}&id=${tokenId}`;

    res.json({
      success: true,
      message: 'Instruções de recuperação enviadas para o email.',
      // Apenas para desenvolvimento - mostrar token na tela
      resetToken: resetToken,
      tokenId: tokenId,
      resetLink: resetLink,
      expiresAt: expiresAt.toISOString(),
      note: 'Em produção, o token seria enviado por email. Este é apenas para desenvolvimento.'
    });

  } catch (error: any) {
    console.error('Erro ao solicitar reset de senha:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota POST /api/auth/reset-password - Redefinir senha com token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, tokenId, newPassword } = req.body;

    if (!token || !tokenId || !newPassword) {
      return res.status(400).json({ 
        error: 'Token, tokenId e nova senha são obrigatórios' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'A senha deve ter pelo menos 6 caracteres' 
      });
    }

    // Buscar token
    const resetToken = passwordResetTokens.get(tokenId);
    
    if (!resetToken) {
      return res.status(400).json({ 
        error: 'Token inválido ou expirado' 
      });
    }

    // Verificar se token já foi usado
    if (resetToken.used) {
      return res.status(400).json({ 
        error: 'Token já foi utilizado' 
      });
    }

    // Verificar se token expirou
    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ 
        error: 'Token expirado. Solicite um novo.' 
      });
    }

    // Verificar se token corresponde
    if (resetToken.token !== token) {
      return res.status(400).json({ 
        error: 'Token inválido' 
      });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Atualizar senha do tenant
    await db.update(tenants)
      .set({ 
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, resetToken.tenantId));

    // Atualizar senha do usuário admin também
    await db.update(users)
      .set({ 
        passwordHash: newPasswordHash
      })
      .where(eq(users.tenantId, resetToken.tenantId))
      .where(eq(users.email, resetToken.email));

    // Marcar token como usado
    resetToken.used = true;
    passwordResetTokens.set(tokenId, resetToken);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.',
      redirectTo: '/login'
    });

  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota GET /api/auth/validate-reset-token - Validar token (para frontend)
router.get('/validate-reset-token', async (req, res) => {
  try {
    const { token, tokenId } = req.query;

    if (!token || !tokenId) {
      return res.status(400).json({ 
        error: 'Token e tokenId são obrigatórios' 
      });
    }

    // Buscar token
    const resetToken = passwordResetTokens.get(tokenId as string);
    
    if (!resetToken) {
      return res.json({
        valid: false,
        error: 'Token inválido ou expirado'
      });
    }

    // Verificar se token já foi usado
    if (resetToken.used) {
      return res.json({
        valid: false,
        error: 'Token já foi utilizado'
      });
    }

    // Verificar se token expirou
    if (new Date() > resetToken.expiresAt) {
      return res.json({
        valid: false,
        error: 'Token expirado. Solicite um novo.'
      });
    }

    // Verificar se token corresponde
    if (resetToken.token !== token) {
      return res.json({
        valid: false,
        error: 'Token inválido'
      });
    }

    res.json({
      valid: true,
      email: resetToken.email,
      expiresAt: resetToken.expiresAt
    });

  } catch (error: any) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({ 
      valid: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Função para limpar tokens expirados
function cleanupExpiredTokens() {
  const now = new Date();
  for (const [id, token] of passwordResetTokens.entries()) {
    if (now > token.expiresAt) {
      passwordResetTokens.delete(id);
    }
  }
}

// Limpar tokens expirados a cada hora
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

export default router;