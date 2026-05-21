"use client";

import type { Task } from "../lib/api";

type Props = {
  task: Task;
  onClick: () => void;
  onToggleComplete?: (task: Task) => void;
};

export function TaskRow({ task, onClick, onToggleComplete }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue =
    !!task.dueDate &&
    !task.completed &&
    new Date(task.dueDate).getTime() < today.getTime();

  function handleKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKey}
        style={S.row}
      >
        {onToggleComplete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task);
            }}
            style={{ ...S.check, ...(task.completed ? S.checkDone : {}) }}
            aria-label="Marcar como concluída"
          >
            {task.completed && <span style={S.checkMark}>✓</span>}
          </button>
        )}
        <span
          style={{ ...S.priorityDot, ...priorityDotStyle(task.priority) }}
          title={`Prioridade ${priorityLabel(task.priority).toLowerCase()}`}
        />
        <div style={S.content}>
          <div
            style={{ ...S.title, ...(task.completed ? S.completed : {}) }}
          >
            {task.title}
          </div>
          {task.dueDate && (
            <div style={S.meta}>
              <span style={{ ...S.date, ...(overdue ? S.overdue : {}) }}>
                {formatDate(task.dueDate)}
                {overdue ? " · vencida" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function priorityDotStyle(p: Task["priority"]): React.CSSProperties {
  if (p === "high") return { background: "var(--priority-high-fg)" };
  if (p === "low") return { background: "var(--priority-low-fg)" };
  return { background: "var(--priority-medium-fg)" };
}

function priorityLabel(p: Task["priority"]) {
  return p === "high" ? "Alta" : p === "low" ? "Baixa" : "Média";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

const S: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: "0.875rem",
    padding: "0.875rem 1rem",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    color: "inherit",
    font: "inherit",
    transition: "border-color 0.15s, background 0.15s",
    outline: "none",
  },
  check: {
    width: "22px",
    height: "22px",
    flexShrink: 0,
    border: "1.5px solid var(--border-strong)",
    borderRadius: "6px",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkDone: {
    background: "var(--accent)",
    borderColor: "var(--accent)",
  },
  checkMark: { color: "#fff", fontSize: "0.875rem", fontWeight: 700 },
  priorityDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
    minWidth: 0,
  },
  title: {
    fontWeight: 500,
    fontSize: "0.9375rem",
    lineHeight: 1.4,
  },
  meta: {
    fontSize: "0.8125rem",
    color: "var(--fg-muted)",
  },
  date: { textTransform: "capitalize" },
  overdue: { color: "var(--danger)", fontWeight: 600 },
  completed: { textDecoration: "line-through", opacity: 0.5 },
};
