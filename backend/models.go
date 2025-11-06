package main

import "sync"

type Task struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`       // obrigatório
	Description string `json:"description"` // opcional
	Status      string `json:"status"`      // "todo" | "doing" | "done"
}

var (
	tasks  = []Task{}
	nextID int64 = 1
	mu     sync.Mutex
)
