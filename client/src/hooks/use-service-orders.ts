import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertServiceOrder, type ServiceOrder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useServiceOrders() {
  return useQuery({
    queryKey: [api.serviceOrders.list.path],
    queryFn: async () => {
      const res = await fetch(api.serviceOrders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch service orders");
      return api.serviceOrders.list.responses[200].parse(await res.json());
    },
  });
}

export function useServiceOrder(id: number) {
  return useQuery({
    queryKey: [api.serviceOrders.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.serviceOrders.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch service order");
      return api.serviceOrders.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateServiceOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertServiceOrder) => {
      const res = await fetch(api.serviceOrders.create.path, {
        method: api.serviceOrders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create service order");
      return api.serviceOrders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.serviceOrders.list.path] });
      toast({ title: "Success", description: "Service Order created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateServiceOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertServiceOrder>) => {
      const url = buildUrl(api.serviceOrders.update.path, { id });
      const res = await fetch(url, {
        method: api.serviceOrders.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update service order");
      return api.serviceOrders.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.serviceOrders.list.path] });
      toast({ title: "Success", description: "Service Order updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
