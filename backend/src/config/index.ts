import 'dotenv/config';
import { envSchema, type Env } from './env.js';

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment validation failed:');
  parsed.error.issues.forEach((issue: { path: (string | number)[]; message: string }) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const config: Env = parsed.data;
