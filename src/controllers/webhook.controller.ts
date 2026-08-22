import type { RequestHandler } from "express";
import { webhookPayloadSchema } from "../schemas/webhook.schema";
import { saveWebhookEvent } from "../repositories/webhook.repository";

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

  if (!webhookId) {
    response.status(400).json({
      error: "Missing webhook ID",
    });

    return;
  }

  const savedEvent = saveWebhookEvent({
    webhookId,
    payload: validationResult.data,
  });

  if (!savedEvent.created) {
    // acknoledge a repeated delivery without storing another event
    response.status(200).json({
      message: "webhook was already received",
      webhook: {
        eventId: savedEvent.eventId,
        id: webhookId,
        duplicate: true,
      },
    });

    return;
  }

  response.status(202).json({
    message: "Webhook accepted for processing",
    webhook: {
      eventId: savedEvent.eventId,
      id: webhookId,
      type: validationResult.data.type,
      duplicate: false,
    },
  });
};
