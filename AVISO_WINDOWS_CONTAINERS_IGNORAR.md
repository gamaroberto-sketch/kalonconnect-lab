# ⚠️ Aviso Docker Desktop: Windows Containers

## 🎯 Resposta Rápida

**Você pode IGNORAR este aviso se estiver usando Linux containers (WSL2).**

O Docker Desktop funciona perfeitamente com **WSL2 (Linux containers)** e **NÃO precisa** de Windows containers habilitados.

---

## 📖 Explicação Detalhada

### O que são Windows Containers?

- **Windows Containers**: Containers que rodam imagens do Windows (Windows Server Core, Nano Server)
- **Linux Containers (WSL2)**: Containers que rodam imagens do Linux (Ubuntu, Alpine, etc.)

### Qual você está usando?

**Provavelmente Linux containers (WSL2)**, porque:
- LiveKit roda em imagens Linux
- A maioria dos projetos usa Linux containers
- WSL2 é o padrão recomendado pelo Docker Desktop

---

## ✅ Como Verificar

### 1. Verificar no Docker Desktop

1. Abra o Docker Desktop
2. Clique no ícone de **engrenagem** (Settings)
3. Vá em **General**
4. Veja a opção **"Use the WSL 2 based engine"** - deve estar **marcada** ✅

### 2. Verificar via Terminal

```powershell
docker version
```

Se aparecer algo como:
```
OS/Arch: linux/amd64
```

Você está usando **Linux containers** (correto para LiveKit).

---

## 🚫 Quando Você PRECISA Habilitar Windows Containers?

**Apenas se:**
- Você estiver desenvolvendo aplicações específicas para Windows Server
- Você precisar rodar imagens Windows nativas
- Você estiver trabalhando com .NET Framework (não .NET Core)

**Para LiveKit e Next.js, você NÃO precisa.**

---

## 🔧 Se Quiser Desabilitar o Aviso

O Docker Desktop pode mostrar esse aviso toda vez que inicia. Para desabilitá-lo:

1. Abra Docker Desktop
2. Settings → General
3. Desmarque qualquer opção relacionada a "Windows containers"
4. Certifique-se de que "Use WSL 2 based engine" está marcado

---

## ✅ Conclusão

**Ação recomendada:**
- ✅ **IGNORE o aviso** se estiver usando WSL2
- ✅ Continue usando normalmente
- ✅ Não precisa habilitar Windows containers
- ✅ Não precisa reiniciar o computador

O Docker Desktop vai funcionar normalmente com Linux containers (WSL2).

---

## 🆘 Se o Docker Não Estiver Funcionando

Se o Docker Desktop não estiver iniciando por outro motivo (não relacionado a Windows containers):

1. Verifique se WSL2 está instalado:
   ```powershell
   wsl --status
   ```

2. Verifique se o serviço Docker está rodando:
   ```powershell
   Get-Service -Name "*docker*"
   ```

3. Reinicie o Docker Desktop:
   - Botão direito no ícone da bandeja → Quit
   - Abra novamente







