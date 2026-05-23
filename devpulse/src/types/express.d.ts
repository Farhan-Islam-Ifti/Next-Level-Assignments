import { TokenUser } from "./domain";

declare global {
  namespace Express {
    interface Request {
      user?: TokenUser;
    }
  }
}
