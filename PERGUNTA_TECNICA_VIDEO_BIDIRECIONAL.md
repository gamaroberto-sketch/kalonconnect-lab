# 🎯 PERGUNTA TÉCNICA: Implementação de Vídeo Bidirecional com LiveKit

## 📋 **CONTEXTO ATUAL**

### ✅ **O QUE JÁ TEMOS IMPLEMENTADO**

#### **1. Geração de Link para Cliente** ✅
- **Arquivo**: `components/ShareConsultationLink.jsx`
- **API**: `/api/generate-consultation-token`
- **Funcionalidade**:
  - Gera token único (formato: `timestamp + random`)
  - Cria URL: `/consultations/client/{token}`
  - Gera QR Code
  - Compartilhamento via WhatsApp
- **Status**: ✅ Funcionando

#### **2. Página do Cliente** ✅
- **Arquivo**: `pages/consultations/client/[token].jsx`
- **Funcionalidade**:
  - Valida token no servidor (SSR)
  - Obtém token LiveKit automaticamente
  - Conecta ao LiveKit com `roomName=consulta-{token}`
  - Renderiza `LiveKitRoomWrapped` com `isProfessional=false`
- **Status**: ✅ Funcionando (cliente conecta ao LiveKit)

#### **3. API LiveKit Token** ✅
- **Arquivo**: `pages/api/livekit/token.js`
- **Funcionalidade**:
  - Gera token JWT do LiveKit
  - Suporta `isHost=true` (profissional) e `isHost=false` (cliente)
  - Retorna `token`, `wsUrl`, `roomName`
- **Status**: ✅ Funcionando

#### **4. Componente LiveKit** ✅
- **Arquivo**: `components/video/LiveKitRoomWrapped.jsx`
- **Funcionalidade**:
  - Conecta ao LiveKit usando token
  - Suporta `isProfessional` (true/false)
  - Gerencia conexão/desconexão
- **Status**: ✅ Funcionando

#### **5. RemoteVideoManager** ✅
- **Arquivo**: `components/video/RemoteVideoManager.jsx`
- **Funcionalidade**:
  - Renderiza vídeos locais e remotos
  - Layout: 2 colunas para profissional, 1 coluna para cliente
  - Filtra tracks por `isProfessional`
- **Status**: ✅ Funcionando

#### **6. VideoPanelContext - LiveKit Integration** ✅
- **Arquivo**: `components/VideoPanelContext.jsx`
- **Funcionalidade**:
  - `consultationId` armazenado no estado
  - `fetchLiveKitToken()` obtém token quando `consultationId` existe
  - `liveKitToken`, `liveKitUrl`, `roomName` disponíveis no contexto
- **Status**: ✅ Parcialmente implementado

---

## ❓ **PERGUNTA TÉCNICA**

### **Como implementar vídeo bidirecional completo onde:**

1. **Cliente recebe APENAS a câmera do profissional**
   - Cliente não publica sua própria câmera
   - Cliente apenas **subscreve** ao vídeo do profissional
   - Cliente vê o profissional na tela

2. **Profissional recebe APENAS a câmera do cliente**
   - Profissional publica sua própria câmera
   - Profissional **subscreve** ao vídeo do cliente
   - Profissional vê:
     - Sua própria câmera (lado esquerdo)
     - Câmera do cliente (lado direito)

3. **Ambos na mesma sala LiveKit**
   - `roomName=consulta-{token}` (mesmo para ambos)
   - Profissional: `participantName=professional-{token}`, `isHost=true`
   - Cliente: `participantName=client-{token}`, `isHost=false`

---

## 🔍 **ANÁLISE DO QUE FALTA**

### **1. Profissional precisa conectar ao LiveKit** ⚠️
**Status Atual**:
- `VideoPanelContext` tem `fetchLiveKitToken()` mas só é chamado quando `consultationId` existe
- `consultationId` é definido quando link é gerado via `setConsultationIdFromLink(token)`
- Mas o profissional não está renderizando `LiveKitRoomWrapped` na página de consultations

**O que precisa**:
- Quando profissional clica "Iniciar Sessão", deve:
  1. Verificar se `consultationId` existe
  2. Chamar `fetchLiveKitToken()` se não tiver token
  3. Renderizar `LiveKitRoomWrapped` quando token estiver disponível

### **2. Profissional precisa publicar sua câmera** ⚠️
**Status Atual**:
- `LiveKitRoomWrapped` recebe `isProfessional=true`
- Mas não há lógica para publicar câmera automaticamente quando conecta

**O que precisa**:
- Quando profissional conecta ao LiveKit:
  1. Obter stream da câmera local (já temos via `window.kalonActivateCamera`)
  2. Publicar stream no LiveKit usando `localParticipant.publishTrack()`
  3. Garantir que stream local seja publicado automaticamente

### **3. Cliente precisa publicar sua câmera** ⚠️
**Status Atual**:
- Cliente conecta ao LiveKit mas não publica câmera
- `isProfessional=false` significa que cliente não deve publicar?

**O que precisa**:
- Cliente deve:
  1. Solicitar permissão de câmera
  2. Obter stream local
  3. Publicar stream no LiveKit
  4. Profissional deve receber e exibir esse stream

### **4. Layout de vídeo no profissional** ⚠️
**Status Atual**:
- `VideoSurface` renderiza `OptimizedVideoElement` (câmera local)
- Mas não renderiza `LiveKitRoomWrapped` quando token está disponível
- Não há layout lado a lado (profissional | cliente)

**O que precisa**:
- Quando `liveKitToken` existe:
  - Renderizar layout 2 colunas
  - Esquerda: Câmera local do profissional (ou LiveKit local track)
  - Direita: Câmera do cliente (LiveKit remote track)

---

## 🎯 **PERGUNTAS ESPECÍFICAS**

### **Pergunta 1: Quando o profissional deve conectar ao LiveKit?**
- [ ] Quando clica "Iniciar Sessão"?
- [ ] Quando gera o link?
- [ ] Automaticamente quando `consultationId` é definido?
- [ ] Outro momento?

### **Pergunta 2: Como publicar câmera local no LiveKit?**
```javascript
// Exemplo do que preciso fazer:
const stream = await window.kalonActivateCamera(); // Stream local
const track = stream.getVideoTracks()[0];
await localParticipant.publishTrack(track, {
  source: Track.Source.Camera,
  name: 'camera-professional'
});
```
**Está correto?** Ou há uma forma melhor usando `@livekit/components-react`?

### **Pergunta 3: Cliente deve publicar câmera automaticamente?**
- [ ] Sim, assim que conecta ao LiveKit
- [ ] Não, apenas quando profissional solicita
- [ ] Cliente escolhe se quer publicar ou não

### **Pergunta 4: Como renderizar layout lado a lado no profissional?**
**Opção A**: Substituir `VideoSurface` quando `liveKitToken` existe?
```javascript
{liveKitToken ? (
  <LiveKitRoomWrapped ... /> // Mostra local + remote
) : (
  <VideoSurface /> // Mostra apenas local
)}
```

**Opção B**: Renderizar ambos e controlar visibilidade?
```javascript
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
  <div>{/* Câmera local */}</div>
  <LiveKitRoomWrapped ... /> {/* Remote tracks */}
</div>
```

**Qual é a melhor abordagem?**

### **Pergunta 5: Como garantir que cliente recebe APENAS vídeo do profissional?**
- Cliente não deve ver sua própria câmera?
- Cliente deve ver apenas o profissional?
- Como configurar `RemoteVideoManager` para isso?

---

## 📝 **IMPLEMENTAÇÃO SUGERIDA**

### **Passo 1: Profissional conecta ao LiveKit quando inicia sessão**

**Local**: `components/VideoPanelContext.jsx` - função `handleSessionConnect`

```javascript
const handleSessionConnect = async () => {
  // ... código existente ...
  
  // Se tem consultationId, obter token LiveKit
  if (consultationId && !liveKitToken) {
    await fetchLiveKitToken();
  }
  
  // ... resto do código ...
};
```

### **Passo 2: Renderizar LiveKitRoomWrapped no profissional**

**Local**: `pages/consultations.jsx` ou `components/VideoSurface.jsx`

```javascript
// Quando liveKitToken existe, mostrar LiveKit
// Quando não existe, mostrar apenas câmera local
{liveKitToken && liveKitUrl && roomName ? (
  <LiveKitRoomWrapped
    token={liveKitToken}
    serverUrl={liveKitUrl}
    roomName={roomName}
    isProfessional={true}
  />
) : (
  <VideoSurface />
)}
```

### **Passo 3: Publicar câmera local no LiveKit**

**Local**: `components/video/LiveKitRoomWrapped.jsx` - função `handleConnectionSuccess`

```javascript
const handleConnectionSuccess = useCallback(async (room) => {
  // ... código existente ...
  
  if (isProfessional) {
    // Publicar câmera local
    const stream = await window.kalonActivateCamera?.();
    if (stream && room.localParticipant) {
      const videoTrack = stream.getVideoTracks()[0];
      await room.localParticipant.publishTrack(videoTrack, {
        source: Track.Source.Camera,
        name: 'camera-professional'
      });
    }
  }
  
  // ... resto do código ...
}, [isProfessional]);
```

### **Passo 4: Cliente publica câmera automaticamente**

**Local**: `pages/consultations/client/[token].jsx` ou criar componente separado

```javascript
useEffect(() => {
  if (liveKitToken && room) {
    // Solicitar permissão e publicar câmera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        const videoTrack = stream.getVideoTracks()[0];
        room.localParticipant.publishTrack(videoTrack, {
          source: Track.Source.Camera,
          name: 'camera-client'
        });
      });
  }
}, [liveKitToken, room]);
```

---

## ❓ **PERGUNTA PRINCIPAL**

**Como implementar corretamente a publicação automática de câmera no LiveKit para:**

1. **Profissional**: Publicar sua câmera quando conecta (se `isProfessional=true`)
2. **Cliente**: Publicar sua câmera quando conecta (se `isProfessional=false`)
3. **Garantir que ambos vejam o vídeo do outro corretamente**

**E qual é a melhor forma de integrar isso com o sistema atual de câmera local (`OptimizedVideoElement` + `window.kalonActivateCamera`)?**

- Devo usar o mesmo stream do `OptimizedVideoElement`?
- Ou criar um stream separado para LiveKit?
- Como evitar conflitos entre câmera local e LiveKit?

---

## 🔧 **ARQUIVOS QUE PRECISAM SER MODIFICADOS**

1. ✅ `components/VideoPanelContext.jsx` - Garantir que `fetchLiveKitToken()` é chamado quando sessão inicia
2. ✅ `pages/consultations.jsx` - Renderizar `LiveKitRoomWrapped` quando token existe
3. ✅ `components/video/LiveKitRoomWrapped.jsx` - Publicar câmera local quando profissional conecta
4. ✅ `pages/consultations/client/[token].jsx` - Publicar câmera do cliente quando conecta
5. ✅ `components/video/RemoteVideoManager.jsx` - Garantir layout correto (cliente vê só profissional, profissional vê ambos)

---

## 📚 **REFERÊNCIAS**

- LiveKit Docs: https://docs.livekit.io/
- `@livekit/components-react`: https://github.com/livekit/components-react
- `SOLUCAO_VIDEO_PROFISSIONAL.md` - Documentação existente sobre integração LiveKit

---

**Aguardando orientação técnica para implementar corretamente a publicação de vídeo bidirecional no LiveKit.**











