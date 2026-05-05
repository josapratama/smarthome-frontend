/**
 * API Error classes
 */

export class ApiError extends Error {
  public status: number;
  public payload?: any;

  constructor(status: number, message: string, payload?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}
