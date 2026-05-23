import { app } from "./app";
import { env } from "./config/env";
import { pool } from "./db/pool";

const startServer = async (): Promise<void> => {
  await pool.query("SELECT 1");

  app.listen(env.port, () => {
    console.log(`DevPulse API running on port ${env.port}`);
  });
};

startServer().catch((error: unknown) => {
  console.error("Failed to start server");
  console.error(error);
  process.exit(1);
});
