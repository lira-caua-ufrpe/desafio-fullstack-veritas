const API = "http://localhost:8080";

export async function listTasks() {
  const res = await fetch(`${API}/tasks`);
  if (!res.ok) throw new Error("Falha ao listar tarefas");
  return res.json();
}

export async function createTask(task) {
  const res = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Falha ao criar tarefa");
  return res.json();
}

export async function updateTask(id, patch) {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Falha ao atualizar tarefa");
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Falha ao excluir");
}
