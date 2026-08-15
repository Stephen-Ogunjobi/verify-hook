import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_PATH: z.string().min(1).default("./data/webhooks.db"),

  WEBHOOK_SECRET: z
    .string()
    .min(32, "WEBHOOK_SECRET must contain at least 32 characters"),

  SIGNATURE_TOLERANCE_SECONDS: z.coerce.number().int().positive().default(300),

  MAX_RETRIES: z.coerce.number().int().min(0).default(5),
});

export const env = envSchema.parse(process.env);
