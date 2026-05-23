import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";
import { TokenUser, UserRole } from "../types/domain";

interface TokenPayload extends JwtPayload {
  id: number;
  name: string;
  role: UserRole;
}

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Missing authorization token");
  }

  const token = authorization.trim();

  if (!token) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Missing authorization token");
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;

    if (!decoded.id || !decoded.name || !decoded.role) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid authorization token");
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role
    } satisfies TokenUser;

    next();
  } catch {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired authorization token");
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Missing authorization token");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(StatusCodes.FORBIDDEN, "Insufficient permissions");
    }

    next();
  };
};
