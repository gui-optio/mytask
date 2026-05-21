"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "../../lib/auth-client";
import { tasksApi, type Task } from "../../lib/api";
import { ThemeToggle } from "../../components/theme-toggle";
import { ViewTabs } from "../../components/view-tabs";
import { TaskRow } from "../../components/task-row";

type Filter = "all" | "active" | "completed";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!successMessage) return;
    const id = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(id);
  }, [successMessage]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editing, setEditing] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
  }

  function closeForm() {
    resetForm();
    setError(null);
    setShowForm(false);
  }

  function openCreatePanel() {
    setEditingId(null);
    resetForm();
    setError(null);
    setShowForm(true);
  }

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true);
    setError(null);
    try {
      setTasks(await tasksApi.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar tarefas");
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
      return;
    }
    if (session) loadTasks();
  }, [isPending, session, router, loadTasks]);

  const filtered = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    return { total, done, active: total - done };
  }, [tasks]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await tasksApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate + "T12:00:00").toISOString() : undefined,
      });
      setTasks((prev) => [created, ...prev]);
      resetForm();
      setShowForm(false);
      setSuccessMessage("Tarefa adicionada com sucesso");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar tarefa");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleCompleted(t: Task) {
    const optimistic = { ...t, completed: !t.completed };
    setTasks((prev) => prev.map((x) => (x.id === t.id ? optimistic : x)));
    try {
      const updated = await tasksApi.update(t.id, { completed: !t.completed });
      setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (e) {
      setTasks((prev) => prev.map((x) => (x.id === t.id ? t : x)));
      setError(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  }

  function startEdit(t: Task) {
    setShowForm(false);
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDescription(t.description ?? "");
    setEditPriority(t.priority);
    setEditDueDate(t.dueDate ? t.dueDate.slice(0, 10) : "");
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(t: Task) {
    if (!editTitle.trim()) return;
    setEditing(true);
    setError(null);
    try {
      const updated = await tasksApi.update(t.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        priority: editPriority,
        dueDate: editDueDate ? new Date(editDueDate + "T12:00:00").toISOString() : null,
      });
      setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar");
    } finally {
      setEditing(false);
    }
  }

  function requestDelete(id: string) {
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    const backup = tasks;
    setDeleting(true);
    setError(null);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await tasksApi.remove(id);
      setConfirmDeleteId(null);
      // Also close the edit panel if this task was being edited
      if (editingId === id) setEditingId(null);
    } catch (e) {
      setTasks(backup);
      setError(e instanceof Error ? e.message : "Erro ao apagar");
    } finally {
      setDeleting(false);
    }
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
            <h1 style={S.title}>Olá, {session.user.name.split(" ")[0]}</h1>
            <p style={S.subtitle}>
              {stats.active === 0
                ? "Nada pendente. Aproveite o dia!"
                : `Você tem ${stats.active} ${stats.active === 1 ? "tarefa" : "tarefas"} pra concluir.`}
            </p>
          </div>
        </header>

        <ViewTabs active="tasks" />

        <div style={S.statsRow}>
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Ativas" value={stats.active} accent="warning" />
          <StatCard label="Concluídas" value={stats.done} accent="accent" />
        </div>

        <button
          type="button"
          onClick={openCreatePanel}
          style={S.btnAddTask}
        >
          <span style={S.btnAddTaskIcon}>+</span>
          Adicionar tarefa
        </button>

        {error && <p style={S.errorBox}>{error}</p>}
        {successMessage && <p style={S.successBox}>{successMessage}</p>}

        <div style={S.listHeader}>
          <h2 style={S.listTitle}>Tarefas</h2>
          <div style={S.filters}>
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              Todas ({stats.total})
            </FilterButton>
            <FilterButton active={filter === "active"} onClick={() => setFilter("active")}>
              Ativas ({stats.active})
            </FilterButton>
            <FilterButton active={filter === "completed"} onClick={() => setFilter("completed")}>
              Concluídas ({stats.done})
            </FilterButton>
          </div>
        </div>

        {loadingTasks ? (
          <div style={S.emptyState}>
            <div style={S.spinner} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={S.emptyState}>
            <p style={S.emptyText}>
              {filter === "all"
                ? "Nenhuma tarefa ainda. Crie a primeira acima!"
                : filter === "active"
                  ? "Sem tarefas ativas. Bom trabalho!"
                  : "Nenhuma tarefa concluída ainda."}
            </p>
          </div>
        ) : (
          <ul style={S.list}>
            {filtered.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onClick={() => startEdit(t)}
                onToggleComplete={toggleCompleted}
              />
            ))}
          </ul>
        )}
      </main>

      {(showForm || editingId !== null) && (
        <div
          style={S.panelOverlay}
          onClick={() => {
            if (showForm && !submitting) closeForm();
            if (editingId !== null && !editing) cancelEdit();
          }}
        >
          <aside
            style={S.panel}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header style={S.panelHeader}>
              <h2 style={S.panelTitle}>
                {showForm ? "Nova tarefa" : "Editar tarefa"}
              </h2>
              <button
                type="button"
                onClick={showForm ? closeForm : cancelEdit}
                style={S.btnClose}
                aria-label="Fechar painel"
              >
                ×
              </button>
            </header>

            {showForm ? (
              <form onSubmit={handleCreate} style={S.panelBody}>
                <label style={S.panelLabel}>
                  <span style={S.panelLabelText}>Título</span>
                  <input
                    type="text"
                    placeholder="O que precisa ser feito?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={S.input}
                    required
                    autoFocus
                  />
                </label>
                <label style={S.panelLabel}>
                  <span style={S.panelLabelText}>Descrição</span>
                  <textarea
                    placeholder="Adicionar descrição (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={S.textarea}
                    rows={4}
                  />
                </label>
                <label style={S.panelLabel}>
                  <span style={S.panelLabelText}>Prioridade</span>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "low" | "medium" | "high")
                    }
                    style={S.select}
                  >
                    <option value="low">Prioridade baixa</option>
                    <option value="medium">Prioridade média</option>
                    <option value="high">Prioridade alta</option>
                  </select>
                </label>
                <label style={S.panelLabel}>
                  <span style={S.panelLabelText}>Data limite</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={S.input}
                  />
                </label>

                {error && <p style={S.errorBox}>{error}</p>}

                <div style={S.panelActions}>
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={submitting}
                    style={S.btnGhost}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !title.trim()}
                    style={S.btnPrimary}
                  >
                    {submitting ? "Adicionando..." : "+ Adicionar"}
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const t = tasks.find((x) => x.id === editingId);
                  if (t) saveEdit(t);
                }}
                style={S.panelBody}
              >
                <label style={S.panelLabel}>
                  <span style={S.panelLabelText}>Título</span>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={S.input}
                    placeholder="O que precisa ser feito?"
                    required
                    autoFocus
                  />
                </label>
                <label style={S.panelLabel}>
                  <span style={S.panelLabelText}>Descrição</span>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={S.textarea}
                    placeholder="Adicionar descrição (opcional)"
                    rows={4}
                  />
                </label>
                <label style={S.panelLabel}>
                  <span style={S.panelLabelText}>Prioridade</span>
                  <select
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(e.target.value as "low" | "medium" | "high")
                    }
                    style={S.select}
                  >
                    <option value="low">Prioridade baixa</option>
                    <option value="medium">Prioridade média</option>
                    <option value="high">Prioridade alta</option>
                  </select>
                </label>
                <label style={S.panelLabel}>
                  <span style={S.panelLabelText}>Data limite</span>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    style={S.input}
                  />
                </label>

                {error && <p style={S.errorBox}>{error}</p>}

                <div style={S.panelActions}>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => requestDelete(editingId)}
                      disabled={editing}
                      style={{ ...S.btnDangerGhost, marginRight: "auto" }}
                    >
                      Remover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={editing}
                    style={S.btnGhost}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editing || !editTitle.trim()}
                    style={S.btnPrimary}
                  >
                    {editing ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </form>
            )}
          </aside>
        </div>
      )}

      {confirmDeleteId && (
        <div
          style={S.modalOverlay}
          onClick={() => !deleting && setConfirmDeleteId(null)}
        >
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Apagar tarefa?</h3>
            <p style={S.modalText}>
              Esta ação não pode ser desfeita. A tarefa será removida permanentemente.
            </p>
            <div style={S.modalActions}>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
                style={S.btnGhost}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                style={S.btnDanger}
              >
                {deleting ? "Apagando..." : "Sim, apagar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "accent" | "warning";
}) {
  const accentStyle: React.CSSProperties =
    accent === "accent"
      ? { color: "var(--accent)" }
      : accent === "warning"
        ? { color: "var(--warning)" }
        : {};
  return (
    <div style={S.statCard}>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statValue, ...accentStyle }}>{value}</div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{ ...S.filterBtn, ...(active ? S.filterBtnActive : {}) }}
    >
      {children}
    </button>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

  // Nav
  nav: {
    background: "var(--nav-bg)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  navInner: {
    maxWidth: "880px",
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
  btnGhost: {
    padding: "0.5rem 0.875rem",
    border: "1px solid var(--border-strong)",
    borderRadius: "8px",
    background: "transparent",
    color: "var(--fg)",
    fontSize: "0.8125rem",
    fontWeight: 500,
  },

  // Main
  main: {
    maxWidth: "880px",
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

  // Stats
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.75rem",
  },
  statCard: {
    padding: "1.25rem",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "var(--fg-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 500,
    marginBottom: "0.375rem",
  },
  statValue: {
    fontSize: "1.875rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },

  // Form
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
  btnAddTask: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.875rem 1rem",
    background: "var(--bg-card)",
    border: "1px dashed var(--border-strong)",
    borderRadius: "12px",
    color: "var(--fg-muted)",
    fontSize: "0.9375rem",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "border-color 0.15s, color 0.15s",
  },
  btnAddTaskIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "6px",
    background: "var(--accent-bg)",
    color: "var(--accent-hover)",
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1,
  },
  input: {
    padding: "0.625rem 0.875rem",
    border: "1px solid var(--border-strong)",
    borderRadius: "8px",
    fontSize: "0.9375rem",
    background: "var(--bg)",
    color: "var(--fg)",
    outline: "none",
  },
  select: {
    flex: 1,
    padding: "0.625rem 0.875rem",
    border: "1px solid var(--border-strong)",
    borderRadius: "8px",
    fontSize: "0.9375rem",
    background: "var(--bg)",
    color: "var(--fg)",
  },
  btnPrimary: {
    padding: "0.625rem 1.25rem",
    border: "none",
    borderRadius: "8px",
    background: "var(--fg)",
    color: "var(--bg)",
    fontSize: "0.9375rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  errorBox: {
    color: "var(--danger)",
    fontSize: "0.875rem",
    padding: "0.75rem 0.875rem",
    background: "var(--danger-bg)",
    borderRadius: "8px",
    border: "1px solid var(--danger-bg)",
  },
  successBox: {
    color: "var(--accent-hover)",
    fontSize: "0.875rem",
    fontWeight: 500,
    padding: "0.75rem 0.875rem",
    background: "var(--accent-bg)",
    borderRadius: "8px",
    border: "1px solid var(--accent-bg)",
  },

  // List header + filters
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.5rem",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  listTitle: { fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.01em" },
  filters: {
    display: "flex",
    gap: "0.25rem",
    padding: "0.25rem",
    background: "var(--bg-muted)",
    borderRadius: "8px",
  },
  filterBtn: {
    padding: "0.375rem 0.75rem",
    border: "none",
    background: "transparent",
    color: "var(--fg-muted)",
    fontSize: "0.8125rem",
    fontWeight: 500,
    borderRadius: "6px",
  },
  filterBtnActive: {
    background: "var(--bg-card)",
    color: "var(--fg)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  },

  // List
  list: { display: "flex", flexDirection: "column", gap: "0.5rem", listStyle: "none" },

  btnDanger: {
    padding: "0.625rem 1.25rem",
    border: "none",
    borderRadius: "8px",
    background: "var(--danger)",
    color: "#fff",
    fontSize: "0.9375rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  btnDangerGhost: {
    padding: "0.625rem 1rem",
    border: "1px solid var(--danger)",
    borderRadius: "8px",
    background: "transparent",
    color: "var(--danger)",
    fontSize: "0.9375rem",
    fontWeight: 500,
    cursor: "pointer",
  },

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
  panelBody: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: "1.5rem",
    overflowY: "auto",
    flex: 1,
  },
  panelLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4375rem",
  },
  panelLabelText: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--fg)",
  },
  textarea: {
    padding: "0.625rem 0.875rem",
    border: "1px solid var(--border-strong)",
    borderRadius: "8px",
    fontSize: "0.9375rem",
    background: "var(--bg)",
    color: "var(--fg)",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "84px",
  },
  panelActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5rem",
    marginTop: "auto",
    paddingTop: "0.5rem",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 50,
  },
  modal: {
    width: "100%",
    maxWidth: "420px",
    background: "var(--bg-card)",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    padding: "1.5rem",
    boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
  },
  modalTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    marginBottom: "0.5rem",
  },
  modalText: {
    fontSize: "0.9375rem",
    color: "var(--fg-muted)",
    lineHeight: 1.5,
    marginBottom: "1.25rem",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5rem",
  },

  emptyState: {
    padding: "3rem 1.5rem",
    textAlign: "center",
    background: "var(--bg-card)",
    border: "1px dashed var(--border-strong)",
    borderRadius: "12px",
  },
  emptyText: { color: "var(--fg-muted)", fontSize: "0.9375rem" },
};
