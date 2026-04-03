export function isAuthenticated(req: any, res: any, next: any) {
  req.user = {
    id: 1,
    username: "admin",
    role: "admin",
    claims: { sub: "1" }
  };
  next();
}

export function getSession(req: any) {
  return {
    user: req.user || { id: 1, username: "admin" }
  };
}

export async function setupAuth(app: any) {
  console.log("🚀 Auth desabilitada - Rodando em modo teste");
  app.use((req: any, res: any, next: any) => {
    req.user = {
      id: 1,
      username: "admin",
      role: "admin",
      claims: { sub: "1" }
    };
    next();
  });
}

export default {
  isAuthenticated,
  getSession,
  setupAuth
};
