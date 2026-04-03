import type { Express } from "express";

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", (req: any, res) => {
    res.json({
      id: 1,
      username: "admin",
      role: "admin"
    });
  });
}
