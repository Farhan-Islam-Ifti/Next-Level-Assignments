import { StatusCodes } from "http-status-codes";
import { pool } from "../../db/pool";
import { AppError } from "../../utils/app-error";
import {
  Issue,
  IssueWithReporter,
  PublicUser,
  Reporter,
  TokenUser
} from "../../types/domain";
import {
  CreateIssueRequestBody,
  IssueFilters,
  UpdateIssueRequestBody
} from "./issues.types";

interface IdRow {
  id: number;
}

const getReporterMap = async (
  reporterIds: number[]
): Promise<Map<number, Reporter>> => {
  const uniqueReporterIds = [...new Set(reporterIds)];

  if (uniqueReporterIds.length === 0) {
    return new Map<number, Reporter>();
  }

  const reportersResult = await pool.query<Reporter>(
    `
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1::int[])
    `,
    [uniqueReporterIds]
  );

  return new Map<number, Reporter>(
    reportersResult.rows.map((reporter) => [reporter.id, reporter])
  );
};

const attachReporter = async (issue: Issue): Promise<IssueWithReporter> => {
  const reporterResult = await pool.query<Reporter>(
    `
      SELECT id, name, role
      FROM users
      WHERE id = $1
    `,
    [issue.reporter_id]
  );

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterResult.rows[0] ?? null,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};

export const createIssue = async (
  reporterId: number,
  payload: CreateIssueRequestBody
): Promise<Issue> => {
  const userResult = await pool.query<Pick<PublicUser, "id">>(
    "SELECT id FROM users WHERE id = $1",
    [reporterId]
  );

  if (userResult.rowCount === null || userResult.rowCount === 0) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid requester");
  }

  const issueResult = await pool.query<Issue>(
    `
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `,
    [payload.title, payload.description, payload.type, reporterId]
  );

  return issueResult.rows[0];
};

export const getAllIssues = async (
  filters: IssueFilters
): Promise<IssueWithReporter[]> => {
  const conditions: string[] = [];
  const values: string[] = [];

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const orderDirection = filters.sort === "oldest" ? "ASC" : "DESC";

  const issuesResult = await pool.query<Issue>(
    `
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues
      ${whereClause}
      ORDER BY created_at ${orderDirection}
    `,
    values
  );

  const reporterMap = await getReporterMap(
    issuesResult.rows.map((issue) => issue.reporter_id)
  );

  return issuesResult.rows.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap.get(issue.reporter_id) ?? null,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
};

export const getSingleIssue = async (
  id: number
): Promise<IssueWithReporter> => {
  const issueResult = await pool.query<Issue>(
    `
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues
      WHERE id = $1
    `,
    [id]
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  return attachReporter(issue);
};

export const updateIssue = async (
  id: number,
  requester: TokenUser,
  payload: UpdateIssueRequestBody
): Promise<Issue> => {
  const existingIssueResult = await pool.query<Issue>(
    `
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues
      WHERE id = $1
    `,
    [id]
  );

  const existingIssue = existingIssueResult.rows[0];

  if (!existingIssue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  const isMaintainer = requester.role === "maintainer";
  const isIssueOwner = existingIssue.reporter_id === requester.id;

  if (!isMaintainer) {
    if (!isIssueOwner) {
      throw new AppError(StatusCodes.FORBIDDEN, "You can update only your own issue");
    }

    if (existingIssue.status !== "open") {
      throw new AppError(StatusCodes.CONFLICT, "Only open issues can be updated by contributors");
    }

    if (payload.status !== undefined) {
      throw new AppError(StatusCodes.FORBIDDEN, "Contributors cannot change issue status");
    }
  }

  const fields: string[] = [];
  const values: string[] = [];

  if (payload.title !== undefined) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }

  if (payload.description !== undefined) {
    values.push(payload.description);
    fields.push(`description = $${values.length}`);
  }

  if (payload.type !== undefined) {
    values.push(payload.type);
    fields.push(`type = $${values.length}`);
  }

  if (payload.status !== undefined) {
    values.push(payload.status);
    fields.push(`status = $${values.length}`);
  }

  if (fields.length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No valid fields provided for update");
  }

  values.push(String(id));

  const updatedIssueResult = await pool.query<Issue>(
    `
      UPDATE issues
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `,
    values
  );

  return updatedIssueResult.rows[0];
};

export const deleteIssue = async (id: number): Promise<void> => {
  const deletedIssueResult = await pool.query<IdRow>(
    `
      DELETE FROM issues
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  if (deletedIssueResult.rowCount === null || deletedIssueResult.rowCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }
};
