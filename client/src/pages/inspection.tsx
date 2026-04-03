import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Brain, CheckCircle, XCircle, Loader2, ClipboardSignature } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

function useInspections() {
  return useQuery({
    queryKey: ["/api/inspections"],
    queryFn: async () => {
      const res = await fetch("/api/inspections", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch inspections");
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

export default function InspectionPage() {
  const { data: inspections, isLoading } = useInspections();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const filtered = inspections?.filter((i: any) =>
    i.technician?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspeções</h1>
          <p className="text-muted-foreground">Registro técnico com análise de IA para cada motor.</p>
        </div>
        <CreateInspectionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por técnico..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="text-sm text-muted-foreground">{filtered?.length ?? 0} inspeções</div>
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>OS</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Cilindro</TableHead>
              <TableHead>Bronzina</TableHead>
              <TableHead>Torque</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1,2,3].map(i => (
                <TableRow key={i}>{[1,2,3,4,5,6].map(j => <TableCell key={j}><div className="h-4 w-20 bg-muted animate-pulse rounded"/></TableCell>)}</TableRow>
              ))
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardSignature className="h-8 w-8 opacity-30"/>
                    <p>Nenhuma inspeção encontrada. Crie a primeira!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map((insp: any, index: number) => (
                <motion.tr key={insp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono">OS-{insp.serviceOrderId}</TableCell>
                  <TableCell>{insp.technician ?? "-"}</TableCell>
                  <TableCell className="font-mono text-xs">{insp.measurements?.diametroCilindro ?? "-"}</TableCell>
                  <TableCell className="font-mono text-xs">{insp.measurements?.folhaBronzina ?? "-"}</TableCell>
                  <TableCell className="font-mono text-xs">{insp.measurements?.torqueCabecote ?? "-"}</TableCell>
                  <TableCell>
                    {insp.approved === true ? (
                      <Badge className="bg-green-500 border-0 gap-1"><CheckCircle className="h-3 w-3"/>Aprovado</Badge>
                    ) : insp.approved === false ? (
                      <Badge className="bg-red-500 border-0 gap-1"><XCircle className="h-3 w-3"/>Reprovado</Badge>
                    ) : (
                      <Badge variant="outline">Pendente</Badge>
                    )}
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

function CreateInspectionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const queryCliente = useQueryClient();
  const { data: serviceOrders } = useServiceOrders();
  const [form, setForm] = useState({ serviceOrderId: "", technician: "", diametroCilindro: "", folhaBronzina: "", torqueCabecote: "", assinatura: "" });
  const [aiReport, setAiReport] = useState("");
  const [approved, setApproved] = useState<boolean | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/inspections/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ osId: Number(form.serviceOrderId) || 1, measurements: { diametroCilindro: form.diametroCilindro, folhaBronzina: form.folhaBronzina, torqueCabecote: form.torqueCabecote } }),
        credentials: "include",
      });
      const data = await res.json();
      setAiReport(data.aiReport);
      setApproved(data.approved);
      toast({ title: data.approved ? "✅ Motor APROVADO" : "❌ Motor REPROVADO" });
    } catch (e) {
      toast({ title: "Erro na análise IA", variant: "destructive" });
    }
    setAnalyzing(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/inspections", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceOrderId: Number(form.serviceOrderId), technician: form.technician, measurements: { diametroCilindro: form.diametroCilindro, folhaBronzina: form.folhaBronzina, torqueCabecote: form.torqueCabecote, assinatura: form.assinatura }, aiReport: aiReport || null, approved }),
        credentials: "include",
      });
      queryCliente.invalidateQueries({ queryKey: ["/api/inspections"] });
      toast({ title: "✅ Inspeção salva!" });
      onOpenChange(false);
      setForm({ serviceOrderId: "", technician: "", diametroCilindro: "", folhaBronzina: "", torqueCabecote: "", assinatura: "" });
      setAiReport(""); setApproved(null);
    } catch (e) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20 gap-2"><Plus className="h-4 w-4"/>Nova Inspeção</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Inspeção Técnica</DialogTitle>
          <DialogDescription>Registre as medidas e obtenha o parecer da IA.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Ordem de Serviço</label>
              <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.serviceOrderId} onChange={e => setForm({...form, serviceOrderId: e.target.value})}>
                <option value="">Selecione a OS...</option>
                {serviceOrders?.map((os: any) => <option key={os.id} value={os.id}>OS-{os.id} — {os.status}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Técnico Responsável</label>
              <Input className="mt-1" placeholder="Nome do técnico" value={form.technician} onChange={e => setForm({...form, technician: e.target.value})} />
            </div>
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Medidas Técnicas</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Diâmetro Cilindro</label>
                <Input className="mt-1 font-mono" placeholder="ex: 102.05mm" value={form.diametroCilindro} onChange={e => setForm({...form, diametroCilindro: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Folha Bronzina</label>
                <Input className="mt-1 font-mono" placeholder="ex: 0.08mm" value={form.folhaBronzina} onChange={e => setForm({...form, folhaBronzina: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Torque Cabeçote</label>
                <Input className="mt-1 font-mono" placeholder="ex: 250Nm" value={form.torqueCabecote} onChange={e => setForm({...form, torqueCabecote: e.target.value})} />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Assinatura do Técnico</label>
            <Input className="mt-1" placeholder="Nome completo" value={form.assinatura} onChange={e => setForm({...form, assinatura: e.target.value})} />
          </div>
          <Button type="button" onClick={analyze} disabled={analyzing} className="w-full gap-2" variant="outline">
            {analyzing ? <><Loader2 className="h-4 w-4 animate-spin"/>Analisando com IA...</> : <><Brain className="h-4 w-4"/>Analisar com IA</>}
          </Button>
          {aiReport && (
            <Card className={`border-2 ${approved ? "border-green-500 bg-green-500/5" : "border-red-500 bg-red-500/5"}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {approved ? <CheckCircle className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-red-500"/>}
                  {approved ? "Motor APROVADO" : "Motor REPROVADO"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiReport.substring(0, 500)}...</p>
              </CardContent>
            </Card>
          )}
        </div>
        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelarar</Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2"/>Salvando...</> : "Salvar Inspeção"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
