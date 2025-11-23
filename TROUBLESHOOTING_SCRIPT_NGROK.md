# Troubleshooting - Script ngrok Vazio/Sem Saída

## Problema: Terminal Vazio

Se o terminal está vazio ao executar `npm run dev-lab:ngrok`, pode ser por:

### 1. ❌ ngrok Não Está Instalado

**Sintoma:** Terminal fecha rapidamente ou mostra erro sobre ngrok não encontrado

**Solução:**

#### Opção A: Instalar via npm (Recomendado)
```bash
npm install -g ngrok
```

#### Opção B: Baixar Manualmente
1. Acesse: https://ngrok.com/download
2. Baixe para Windows
3. Extraia o arquivo `ngrok.exe`
4. Adicione ao PATH do sistema:
   - Copie `ngrok.exe` para uma pasta no PATH (ex: `C:\Windows\System32`)
   - Ou adicione a pasta onde está o `ngrok.exe` ao PATH do Windows

#### Verificar Instalação
```bash
where ngrok
# Deve mostrar o caminho do ngrok.exe
```

---

### 2. ❌ ngrok Não Está no PATH

**Sintoma:** Script diz "ngrok não encontrado"

**Solução:**

#### Verificar se ngrok existe
```bash
# Procurar ngrok.exe no sistema
Get-ChildItem -Path C:\ -Filter ngrok.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
```

#### Adicionar ao PATH (Windows)
1. Encontre onde está o `ngrok.exe`
2. Adicione ao PATH:
   - Painel de Controle → Sistema → Configurações Avançadas
   - Variáveis de Ambiente → Path → Editar
   - Adicionar pasta do ngrok.exe

#### Ou usar caminho completo no script (temporário)
Se o ngrok estiver em uma pasta específica, podemos modificar o script para usar caminho completo.

---

### 3. ⚠️ Script Executando mas Sem Output

**Sintoma:** Terminal não mostra nada, mas processo está rodando

**Possíveis causas:**
- Script está aguardando ngrok iniciar (pode demorar alguns segundos)
- Output está sendo redirecionado

**Solução:**
- Aguarde 10-15 segundos
- Verifique se há processo Node.js rodando
- Tente executar diretamente: `node scripts/dev-with-ngrok.js`

---

### 4. ⚠️ Erro Silencioso

**Sintoma:** Script inicia mas não faz nada

**Solução:**
Execute com output detalhado:
```bash
node scripts/dev-with-ngrok.js
```

Isso mostrará todos os logs e erros.

---

## 🔍 Diagnóstico Rápido

Execute estes comandos para diagnosticar:

```bash
# 1. Verificar se ngrok está instalado
where ngrok

# 2. Verificar se script existe
Test-Path scripts\dev-with-ngrok.js

# 3. Executar script diretamente (ver erros)
node scripts/dev-with-ngrok.js

# 4. Verificar se Node.js funciona
node --version

# 5. Verificar se npm funciona
npm --version
```

---

## ✅ Solução Rápida

Se ngrok não está instalado:

1. **Instalar ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Ou baixar manualmente:**
   - https://ngrok.com/download
   - Extrair e adicionar ao PATH

3. **Verificar instalação:**
   ```bash
   ngrok version
   ```

4. **Tentar novamente:**
   ```bash
   npm run dev-lab:ngrok
   ```

---

## 📝 Notas

- O script precisa do ngrok no PATH do sistema
- Se ngrok estiver em outra pasta, adicione ao PATH
- O script mostra mensagens de erro claras se ngrok não for encontrado

---

## ⚠️ Aviso: "Windows containers not enabled"

**Sintoma:** Docker Desktop mostra aviso sobre Windows containers não habilitados

**✅ SOLUÇÃO: IGNORE ESTE AVISO**

Este aviso pode ser **ignorado completamente** se você estiver usando **Linux containers (WSL2)**, que é o padrão recomendado.

### Por que aparece?
- Docker Desktop detecta que Windows containers não estão habilitados
- Mas você **NÃO precisa** de Windows containers para LiveKit
- LiveKit roda em Linux containers (WSL2)

### O que fazer?
1. **Clique em "OK" ou feche o aviso**
2. **Continue normalmente** - Docker Desktop funciona perfeitamente com WSL2
3. **Não precisa habilitar Windows containers**
4. **Não precisa reiniciar o computador**

### Verificar se está usando WSL2:
```powershell
docker version
```
Se aparecer `OS/Arch: linux/amd64`, você está usando Linux containers (correto ✅).

**📖 Mais detalhes:** Veja `AVISO_WINDOWS_CONTAINERS_IGNORAR.md`

---

## 🐳 Problema: Docker Desktop Não Fica Pronto

**Sintoma:** Script aguarda 120 segundos mas Docker daemon não fica disponível

**Solução Recomendada: Iniciar Docker Desktop Manualmente Primeiro**

### Passo a Passo:

1. **Abra o Docker Desktop manualmente:**
   - Procure "Docker Desktop" no menu Iniciar
   - Clique para abrir
   - Aguarde até aparecer "Docker Engine running" (sem erros)

2. **Verifique se Docker está funcionando:**
   ```powershell
   docker ps
   ```
   Se funcionar, você verá uma lista (pode estar vazia, mas não deve dar erro).

3. **Execute o script:**
   ```bash
   npm run dev-lab:ngrok
   ```

### Se Docker Desktop Não Iniciar:

**Verificar WSL2:**
```powershell
wsl --status
```

**Se WSL2 não estiver instalado:**
```powershell
wsl --install
```
(Requer reinicialização do computador)

**Verificar se Docker Desktop está instalado corretamente:**
- Abra Docker Desktop
- Vá em Settings → General
- Verifique se "Use WSL 2 based engine" está marcado

### Alternativa: Ignorar Verificação do Docker

Se o Docker Desktop estiver rodando mas o script não detecta, você pode:
1. Iniciar LiveKit manualmente primeiro:
   ```powershell
   cd C:\kalonos\kalonconnect-lab
   docker-compose up -d
   ```
2. Depois executar o script (ele detectará que LiveKit já está rodando)

---

## 🆘 Se Nada Funcionar

Execute o script diretamente para ver o erro completo:

```bash
cd C:\kalonos\kalonconnect-lab
node scripts/dev-with-ngrok.js
```

Isso mostrará exatamente qual é o problema.


