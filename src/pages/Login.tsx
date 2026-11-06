import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { trpcClient } from "@/lib/trpc-client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await trpcClient.auth.login.mutate({ email: email.trim(), password });
      navigate("/admin", { replace: true });
      // Recarga suave para que useAuth tome la nueva cookie en todo el árbol.
      window.location.href = "/admin";
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-brand-deep px-4">
      <Card className="w-full max-w-sm border-brand-graphite/10">
        <CardHeader className="items-center text-center">
          <Logo />
          <CardTitle className="mt-4 font-display text-xl font-bold uppercase text-brand-graphite">
            Panel de administración
          </CardTitle>
          <p className="text-sm text-foreground/60">
            Acceso privado para el equipo de AGROAPER.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              autoComplete="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-h-[48px]"
            />
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="min-h-[48px]"
            />
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="min-h-[48px] w-full bg-brand-deep font-display text-sm font-bold uppercase tracking-wide text-brand-cream hover:bg-brand-graphite"
              size="lg"
            >
              {loading ? "Entrando…" : "Entrar"}
            </Button>
            <Button asChild variant="ghost" className="min-h-[44px] w-full">
              <Link to="/">Volver a la web</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
