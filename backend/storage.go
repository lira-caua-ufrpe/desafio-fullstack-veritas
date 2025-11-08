package main

import (
	"encoding/json"
	"os"
)

const dbFile = "tasks.json"

func loadTasks() {
	mu.Lock()
	defer mu.Unlock()

	b, err := os.ReadFile(dbFile)
	if err != nil {
		return // primeira execução: sem arquivo
	}
	var list []Task
	if err := json.Unmarshal(b, &list); err != nil {
		return
	}
	tasks = list
	var maxID int64
	for _, t := range tasks {
		if t.ID > maxID {
			maxID = t.ID
		}
	}
	nextID = maxID + 1
}

func saveTasks() {
	mu.Lock()
	defer mu.Unlock()

	b, _ := json.MarshalIndent(tasks, "", "  ")
	_ = os.WriteFile(dbFile, b, 0644)
}
