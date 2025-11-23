# 🔧 SOLUÇÃO: Integrar LiveKit no Lado do Profissional

## 🎯 Problema Identificado:

O cliente está conectado ao LiveKit, mas o profissional **NÃO está**. Por isso o vídeo não aparece.

## 📋 O que precisa ser feito:

### 1. Profissional precisa obter o `consultationId`
- O `consultationId` é gerado em `ShareConsultationLink` via `/api/generate-consultation-token`
- Esse mesmo ID é usado no link do cliente: `/consultations/client/{token}`
- O profissional precisa armazenar esse ID quando gera o link

### 2. Profissional precisa conectar ao LiveKit
- Quando "Iniciar Sessão" é clicado, o profissional deve:
  1. Obter token do LiveKit usando `/api/livekit/token` com:
     - `roomName=consulta-{consultationId}` (mesmo do cliente)
     - `participantName=professional-{consultationId}`
     - `isHost=true` (profissional pode publicar)
  2. Renderizar `LiveKitRoomWrapped` com o token
  3. Publicar vídeo/áudio quando câmera for ativada

### 3. Garantir que ambos estão na mesma sala
- Cliente: `roomName=consulta-{token}` ✅
- Profissional: `roomName=consulta-{consultationId}` (precisa ser o mesmo)

## 🔧 Implementação Necessária:

### Passo 1: Armazenar `consultationId` no VideoPanelContext
```javascript
// Quando o link é gerado, armazenar o consultationId
const [consultationId, setConsultationId] = useState(null);
```

### Passo 2: Obter token do LiveKit quando sessão iniciar
```javascript
// Em handleSessionConnect, obter token do LiveKit
const fetchLiveKitToken = async () => {
  if (!consultationId) return;
  
  const response = await fetch(
    `/api/livekit/token?roomName=consulta-${consultationId}&participantName=professional-${consultationId}&isHost=true`
  );
  const data = await response.json();
  setLiveKitToken(data.token);
  setLiveKitUrl(data.wsUrl);
  setRoomName(data.roomName);
};
```

### Passo 3: Renderizar LiveKitRoomWrapped no profissional
```javascript
// Em VideoSurface ou consultations.jsx
{liveKitToken && liveKitUrl && roomName && (
  <LiveKitRoomWrapped
    token={liveKitToken}
    serverUrl={liveKitUrl}
    roomName={roomName}
    isProfessional={true}
  />
)}
```

## 🆘 PRECISA DE AJUDA PARA:

1. **Onde armazenar o `consultationId`?**
   - No `VideoPanelContext`?
   - Como prop do `ShareConsultationLink`?

2. **Como passar o `consultationId` do `ShareConsultationLink` para o contexto?**
   - Via callback?
   - Via contexto compartilhado?

3. **Onde renderizar o `LiveKitRoomWrapped` no profissional?**
   - Substituir `VideoSurface`?
   - Adicionar junto com `VideoSurface`?

## 📝 Próximos Passos:

1. Modificar `ShareConsultationLink` para passar `consultationId` ao contexto
2. Adicionar lógica em `VideoPanelContext` para obter token do LiveKit
3. Renderizar `LiveKitRoomWrapped` quando token estiver disponível
4. Garantir que vídeo/áudio sejam publicados automaticamente





