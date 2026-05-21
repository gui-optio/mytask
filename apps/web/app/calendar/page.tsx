"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "../../lib/auth-client";
import { tasksApi, type Task } from "../../lib/api";
import { ThemeToggle } from "../../components/theme-toggle";
import { ViewTabs } from "../../components/view-tabs";
import { TaskRow } from "../../components/task-row";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function CalendarPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await tasksApi.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
      return;
    }
    if (session) loadTasks();
  }, [isPending, session, router, loadTasks]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const key = t.dueDate.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return map;
  }, [tasks]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const result: { date: Date; inMonth: boolean }[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      result.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        inMonth: false,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: new Date(year, month, d), inMonth: true });
    }
    while (result.length % 7 !== 0) {
      const last = result[result.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      result.push({ date: next, inMonth: false });
    }
    return result;
  }, [cursor]);

  const upcoming = useMemo(() => {
    const withDate = tasks.filter((t) => t.dueDate && !t.completed);
    withDate.sort(
      (a, b) =>
        new Date(a.dueDate as string).getTime() -
        new Date(b.dueDate as string).getTime()
    );
    return withDate.slice(0, 6);
  }, [tasks]);

  function prevMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  }
  function goToday() {
    const d = new Date();
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  if (isPending) {
    return (
      <main style={S.loading}>
        <div style={S.spinner} />
      </main>
    );
  }
  if (!session) return null;

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.navInner}>
          <Link href="/" style={S.logo}>
            <span style={S.logoDot} />
            mytask
          </Link>
          <div style={S.navUser}>
            <div style={S.avatar}>{initials(session.user.name)}</div>
            <div style={S.userBlock}>
              <div style={S.userName}>{session.user.name}</div>
              <div style={S.userEmail}>{session.user.email}</div>
            </div>
            <ThemeToggle compact />
            <button onClick={handleSignOut} style={S.btnGhost}>
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main style={S.main}>
        <header style={S.header}>
          <div>
            <h1 style={S.title}>Calendário</h1>
            <p style={S.subtitle}>
              Suas tarefas organizadas pela data limite.
            </p>
          </div>
        </header>

        <ViewTabs active="calendar" />

        <div style={S.toolbar}>
          <div style={S.monthLabel}>
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </div>
          <div style={S.toolbarBtns}>
            <button onClick={prevMonth} style={S.btnGhost} aria-label="Mês anterior">
              ‹
            </button>
            <button onClick={goToday} style={S.btnGhost}>
              Hoje
            </button>
            <button onClick={nextMonth} style={S.btnGhost} aria-label="Próximo mês">
              ›
            </button>
          </div>
        </div>

        {error && <p style={S.errorBox}>{error}</p>}

        <div style={S.grid}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={S.weekday}>{w}</div>
          ))}
          {cells.map(({ date, inMonth }) => {
            const key = isoDay(date);
            const dayTasks = tasksByDay.get(key) ?? [];
            const isToday = date.getTime() === today.getTime();
            return (
              <div
                key={key + (inMonth ? "" : "-out")}
                style={{
                  ...S.cell,
                  ...(inMonth ? {} : S.cellMuted),
                  ...(isToday ? S.cellToday : {}),
                }}
              >
                <div style={S.cellHead}>
                  <span style={isToday ? S.dayNumToday : S.dayNum}>
                    {date.getDate()}
                  </span>
                </div>
                <div style={S.cellList}>
                  {dayTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        ...S.cellTask,
                        ...priorityBgStyle(t.priority),
                        ...(t.completed ? S.cellTaskDone : {}),
                      }}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div style={S.cellMore}>+{dayTasks.length - 3} mais</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <section style={S.upcomingSection}>
          <h2 style={S.upcomingTitle}>Próximas tarefas</h2>
          {loading ? (
            <div style={S.emptyState}>
              <div style={S.spinner} />
            </div>
          ) : upcoming.length === 0 ? (
            <div style={S.emptyState}>
              <p style={S.emptyText}>
                Nenhuma tarefa pendente com data limite. Adicione uma data nas{" "}
                <Link href="/dashboard" style={S.link}>suas tarefas</Link>.
              </p>
            </div>
          ) : (
            <ul style={S.upcomingList}>
              {upcoming.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onClick={() => setSelectedTask(t)}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      {selectedTask && (
        <div style={S.panelOverlay} onClick={() => setSelectedTask(null)}>
          <aside
            style={S.panel}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header style={S.panelHeader}>
              <h2 style={S.panelTitle}>Detalhes da tarefa</h2>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                style={S.btnClose}
                aria-label="Fechar painel"
              >
                ×
              </button>
            </header>

            <div style={S.panelBody}>
              <div>
                <div
                  style={{
                    ...S.taskTitle,
                    ...(selectedTask.completed ? S.completed : {}),
                  }}
                >
                  {selectedTask.title}
                </div>
                <span
                  style={{ ...S.badge, ...priorityBgStyle(selectedTask.priority) }}
                >
                  {priorityLabel(selectedTask.priority)}
                </span>
              </div>

              {selectedTask.description && (
                <div>
                  <div style={S.fieldLabel}>Descrição</div>
                  <p style={S.fieldText}>{selectedTask.description}</p>
                </div>
              )}

              {selectedTask.dueDate && (
                <div>
                  <div style={S.fieldLabel}>Data limite</div>
                  <p style={S.fieldTextCapital}>{formatFullDate(selectedTask.dueDate)}</p>
                </div>
              )}

              <div>
                <div style={S.fieldLabel}>Status</div>
                <p style={S.fieldText}>
                  {selectedTask.completed ? "Concluída" : "Pendente"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function priorityLabel(p: Task["priority"]) {
  return p === "high" ? "Alta" : p === "low" ? "Baixa" : "Média";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function priorityBgStyle(p: Task["priority"]): React.CSSProperties {
  if (p === "high")
    return {
      background: "var(--priority-high-bg)",
      color: "var(--priority-high-fg)",
    };
  if (p === "low")
    return {
      background: "var(--priority-low-bg)",
      color: "var(--priority-low-fg)",
    };
  return {
    background: "var(--priority-medium-bg)",
    color: "var(--priority-medium-fg)",
  };
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "var(--bg)" },

  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid var(--border)",
    borderTopColor: "var(--accent)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  nav: {
    background: "var(--nav-bg)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  navInner: {
    maxWidth: "1100px",
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
  navUser: { display: "flex", alignItems: "center", gap: "0.75rem" },
  navLink: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--fg-muted)",
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "999px",
    background: "var(--fg)",
    color: "var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: "0.8125rem",
  },
  userBlock: { lineHeight: 1.2 },
  userName: { fontSize: "0.875rem", fontWeight: 500 },
  userEmail: { fontSize: "0.75rem", color: "var(--fg-muted)" },

  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2.5rem 1.5rem 4rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  header: { marginBottom: "0.5rem" },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    marginBottom: "0.25rem",
  },
  subtitle: { color: "var(--fg-muted)", fontSize: "1rem" },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  monthLabel: {
    fontSize: "1.25rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    textTransform: "capitalize",
  },
  toolbarBtns: { display: "flex", gap: "0.375rem" },
  btnGhost: {
    padding: "0.5rem 0.875rem",
    border: "1px solid var(--border-strong)",
    borderRadius: "8px",
    background: "transparent",
    color: "var(--fg)",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
  },

  errorBox: {
    color: "var(--danger)",
    fontSize: "0.875rem",
    padding: "0.75rem 0.875rem",
    background: "var(--danger-bg)",
    borderRadius: "8px",
    border: "1px solid var(--danger-bg)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "1px",
    background: "var(--border)",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid var(--border)",
  },
  weekday: {
    background: "var(--bg-muted)",
    padding: "0.625rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--fg-muted)",
    textAlign: "center",
  },
  cell: {
    background: "var(--bg-card)",
    minHeight: "108px",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  cellMuted: {
    background: "var(--bg)",
    opacity: 0.55,
  },
  cellToday: {
    background: "var(--accent-bg)",
  },
  cellHead: { display: "flex", justifyContent: "space-between" },
  dayNum: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--fg-muted)",
  },
  dayNumToday: {
    fontSize: "0.8125rem",
    fontWeight: 700,
    color: "var(--accent-hover)",
  },
  cellList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  cellTask: {
    fontSize: "0.6875rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "6px",
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cellTaskDone: {
    textDecoration: "line-through",
    opacity: 0.5,
  },
  cellMore: {
    fontSize: "0.6875rem",
    color: "var(--fg-muted)",
    fontWeight: 500,
    padding: "0 0.25rem",
  },

  upcomingSection: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  upcomingTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  upcomingList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    listStyle: "none",
  },

  emptyState: {
    padding: "2rem 1.5rem",
    textAlign: "center",
    background: "var(--bg-card)",
    border: "1px dashed var(--border-strong)",
    borderRadius: "12px",
  },
  emptyText: { color: "var(--fg-muted)", fontSize: "0.9375rem" },
  link: { color: "var(--fg)", fontWeight: 600, textDecoration: "underline" },

  // Side panel
  panelOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 40,
    animation: "overlay-in 0.18s ease-out",
  },
  panel: {
    width: "100%",
    maxWidth: "440px",
    height: "100vh",
    background: "var(--bg-card)",
    borderLeft: "1px solid var(--border)",
    boxShadow: "-12px 0 32px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    animation: "panel-in 0.22s ease-out",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid var(--border)",
  },
  panelTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  btnClose: {
    width: "28px",
    height: "28px",
    border: "none",
    background: "transparent",
    color: "var(--fg-muted)",
    fontSize: "1.25rem",
    lineHeight: 1,
    borderRadius: "6px",
    cursor: "pointer",
  },
  panelBody: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    padding: "1.5rem",
    overflowY: "auto",
    flex: 1,
  },
  taskTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    lineHeight: 1.3,
    marginBottom: "0.5rem",
  },
  badge: {
    display: "inline-block",
    fontSize: "0.6875rem",
    padding: "0.25rem 0.625rem",
    borderRadius: "999px",
    fontWeight: 600,
    letterSpacing: "0.02em",
  },
  completed: { textDecoration: "line-through", opacity: 0.5 },
  fieldLabel: {
    fontSize: "0.75rem",
    color: "var(--fg-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 600,
    marginBottom: "0.375rem",
  },
  fieldText: {
    fontSize: "0.9375rem",
    color: "var(--fg)",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  fieldTextCapital: {
    fontSize: "0.9375rem",
    color: "var(--fg)",
    lineHeight: 1.5,
    textTransform: "capitalize",
  },
};
