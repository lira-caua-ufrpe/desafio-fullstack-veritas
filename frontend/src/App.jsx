import { useEffect, useMemo, useState } from "react";
import { listTasks, createTask, updateTask, deleteTask } from "./api";

const STATUSES = ["todo", "doing", "done"];
const LABEL = { todo: "A Fazer", doing: "Em Progresso", done: "Concluídas" };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listTasks();
        setTasks(data);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const by = { todo: [], doing: [], done: [] };
    for (const t of tasks) by[t.status]?.push(t);
    return by;
  }, [tasks]);

  async function onAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setSaving(true);
      const created = await createTask({ title: title.trim(), description, status: "todo" });
      setTasks((prev) => [...prev, created]);
      setTitle("");
      setDescription("");
      setErr("");
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function onMove(t, dir) {
    const idx = STATUSES.indexOf(t.status);
    const next = STATUSES[idx + dir];
    if (!next) return;
    try {
      setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: next } : x)));
      await updateTask(t.id, { title: t.title, description: t.description, status: next });
    } catch {
      setErr("Falha ao mover. Recarregue a página.");
    }
  }

  async function onDelete(id) {
    if (!confirm("Excluir esta tarefa?")) return;
    try {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await deleteTask(id);
    } catch {
      setErr("Falha ao excluir. Recarregue a página.");
    }
  }

  function startEdit(t) {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDesc(t.description || "");
  }

  async function confirmEdit(id) {
    if (!editTitle.trim()) return;
    try {
      const updated = await updateTask(id, {
        title: editTitle.trim(),
        description: editDesc,
        status: tasks.find((t) => t.id === id)?.status,
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      setErr("");
    } catch {
      setErr("Falha ao editar.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>Mini Kanban</h1>
      </header>

      <section style={styles.addBox}>
        <form onSubmit={onAdd} style={styles.form}>
          <input
            placeholder="Título da tarefa *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.input}
          />
          <button disabled={saving || !title.trim()} style={styles.btnPrimary}>
            {saving ? "Adicionando..." : "Adicionar"}
          </button>
        </form>
        {err && <p style={{ color: "crimson", marginTop: 6 }}>{err}</p>}
      </section>

      {loading ? (
        <p style={{ padding: 16 }}>Carregando…</p>
      ) : (
        <div style={styles.columns}>
          {STATUSES.map((s) => (
            <Column
              key={s}
              title={LABEL[s]}
              tasks={grouped[s]}
              onMove={onMove}
              onDelete={onDelete}
              startEdit={startEdit}
              confirmEdit={confirmEdit}
              cancelEdit={cancelEdit}
              editingId={editingId}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editDesc={editDesc}
              setEditDesc={setEditDesc}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Column({
  title,
  tasks,
  onMove,
  onDelete,
  startEdit,
  confirmEdit,
  cancelEdit,
  editingId,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
}) {
  return (
    <div style={styles.column}>
      <div style={styles.columnHead}>
        <h3 style={{ margin: 0 }}>{title}</h3>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {tasks.map((t) => (
          <div key={t.id} style={styles.card}>
            {editingId === t.id ? (
              <div style={{ display: "grid", gap: 6 }}>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={styles.input} />
                <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} style={styles.input} />
                <div style={styles.row}>
                  <button onClick={() => confirmEdit(t.id)} style={styles.btnPrimary}>Salvar</button>
                  <button onClick={cancelEdit} style={styles.btnGhost}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gap: 4 }}>
                  <strong>{t.title}</strong>
                  {t.description ? <small style={{ opacity: 0.8 }}>{t.description}</small> : null}
                </div>
                <div style={styles.row}>
                  <button onClick={() => onMove(t, -1)} style={styles.btnGhost} disabled={t.status === "todo"}>←</button>
                  <button onClick={() => startEdit(t)} style={styles.btnGhost}>Editar</button>
                  <button onClick={() => onDelete(t.id)} style={styles.btnGhost}>Excluir</button>
                  <button onClick={() => onMove(t, +1)} style={styles.btnGhost} disabled={t.status === "done"}>→</button>
                </div>
              </>
            )}
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={styles.hint}>
            <small>Nenhuma tarefa em “{title}”.</small>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "system-ui, Arial, sans-serif", maxWidth: 1100, margin: "0 auto", padding: 16 },
  header: { padding: "8px 0", marginBottom: 8, borderBottom: "1px solid #eee" },
  addBox: { margin: "12px 0 16px" },
  form: { display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr auto" },
  input: { padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd" },
  btnPrimary: { padding: "8px 12px", borderRadius: 8, border: "1px solid #0a7", background: "#0a7", color: "white", cursor: "pointer" },
  btnGhost: { padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc", background: "white", cursor: "pointer" },
  columns: { display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr 1fr" },
  column: { background: "#f8f9fb", border: "1px solid #eee", borderRadius: 12, padding: 12, minHeight: 300 },
  columnHead: { marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #e6e6e6" },
  card: { background: "white", border: "1px solid #eee", borderRadius: 12, padding: 12, display: "grid", gap: 8 },
  row: { display: "flex", gap: 8, justifyContent: "space-between", flexWrap: "wrap" },
  hint: { padding: 8, border: "1px dashed #ddd", borderRadius: 8, background: "#fafafa", textAlign: "center" },
};
