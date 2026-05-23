import dotenv from "dotenv";

dotenv.config();

const requiredEnvKeys = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredEnvKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const parsedPort = Number(process.env.PORT ?? 5000);
const parsedSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
  throw new Error("PORT must be a positive number");
}

if (
  !Number.isInteger(parsedSaltRounds) ||
  parsedSaltRounds < 8 ||
  parsedSaltRounds > 12
) {
  throw new Error("BCRYPT_SALT_ROUNDS must be an integer between 8 and 12");
}

export const env = {
  port: parsedPort,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  bcryptSaltRounds: parsedSaltRounds,
  corsOrigin: process.env.CORS_ORIGIN ?? "*"
};
