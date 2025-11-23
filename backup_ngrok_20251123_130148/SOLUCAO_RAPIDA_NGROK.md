# Solução Rápida - ngrok com Atualização Automática

## Problema Resolvido: Encoding e Inicialização

Os scripts foram corrigidos. Agora use esta solução simples:

---

## Método Mais Simples (Recomendado)

### Terminal 2: Iniciar ngrok
```powershell
.\iniciar-ngrok-simples.ps1
```

Ou manualmente:
```powershell
ngrok http 7880
```

### Em outro terminal (ou depois): Atualizar URL
```powershell
.\atualizar-url-ngrok.ps1
```

**Pronto!** A URL será atualizada automaticamente no `.env.local`.

---

## Método Automático (Se funcionar)

Tente:
```powershell
.\iniciar-ngrok-auto.ps1
```

Se não funcionar, use o método simples acima.

---

## Verificar se Funcionou

1. Execute `.\atualizar-url-ngrok.ps1`
2. Veja a mensagem: "OK - Arquivo .env.local atualizado com sucesso!"
3. Reinicie o servidor Next.js

---

## Troubleshooting

### "Erro ao conectar à API do ngrok"
- Certifique-se de que o ngrok está rodando
- Acesse http://127.0.0.1:4040 para verificar

### "Nenhum túnel HTTPS encontrado"
- Aguarde alguns segundos após iniciar o ngrok
- Execute `.\atualizar-url-ngrok.ps1` novamente

### Scripts com erro de encoding
- Use `iniciar-ngrok-simples.ps1` e `atualizar-url-ngrok.ps1` (versões corrigidas)

