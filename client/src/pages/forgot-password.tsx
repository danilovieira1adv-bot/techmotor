import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle, Loader2, Mail, Copy, ExternalLink } from "lucide-react";

export default function ForgotPasswordPage() {
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [resetData, setResetData] = useState<{
    resetToken: string;
    tokenId: string;
    resetLink: string;
    expiresAt: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetData(null);

    if (!email) {
      setError("Por favor, informe seu email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao solicitar recuperação de senha");
      }

      setSuccess(true);
      setResetData(data);

    } catch (err: any) {
      setError(err.message || "Erro ao solicitar recuperação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Poderia adicionar um toast de confirmação aqui
    alert("Token copiado para a área de transferência!");
  };

  const openResetLink = () => {
    if (resetData?.resetLink) {
      window.open(resetData.resetLink, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
              <CardDescription>
                Informe seu email para receber instruções de recuperação
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setLocation("/login")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!success ? (
            <>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Modo de desenvolvimento:</strong> O token será mostrado na tela.
                      Em produção, seria enviado por email.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email cadastrado *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Instruções de Recuperação"
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-600 pt-4">
                  <p>
                    Lembrou da senha?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                      Voltar para o login
                    </Link>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-xl mb-2">Instruções Enviadas!</CardTitle>
                <CardDescription className="text-base">
                  {resetData?.message || "Se o email existir em nosso sistema, enviaremos instruções de recuperação."}
                </CardDescription>
              </div>

              {resetData && (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      ⚠️ Modo de Desenvolvimento
                    </p>
                    <p className="text-sm text-yellow-700">
                      Em produção, o token seria enviado por email. Abaixo estão os dados para teste:
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Token de Reset:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={resetData.resetToken}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(resetData.resetToken)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Token ID:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={resetData.tokenId}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(resetData.tokenId)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Link de Reset:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={resetData.resetLink}
                          readOnly
                          className="text-sm"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={openResetLink}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Expira em:</Label>
                      <p className="text-sm text-gray-700 mt-1">
                        {new Date(resetData.expiresAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      onClick={() => window.open(resetData.resetLink, "_blank")}
                      className="w-full"
                    >
                      Ir para Página de Redefinição
                    </Button>
                    
                    <Button
                      onClick={() => setLocation("/login")}
                      variant="outline"
                      className="w-full"
                    >
                      Voltar para Login
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}