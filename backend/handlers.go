package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func readJSON(r *http.Request, v any) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	return dec.Decode(v)
}

func isValidStatus(s string) bool {
	switch s {
	case "todo", "doing", "done":
		return true
	default:
		return false
	}
}

// --------- /tasks (coleção)
func tasksCollectionHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		mu.Lock()
		list := make([]Task, len(tasks))
		copy(list, tasks)
		mu.Unlock()
		writeJSON(w, http.StatusOK, list)

	case http.MethodPost:
		var in Task
		if err := readJSON(r, &in); err != nil {
			http.Error(w, "invalid json", http.StatusBadRequest)
			return
		}
		if strings.TrimSpace(in.Title) == "" {
			http.Error(w, "title is required", http.StatusBadRequest)
			return
		}
		if in.Status == "" {
			in.Status = "todo"
		}
		if !isValidStatus(in.Status) {
			http.Error(w, "invalid status", http.StatusBadRequest)
			return
		}

		mu.Lock()
		in.ID = nextID
		nextID++
		tasks = append(tasks, in)
		mu.Unlock()

		// salvar fora do lock
		saveTasks()

		writeJSON(w, http.StatusCreated, in)

	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

// --------- /tasks/{id} (item)
func tasksItemHandler(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r.URL.Path)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		mu.Lock()
		defer mu.Unlock()
		for _, t := range tasks {
			if t.ID == id {
				writeJSON(w, http.StatusOK, t)
				return
			}
		}
		http.NotFound(w, r)

	case http.MethodPut:
		var in Task
		if err := readJSON(r, &in); err != nil {
			http.Error(w, "invalid json", http.StatusBadRequest)
			return
		}
		if strings.TrimSpace(in.Title) == "" {
			http.Error(w, "title is required", http.StatusBadRequest)
			return
		}
		if in.Status != "" && !isValidStatus(in.Status) {
			http.Error(w, "invalid status", http.StatusBadRequest)
			return
		}

		var updated *Task
		mu.Lock()
		for i, t := range tasks {
			if t.ID == id {
				// atualizar campos
				t.Title = in.Title
				t.Description = in.Description
				if in.Status != "" {
					t.Status = in.Status
				}
				tasks[i] = t
				updated = &t
				break
			}
		}
		mu.Unlock()

		if updated == nil {
			http.NotFound(w, r)
			return
		}

		// salvar fora do lock
		saveTasks()
		writeJSON(w, http.StatusOK, *updated)

	case http.MethodDelete:
		var removed bool
		mu.Lock()
		for i, t := range tasks {
			if t.ID == id {
				// remove mantendo ordem
				tasks = append(tasks[:i], tasks[i+1:]...)
				removed = true
				break
			}
		}
		mu.Unlock()

		if !removed {
			http.NotFound(w, r)
			return
		}

		// salvar fora do lock
		saveTasks()
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func parseID(path string) (int64, error) {
	// espera /tasks/{id}
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) != 2 {
		return 0, errors.New("bad path")
	}
	return strconv.ParseInt(parts[1], 10, 64)
}
