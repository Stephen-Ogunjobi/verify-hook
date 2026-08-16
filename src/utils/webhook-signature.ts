import { createHmac, timingSafeEqual } from "node:crypto";

type CalculateSignatureInput = {
  secret: string;
  timestamp: string;
  webhookId: string;
  rawBody: Buffer;
};

export function calculateWebhookSignature({
  secret,
  timestamp,
  webhookId,
  rawBody,
}: CalculateSignatureInput): string {
  const digest = createHmac("sha256", secret)
    .update(timestamp)
    .update(".")
    .update(webhookId)
    .update(".")
    .update(rawBody)
    .digest("hex");

  return `sha256=${digest}`;
}

type VerifySignatureInput = CalculateSignatureInput & {
  receivedSignature: string;
};

export function verifyWebhookSignature({
  secret,
  timestamp,
  webhookId,
  rawBody,
  receivedSignature,
}: VerifySignatureInput): boolean {
  const expectedSignature = calculateWebhookSignature({
    secret,
    timestamp,
    webhookId,
    rawBody,
  });

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
