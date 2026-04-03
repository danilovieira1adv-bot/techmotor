import { z } from 'zod';

// Schemas de validação para APIs
export const registerTenantSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  nome_retifica: z.string().min(2, 'Nome da retífica deve ter pelo menos 2 caracteres'),
  telefone: z.string().optional(),
  plano: z.enum(['basico', 'profissional', 'enterprise']).default('basico')
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória')
});

export const errorSchemas = {
  validation: z.object({ 
    message: z.string(), 
    field: z.string().optional() 
  }),
  notFound: z.object({ 
    message: z.string() 
  }),
  internal: z.object({ 
    message: z.string() 
  }),
};

export const api = {
  tenants: {
    register: {
      method: 'POST' as const,
      path: '/api/tenants/register' as const,
      input: registerTenantSchema,
      responses: { 
        201: z.object({
          success: z.boolean(),
          message: z.string(),
          tenant: z.object({
            id: z.string(),
            nome: z.string(),
            email: z.string(),
            plano: z.string(),
            slug: z.string(),
            telefone: z.string().optional()
          }),
          token: z.string(),
          subscription: z.object({
            plano: z.string(),
            status: z.string(),
            data_fim: z.string()
          })
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/tenants/login' as const,
      input: loginSchema,
      responses: { 
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          tenant: z.object({
            id: z.string(),
            nome: z.string(),
            email: z.string(),
            plano: z.string(),
            status: z.string(),
            slug: z.string(),
            telefone: z.string().optional()
          }),
          token: z.string(),
          subscription: z.any().nullable()
        }),
        401: errorSchemas.validation,
        500: errorSchemas.internal
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/tenants/me' as const,
      responses: { 
        200: z.object({
          success: z.boolean(),
          tenant: z.object({
            id: z.string(),
            nome: z.string(),
            email: z.string(),
            plano: z.string(),
            status: z.string(),
            slug: z.string(),
            telefone: z.string().optional(),
            createdAt: z.any()
          }),
          subscription: z.any().nullable(),
          hasActiveSubscription: z.boolean()
        }),
        401: errorSchemas.validation,
        404: errorSchemas.notFound,
        500: errorSchemas.internal
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/tenants' as const,
      responses: { 
        200: z.object({
          success: z.boolean(),
          tenants: z.array(z.any())
        }),
        500: errorSchemas.internal
      },
    },
  },
  payment: {
    plans: {
      method: 'GET' as const,
      path: '/api/payment/plans' as const,
      responses: { 
        200: z.object({
          plans: z.array(z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            features: z.array(z.string()),
            recommended: z.boolean().optional()
          }))
        })
      },
    },
  },
  landing: {
    info: {
      method: 'GET' as const,
      path: '/api/landing/info' as const,
      responses: { 
        200: z.object({
          title: z.string(),
          description: z.string(),
          features: z.array(z.string()),
          pricing: z.array(z.object({
            name: z.string(),
            price: z.number(),
            period: z.string()
          }))
        })
      },
    },
  },
  health: {
    check: {
      method: 'GET' as const,
      path: '/api/health' as const,
      responses: { 
        200: z.object({
          status: z.string(),
          service: z.string(),
          environment: z.string(),
          timestamp: z.string()
        })
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}