import { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  message: string;
  data?: T;
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response<SuccessResponse<T>> => {
  const responseBody: SuccessResponse<T> = {
    success: true,
    message
  };

  if (data !== undefined) {
    responseBody.data = data;
  }

  return res.status(statusCode).json(responseBody);
};
