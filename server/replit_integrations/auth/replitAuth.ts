// Auth simplificada para testes locais

export function isAuthenticated() {
  return true; // Sempre autenticado em testes
}

export function getSession(req: any) {
  return {
    user: req.user || { id: 1, username: "admin" }
  };
}

export function setupAuth(app: any) {
  console.log("🚀 Auth desabilitada - Rodando em modo teste");
  
  // Middleware que adiciona usuário fictício
  app.use((req: any, res: any, next: any) => {
    req.user = { 
      id: 1, 
      username: "admin",
      role: "admin"
    };
    next();
  });
}

export default {
  isAuthenticated,
  getSession,
  setupAuth
};