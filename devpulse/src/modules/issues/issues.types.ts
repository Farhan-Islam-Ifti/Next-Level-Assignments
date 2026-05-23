import { IssueStatus, IssueType } from "../../types/domain";

export interface CreateIssueRequestBody {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueRequestBody {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

export interface IssueFilters {
  sort: "newest" | "oldest";
  type?: IssueType;
  status?: IssueStatus;
}
