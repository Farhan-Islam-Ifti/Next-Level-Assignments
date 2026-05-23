import { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "./app-error";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("ERROR_HANDLER_CAUGHT:", error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal server error",
    errors: process.env.NODE_ENV === "production" ? null : String(error)
  });
};
