import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowLeft, CheckCircle, Loader2, Lock, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Extrair token da URL
  const searchParams = new URLSearchParams(search);
  const token = searchParams.get("token");
  const tokenId = searchParams.get("id");

  useEffect(() => {
    validateToken();
  }, [token, tokenId]);

  const validateToken = async () => {
    if (!token || !tokenId) {
      setTokenValid(false);
      setValidating(false);
      setError("Token inválido ou ausente na URL");
      return;
    }

    try {
      const response = await fetch(`/api/auth/validate-reset-token?token=${token}&tokenId=${tokenId}`);
      const data = await response.json();

      if (data.valid) {
        setTokenValid(true);
        setEmail(data.email || "");
      } else {
        setTokenValid(false);
        setError(data.error || "Token inválido ou expirado");
      }
    } catch (err: any) {
      setTokenValid(false);
      setError("Erro ao validar token. Tente novamente.");
    } finally {
      setValidating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (formData.newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (!token || !tokenId) {
      setError("Token inválido");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          tokenId,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir senha");
      }

      setSuccess(true);

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        setLocation("/login");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 animate-pulse font-medium">
                Validando token de recuperação...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Token Inválido</CardTitle>
                <CardDescription>
                  Não foi possível validar o token de recuperação
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setLocation("/login")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {error || "O token de recuperação é inválido, expirou ou já foi utilizado."}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <p className="text-gray-600">
                Possíveis motivos:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>O token expirou (validade de 1 hora)</li>
                <li>O token já foi utilizado</li>
                <li>O link está incorreto ou incompleto</li>
                <li>Ocorreu um erro no servidor</li>
              </ul>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={() => setLocation("/forgot-password")}
                  className="w-full"
                >
                  Solicitar Novo Token
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Você será redirecionado para a página de login em instantes...
            </p>
            <Button onClick={() => setLocation("/login")} className="w-full">
              Ir para Login Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
              <CardDescription>
                Crie uma nova senha para sua conta
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setLocation("/login")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {email && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Redefinindo senha para: <strong>{email}</strong>
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                A senha deve ter pelo menos 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Redefinir Senha
                  </>
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
        </CardContent>
      </Card>
    </div>
  );
}