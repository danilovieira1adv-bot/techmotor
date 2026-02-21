import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertInspection } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCreateInspection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInspection) => {
      const res = await fetch(api.inspections.create.path, {
        method: api.inspections.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create inspection");
      return api.inspections.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate both lists and detail views related to service orders as they might show inspection status
      queryClient.invalidateQueries({ queryKey: [api.serviceOrders.list.path] });
      toast({ title: "Success", description: "Inspection recorded successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useAnalyzeInspection() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ osId, measurements }: { osId: number; measurements: any }) => {
      const res = await fetch(api.inspections.analyze.path, {
        method: api.inspections.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ osId, measurements }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("AI Analysis failed");
      return api.inspections.analyze.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
    },
  });
}
