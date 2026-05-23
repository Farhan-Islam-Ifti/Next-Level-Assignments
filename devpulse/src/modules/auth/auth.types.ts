import { UserRole } from "../../types/domain";

export interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}
