import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../utils/app-error";
import {
  allowedIssueStatuses,
  allowedIssueTypes,
  assertIssueStatus,
  assertIssueType,
  assertString,
  parsePositiveId
} from "../../utils/validators";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { IssueStatus, IssueType } from "../../types/domain";
import * as issuesService from "./issues.service";
import {
  CreateIssueRequestBody,
  IssueFilters,
  UpdateIssueRequestBody
} from "./issues.types";

export const issuesRouter = Router();

issuesRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Missing authorization token");
    }

    const payload: CreateIssueRequestBody = {
      title: assertString(req.body.title, "title", { max: 150 }),
      description: assertString(req.body.description, "description", { min: 20 }),
      type: assertIssueType(req.body.type)
    };

    const issue = await issuesService.createIssue(req.user.id, payload);

    return sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
  })
);

issuesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const sortValue = req.query.sort === undefined
      ? "newest"
      : String(req.query.sort);

    if (sortValue !== "newest" && sortValue !== "oldest") {
      throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", "sort must be newest or oldest");
    }

    let type: IssueType | undefined;
    let status: IssueStatus | undefined;

    if (req.query.type !== undefined) {
      const rawType = String(req.query.type);

      if (!allowedIssueTypes.includes(rawType as IssueType)) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", "type must be bug or feature_request");
      }

      type = rawType as IssueType;
    }

    if (req.query.status !== undefined) {
      const rawStatus = String(req.query.status);

      if (!allowedIssueStatuses.includes(rawStatus as IssueStatus)) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Validation error", "status must be open, in_progress, or resolved");
      }

      status = rawStatus as IssueStatus;
    }

    const filters: IssueFilters = {
      sort: sortValue,
      type,
      status
    };

    const issues = await issuesService.getAllIssues(filters);

    return sendSuccess(res, StatusCodes.OK, "Issues retrived successfully", issues);
  })
);

issuesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parsePositiveId(String(req.params.id));

    const issue = await issuesService.getSingleIssue(id);

    return sendSuccess(res, StatusCodes.OK, "Issue retrived successfully", issue);
  })
);

issuesRouter.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Missing authorization token");
    }

    const id = parsePositiveId(String(req.params.id));
    const payload: UpdateIssueRequestBody = {};

    if (req.body.title !== undefined) {
      payload.title = assertString(req.body.title, "title", { max: 150 });
    }

    if (req.body.description !== undefined) {
      payload.description = assertString(req.body.description, "description", { min: 20 });
    }

    if (req.body.type !== undefined) {
      payload.type = assertIssueType(req.body.type);
    }

    if (req.body.status !== undefined) {
      payload.status = assertIssueStatus(req.body.status);
    }

    const issue = await issuesService.updateIssue(id, req.user, payload);

    return sendSuccess(res, StatusCodes.OK, "Issue updated successfully", issue);
  })
);

issuesRouter.delete(
  "/:id",
  requireAuth,
  requireRole("maintainer"),
  asyncHandler(async (req, res) => {
    const id = parsePositiveId(String(req.params.id));

    await issuesService.deleteIssue(id);

    return sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
  })
);
