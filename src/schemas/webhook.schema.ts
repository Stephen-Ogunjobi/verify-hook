import { z } from "zod";

export const webhookPayloadSchema = z
  .object({
    type: z
      .string()
      .trim()
      .min(1, "Event type is required")
      .max(100, "Event type cannot exceed 100 characters"),

    data: z.record(z.string(), z.unknown()),
  })
  .strict();

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
