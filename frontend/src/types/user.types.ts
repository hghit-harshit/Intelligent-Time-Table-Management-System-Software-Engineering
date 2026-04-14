export type UserRole = "student" | "faculty" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
