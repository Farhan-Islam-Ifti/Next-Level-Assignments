import { StatusCodes } from "http-status-codes";
import { AppError } from "./app-error";
import { IssueStatus, IssueType, UserRole } from "../types/domain";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const allowedRoles: readonly UserRole[] = ["contributor", "maintainer"];
export const allowedIssueTypes: readonly IssueType[] = ["bug", "feature_request"];
export const allowedIssueStatuses: readonly IssueStatus[] = ["open", "in_progress", "resolved"];

interface StringValidationOptions {
  min?: number;
  max?: number;
}

export const assertString = (
  value: unknown,
  field: string,
  options: StringValidationOptions = {}
): string => {
  if (typeof value !== "string") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", `${field} must be a string`);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", `${field} is required`);
  }

  if (options.min !== undefined && trimmedValue.length < options.min) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", `${field} must be at least ${options.min} characters`);
  }

  if (options.max !== undefined && trimmedValue.length > options.max) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", `${field} must be at most ${options.max} characters`);
  }

  return trimmedValue;
};

export const assertEmail = (value: unknown): string => {
  const email = assertString(value, "email").toLowerCase();

  if (!emailRegex.test(email)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", "email must be valid");
  }

  return email;
};

export const assertRole = (value: unknown): UserRole => {
  const role = value === undefined ? "contributor" : assertString(value, "role");

  if (!allowedRoles.includes(role as UserRole)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", "role must be contributor or maintainer");
  }

  return role as UserRole;
};

export const assertIssueType = (value: unknown): IssueType => {
  const type = assertString(value, "type");

  if (!allowedIssueTypes.includes(type as IssueType)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", "type must be bug or feature_request");
  }

  return type as IssueType;
};

export const assertIssueStatus = (value: unknown): IssueStatus => {
  const status = assertString(value, "status");

  if (!allowedIssueStatuses.includes(status as IssueStatus)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", "status must be open, in_progress, or resolved");
  }

  return status as IssueStatus;
};

export const parsePositiveId = (value: string): number => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", "id must be a positive integer");
  }

  return id;
};
