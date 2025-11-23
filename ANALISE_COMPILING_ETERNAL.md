# 🔍 ANÁLISE: Problema de Compiling Eterno

**Data:** 2025-01-27  
**Status:** ❌ PROBLEMA PERSISTENTE  
**Prioridade:** 🔴 CRÍTICA - Bloqueia todo o desenvolvimento

---

## 📋 RESUMO DO PROBLEMA

O sistema entra em loop infinito de re-compilação quando:
- Usuário acessa a página de consultas
- LiveKit tenta conectar
- Componentes tentam renderizar tracks de vídeo

**Sintomas:**
- "Compiling..." aparece e não para
- Console mostra re-renders infinitos
- Vídeo não aparece (telas pretas com "Aguardando...")
- Câmera não é ativada mesmo quando usuário clica nos botões

---

## ✅ SUGESTÕES DO KIMI (Resposta Kimi1.txt)

### 1. Fix Compiling Eterno
```javascript
const allTracks = useTracks(
  [
    {
      source: LiveKitTrack.Source.Camera,
      withPlaceholder: false, // ✅ CORRETO
    },
  ],
  { onlySubscribed: true } // ✅ CORRETO
);
```

**Status:** ✅ Implementado, mas ainda compila eternamente

### 2. Fix Câmera Automática
- Solicitar permissão ANTES de conectar
- `connect={hasPermission}` e `video={hasPermission}`

**Status:** ⚠️ Tentado, mas causou outros problemas

### 3. Fix AudioContext
- Remover `RoomAudioRenderer` completamente
- `audio={false}` em todos os lugares

**Status:** ✅ Implementado

### 4. Fix Cliente - Apenas Vídeo Remoto
- Filtrar tracks locais para cliente
- Layout diferente (1 tela vs 2 telas)

**Status:** ✅ Implementado

### 5. Fix Profissional - Layout Garantido
- Sempre 2 telas (local + remoto/placeholder)
- Separar tracks locais e remotas

**Status:** ✅ Implementado

---

## ✅ SUGESTÕES DO MANUS (Resposta Manus6.txt)

### 1. LiveKitRoomWrapped.jsx
- Adicionar `isProfessional` prop
- Solicitar permissão antes de conectar
- Remover `RoomAudioRenderer`

**Status:** ✅ Implementado

### 2. RemoteVideoManager.jsx
- `withPlaceholder: false` e `onlySubscribed: true`
- Receber `isProfessional` prop
- Lógica de layout baseada em `isProfessional`

**Status:** ✅ Implementado, mas ainda compila

### 3. VideoSurface.jsx
- Passar `isProfessional` para `LiveKitRoomWrapped`

**Status:** ✅ Implementado

---

## 🔴 O QUE FOI TENTADO (SEM SUCESSO)

### Tentativa 1: `onlySubscribed: true`
- **Resultado:** Ainda compila eternamente
- **Problema:** Tracks locais podem não estar "subscritos"

### Tentativa 2: `onlySubscribed: false`
- **Resultado:** Ainda compila eternamente
- **Problema:** Inclui tracks que causam re-renders

### Tentativa 3: `useMemo` com dependências estáveis
- **Resultado:** Ainda compila eternamente
- **Problema:** `allTracks` muda de referência constantemente

### Tentativa 4: `useRef` para estabilizar tracks
- **Resultado:** Ainda compila eternamente
- **Problema:** Refs não atualizam quando necessário

### Tentativa 5: `React.memo` no componente
- **Resultado:** Ainda compila eternamente
- **Problema:** Props internas (tracks) mudam constantemente

### Tentativa 6: Eventos customizados para ativar câmera
- **Resultado:** Eventos funcionam, mas compiling persiste
- **Problema:** Compiling acontece antes mesmo de ativar câmera

### Tentativa 7: `video={false}` no LiveKitRoom
- **Resultado:** Evita `NotReadableError`, mas compiling persiste
- **Problema:** Compiling acontece na renderização inicial

---

## 🎯 POSSÍVEIS CAUSAS DO COMPILING ETERNO

### Hipótese 1: `useTracks` está causando loops
- `useTracks` pode estar retornando novos arrays a cada render
- Mesmo com `useMemo`, o array de entrada muda

### Hipótese 2: `VideoTrack` component está causando re-renders
- Componente `VideoTrack` do LiveKit pode estar atualizando constantemente
- Cada atualização causa novo render do pai

### Hipótese 3: `LiveKitRoom` está reconectando constantemente
- `LiveKitRoom` pode estar entrando em loop de conexão/desconexão
- Cada reconexão causa novo render

### Hipótese 4: Estado do `VideoPanelContext` está mudando constantemente
- Algum estado interno está mudando e causando cascata de re-renders
- Todos os componentes filhos re-renderizam

### Hipótese 5: Turbopack/Next.js está em loop de hot reload
- Mudanças de estado estão sendo detectadas como mudanças de código
- Hot reload entra em loop

---

## 📝 ESTADO ATUAL DO CÓDIGO

### Arquivos Principais:
1. `components/video/LiveKitRoomWrapped.jsx`
   - `video={false}` (não acessa câmera automaticamente)
   - `audio={false}` (sem AudioContext)
   - Sem `RoomAudioRenderer`
   - AudioContext mockado

2. `components/video/RemoteVideoManager.jsx`
   - `withPlaceholder: false`
   - `onlySubscribed: false` (tentativa de incluir tracks locais)
   - `useMemo` para estabilizar tracks
   - `React.memo` no componente
   - Eventos customizados para ativar câmera

3. `components/VideoPanelContext.jsx`
   - Dispara eventos `livekit:activateCamera` e `livekit:startSession`
   - Quando usuário ativa câmera ou inicia sessão

---

## 🎯 O QUE PRECISA SER RESOLVIDO

### Problema Principal:
**Compiling eterno** - Sistema entra em loop infinito de re-compilação

### Problemas Secundários:
1. Vídeo não aparece (telas pretas)
2. Câmera não é ativada automaticamente
3. Eventos de ativação funcionam, mas vídeo não aparece

---

## 📋 PERGUNTAS PARA KIMI/MANUS AMANHÃ

1. **Por que `useTracks` está causando compiling eterno mesmo com `withPlaceholder: false` e `onlySubscribed: true`?**

2. **Como estabilizar `useTracks` para evitar re-renders infinitos?**

3. **O componente `VideoTrack` do LiveKit está causando loops? Como evitar?**

4. **O `LiveKitRoom` está reconectando constantemente? Como verificar e corrigir?**

5. **Devo usar uma abordagem completamente diferente? (ex: não usar `useTracks`, acessar tracks diretamente do `room`?)**

6. **O problema é do Turbopack/Next.js ou do código React?**

7. **Há alguma configuração do LiveKit que pode evitar loops?**

8. **Devo usar polling ao invés de hooks do LiveKit?**

9. **O `VideoPanelContext` pode estar causando o loop? Como isolar?**

10. **Devo desabilitar hot reload do Turbopack para testar?**

---

## 🔧 PRÓXIMOS PASSOS (AMANHÃ)

1. ✅ Ler novas sugestões do Kimi/Manus
2. ✅ Implementar solução específica para compiling
3. ✅ Testar isoladamente (sem outros componentes)
4. ✅ Verificar se problema é do LiveKit ou do React
5. ✅ Considerar alternativa: não usar `@livekit/components-react` hooks
6. ✅ Verificar se `VideoPanelContext` está causando o loop
7. ✅ Testar com hot reload desabilitado

---

## 📚 REFERÊNCIAS

- **Sugestões Kimi:** `Resposta Kimi1.txt`
- **Sugestões Manus:** `Resposta Manus6.txt`
- **Versão Funcional (que funcionava antes):** `VERSÃO_FUNCIONAL_VIDEO.md` (se existir)

---

## 🔍 CÓDIGO ATUAL (PARA REFERÊNCIA)

### RemoteVideoManager.jsx (Estado Atual)
```javascript
const allTracks = useTracks(
  [
    {
      source: LiveKitTrack.Source.Camera,
      withPlaceholder: false,
    },
  ],
  { onlySubscribed: false } // Tentativa de incluir tracks locais
);

const tracks = useMemo(() => {
  const filtered = allTracks.filter((trackRef) => {
    if (trackRef.participant?.isLocal) {
      return trackRef.publication?.track != null;
    }
    return trackRef.publication?.isSubscribed && trackRef.publication?.track != null;
  });
  return filtered;
}, [allTracks.length]);
```

### LiveKitRoomWrapped.jsx (Estado Atual)
```javascript
<LiveKitRoom
  token={token}
  serverUrl={serverUrl}
  connect={true}
  video={false} // Não inicia vídeo automaticamente
  audio={false} // Áudio desabilitado
  options={{
    adaptiveStream: true,
    dynacast: true,
    autoSubscribe: true,
  }}
>
  <RemoteVideoManager isProfessional={isProfessional} />
</LiveKitRoom>
```

---

**Nota:** Este problema está bloqueando todo o desenvolvimento. É crítico resolver antes de continuar.









