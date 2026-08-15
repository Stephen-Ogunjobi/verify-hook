import "dotenv/config";
import app from "./app";
import { initializeDatabase } from "./database/schema";

const port = Number(process.env.PORT) || 4000;

initializeDatabase();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
