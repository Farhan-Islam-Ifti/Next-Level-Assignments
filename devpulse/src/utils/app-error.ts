export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown;

  constructor(statusCode: number, message: string, errors: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
