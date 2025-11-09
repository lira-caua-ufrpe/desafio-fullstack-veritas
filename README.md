
# Desafio Fullstack — Mini Kanban (React + Go)

Pequeno **Kanban** com três colunas fixas (**A Fazer**, **Em Progresso**, **Concluídas**), CRUD completo de tarefas, validações e **persistência em JSON**.  
Frontend em **React (Vite)** e backend em **Go** com API REST.

---

## ⚡️ Demonstração rápida

- **Frontend:** `http://localhost:5173`  
- **API:** `http://localhost:8080/health` e `http://localhost:8080/tasks`  
- **User Flow (obrigatório):** [`/docs/user-flow.png`](./docs/user-flow.png)

---

## 🗂 Estrutura do repositório

```

desafio-fullstack-veritas
├─ backend/
│  ├─ main.go           # server + rotas + CORS
│  ├─ handlers.go       # handlers REST /tasks
│  ├─ models.go         # modelos e validações
│  ├─ storage.go        # persistência em tasks.json (bônus)
│  └─ tasks.json        # "banco" em arquivo
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx        # UI Kanban + chamadas à API
│  │  ├─ api.js         # cliente REST
│  │  ├─ index.css      # tema claro/contraste
│  │  └─ main.jsx
│  ├─ index.html
│  └─ package.json
├─ docs/
│  ├─ user-flow.png     # diagrama do fluxo do usuário (obrigatório)
│  └─ user-flow.md      # fonte Mermaid (manutenção)
├─ tests/
│  ├─ rest.http         # chamadas REST (VS Code REST Client)
│  └─ run.ps1           # smoke-test (Windows/PowerShell)
└─ README.md

````

---

## ✅ Requisitos atendidos

- **Frontend (React):** render das 3 colunas; **adicionar**, **editar**, **mover** e **excluir** tarefas; feedback básico de loading/erro; consumo da API REST.
- **Backend (Go):** endpoints **GET/POST/PUT/DELETE** para `/tasks`; **validações** (título obrigatório, status válido: `todo|doing|done`); **CORS** liberado para dev.
- **Documentação:** **User Flow** em `/docs`.
- **Git:** commits claros e organizados.

**Bônus implementado:** persistência em **arquivo JSON**.  
**Bônus pendentes (opcional):** drag & drop, Docker, testes automatizados.

---

## 🚀 Como rodar

### 1) Pré-requisitos
- **Go** ≥ 1.22  
- **Node** ≥ 18 e **npm**  
- Windows/macOS/Linux (desenvolvido e testado em Windows)

### 2) Backend

```bash
cd backend
go run .
# API em http://localhost:8080
````

**Rotas:**

* `GET    /health` → `"ok"`
* `GET    /tasks`
* `POST   /tasks`
* `GET    /tasks/:id`
* `PUT    /tasks/:id`
* `DELETE /tasks/:id`

> A persistência grava em `backend/tasks.json`. O arquivo é carregado no **start** e salvo após **POST/PUT/DELETE**.

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
# App em http://localhost:5173
```

> **PowerShell bloqueando `npm.ps1`?** Use `npm.cmd run dev` **ou**:
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

---

## 🧪 Teste rápido da API (PowerShell)

```powershell
# Saúde
irm http://localhost:8080/health

# Lista (deve iniciar como [])
irm http://localhost:8080/tasks

# Cria
$body = @{ title="Configurar colunas"; description="Kanban"; status="todo" } | ConvertTo-Json
$created = irm -Uri http://localhost:8080/tasks -Method POST -Body $body -ContentType "application/json"
$created

# Atualiza
$id = $created.id
$upd = @{ title="Configurar colunas"; description="Kanban básico"; status="doing" } | ConvertTo-Json
irm -Uri "http://localhost:8080/tasks/$id" -Method PUT -Body $upd -ContentType "application/json"

# Deleta
irm -Uri "http://localhost:8080/tasks/$id" -Method DELETE
```

---

## 🧠 Decisões técnicas

* **Go `net/http`** puro: handlers simples e fáceis de ler.
* **CORS** liberado para `http://localhost:*` durante desenvolvimento.
* **Persistência:** memória + **`tasks.json`** (bônus).

  * Carrega no início (`loadTasks()`).
  * Salva **fora** do lock para evitar deadlock (chamado após `Unlock()`).
* **Frontend:** Vite + React; fetch via `api.js`; **tema claro** forçado em `index.css` para garantir contraste.

---

## ⚠️ Limitações do MVP

* Sem autenticação/usuários.
* Sem filtros/busca.
* Sem drag & drop (movimentação por botões ←/→).
* Persistência em arquivo não trata concorrência multi-processo (adequado para demo).

---

## 📈 Melhorias futuras

* **Drag & Drop** HTML5 entre colunas.
* **Docker** (Dockerfile front/back + docker-compose).
* **Testes**:

  * Go: `net/http/httptest` para handlers.
  * Front: React Testing Library.
* **Optimistic UI** + retries.
* Filtros e busca.

---

## 🔌 Modelo e exemplos da API

### Modelo `Task`

```json
{
  "id": 1,
  "title": "string (obrigatório)",
  "description": "string (opcional)",
  "status": "todo | doing | done"
}
```

### Exemplos `curl`

```bash
# criar
curl -X POST http://localhost:8080/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Exemplo","description":"Teste","status":"todo"}'

# mover para doing
curl -X PUT http://localhost:8080/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Exemplo","description":"Teste","status":"doing"}'
```

---

## 📝 User Flow

* Imagem: [`/docs/user-flow.png`](./docs/user-flow.png)
* Fonte (Mermaid): [`/docs/user-flow.md`](./docs/user-flow.md)

---

## 🔧 Troubleshooting

* **Tela branca no front:** era contraste do tema escuro; `index.css` força tema claro.
* **PowerShell bloqueando npm:** use `npm.cmd run dev` ou ajuste a ExecutionPolicy (acima).
* **Portas ocupadas:** backend **8080**, frontend **5173**.

---

## ✍️ Convenção de commits

Padrão **Conventional Commits**:
`feat: … | fix: … | docs: … | style: … | refactor: … | test: …`

Exemplos:

* `feat(backend): persistência em arquivo JSON`
* `style(frontend): forçar tema claro e corrigir contraste`

---

## 👤 Autor

**Cauã Lira** — desenvolvimento e documentação
GitHub/LinkedIn: `lira-caua-ufrpe`

---

## 📄 Licença

Uso acadêmico/avaliativo. Sem garantias.
