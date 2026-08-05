import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    TMDB_API_KEY: z.string().min(1),
    FANART_API_KEY: z.string().default(""),
    UPSTASH_REDIS_REST_URL: z.union([z.string().url(), z.literal("")]).default(""),
    UPSTASH_REDIS_REST_TOKEN: z.string().default(""),
  },
  client: {
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional().default(""),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional().default(""),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional().default(""),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional().default(""),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional().default(""),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional().default(""),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().default(""),
    NEXT_PUBLIC_ADMIN_EMAILS: z.string().default(""),
    NEXT_PUBLIC_WEBSITE_URL: z.union([z.string().url(), z.literal("")]).default(""),
  },
  runtimeEnv: {
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    FANART_API_KEY: process.env.FANART_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_ADMIN_EMAILS: process.env.NEXT_PUBLIC_ADMIN_EMAILS,
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
  },
  emptyStringAsUndefined: false,
  skipValidation: process.env.NODE_ENV !== "production",
});
