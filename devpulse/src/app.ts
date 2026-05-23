import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { issuesRouter } from "./modules/issues/issues.routes";
import { errorHandler } from "./utils/error-handler";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin === "*" ? "*" : env.corsOrigin.split(","),
    credentials: true
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "DevPulse API is running"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);

app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    errors: null
  });
});

app.use(errorHandler);
