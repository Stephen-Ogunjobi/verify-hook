import type { RequestHandler } from "express";
import { webhookPayloadSchema } from "../schemas/webhook.schema";

export const receiveWebhook: RequestHandler = (request, response) => {
  if (!Buffer.isBuffer(request.body)) {
    response.status(400).json({
      error: "Webhook body must be raw bytes",
    });

    return;
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(request.body.toString("utf8"));
  } catch {
    response.status(400).json({
      error: "Webhook body contains invalid JSON",
    });

    return;
  }

  const validationResult = webhookPayloadSchema.safeParse(parsedBody);

  if (!validationResult.success) {
    response.status(400).json({
      error: "Invalid webhook payload",
      details: validationResult.error.flatten(),
    });

    return;
  }

  const webhookId = request.get("X-Webhook-Id");

  response.status(200).json({
    message: "Webhook verified and validated",
    webhook: {
      id: webhookId,
      type: validationResult.data.type,
    },
  });
};
