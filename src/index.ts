import app from "./app";
import { initializeDatabase } from "./database/schema";
import { env } from "./config/env";

const port = env.PORT;

initializeDatabase();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
