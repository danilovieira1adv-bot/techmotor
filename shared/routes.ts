import { z } from 'zod';
import { 
  insertClientSchema, clients,
  insertServiceOrderSchema, serviceOrders,
  insertPartSchema, parts,
  insertInspectionSchema, inspections,
  insertKnowledgeBaseSchema, knowledgeBase 
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  clients: {
    list: {
      method: 'GET' as const,
      path: '/api/clients' as const,
      responses: { 200: z.array(z.custom<typeof clients.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/clients' as const,
      input: insertClientSchema,
      responses: { 201: z.custom<typeof clients.$inferSelect>() },
    },
  },
  serviceOrders: {
    list: {
      method: 'GET' as const,
      path: '/api/service-orders' as const,
      responses: { 200: z.array(z.custom<typeof serviceOrders.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/service-orders/:id' as const,
      responses: { 200: z.custom<typeof serviceOrders.$inferSelect>(), 404: errorSchemas.notFound },
    },
    create: {
      method: 'POST' as const,
      path: '/api/service-orders' as const,
      input: insertServiceOrderSchema,
      responses: { 201: z.custom<typeof serviceOrders.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/service-orders/:id' as const,
      input: insertServiceOrderSchema.partial(),
      responses: { 200: z.custom<typeof serviceOrders.$inferSelect>(), 404: errorSchemas.notFound },
    },
  },
  inspections: {
    create: {
      method: 'POST' as const,
      path: '/api/inspections' as const,
      input: insertInspectionSchema,
      responses: { 201: z.custom<typeof inspections.$inferSelect>() },
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/inspections/analyze' as const,
      input: z.object({ osId: z.number(), measurements: z.any() }),
      responses: { 200: z.object({ aiReport: z.string(), approved: z.boolean() }) }
    }
  },
  parts: {
    list: {
      method: 'GET' as const,
      path: '/api/parts' as const,
      responses: { 200: z.array(z.custom<typeof parts.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/parts' as const,
      input: insertPartSchema,
      responses: { 201: z.custom<typeof parts.$inferSelect>() },
    }
  },
  knowledgeBase: {
    list: {
      method: 'GET' as const,
      path: '/api/knowledge-base' as const,
      responses: { 200: z.array(z.custom<typeof knowledgeBase.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/knowledge-base' as const,
      input: insertKnowledgeBaseSchema,
      responses: { 201: z.custom<typeof knowledgeBase.$inferSelect>() },
    }
  }
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
