import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { pool } from "../../db/pool";
import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { PublicUser, UserRole } from "../../types/domain";
import { LoginRequestBody, SignupRequestBody } from "./auth.types";

interface DbUser extends PublicUser {
  password: string;
}

interface SignupRow {
  id: number;
}

interface LoginResponse {
  token: string;
  user: PublicUser;
}

export const signup = async (payload: SignupRequestBody): Promise<PublicUser> => {
  const existingUserResult = await pool.query<SignupRow>(
    "SELECT id FROM users WHERE email = $1",
    [payload.email]
  );

  if (existingUserResult.rowCount !== null && existingUserResult.rowCount > 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already exists", "email must be unique");
  }

  const hashedPassword = await bcrypt.hash(payload.password, env.bcryptSaltRounds);

  const createdUserResult = await pool.query<PublicUser>(
    `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `,
    [payload.name, payload.email, hashedPassword, payload.role]
  );

  return createdUserResult.rows[0];
};

export const login = async (payload: LoginRequestBody): Promise<LoginResponse> => {
  const userResult = await pool.query<DbUser>(
    `
      SELECT id, name, email, password, role, created_at, updated_at
      FROM users
      WHERE email = $1
    `,
    [payload.email]
  );

  const user = userResult.rows[0];

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const signOptions: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
  };

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role as UserRole
    },
    env.jwtSecret,
    signOptions
  );

  const publicUser: PublicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };

  return {
    token,
    user: publicUser
  };
};
