import { Link, useLocation } from "wouter";
import { 
  Home, 
  Wrench, 
  Users, 
  MessageSquare, 
  BookOpen,
  ClipboardList,
  FileText, 
  Settings, 
  LogOut,
  Menu,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Wrench, label: "Service Orders", href: "/service-orders" },
    { icon: Users, label: "Clients", href: "/clients" },
    { icon: MessageSquare, label: "WhatsApp Chat", href: "/chat" },
    { icon: BookOpen, label: "Knowledge Base", href: "/knowledge" },
    { icon: ClipboardList, label: "Inspeções", href: "/inspections" },
    { icon: FileText, label: "Orçamentos", href: "/budgets" },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-border/10 p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Activity className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none tracking-tight">TechMotor</span>
            <span className="text-xs text-muted-foreground">Rectification Sys</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={location === item.href}
                  className="transition-all duration-200 hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-md"
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/10 p-4">
        <div className="flex items-center gap-3 overflow-hidden mb-4">
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
            <AvatarImage src={user?.profileImageUrl || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export function MobileNav() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="flex items-center p-4 border-b md:hidden bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-6 w-6" />
      </Button>
      <span className="ml-2 font-bold text-lg">TechMotor</span>
    </div>
  );
}
