import { database } from "../database/connection";
import type { WebhookPayload } from "../schemas/webhook.schema";

type SaveWebhookInput = {
  webhookId: string;
  payload: WebhookPayload;
};

type SaveWebhookResult = {
  eventId: number;
  created: boolean;
};

export function saveWebhookEvent({
  webhookId,
  payload,
}: SaveWebhookInput): SaveWebhookResult {
  const insertEvent = database.prepare(`
    INSERT OR IGNORE INTO webhook_events (
      webhook_id,
      event_type,
      payload
    )
    VALUES (?, ?, ?)
  `);

  const result = insertEvent.run(
    webhookId,
    payload.type,
    JSON.stringify(payload),
  );

  if (result.changes === 1) {
    return {
      eventId: Number(result.lastInsertRowid),
      created: true,
    };
  }

  // insert or ignore reaches here when webhook_id already exists.
  const existingEvent = database
    .prepare(
      `
      SELECT id
      FROM webhook_events
      WHERE webhook_id = ?
    `,
    )
    .get(webhookId) as { id: number } | undefined;

  if (!existingEvent) {
    throw new Error("Webhook was not inserted and could not be found");
  }

  return {
    eventId: existingEvent.id,
    created: false,
  };
}
