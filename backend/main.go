package main

import (
	"log"
	"net/http"
)

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	loadTasks()
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/tasks", tasksCollectionHandler) // GET, POST
	mux.HandleFunc("/tasks/", tasksItemHandler)      // GET, PUT, DELETE por id

	addr := ":8080"
	log.Println("API rodando em", addr)
	log.Fatal(http.ListenAndServe(addr, withCORS(mux)))
}
