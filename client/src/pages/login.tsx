import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Side - Hero / Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
           {/* Abstract industrial shapes overlay */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
           {/* Unsplash image with overlay */}
           {/* industrial workshop engine machine */}
           <img 
             src="https://pixabay.com/get/gcce97cb0f0d66a73ebbf8ab64e4955c8406ca3261f40b2488ada0260a87af2ca99fdb5c9c7636e16f2cc6696ecd9fd25922a1e9e23a29a5a530c3bc108cd1ed9_1280.jpg" 
             alt="Industrial Workshop" 
             className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
           />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">TechMotor</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-md font-light leading-relaxed">
            Advanced Diesel Engine Rectification Management System with AI-powered diagnostics.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          © {new Date().getFullYear()} TechMotor Systems. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Action */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <Card className="border-border/50 shadow-xl shadow-black/5">
            <CardContent className="pt-6 pb-6 flex flex-col gap-4">
              <Button 
                size="lg" 
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5" 
                onClick={handleLogin}
              >
                Log in with Replit
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Secure Access</span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                By logging in, you agree to our internal use policy and data handling procedures.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
