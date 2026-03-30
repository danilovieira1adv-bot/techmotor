import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // MUDANÇA AQUI: de 'connectionString' para 'url'
    url: process.env.DATABASE_URL || 'postgresql://postgres:docker@postgres:5432/techmotor',
  },
  verbose: true,
  strict: true,
} satisfies Config;
