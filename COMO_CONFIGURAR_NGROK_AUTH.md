# Como Configurar Autenticação do ngrok

## 🔴 Erro: Authentication Failed

Se você está vendo este erro:
```
ERROR: authentication failed: Usage of ngrok requires a verified account and authtoken.
ERR_NGROK_4018
```

Você precisa configurar o authtoken do ngrok.

---

## ✅ Solução Passo a Passo

### 1. Criar Conta no ngrok (se ainda não tiver)

1. Acesse: https://dashboard.ngrok.com/signup
2. Crie uma conta gratuita (ou faça login se já tiver)

### 2. Obter seu Authtoken

1. Após fazer login, acesse: https://dashboard.ngrok.com/get-started/your-authtoken
2. Você verá seu authtoken (algo como: `2abc123def456ghi789jkl012mno345pq_6R7S8T9U0V1W2X3Y4Z5A6B7C8D`)
3. **Copie esse token** (você vai precisar dele)

### 3. Configurar o Authtoken

Abra o terminal do Cursor e execute:

```bash
ngrok config add-authtoken SEU_AUTHTOKEN_AQUI
```

**Exemplo:**
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl012mno345pq_6R7S8T9U0V1W2X3Y4Z5A6B7C8D
```

### 4. Verificar se Funcionou

Execute:
```bash
ngrok version
```

Se mostrar a versão sem erros, está configurado corretamente!

---

## 🚀 Depois de Configurar

Após configurar o authtoken, execute novamente:

```bash
npm run dev-lab:ngrok
```

Agora deve funcionar! 🎉

---

## 📝 Onde o Authtoken é Salvo?

O ngrok salva o authtoken em:
- **Windows:** `C:\Users\SEU_USUARIO\.ngrok2\ngrok.yml`
- **Mac/Linux:** `~/.ngrok2/ngrok.yml`

Você não precisa editar esse arquivo manualmente. Use o comando `ngrok config add-authtoken`.

---

## ⚠️ Nota Importante

- O authtoken é **gratuito** e permite uso ilimitado na versão gratuita
- Você só precisa configurar **uma vez**
- O authtoken fica salvo e não precisa ser configurado novamente

---

## 🔍 Verificar Configuração Atual

Para verificar se o authtoken está configurado:

```bash
# Verificar versão (se funcionar, authtoken está OK)
ngrok version

# OU verificar arquivo de config (Windows)
type %USERPROFILE%\.ngrok2\ngrok.yml
```

---

## 🆘 Se Ainda Não Funcionar

1. **Verifique se copiou o token completo** (sem espaços)
2. **Tente novamente:**
   ```bash
   ngrok config add-authtoken SEU_TOKEN
   ```
3. **Verifique se está logado no dashboard:** https://dashboard.ngrok.com/
4. **Se necessário, gere um novo token** no dashboard

---

## ✅ Próximos Passos

Após configurar o authtoken:

1. Execute: `npm run dev-lab:ngrok`
2. O script vai criar os túneis automaticamente
3. As URLs serão injetadas no Next.js automaticamente
4. Você poderá testar em dispositivos móveis! 📱


