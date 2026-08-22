import { randomUUID } from "node:crypto";
import { env } from "../src/config/env";
import { calculateWebhookSignature } from "../src/utils/webhook-signature";

const webhookUrl = `http://localhost:${env.PORT}/webhooks`;

async function sendTestWebhook(): Promise<void> {
  //proceess.argv is an array containing cli arg
  //used the supplied id when testing dublicate or create a new one
  const webhookId = process.argv[2] ?? randomUUID();
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const payload = {
    type: "user.created",
    data: {
      userId: "user-123",
      email: "learner@example.com",
    },
  };

  // convert the payload once and sign this exact string
  const rawBody = JSON.stringify(payload);

  const signature = calculateWebhookSignature({
    secret: env.WEBHOOK_SECRET,
    timestamp,
    webhookId,
    rawBody: Buffer.from(rawBody),
  });

  console.log("Sending webhook...");
  console.log("Webhook ID:", webhookId);
  console.log("Event type:", payload.type);

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Id": webhookId,
      "X-Webhook-Timestamp": timestamp,
      "X-Webhook-Signature": signature,
    },

    // Send the same string that was used to create the signature.
    body: rawBody,
  });

  const responseBody = await response.text();

  console.log("Status:", response.status, response.statusText);
  console.log("Response:", responseBody);
}

sendTestWebhook().catch((error: unknown) => {
  console.error("Failed to send webhook:", error);
  process.exitCode = 1;
});
