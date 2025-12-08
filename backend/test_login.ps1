$body = @{username='admin'; password='admin123'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/auth/token/' -Method POST -Body $body -ContentType 'application/json'
