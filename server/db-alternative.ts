import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

// Configuração para desenvolvimento sem PostgreSQL
let pool: pg.Pool;
let db: ReturnType<typeof drizzle>;

if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
  console.log('⚠️  Modo desenvolvimento: usando banco em memória (SQLite simulada)');
  
  // Criar um pool mock para desenvolvimento
  pool = {
    connect: async () => {
      console.log('📦 Conexão mock do banco (modo desenvolvimento)');
      return {
        release: () => {},
        query: async () => ({ rows: [], rowCount: 0 }),
      } as any;
    },
    query: async () => ({ rows: [], rowCount: 0 }),
    end: async () => {},
    on: () => pool,
  } as any;
  
  db = drizzle(pool as any, { schema });
  
  // Mock das funções do banco para desenvolvimento
  console.log('✅ Banco mock configurado para desenvolvimento');
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
  console.log('✅ Conectado ao PostgreSQL');
}

export { pool, db };