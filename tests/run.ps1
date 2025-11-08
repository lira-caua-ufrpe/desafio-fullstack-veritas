$base = "http://localhost:8080"

Write-Host "Health:";      irm "$base/health"
Write-Host "List:";        irm "$base/tasks"

Write-Host "Create:"
$body = @{ title="Criar colunas"; description="Kanban"; status="todo" } | ConvertTo-Json
$created = irm -Uri "$base/tasks" -Method POST -Body $body -ContentType "application/json"; $created
$id = $created.id

Write-Host "Update:"
$upd = @{ title="Criar colunas (edit)"; description="doing"; status="doing" } | ConvertTo-Json
irm -Uri "$base/tasks/$id" -Method PUT -Body $upd -ContentType "application/json"

Write-Host "Delete:"
irm -Uri "$base/tasks/$id" -Method DELETE

Write-Host "List final:";  irm "$base/tasks"
