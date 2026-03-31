import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Wrench, Shield, Zap, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex login-bg">
      {/* Lado esquerdo - informações */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">RetíficaPro</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Gestão profissional para sua retífica de motores
            </h1>
            <p className="text-blue-200 text-lg">
              Controle completo de OS, inspeções com IA, orçamentos e muito mais.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Zap, text: "Análise de motores com Inteligência Artificial" },
              { icon: BarChart3, text: "Dashboard com métricas em tempo real" },
              { icon: Shield, text: "Sistema seguro com autenticação por retífica" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-blue-100">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-sm">
          RetíficaPro © 2024 — Sistema profissional para retíficas de motores diesel
        </p>
      </div>

      {/* Lado direito - formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-blue-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg pulse-blue">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">RetíficaPro</h2>
                <p className="text-sm text-slate-500">Sistema de Gestão</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bem-vindo de volta!</h3>
            <p className="text-slate-500 mb-6">Entre com suas credenciais para acessar</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <Input
                  className="mt-1 h-11 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                <Input
                  className="mt-1 h-11 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-800"
                >
                  {(error as Error).message}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
                disabled={isPending}
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Entrando...</>
                ) : "Entrar no sistema"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-center text-slate-400">
                Acesso restrito a usuários autorizados
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
