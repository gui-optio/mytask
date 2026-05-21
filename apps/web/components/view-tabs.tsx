import Link from "next/link";

type View = "tasks" | "calendar";

export function ViewTabs({ active }: { active: View }) {
  return (
    <div style={S.tabs} role="tablist">
      <Tab href="/dashboard" active={active === "tasks"} label="Tarefas" />
      <Tab href="/calendar" active={active === "calendar"} label="Calendário" />
    </div>
  );
}

function Tab({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      style={{ ...S.tab, ...(active ? S.tabActive : {}) }}
    >
      {label}
    </Link>
  );
}

const S: Record<string, React.CSSProperties> = {
  tabs: {
    display: "inline-flex",
    gap: "0.25rem",
    padding: "0.25rem",
    background: "var(--bg-muted)",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    alignSelf: "flex-start",
  },
  tab: {
    padding: "0.5rem 0.875rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--fg-muted)",
    borderRadius: "8px",
    transition: "background 0.15s, color 0.15s",
  },
  tabActive: {
    background: "var(--bg-card)",
    color: "var(--fg)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  },
};
