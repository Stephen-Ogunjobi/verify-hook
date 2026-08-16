import type { RequestHandler } from "express";
import { env } from "../config/env";
import { verifyWebhookSignature } from "../utils/webhook-signature";

export const verifyWebhookRequest: RequestHandler = (
  request,
  response,
  next,
) => {
  const timestamp = request.get("X-Webhook-Timestamp");

  const webhookId = request.get("X-Webhook-Id");

  const signature = request.get("X-Webhook-Signature");

  if (!webhookId || !timestamp || !signature) {
    response.status(401).json({
      error: "Missing webhook signature headers",
    });

    return;
  }

  if (!Buffer.isBuffer(request.body)) {
    response.status(400).json({
      error: "Webhook body must be raw bytes",
    });

    return;
  }

  const timestampNumber = Number(timestamp);

  if (!Number.isInteger(timestampNumber) || timestampNumber <= 0) {
    response.status(401).json({
      error: "Invalid webhook timestamp",
    });

    return;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  const timestampDifference = Math.abs(currentTimestamp - timestampNumber);

  if (timestampDifference > env.SIGNATURE_TOLERANCE_SECONDS) {
    response.status(401).json({
      error: "Webhook timestamp is outside the allowed tolerance",
    });

    return;
  }

  const signatureIsValid = verifyWebhookSignature({
    secret: env.WEBHOOK_SECRET,
    timestamp,
    webhookId,
    rawBody: request.body,
    receivedSignature: signature,
  });

  if (!signatureIsValid) {
    response.status(401).json({
      error: "Invalid webhook signature",
    });

    return;
  }

  next();
};
