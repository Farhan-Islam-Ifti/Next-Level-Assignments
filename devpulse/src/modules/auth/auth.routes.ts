import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { assertEmail, assertRole, assertString } from "../../utils/validators";
import * as authService from "./auth.service";
import { LoginRequestBody, SignupRequestBody } from "./auth.types";

export const authRouter = Router();

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const payload: SignupRequestBody = {
      name: assertString(req.body.name, "name"),
      email: assertEmail(req.body.email),
      password: assertString(req.body.password, "password"),
      role: assertRole(req.body.role)
    };

    const user = await authService.signup(payload);

    return sendSuccess(res, StatusCodes.CREATED, "User registered successfully", user);
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload: LoginRequestBody = {
      email: assertEmail(req.body.email),
      password: assertString(req.body.password, "password")
    };

    const loginData = await authService.login(payload);

    return sendSuccess(res, StatusCodes.OK, "Login successful", loginData);
  })
);
