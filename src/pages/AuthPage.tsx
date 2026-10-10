import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NotebookPen, Loader2, AlertCircle } from "lucide-react";

const PASSWORD_MIN = 6;
const PASSWORD_MAX = 30;
const PASSWORD_SYMBOL = /[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/;

function validatePassword(password: string): string | null {
  if (password.length > PASSWORD_MAX) {
    return `La contraseña no puede tener más de ${PASSWORD_MAX} caracteres.`;
  }
  if (password.length < PASSWORD_MIN) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`;
  }
  if (!PASSWORD_SYMBOL.test(password)) {
    return "La contraseña debe incluir al menos un carácter simbólico (por ejemplo ! @ # $ %).";
  }
  return null;
}

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        // With email confirmation off, signUp returns a session immediately
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Algo salió mal";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
            <NotebookPen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Notas
          </h1>
          <p className="text-slate-500 mt-1">Tu espacio personal de notas</p>
        </div>

        <Card className="shadow-xl border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-xl">
              {mode === "login" ? "Bienvenido de nuevo" : "Creá tu cuenta"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Iniciá sesión para ver tus notas"
                : "Registrate para empezar a tomar notas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vos@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value.slice(0, PASSWORD_MAX))
                  }
                  required
                  minLength={PASSWORD_MIN}
                  maxLength={PASSWORD_MAX}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
                <p className="text-xs text-slate-500">
                  Máximo {PASSWORD_MAX} caracteres e incluir al menos un símbolo
                  (por ejemplo ! @ # $ %).
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === "login" ? "Iniciar sesión" : "Registrarse"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {mode === "login" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
              <button
                onClick={switchMode}
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {mode === "login" ? "Registrate" : "Iniciá sesión"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
