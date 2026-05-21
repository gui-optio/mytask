"use client";

import Link from "next/link";
import { ThemeToggle } from "../components/theme-toggle";
import { useSession } from "../lib/auth-client";

export default function Home() {
  const { data: session } = useSession();
  const isAuthed = !!session;

  return (
    <div style={S.page}>
      <Nav isAuthed={isAuthed} />
      <Hero isAuthed={isAuthed} />
      <Features />
      <SocialProof />
      <CtaSection isAuthed={isAuthed} />
      <Footer />
    </div>
  );
}

function Nav({ isAuthed }: { isAuthed: boolean }) {
  return (
    <nav style={S.nav}>
      <div style={S.navInner}>
        <Link href="/" style={S.logo}>
          <span style={S.logoDot} />
          mytask
        </Link>
        <div style={S.navLinks}>
          <Link href="#features" style={S.navLink}>Recursos</Link>
          <Link href="#pricing" style={S.navLink}>Por que mytask</Link>
          <ThemeToggle compact />
          {isAuthed ? (
            <Link href="/dashboard" style={S.btnPrimarySmall}>Ir para tarefas</Link>
          ) : (
            <>
              <Link href="/sign-in" style={S.navLink}>Entrar</Link>
              <Link href="/sign-up" style={S.btnPrimarySmall}>Criar conta grátis</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Hero({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section style={S.hero}>
      <span style={S.eyebrow}>Gerenciamento de tarefas inteligente</span>
      <h1 style={S.heroTitle}>
        Sua produtividade<br />
        merece mais <span style={S.heroAccent}>organização</span>.
      </h1>
      <p style={S.heroSubtitle}>
        Feito para quem leva tempo a sério. Centralize tarefas, defina prioridades
        e nunca mais perca um prazo importante.
      </p>
      <div style={S.heroCtas}>
        {isAuthed ? (
          <Link href="/dashboard" style={S.btnPrimary}>
            Ir para minhas tarefas
            <span style={S.arrow}>→</span>
          </Link>
        ) : (
          <Link href="/sign-up" style={S.btnPrimary}>
            Começar grátis
            <span style={S.arrow}>→</span>
          </Link>
        )}
        <Link href="#features" style={S.btnGhost}>
          Ver recursos
        </Link>
      </div>
      <p style={S.heroNote}>
        Sem cartão de crédito · Configuração em menos de 1 minuto
      </p>

      <div style={S.heroPreview}>
        <PreviewCard />
      </div>
    </section>
  );
}

function PreviewCard() {
  return (
    <div style={S.previewCard}>
      <div style={S.previewHeader}>
        <div style={S.previewDots}>
          <span style={{ ...S.previewDot, background: "#FF5F57" }} />
          <span style={{ ...S.previewDot, background: "#FEBC2E" }} />
          <span style={{ ...S.previewDot, background: "#28C840" }} />
        </div>
        <span style={S.previewUrl}>mytask.app / dashboard</span>
      </div>
      <div style={S.previewBody}>
        <div style={S.previewTitleRow}>
          <h3 style={S.previewTitle}>Minhas tarefas</h3>
          <span style={S.previewCount}>4 ativas</span>
        </div>
        <div style={S.previewList}>
          <PreviewTask title="Finalizar relatório trimestral" priority="high" done={false} />
          <PreviewTask title="Revisar PRs do time" priority="medium" done={false} />
          <PreviewTask title="Responder e-mails do cliente" priority="medium" done={true} />
          <PreviewTask title="Planejar sprint da próxima semana" priority="low" done={false} />
        </div>
      </div>
    </div>
  );
}

function PreviewTask({
  title,
  priority,
  done,
}: {
  title: string;
  priority: "low" | "medium" | "high";
  done: boolean;
}) {
  const pColors: Record<string, React.CSSProperties> = {
    high: { background: "var(--priority-high-bg)", color: "var(--priority-high-fg)" },
    medium: { background: "var(--priority-medium-bg)", color: "var(--priority-medium-fg)" },
    low: { background: "var(--priority-low-bg)", color: "var(--priority-low-fg)" },
  };
  return (
    <div style={S.previewTask}>
      <span style={{ ...S.previewCheck, ...(done ? S.previewCheckDone : {}) }}>
        {done ? "✓" : ""}
      </span>
      <span
        style={{
          ...S.previewTaskTitle,
          ...(done ? { textDecoration: "line-through", opacity: 0.5 } : {}),
        }}
      >
        {title}
      </span>
      <span style={{ ...S.previewBadge, ...pColors[priority] }}>{priority}</span>
    </div>
  );
}

function Features() {
  const items = [
    {
      icon: "✓",
      title: "Tarefas com prioridade",
      text: "Organize por urgência (baixa, média, alta) e foque no que realmente importa.",
    },
    {
      icon: "⚡",
      title: "Atualizações instantâneas",
      text: "Marque como concluída com um clique. A UI responde antes mesmo do servidor.",
    },
    {
      icon: "🔒",
      title: "Seus dados, isolados",
      text: "Cada usuário só vê suas próprias tarefas. Autenticação segura por padrão.",
    },
    {
      icon: "📅",
      title: "Datas e descrições",
      text: "Adicione contexto e prazos para nunca perder um detalhe importante.",
    },
    {
      icon: "📊",
      title: "Visão clara do dia",
      text: "Layout limpo e direto. Veja tudo que importa em uma única tela.",
    },
    {
      icon: "🌱",
      title: "Cresce com você",
      text: "Comece simples. Adicione complexidade conforme sua rotina evolui.",
    },
  ];

  return (
    <section id="features" style={S.section}>
      <div style={S.sectionInner}>
        <span style={S.eyebrow}>Recursos</span>
        <h2 style={S.sectionTitle}>
          Tudo que você precisa, nada que atrapalhe.
        </h2>
        <p style={S.sectionSubtitle}>
          Ferramentas focadas em produtividade real, sem distrações.
        </p>

        <div style={S.featuresGrid}>
          {items.map((it) => (
            <div key={it.title} style={S.featureCard}>
              <div style={S.featureIcon}>{it.icon}</div>
              <h3 style={S.featureTitle}>{it.title}</h3>
              <p style={S.featureText}>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section style={S.sectionAlt}>
      <div style={S.sectionInner}>
        <div style={S.statsRow}>
          <Stat number="∞" label="tarefas por usuário" />
          <Stat number="< 100ms" label="resposta média" />
          <Stat number="100%" label="dos dados isolados por usuário" />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div style={S.stat}>
      <div style={S.statNumber}>{number}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

function CtaSection({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section id="pricing" style={S.ctaSection}>
      <div style={S.ctaInner}>
        <h2 style={S.ctaTitle}>
          Pronto pra organizar seu dia?
        </h2>
        <p style={S.ctaSubtitle}>
          {isAuthed
            ? "Continue de onde parou."
            : "Crie sua conta gratuita em segundos e comece a usar agora."}
        </p>
        <div style={S.heroCtas}>
          {isAuthed ? (
            <Link href="/dashboard" style={S.btnPrimaryDark}>
              Ir para minhas tarefas
              <span style={S.arrow}>→</span>
            </Link>
          ) : (
            <>
              <Link href="/sign-up" style={S.btnPrimaryDark}>
                Criar conta grátis
                <span style={S.arrow}>→</span>
              </Link>
              <Link href="/sign-in" style={S.btnGhostDark}>
                Já tenho conta
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.footerInner}>
        <div style={S.logo}>
          <span style={S.logoDot} />
          mytask
        </div>
        <p style={S.footerText}>
          © {new Date().getFullYear()} mytask · Feito para quem leva tempo a sério
        </p>
      </div>
    </footer>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { background: "var(--bg)", color: "var(--fg)" },

  // Nav
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "var(--nav-bg)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border)",
  },
  navInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1rem 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: 700,
    fontSize: "1.125rem",
    letterSpacing: "-0.02em",
  },
  logoDot: {
    display: "inline-block",
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "var(--accent)",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
    fontSize: "0.9375rem",
  },
  navLink: { color: "var(--fg-muted)" },

  // Hero
  hero: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "5rem 1.5rem 4rem",
    textAlign: "center",
  },
  eyebrow: {
    display: "inline-block",
    padding: "0.375rem 0.875rem",
    background: "var(--accent-bg)",
    color: "var(--accent-hover)",
    fontSize: "0.8125rem",
    fontWeight: 600,
    borderRadius: "999px",
    marginBottom: "1.5rem",
    letterSpacing: "0.01em",
  },
  heroTitle: {
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    fontWeight: 700,
    letterSpacing: "-0.04em",
    lineHeight: 1.05,
    marginBottom: "1.5rem",
  },
  heroAccent: {
    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "1.25rem",
    color: "var(--fg-muted)",
    maxWidth: "600px",
    margin: "0 auto 2rem",
    lineHeight: 1.5,
  },
  heroCtas: {
    display: "flex",
    justifyContent: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  heroNote: {
    marginTop: "1.5rem",
    fontSize: "0.875rem",
    color: "var(--fg-subtle)",
  },
  heroPreview: {
    marginTop: "4rem",
    display: "flex",
    justifyContent: "center",
  },

  // Preview card
  previewCard: {
    width: "100%",
    maxWidth: "720px",
    background: "var(--bg-card)",
    borderRadius: "16px",
    border: "1px solid var(--border)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.08)",
    overflow: "hidden",
    textAlign: "left",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-muted)",
    position: "relative",
  },
  previewDots: { display: "flex", gap: "0.375rem" },
  previewDot: {
    width: "12px",
    height: "12px",
    borderRadius: "999px",
    display: "inline-block",
  },
  previewUrl: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "0.75rem",
    color: "var(--fg-subtle)",
    fontFamily: "var(--font-geist-mono)",
  },
  previewBody: { padding: "1.5rem" },
  previewTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  previewTitle: { fontSize: "1.125rem", fontWeight: 600 },
  previewCount: {
    fontSize: "0.75rem",
    color: "var(--fg-muted)",
    padding: "0.25rem 0.5rem",
    background: "var(--bg-muted)",
    borderRadius: "999px",
  },
  previewList: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  previewTask: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    background: "var(--bg)",
  },
  previewCheck: {
    width: "18px",
    height: "18px",
    border: "1.5px solid var(--border-strong)",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    color: "#fff",
    flexShrink: 0,
  },
  previewCheckDone: {
    background: "var(--accent)",
    borderColor: "var(--accent)",
  },
  previewTaskTitle: { flex: 1, fontSize: "0.9375rem" },
  previewBadge: {
    fontSize: "0.65rem",
    padding: "0.125rem 0.5rem",
    borderRadius: "999px",
    fontWeight: 500,
    textTransform: "uppercase",
  },

  // Sections
  section: {
    padding: "5rem 1.5rem",
    borderTop: "1px solid var(--border)",
  },
  sectionAlt: {
    padding: "4rem 1.5rem",
    background: "var(--bg-muted)",
    borderTop: "1px solid var(--border)",
    borderBottom: "1px solid var(--border)",
  },
  sectionInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "clamp(1.875rem, 4vw, 2.75rem)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    marginBottom: "1rem",
    marginTop: "0.5rem",
  },
  sectionSubtitle: {
    fontSize: "1.125rem",
    color: "var(--fg-muted)",
    maxWidth: "560px",
    margin: "0 auto 3rem",
  },

  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1rem",
    textAlign: "left",
  },
  featureCard: {
    padding: "1.75rem",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  featureIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: "var(--accent-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    marginBottom: "1rem",
  },
  featureTitle: {
    fontSize: "1.0625rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    letterSpacing: "-0.01em",
  },
  featureText: { fontSize: "0.9375rem", color: "var(--fg-muted)", lineHeight: 1.5 },

  // Stats
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "2rem",
  },
  stat: { textAlign: "center" },
  statNumber: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    marginBottom: "0.25rem",
  },
  statLabel: { color: "var(--fg-muted)", fontSize: "0.9375rem" },

  // CTA
  ctaSection: {
    padding: "6rem 1.5rem",
    background: "var(--fg)",
    color: "var(--bg)",
  },
  ctaInner: {
    maxWidth: "720px",
    margin: "0 auto",
    textAlign: "center",
  },
  ctaTitle: {
    fontSize: "clamp(1.875rem, 4vw, 3rem)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    marginBottom: "1rem",
  },
  ctaSubtitle: {
    fontSize: "1.125rem",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "2rem",
  },

  // Buttons
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.875rem 1.5rem",
    background: "var(--fg)",
    color: "var(--bg)",
    fontSize: "0.9375rem",
    fontWeight: 500,
    borderRadius: "8px",
    border: "none",
    transition: "transform 0.1s, opacity 0.1s",
  },
  btnPrimarySmall: {
    padding: "0.5rem 1rem",
    background: "var(--fg)",
    color: "var(--bg)",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "8px",
  },
  btnPrimaryDark: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.875rem 1.5rem",
    background: "var(--accent)",
    color: "#fff",
    fontSize: "0.9375rem",
    fontWeight: 500,
    borderRadius: "8px",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.875rem 1.5rem",
    color: "var(--fg)",
    fontSize: "0.9375rem",
    fontWeight: 500,
    borderRadius: "8px",
    border: "1px solid var(--border-strong)",
    background: "transparent",
  },
  btnGhostDark: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.875rem 1.5rem",
    color: "var(--bg)",
    fontSize: "0.9375rem",
    fontWeight: 500,
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
  },
  arrow: { fontSize: "1.125rem", lineHeight: 1 },

  // Footer
  footer: {
    padding: "2rem 1.5rem",
    borderTop: "1px solid var(--border)",
  },
  footerInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  footerText: { color: "var(--fg-muted)", fontSize: "0.875rem" },
};
