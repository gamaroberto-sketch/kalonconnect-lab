# Como Usar o Script ngrok Automatizado

## 🚀 Script Implementado

Foi criado o script `scripts/dev-with-ngrok.js` que automatiza completamente o processo de:
- ✅ Iniciar ngrok com túneis duplos (Next.js:3001 + LiveKit:7880)
- ✅ Obter URLs automaticamente
- ✅ Injetar variáveis de ambiente no Next.js
- ✅ Iniciar Next.js com tudo configurado

## 📋 Como Usar

### Opção 1: Usar o Script Automatizado (Recomendado)

```bash
npm run dev-lab:ngrok
```

**Isso vai:**
1. Verificar se ngrok está instalado
2. Verificar se já existe ngrok rodando com ambos os túneis
3. Se não existir, criar configuração e iniciar ngrok
4. Aguardar ambos os túneis ficarem disponíveis
5. Iniciar Next.js com variáveis injetadas:
   - `NEXT_PUBLIC_SITE_URL=https://abc123.ngrok.io` (Next.js)
   - `NEXT_PUBLIC_LIVEKIT_URL=wss://xyz789.ngrok.io` (LiveKit)

### Opção 2: Usar o Script Manual (Antigo)

Se preferir manter controle manual:
```bash
npm run dev-lab
```

E em outro terminal:
```bash
.\iniciar-ngrok-simples.ps1
.\atualizar-url-ngrok.ps1
```

## ✅ O Que o Script Faz Automaticamente

1. **Verifica ngrok instalado** - Se não encontrar, mostra erro e instruções
2. **Verifica túneis existentes** - Se encontrar ambos, reutiliza
3. **Cria configuração temporária** - Arquivo `ngrok-temp.yml` na raiz
4. **Inicia ngrok** - Com túneis duplos (Next.js + LiveKit)
5. **Aguarda túneis** - Polling até ambos estarem disponíveis
6. **Obtém URLs** - Via API do ngrok
7. **Converte URLs** - https → wss para LiveKit
8. **Inicia Next.js** - Com variáveis injetadas
9. **Cleanup** - Remove arquivo temporário ao sair

## 🎯 Resultado

Ao executar `npm run dev-lab:ngrok`:

- ✅ Next.js inicia na porta 3001
- ✅ ngrok expõe porta 3001 (Next.js) → `https://abc123.ngrok.io`
- ✅ ngrok expõe porta 7880 (LiveKit) → `wss://xyz789.ngrok.io`
- ✅ Variáveis injetadas automaticamente
- ✅ Link gerado será acessível externamente (mobile, etc)

## ⚠️ Requisitos

1. **ngrok instalado** - No PATH do sistema
   - Windows: `where ngrok` deve funcionar
   - Linux/Mac: `which ngrok` deve funcionar

2. **Portas livres** - 3001 (Next.js) e 7880 (LiveKit)

3. **Node.js** - Para executar o script

## 🔧 Troubleshooting

### "Ngrok não encontrado"
```bash
# Instalar ngrok:
# Windows: Baixe de https://ngrok.com/download
# Ou: npm install -g ngrok
```

### "Estado parcial do ngrok detectado"
- Significa que ngrok está rodando mas não tem ambos os túneis
- Solução: Encerre o ngrok e tente novamente
```bash
# Windows:
taskkill /F /IM ngrok.exe

# Linux/Mac:
pkill ngrok
```

### "Timeout aguardando túneis"
- ngrok pode estar demorando para iniciar
- Verifique se as portas 3001 e 7880 estão livres
- Verifique logs do ngrok no terminal

### Arquivo `ngrok-temp.yml` não removido
- O script tenta remover automaticamente
- Se não remover, pode deletar manualmente (não causa problemas)

## 📝 Notas

- O arquivo `ngrok-temp.yml` é criado temporariamente na raiz do projeto
- É removido automaticamente quando o script encerra
- Se o processo for morto (kill -9), o arquivo pode ficar (pode deletar manualmente)

## 🎉 Vantagens

- ✅ **Zero configuração manual** - Tudo automático
- ✅ **Sem reiniciar** - Variáveis injetadas antes do Next.js iniciar
- ✅ **Reutilização inteligente** - Se ngrok já estiver rodando, reutiliza
- ✅ **Cleanup automático** - Remove arquivos temporários
- ✅ **Logs claros** - Mostra o que está acontecendo em cada etapa

## 🚀 Próximos Passos

1. Execute: `npm run dev-lab:ngrok`
2. Aguarde ambos os túneis iniciarem
3. Next.js iniciará automaticamente
4. Gere um link de consulta
5. Teste no mobile - deve funcionar! ✅









