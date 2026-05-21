"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "../../lib/auth-client";
import { AuthLayout } from "../../components/auth-layout";
import { PasswordInput } from "../../components/password-input";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && session) router.replace("/dashboard");
  }, [isPending, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn.email({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message ?? "Email ou senha inválidos");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthLayout>
      <header style={S.header}>
        <h1 style={S.title}>Bem-vindo de volta</h1>
        <p style={S.subtitle}>Entre para continuar suas tarefas.</p>
      </header>

      <form onSubmit={handleSubmit} style={S.form}>
        <label style={S.label}>
          <span style={S.labelText}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={S.input}
            placeholder="voce@exemplo.com"
            autoComplete="email"
          />
        </label>

        <label style={S.label}>
          <span style={S.labelText}>Senha</span>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            inputStyle={S.input}
            placeholder="Sua senha"
            autoComplete="current-password"
          />
        </label>

        {error && <p style={S.error}>{error}</p>}

        <button type="submit" disabled={loading} style={S.button}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p style={S.footerText}>
        Não tem conta?{" "}
        <Link href="/sign-up" style={S.link}>
          Criar conta grátis
        </Link>
      </p>
    </AuthLayout>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { marginBottom: "2rem" },
  title: {
    fontSize: "1.875rem",
    fontWeight: 700,
    letterSpacing: "-0.025em",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "var(--fg-muted)",
    fontSize: "0.9375rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  label: { display: "flex", flexDirection: "column", gap: "0.4375rem" },
  labelText: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--fg)",
  },
  input: {
    padding: "0.75rem 0.9375rem",
    border: "1px solid var(--border-strong)",
    borderRadius: "10px",
    fontSize: "0.9375rem",
    background: "var(--bg-card)",
    color: "var(--fg)",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.8125rem",
    border: "none",
    borderRadius: "10px",
    background: "var(--fg)",
    color: "var(--bg)",
    fontSize: "0.9375rem",
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
  error: {
    color: "var(--danger)",
    fontSize: "0.875rem",
    padding: "0.625rem 0.75rem",
    background: "var(--danger-bg)",
    borderRadius: "8px",
  },
  footerText: {
    marginTop: "2rem",
    textAlign: "center",
    fontSize: "0.875rem",
    color: "var(--fg-muted)",
  },
  link: {
    color: "var(--fg)",
    fontWeight: 600,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
};
