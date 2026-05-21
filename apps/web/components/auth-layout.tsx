"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-main" style={S.main}>
      <aside className="auth-aside" style={S.aside}>
        <div style={S.asideOverlay} />
        <div style={S.asideGrid} />
        <div style={S.asideBlob1} />
        <div style={S.asideBlob2} />

        <div style={S.asideTop}>
          <Link href="/" style={S.logoLight}>
            <span style={S.logoDotLight} />
            mytask
          </Link>
        </div>

        <div style={S.asideContent}>
          <span style={S.eyebrow}>Gerenciamento de tarefas inteligente</span>
          <h2 style={S.asideTitle}>
            Sua produtividade<br />
            merece mais organização.
          </h2>
          <p style={S.asideSubtitle}>
            Centralize tarefas, defina prioridades e nunca mais perca um prazo
            importante.
          </p>

          <div style={S.floatStack}>
            <FloatingTask
              title="Finalizar relatório trimestral"
              priority="Alta"
              priorityBg="rgba(254, 226, 226, 0.95)"
              priorityFg="#991b1b"
              done={false}
              offset={0}
            />
            <FloatingTask
              title="Revisar PRs do time"
              priority="Média"
              priorityBg="rgba(254, 243, 199, 0.95)"
              priorityFg="#92400e"
              done={false}
              offset={1}
            />
            <FloatingTask
              title="Responder e-mails do cliente"
              priority="Média"
              priorityBg="rgba(254, 243, 199, 0.95)"
              priorityFg="#92400e"
              done
              offset={2}
            />
          </div>
        </div>

        <div style={S.asideFooter}>
          <span style={S.asideFooterText}>
            © {new Date().getFullYear()} mytask · Feito para quem leva tempo a sério
          </span>
        </div>
      </aside>

      <section style={S.formSide}>
        <div style={S.themeCorner}>
          <ThemeToggle compact />
        </div>

        <Link href="/" className="auth-logo-mobile" style={S.logoMobile}>
          <span style={S.logoDot} />
          mytask
        </Link>

        <div style={S.formInner}>{children}</div>
      </section>
    </main>
  );
}

function FloatingTask({
  title,
  priority,
  priorityBg,
  priorityFg,
  done,
  offset,
}: {
  title: string;
  priority: string;
  priorityBg: string;
  priorityFg: string;
  done: boolean;
  offset: number;
}) {
  return (
    <div
      className="auth-float-card"
      style={{
        ...S.floatCard,
        marginLeft: `${offset * 18}px`,
      }}
    >
      <span
        style={{
          ...S.floatCheck,
          ...(done
            ? { background: "#10b981", borderColor: "#10b981", color: "#fff" }
            : {}),
        }}
      >
        {done ? "✓" : ""}
      </span>
      <span
        style={{
          ...S.floatTitle,
          ...(done ? { textDecoration: "line-through", opacity: 0.55 } : {}),
        }}
      >
        {title}
      </span>
      <span style={{ ...S.floatBadge, background: priorityBg, color: priorityFg }}>
        {priority}
      </span>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
    background: "var(--bg)",
  },

  // Left side — art
  aside: {
    position: "relative",
    overflow: "hidden",
    padding: "2.5rem 3rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#fff",
    background:
      "linear-gradient(140deg, #047857 0%, #059669 35%, #10b981 75%, #34d399 100%)",
    minHeight: "100vh",
  },
  asideOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.18), transparent 45%), radial-gradient(circle at 80% 90%, rgba(0,0,0,0.25), transparent 50%)",
    pointerEvents: "none",
  },
  asideGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
    backgroundSize: "44px 44px",
    maskImage:
      "radial-gradient(ellipse at center, rgba(0,0,0,0.8), transparent 70%)",
    WebkitMaskImage:
      "radial-gradient(ellipse at center, rgba(0,0,0,0.8), transparent 70%)",
    pointerEvents: "none",
  },
  asideBlob1: {
    position: "absolute",
    top: "-120px",
    right: "-100px",
    width: "360px",
    height: "360px",
    borderRadius: "999px",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  asideBlob2: {
    position: "absolute",
    bottom: "-140px",
    left: "-80px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background:
      "radial-gradient(circle, rgba(4,120,87,0.55) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  asideTop: { position: "relative", zIndex: 1 },
  logoLight: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: 700,
    fontSize: "1.125rem",
    letterSpacing: "-0.02em",
    color: "#fff",
  },
  logoDotLight: {
    display: "inline-block",
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#fff",
    boxShadow: "0 0 0 4px rgba(255,255,255,0.18)",
  },

  asideContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "460px",
  },
  eyebrow: {
    display: "inline-block",
    padding: "0.375rem 0.875rem",
    background: "rgba(255,255,255,0.16)",
    color: "#fff",
    fontSize: "0.8125rem",
    fontWeight: 600,
    borderRadius: "999px",
    marginBottom: "1.5rem",
    letterSpacing: "0.01em",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  asideTitle: {
    fontSize: "clamp(2rem, 3.4vw, 2.75rem)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    marginBottom: "1rem",
  },
  asideSubtitle: {
    fontSize: "1.0625rem",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 1.55,
    marginBottom: "2.5rem",
  },

  floatStack: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  floatCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.875rem 1rem",
    background: "rgba(255,255,255,0.96)",
    color: "#0a0a0a",
    borderRadius: "12px",
    boxShadow:
      "0 18px 40px rgba(0,0,0,0.18), 0 2px 0 rgba(255,255,255,0.4) inset",
    maxWidth: "380px",
    backdropFilter: "blur(10px)",
  },
  floatCheck: {
    width: "20px",
    height: "20px",
    border: "1.5px solid #d4d4d4",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  floatTitle: { flex: 1, fontSize: "0.9375rem", fontWeight: 500 },
  floatBadge: {
    fontSize: "0.6875rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "999px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },

  asideFooter: {
    position: "relative",
    zIndex: 1,
  },
  asideFooterText: {
    fontSize: "0.8125rem",
    color: "rgba(255,255,255,0.7)",
  },

  // Right side — form
  formSide: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2.5rem 1.5rem",
    background: "var(--bg)",
  },
  themeCorner: {
    position: "absolute",
    top: "1.25rem",
    right: "1.25rem",
  },
  logoMobile: {
    display: "none",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: 700,
    fontSize: "1.125rem",
    letterSpacing: "-0.02em",
    color: "var(--fg)",
    marginBottom: "1.5rem",
  },
  logoDot: {
    display: "inline-block",
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "var(--accent)",
  },
  formInner: {
    width: "100%",
    maxWidth: "420px",
  },
};
