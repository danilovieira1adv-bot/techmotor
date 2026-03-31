import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Book, Wrench, Youtube } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const createItemSchema = z.object({
  manufacturer: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  infoType: z.string().min(1, "Required"),
  contentText: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

function useKnowledgeBase() {
  return useQuery({
    queryKey: ["/api/knowledge-base"],
    queryFn: async () => {
      const res = await fetch("/api/knowledge-base", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

function useCreateKnowledgeBase() {
  const queryCliente = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: z.infer<typeof createItemSchema>) => {
      const res = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryCliente.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      toast({ title: "Success", description: "Technical spec added!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

const INFO_TYPES = ["Torque", "Clearance", "Procedure", "Diagram", "Other"];

export default function KnowledgeBasePage() {
  const { data: items, isLoading } = useKnowledgeBase();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered = items?.filter((item: any) =>
    item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.infoType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      Torque: "bg-orange-500",
      Clearance: "bg-blue-500",
      Procedure: "bg-purple-500",
      Diagram: "bg-teal-500",
      Other: "bg-gray-500",
    };
    return colors[type] ?? "bg-gray-500";
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">Technical specs, torque values and procedures for diesel engines.</p>
        </div>
        <CreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search manufacturer, model or type..." className="pl-9 bg-background border-border/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="text-sm text-muted-foreground">{filtered?.length ?? 0} records</div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Manufacturer</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Video</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1,2,3].map((i) => (
                <TableRow key={i}>
                  {[1,2,3,4,5].map(j => <TableCell key={j}><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>)}
                </TableRow>
              ))
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Book className="h-8 w-8 opacity-30" />
                    <p>No records yet. Add your first technical spec!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map((item: any, index: number) => (
                <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary opacity-60" />
                      {item.manufacturer}
                    </div>
                  </TableCell>
                  <TableCell>{item.model}</TableCell>
                  <TableCell>
                    <Badge className={`${getTypeBadge(item.infoType)} border-0 text-white`}>{item.infoType}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{item.contentText ?? "-"}</TableCell>
                  <TableCell>
                    {item.videoUrl ? (
                      <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="hover:text-red-500"><Youtube className="h-4 w-4" /></Button>
                      </a>
                    ) : "-"}
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { mutate: createItem, isPending } = useCreateKnowledgeBase();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof createItemSchema>>({ resolver: async (data) => { try { return { values: createItemSchema.parse(data), errors: {} }; } catch (e: any) { return { values: {}, errors: e.formErrors?.fieldErrors ?? {} }; } } });

  const onSubmit = (data: z.infer<typeof createItemSchema>) => {
    createItem(data, { onSuccess: () => { onOpenChange(false); reset(); } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20 gap-2"><Plus className="h-4 w-4" /> Add Technical Spec</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Technical Specification</DialogTitle>
          <DialogDescription>Register technical data for a diesel engine component.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Manufacturer</label>
              <Input placeholder="e.g. Cummins" {...register("manufacturer")} className="mt-1" />
              {errors.manufacturer && <p className="text-xs text-red-500 mt-1">{errors.manufacturer.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Engine Model</label>
              <Input placeholder="e.g. ISB 6.7" {...register("model")} className="mt-1" />
              {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Info Type</label>
            <select {...register("infoType")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select type...</option>
              {INFO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.infoType && <p className="text-xs text-red-500 mt-1">{errors.infoType.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Content / Notes</label>
            <Textarea placeholder="Enter technical specifications..." {...register("contentText")} className="mt-1" rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium">Video URL (optional)</label>
            <Input placeholder="https://youtube.com/..." {...register("videoUrl")} className="mt-1" />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : "Add Spec"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
