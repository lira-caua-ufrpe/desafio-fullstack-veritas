#!/usr/bin/env bash
set -e
BASE="http://localhost:8080"
echo "Health:";        curl -s "$BASE/health"; echo
echo "List:";          curl -s "$BASE/tasks"; echo
CRE=$(curl -s -X POST "$BASE/tasks" -H "Content-Type: application/json" -d '{"title":"Criar colunas","description":"Kanban","status":"todo"}'); echo "$CRE"
ID=$(echo "$CRE" | sed -n 's/.*"id":\s*\([0-9]*\).*/\1/p')
curl -s -X PUT "$BASE/tasks/$ID" -H "Content-Type: application/json" -d '{"title":"Criar colunas (edit)","description":"doing","status":"doing"}'; echo
curl -s -X DELETE "$BASE/tasks/$ID" -i | head -n1
curl -s "$BASE/tasks"; echo
