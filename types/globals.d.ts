export {};

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Role;
    };
  }
}
