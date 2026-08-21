import express from "express";
import webhookRouter from "./routes/webhook.routes";

const app = express();

//webhook route must come before express.json to keep the raw body
app.use("/webhooks", webhookRouter);

app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});

export default app;
