"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Credenciais inválidas.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      {/* Animated orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Zap size={28} />
          </div>
          <h1 className="login-title">Motor de Crédito</h1>
          <p className="login-subtitle">Painel de Administração</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="form-label">Email</label>
            <div className="login-input-wrapper">
              <Mail size={16} className="login-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input login-input"
                placeholder="admin@empresa.com"
                required
                id="login-email"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="form-label">Senha</label>
            <div className="login-input-wrapper">
              <Lock size={16} className="login-input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input login-input"
                placeholder="••••••••"
                required
                id="login-password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <div className="form-api-error">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-analisar"
            id="btn-login"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar no Painel"
            )}
          </button>
        </form>

        <p className="login-footer">
          Acesso restrito ao administrador do sistema
        </p>
      </div>
    </div>
  );
}
