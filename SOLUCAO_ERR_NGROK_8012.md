# Solução: ERR_NGROK_8012

## 🔴 Problema

O erro `ERR_NGROK_8012` ocorre quando o ngrok consegue criar o túnel, mas **não consegue conectar ao serviço local**.

**Causa:** O ngrok tenta conectar às portas 3001 (Next.js) e 7880 (LiveKit) **antes** que esses serviços estejam rodando.

## ✅ Soluções

### Solução 1: Verificar se as Portas Estão Livres e Acessíveis

O script inicia o ngrok antes do Next.js. O ngrok tenta conectar imediatamente, mas o Next.js ainda não está rodando.

**Verificações necessárias:**

1. **Porta 3001 (Next.js):**
   - Deve estar livre quando o ngrok inicia
   - O Next.js será iniciado DEPOIS pelo script
   - O ngrok vai aguardar até o Next.js estar pronto

2. **Porta 7880 (LiveKit):**
   - Deve estar rodando ANTES do ngrok iniciar
   - Ou o ngrok vai falhar ao conectar

### Solução 2: Aguardar Serviços Estarem Prontos

O script precisa:
1. Verificar se LiveKit está rodando na porta 7880
2. Iniciar ngrok
3. Aguardar túneis ficarem disponíveis
4. Iniciar Next.js na porta 3001
5. O ngrok vai conectar automaticamente quando o Next.js estiver pronto

### Solução 3: Verificar Portas em Uso

Execute para verificar se as portas estão livres:

```powershell
# Verificar porta 3001
netstat -ano | findstr :3001

# Verificar porta 7880
netstat -ano | findstr :7880
```

Se alguma porta estiver em uso, pare o processo ou use outra porta.

## 🔧 Correção no Script

O script precisa:
1. Verificar se LiveKit está rodando (porta 7880) ANTES de iniciar ngrok
2. Aguardar Next.js estar pronto após iniciar
3. Adicionar retry logic para conexões

## 📝 Passos para Resolver

1. **Verifique se LiveKit está rodando:**
   ```bash
   # Se LiveKit não estiver rodando, inicie-o primeiro
   # Ou ajuste o script para iniciar LiveKit antes do ngrok
   ```

2. **Verifique se as portas estão livres:**
   ```powershell
   netstat -ano | findstr ":3001 :7880"
   ```

3. **Execute o script novamente:**
   ```bash
   npm run dev-lab:ngrok
   ```

4. **Se o erro persistir:**
   - Verifique se o LiveKit está realmente rodando na porta 7880
   - Verifique se há firewall bloqueando
   - Tente iniciar o Next.js manualmente primeiro para testar

## ⚠️ Nota Importante

O `ERR_NGROK_8012` é um erro de **conectividade**, não de autenticação. Significa que:
- ✅ Ngrok está funcionando
- ✅ Túneis foram criados
- ❌ Mas não consegue conectar ao serviço local

Isso geralmente acontece porque o serviço não está rodando ou não está acessível na porta especificada.


