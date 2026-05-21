const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type NewTaskInput = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
};

export type UpdateTaskInput = Partial<{
  title: string;
  description: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
}>;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export const tasksApi = {
  list: () => request<Task[]>("/tasks"),
  create: (input: NewTaskInput) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: UpdateTaskInput) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (id: string) =>
    request<{ ok: true; id: string }>(`/tasks/${id}`, { method: "DELETE" }),
};
