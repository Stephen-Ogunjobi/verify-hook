import express, { Router } from "express";
import { verifyWebhookRequest } from "../middleware/verify-webhook-signature";
import { receiveWebhook } from "../controllers/webhook.controller";

const webhookRouter = Router();

webhookRouter.post(
  "/",
  //for keeping exact request bytes for signature verification
  express.raw({ type: "application/json" }),
  verifyWebhookRequest,
  receiveWebhook,
);

export default webhookRouter;
