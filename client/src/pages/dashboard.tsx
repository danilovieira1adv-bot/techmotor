import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { ClipboardList, Users, CheckCircle, Clock, TrendingUp, Wrench, AlertCircle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const weekData = [
  { day: "Seg", motores: 2 }, { day: "Ter", motores: 4 }, { day: "Qua", motores: 3 },
  { day: "Qui", motores: 5 }, { day: "Sex", motores: 4 }, { day: "Sáb", motores: 2 }, { day: "Dom", motores: 1 },
];

const statusData = [
  { name: "Abertas", value: 4, color: "#3b82f6" },
  { name: "Em andamento", value: 3, color: "#f59e0b" },
  { name: "Concluídas", value: 8, color: "#10b981" },
];

export default function DashboardPage() {
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => { const r = await fetch("/api/clients", { credentials: "include" }); return r.json(); }
  });
  const { data: orders } = useQuery({
    queryKey: ["/api/service-orders"],
    queryFn: async () => { const r = await fetch("/api/service-orders", { credentials: "include" }); return r.json(); }
  });
  const { data: budgets } = useQuery({
    queryKey: ["/api/budgets"],
    queryFn: async () => { const r = await fetch("/api/budgets", { credentials: "include" }); return r.json(); }
  });

  const totalClientes = Array.isArray(clients) ? clients.length : 0;
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const completedOrders = Array.isArray(orders) ? orders.filter((o: any) => o.status === "COMPLETED").length : 0;
  const pendingOrders = Array.isArray(orders) ? orders.filter((o: any) => o.status === "pending" || o.status === "OPEN").length : 0;
  const totalBudgets = Array.isArray(budgets) ? budgets.length : 0;
  const approvedBudgets = Array.isArray(budgets) ? budgets.filter((b: any) => b.status === "approved").length : 0;

  const stats = [
    { title: "Total de OS", value: totalOrders, icon: ClipboardList, color: "bg-blue-500", light: "bg-blue-50 dark:bg-blue-950", text: "text-blue-600", change: "+12% este mês" },
    { title: "Clientes Ativos", value: totalClientes, icon: Users, color: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-600", change: "+3 novos" },
    { title: "OS Concluídas", value: completedOrders, icon: CheckCircle, color: "bg-violet-500", light: "bg-violet-50 dark:bg-violet-950", text: "text-violet-600", change: "Este mês" },
    { title: "OS Pendentes", value: pendingOrders, icon: Clock, color: "bg-amber-500", light: "bg-amber-50 dark:bg-amber-950", text: "text-amber-600", change: "Aguardando" },
    { title: "Orçamentos", value: totalBudgets, icon: TrendingUp, color: "bg-pink-500", light: "bg-pink-50 dark:bg-pink-950", text: "text-pink-600", change: `${approvedBudgets} aprovados` },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da sua retífica em tempo real</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
          <Activity className="h-4 w-4 text-green-500" />
          <span>Sistema operacional</span>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="card-hover border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`h-10 w-10 rounded-xl ${stat.light} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.text}`} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium text-foreground">{stat.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.change}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-500" />
                Motores retificados — últimos 7 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weekData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Bar dataKey="motores" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Status das OS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Atividade recente */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Atividade recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { text: "Nova OS criada — Motor Cummins ISB", time: "2h atrás", color: "bg-blue-500" },
                { text: "Inspeção aprovada pela IA — OS-2024-003", time: "4h atrás", color: "bg-emerald-500" },
                { text: "Orçamento enviado via WhatsApp", time: "6h atrás", color: "bg-violet-500" },
                { text: "Cliente cadastrado — Transportadora Silva", time: "8h atrás", color: "bg-amber-500" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.05 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`h-2 w-2 rounded-full ${item.color} flex-shrink-0`} />
                  <span className="text-sm flex-1">{item.text}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
