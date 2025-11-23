# ℹ️ Aviso: Docker Desktop - Windows Containers

## O Que Aconteceu

Ao iniciar o Docker Desktop automaticamente, uma janela apareceu com a mensagem:

```
Docker Desktop - Windows containers not enabled

The Windows containers feature is disabled. Enable it using the following PowerShell script...
```

## ⚠️ Isso É Normal e Pode Ser Ignorado

### Por Que Aparece?

O Docker Desktop detecta que os **Windows containers** não estão habilitados e mostra esse aviso.

### Você Precisa Habilitar?

**NÃO!** Para o nosso uso (LiveKit), você **NÃO precisa** habilitar Windows containers.

### Por Quê?

1. **Docker Desktop funciona com WSL2 (Linux containers)**
   - WSL2 é o modo padrão e recomendado
   - Não requer habilitar Windows containers

2. **LiveKit usa Linux containers**
   - LiveKit roda em containers Linux
   - Não precisa de Windows containers

3. **Windows containers são opcionais**
   - Apenas necessários se você quiser rodar containers Windows nativos
   - Não é necessário para desenvolvimento web/Node.js/LiveKit

## O Que Fazer

### Opção 1: Ignorar (Recomendado)

1. **Feche a janela do aviso**
2. **Aguarde Docker Desktop terminar de iniciar**
3. **O script continuará normalmente**

Docker Desktop funcionará perfeitamente com WSL2 (Linux containers).

### Opção 2: Desabilitar o Aviso (Opcional)

Se o aviso aparecer toda vez e incomodar:

1. Abra Docker Desktop
2. Vá em **Settings** → **General**
3. Desmarque **"Use Windows containers"** (se estiver marcado)
4. Clique em **Apply & Restart**

Isso garante que Docker Desktop use apenas WSL2 (Linux containers).

## Verificação

Para verificar se Docker está funcionando corretamente:

```bash
docker info
```

Se retornar informações do Docker, está funcionando corretamente.

Para verificar se está usando WSL2:

```bash
docker version
```

Deve mostrar informações sobre o backend (WSL2).

## Status do Script

✅ **O script continua funcionando normalmente**

O aviso não impede o funcionamento. O script:
- ✅ Detecta que Docker Desktop foi iniciado
- ✅ Aguarda daemon ficar pronto
- ✅ Continua com LiveKit normalmente

## Resumo

- ⚠️ Aviso é normal e pode ser ignorado
- ✅ Docker Desktop funciona com WSL2 (Linux containers)
- ✅ LiveKit usa Linux containers (não precisa Windows containers)
- ✅ Script continua funcionando normalmente
- 🔧 Opcional: Desabilitar aviso nas configurações do Docker Desktop

**Ação:** Feche a janela do aviso e aguarde Docker Desktop terminar de iniciar. O script continuará automaticamente.


