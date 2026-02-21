import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useServiceOrders } from "@/hooks/use-service-orders";
import { useClients } from "@/hooks/use-clients";
import { Activity, Wrench, AlertCircle, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function DashboardPage() {
  const { data: serviceOrders } = useServiceOrders();
  const { data: clients } = useClients();

  // Metrics calculation
  const totalOpen = serviceOrders?.filter(so => so.status === 'OPEN').length || 0;
  const inProgress = serviceOrders?.filter(so => ['INSPECTION', 'MACHINING', 'ASSEMBLY'].includes(so.status)).length || 0;
  const completed = serviceOrders?.filter(so => so.status === 'COMPLETED').length || 0;
  
  const chartData = [
    { name: 'Mon', orders: 4 },
    { name: 'Tue', orders: 3 },
    { name: 'Wed', orders: 7 },
    { name: 'Thu', orders: 5 },
    { name: 'Fri', orders: 8 },
    { name: 'Sat', orders: 2 },
    { name: 'Sun', orders: 1 },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Real-time workshop performance metrics.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="metric-card bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-card border-l-4 border-l-primary">
            <CardContent className="p-0 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Orders</p>
                <div className="text-3xl font-bold text-primary">{totalOpen}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="metric-card bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-card border-l-4 border-l-accent">
            <CardContent className="p-0 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <div className="text-3xl font-bold text-accent">{inProgress}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-accent" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="metric-card bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-card border-l-4 border-l-emerald-500">
            <CardContent className="p-0 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <div className="text-3xl font-bold text-emerald-600">{completed}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="metric-card bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-card border-l-4 border-l-purple-500">
            <CardContent className="p-0 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                <div className="text-3xl font-bold text-purple-600">{clients?.length || 0}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <UsersIcon className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div 
          className="col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle>Weekly Output</CardTitle>
              <CardDescription>Engines rectified over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          className="col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from the workshop</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted border border-border">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">OS-2024-00{i} Updated</p>
                      <p className="text-xs text-muted-foreground">
                        Status changed to {['Inspection', 'Machining', 'Assembly', 'QC'][i-1]}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {i * 2}h ago
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
