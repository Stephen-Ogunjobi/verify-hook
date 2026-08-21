import { env } from "../src/config/env";
import { calculateWebhookSignature } from "../src/utils/webhook-signature";

// these values must be the same to what we later send with curl.
const webhookId = "webhook-test-001";
const timestamp = Math.floor(Date.now() / 1000).toString();

const body = JSON.stringify({
  type: "user.created",
  data: {
    userId: "user-123",
    email: "learner@example.com",
  },
});

const signature = calculateWebhookSignature({
  secret: env.WEBHOOK_SECRET,
  timestamp,
  webhookId,
  rawBody: Buffer.from(body),
});

console.log("Timestamp:", timestamp);
console.log("Webhook ID:", webhookId);
console.log("Body:", body);
console.log("Signature:", signature);
