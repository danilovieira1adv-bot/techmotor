import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, FileText, Send, CheckCircle, Clock, XCircle, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

function useBudgets() {
  return useQuery({
    queryKey: ["/api/budgets"],
    queryFn: async () => {
      const res = await fetch("/api/budgets", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

function useClients() {
  return useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

function useServiceOrders() {
  return useQuery({
    queryKey: ["/api/service-orders"],
    queryFn: async () => {
      const res = await fetch("/api/service-orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  sent: "bg-blue-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  sent: "Enviado",
};

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useBudgets();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);

  const filtered = budgets?.filter((b: any) =>
    b.id?.toString().includes(searchTerm) ||
    b.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie orçamentos e envie para aprovação via WhatsApp.</p>
        </div>
        <CreateBudgetDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar orçamento..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="text-sm text-muted-foreground">{filtered?.length ?? 0} orçamentos</div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Nº</TableHead>
              <TableHead>Clientee</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1,2,3].map(i => (
                <TableRow key={i}>{[1,2,3,4,5,6,7,8].map(j => <TableCell key={j}><div className="h-4 w-20 bg-muted animate-pulse rounded"/></TableCell>)}</TableRow>
              ))
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 opacity-30"/>
                    <p>Nenhum orçamento encontrado. Crie o primeiro!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map((budget: any, index: number) => (
                <motion.tr key={budget.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedBudget(budget)}>
                  <TableCell className="font-mono font-medium">#{budget.id}</TableCell>
                  <TableCell>{budget.client_name ?? "Clientee #" + budget.clientId}</TableCell>
                  <TableCell>{budget.serviceOrderId ? `OS-${budget.serviceOrderId}` : "-"}</TableCell>
                  <TableCell className="font-medium">R$ {(Number(budget.total) - Number(budget.discount)).toFixed(2)}</TableCell>
                  <TableCell className="text-green-600">-R$ {Number(budget.discount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_COLORS[budget.status] ?? "bg-gray-500"} border-0 text-white`}>
                      {STATUS_LABELS[budget.status] ?? budget.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(budget.created_at || budget.createdAt) ? new Date(budget.created_at || budget.createdAt).toLocaleDateString("pt-BR") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <SendWhatsAppButton budget={budget} />
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); printBudget(budget); }}>
                        <Printer className="h-4 w-4"/>
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedBudget && (
        <BudgetDetailDialog budget={selectedBudget} onClose={() => setSelectedBudget(null)} />
      )}
    </div>
  );
}

function SendWhatsAppButton({ budget }: { budget: any }) {
  const { toast } = useToast();
  const queryCliente = useQueryClient();

  const send = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/budgets/${budget.id}/send-whatsapp`, {
        method: "POST", credentials: "include"
      });
      const data = await res.json();
      queryCliente.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({ title: "✅ Enviado!", description: "Abrindo WhatsApp..." });
      if (data.whatsappUrl) window.open(data.whatsappUrl, "_blank");
    } catch {
      toast({ title: "Erro ao enviar", variant: "destructive" });
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={send} className="hover:text-green-500">
      <Send className="h-4 w-4"/>
    </Button>
  );
}

function BudgetDetailDialog({ budget, onClose }: { budget: any; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Orçamento #{budget.id}</DialogTitle>
          <DialogDescription>Detalhes do orçamento</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={`${STATUS_COLORS[budget.status]} border-0 text-white`}>{STATUS_LABELS[budget.status]}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold text-lg">R$ {Number(budget.total).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span className="text-green-600">-R$ {Number(budget.discount).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total final</span><span className="font-bold text-xl text-primary">R$ {(Number(budget.total) - Number(budget.discount)).toFixed(2)}</span></div>
          {budget.notes && <div><span className="text-muted-foreground text-sm">Observações:</span><p className="text-sm mt-1">{budget.notes}</p></div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={() => printBudget(budget)}><Printer className="h-4 w-4 mr-2"/>Imprimir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function printBudget(budget: any) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <html><head><title>Orçamento #${budget.id}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}h1{color:#333}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f5f5f5}.total{font-size:1.5em;font-weight:bold;color:#333}.footer{margin-top:40px;border-top:1px solid #ddd;padding-top:20px;font-size:0.9em;color:#666}</style>
    </head><body>
    <h1>🔧 RetíficaPro — Orçamento #${budget.id}</h1>
    <p><strong>Data:</strong> ${(budget.created_at || budget.createdAt) ? new Date(budget.created_at || budget.createdAt).toLocaleDateString("pt-BR") : "-"}</p>
    <p><strong>Status:</strong> ${STATUS_LABELS[budget.status] ?? budget.status}</p>
    <table><tr><th>Descrição</th><th>Qtd</th><th>Unit.</th><th>Total</th></tr>
    <tr><td>Serviços de retífica</td><td>1</td><td>R$ ${Number(budget.total).toFixed(2)}</td><td>R$ ${Number(budget.total).toFixed(2)}</td></tr>
    </table>
    <p><strong>Desconto:</strong> -R$ ${Number(budget.discount).toFixed(2)}</p>
    <p class="total">Total Final: R$ ${(Number(budget.total) - Number(budget.discount)).toFixed(2)}</p>
    ${budget.notes ? `<p><strong>Observações:</strong> ${budget.notes}</p>` : ""}
    <div class="footer"><p>RetíficaPro — Sistema de Retífica de Motores</p></div>
    </body></html>
  `);
  win.document.close();
  win.print();
}

function CreateBudgetDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const queryCliente = useQueryClient();
  const { data: clients } = useClients();
  const { data: serviceOrders } = useServiceOrders();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ clientId: "", serviceOrderId: "", discount: "0", notes: "" });
  const [items, setItems] = useState([{ type: "service", description: "", quantity: "1", unitPrice: "", total: "0" }]);

  const addItem = () => setItems([...items, { type: "service", description: "", quantity: "1", unitPrice: "", total: "0" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(field === "quantity" ? value : updated[i].quantity) || 0;
      const price = parseFloat(field === "unitPrice" ? value : updated[i].unitPrice) || 0;
      updated[i].total = (qty * price).toFixed(2);
    }
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total || "0"), 0);
  const total = subtotal - parseFloat(form.discount || "0");

  const save = async () => {
    if (!form.clientId) { toast({ title: "Selecione um cliente", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await fetch("/api/budgets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: Number(form.clientId), serviceOrderId: form.serviceOrderId ? Number(form.serviceOrderId) : null, discount: parseFloat(form.discount || "0"), notes: form.notes, items: items.map(i => ({ type: i.type, description: i.description, quantity: parseFloat(i.quantity), unitPrice: parseFloat(i.unitPrice), total: parseFloat(i.total) })) }),
        credentials: "include",
      });
      queryCliente.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({ title: "✅ Orçamento criado!" });
      onOpenChange(false);
      setForm({ clientId: "", serviceOrderId: "", discount: "0", notes: "" });
      setItems([{ type: "service", description: "", quantity: "1", unitPrice: "", total: "0" }]);
    } catch (e) { toast({ title: "Erro ao criar", variant: "destructive" }); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20 gap-2"><Plus className="h-4 w-4"/>Novo Orçamento</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
          <DialogDescription>Crie um orçamento e envie para o cliente via WhatsApp.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Clientee</label>
              <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})}>
                <option value="">Selecione...</option>
                {clients?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">OS (opcional)</label>
              <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.serviceOrderId} onChange={e => setForm({...form, serviceOrderId: e.target.value})}>
                <option value="">Nenhuma</option>
                {serviceOrders?.map((os: any) => <option key={os.id} value={os.id}>OS-{os.id}</option>)}
              </select>
            </div>
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Itens do Orçamento</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1"/>Adicionar</Button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-1">
                  <select className="w-full rounded-md border border-input bg-background px-2 py-2 text-xs" value={item.type} onChange={e => updateItem(i, "type", e.target.value)}>
                    <option value="service">Serv.</option>
                    <option value="part">Peça</option>
                  </select>
                </div>
                <div className="col-span-5">
                  <Input placeholder="Descrição" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} className="text-sm"/>
                </div>
                <div className="col-span-2">
                  <Input placeholder="Qtd" type="number" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} className="text-sm"/>
                </div>
                <div className="col-span-2">
                  <Input placeholder="R$ Unit." type="number" value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", e.target.value)} className="text-sm"/>
                </div>
                <div className="col-span-1 text-sm font-mono text-right">R${item.total}</div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="h-8 w-8 hover:text-red-500"><Trash2 className="h-3 w-3"/></Button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Desconto (R$)</label>
              <Input className="mt-1" type="number" placeholder="0.00" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})}/>
            </div>
            <Card className="border-primary/30">
              <CardContent className="pt-4 pb-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-green-600"><span>Desconto</span><span>-R$ {parseFloat(form.discount||"0").toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg mt-1"><span>Total</span><span className="text-primary">R$ {total.toFixed(2)}</span></div>
              </CardContent>
            </Card>
          </div>
          <div>
            <label className="text-sm font-medium">Observações</label>
            <Input className="mt-1" placeholder="Condições de pagamento, prazo, etc." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}/>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelarar</Button>
          <Button type="button" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Criar Orçamento"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
