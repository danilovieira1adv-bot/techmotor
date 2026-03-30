import { useState } from "react";
import { useClients, useCreateClient } from "@/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Phone, MessageCircle, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { motion } from "framer-motion";

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your workshop clients and their vehicles.</p>
        </div>
        <CreateClientDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-9 bg-background border-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredClients?.length ?? 0} clients found
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded-full" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : filteredClients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <User className="h-8 w-8 opacity-30" />
                    <p>No clients found. Add your first client!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients?.map((client, index) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {client.phone ?? "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.whatsappOptIn ? (
                      <Badge className="bg-green-500 hover:bg-green-600 border-0 gap-1">
                        <MessageCircle className="h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground gap-1">
                        <MessageCircle className="h-3 w-3" /> Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "-"}
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

function CreateClientDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: createClient, isPending } = useCreateClient();

  const form = useForm<z.infer<typeof insertClientSchema>>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: "",
      phone: "",
      whatsappOptIn: false,
    },
  });

  const onSubmit = (data: z.infer<typeof insertClientSchema>) => {
    createClient(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20 gap-2">
          <Plus className="h-4 w-4" />
          New Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>Register a new client in the workshop system.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+55 11 99999-9999" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsappOptIn"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={field.onChange}
                      className="h-4 w-4 accent-primary"
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer">Enable WhatsApp notifications</FormLabel>
                    <p className="text-xs text-muted-foreground">Send OS updates via WhatsApp</p>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
