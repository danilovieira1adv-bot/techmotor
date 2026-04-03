import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, MobileNav } from "@/components/layout-sidebar";
import { useAuth } from "@/hooks/use-auth";

import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import ServiceOrdersPage from "@/pages/service-orders";
import ChatPage from "@/pages/chat";
import InspectionPage from "@/pages/inspection";
import BudgetsPage from "@/pages/budgets";
import ClientsPage from "@/pages/clients";
import KnowledgeBasePage from "@/pages/knowledge-base";
import LandingPage from "@/pages/landing";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full min-w-0">
          <MobileNav />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse font-medium">Loading System...</p>
        </div>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/signup" component={LoginPage} />
        <Route component={LandingPage} />
      </Switch>
    );
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/service-orders" component={ServiceOrdersPage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/inspections" component={InspectionPage} />
        <Route path="/budgets" component={BudgetsPage} />
        <Route path="/clients" component={ClientsPage} />
        <Route path="/knowledge" component={KnowledgeBasePage} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
