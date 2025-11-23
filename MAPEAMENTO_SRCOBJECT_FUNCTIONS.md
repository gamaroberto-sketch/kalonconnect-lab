# 🎯 MAPEAMENTO COMPLETO: Funções que Modificam srcObject

## 📋 **RESUMO EXECUTIVO**

Este documento mapeia **todas as funções** que modificam o atributo `srcObject` de elementos `<video>` no projeto, identificando conflitos, race conditions e impactos no ciclo de vida do DOM.

---

## 🔴 **1. FUNÇÕES PRINCIPAIS - VideoPanelContext.jsx**

### **1.1 ensureLocalStream()**
**Arquivo**: `components/VideoPanelContext.jsx`  
**Linhas**: 269-358  
**Contexto**: Função assíncrona principal para captação de MediaStream

#### **🔴 Modificação srcObject (Linha 304)**
```javascript
if (localVideoRef.current) {
  localVideoRef.current.srcObject = stream;  // 🔴 ATRIBUIÇÃO PRINCIPAL
  console.log('✅ Stream conectado ao elemento de vídeo');
}
```

#### **Triggers de Execução:**
- ✅ `toggleCameraPreview()` - Primeira vez ligando câmera
- ✅ `toggleVideo()` - Ativação de vídeo
- ✅ `toggleAudio()` - Ativação de áudio (indireta)

#### **Impacto no Ciclo de Vida:**
- **Mount**: Cria novo MediaStream via `getUserMedia()`
- **DOM**: Atribui `srcObject` diretamente ao elemento
- **Play**: Inicia polling para aguardar dimensões do vídeo
- **Tracks**: Habilita/desabilita tracks conforme necessário

#### **⚠️ Conflitos Potenciais:**
- Pode ser chamada múltiplas vezes se `streamRef.current` for null
- Race condition com `toggleCameraPreview()` que também atribui srcObject

---

### **1.2 toggleCameraPreview()**
**Arquivo**: `components/VideoPanelContext.jsx`  
**Linhas**: 442-495  
**Contexto**: Toggle principal da câmera (liga/desliga)

#### **🔴 Modificação srcObject - RESET (Linha 468)**
```javascript
if (isCameraPreviewOn) {
  // Desligando câmera
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = null;  // 🔴 RESET para NULL
  }
}
```

#### **🔴 Modificação srcObject - REATRIBUIÇÃO (Linha 488)**
```javascript
else {
  // Ligando câmera
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = streamRef.current;  // 🔴 REATRIBUIÇÃO
    console.log('✅ Stream conectado ao elemento de vídeo');
  }
}
```

#### **Triggers de Execução:**
- ✅ Clique no botão câmera (VideoControls)
- ✅ `toggleVideo()` quando câmera está desligada
- ✅ Ativação automática em alguns fluxos

#### **Impacto no Ciclo de Vida:**
- **OFF→ON**: Chama `ensureLocalStream()` se necessário, depois reatribui srcObject
- **ON→OFF**: Para todos os tracks, limpa streamRef, reseta srcObject para null
- **DOM**: Remove/adiciona stream do elemento de vídeo

#### **⚠️ Conflitos Críticos:**
- **DUPLA ATRIBUIÇÃO**: Se stream não existe, chama `ensureLocalStream()` que TAMBÉM atribui srcObject
- **RACE CONDITION**: Entre linha 488 e ensureLocalStream linha 304
- **TIMING**: Pode executar antes do elemento estar montado no DOM

---

### **1.3 toggleScreenShare()**
**Arquivo**: `components/VideoPanelContext.jsx`  
**Linhas**: 517-540  
**Contexto**: Compartilhamento de tela

#### **🔴 Modificação srcObject - SCREEN STREAM (Linha 525)**
```javascript
if (!isScreenSharing) {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true
  });
  if (screenShareRef.current) {
    screenShareRef.current.srcObject = screenStream;  // 🔴 SCREEN STREAM
  }
}
```

#### **🔴 Modificação srcObject - CLEANUP (Linha 535)**
```javascript
else {
  if (screenShareRef.current?.srcObject) {
    screenShareRef.current.srcObject.getTracks().forEach((track) => track.stop());
    screenShareRef.current.srcObject = null;  // 🔴 CLEANUP
  }
}
```

#### **Triggers de Execução:**
- ✅ Clique no botão compartilhar tela (VideoControls)
- ✅ Fim automático de compartilhamento (usuário para via browser)

#### **Impacto no Ciclo de Vida:**
- **START**: Cria novo MediaStream via `getDisplayMedia()`, atribui a `screenShareRef`
- **STOP**: Para tracks, limpa srcObject
- **DOM**: Usa elemento de vídeo separado (`screenShareRef`)

#### **⚠️ Conflitos Potenciais:**
- Usa ref diferente (`screenShareRef`), então não conflita diretamente
- Pode haver conflito de recursos de vídeo no browser

---

## 🔴 **2. COMPONENTES EXPERIMENTAIS**

### **2.1 NativeVideo.jsx - Elemento Nativo**
**Arquivo**: `components/NativeVideo.jsx`  
**Linhas**: 64-80  
**Contexto**: Manipulação direta do DOM, fora do React

#### **🔴 Modificação srcObject (Linha 76)**
```javascript
// 🔴 TÉCNICA PERPLEXITY: Comparar referências antes de atribuir
if (stream && stream !== currentStreamRef.current) {
  currentStreamRef.current = stream;
  
  // 🔴 VERIFICAR se srcObject já é o mesmo
  if (video.srcObject !== stream) {
    console.log('🔍 DEBUG: Atribuindo srcObject (era diferente)');
    video.srcObject = stream;  // 🔴 MANIPULAÇÃO DIRETA DOM
  } else {
    console.log('🔍 DEBUG: srcObject já é o mesmo, pulando atribuição');
  }
}
```

#### **Triggers de Execução:**
- ✅ `useEffect` quando prop `stream` muda
- ✅ Componente recebe novo stream via props

#### **Impacto no Ciclo de Vida:**
- **Mount**: Cria elemento `<video>` nativo via `document.createElement()`
- **Update**: Compara referências antes de atribuir (evita atribuições desnecessárias)
- **Unmount**: Remove elemento do DOM, limpa refs

#### **⚠️ Conflitos Potenciais:**
- **NÃO USADO ATUALMENTE** no projeto principal
- Se fosse usado, poderia conflitar com VideoPanelContext
- Manipulação direta do DOM pode causar inconsistências

---

### **2.2 StableVideo.jsx - Refs Estáveis**
**Arquivo**: `components/StableVideo.jsx`  
**Linhas**: 14-33  
**Contexto**: Componente com refs para evitar re-renders

#### **🔴 Modificação srcObject - ATRIBUIÇÃO (Linha 18)**
```javascript
// 🔴 TÉCNICA PERPLEXITY: Comparar referência do stream via ref
if (stream && stream !== videoStreamRef.current) {
  videoStreamRef.current = stream;
  
  if (video) {
    video.srcObject = stream;  // 🔴 srcObject assignment
    video.muted = true;
    video.onloadedmetadata = () => {
      video.play().catch(() => {});
    };
  }
}
```

#### **🔴 Modificação srcObject - RESET (Linha 30)**
```javascript
// 🔴 CLEANUP: Limpar quando stream for removido
if (!stream && videoStreamRef.current) {
  videoStreamRef.current = null;
  if (video) {
    video.srcObject = null;  // 🔴 RESET srcObject
  }
}
```

#### **Triggers de Execução:**
- ✅ `useEffect` quando prop `stream` muda
- ✅ Stream é removido (prop vira null/undefined)

#### **Impacto no Ciclo de Vida:**
- **Update**: Usa ref para comparar streams, evita atribuições desnecessárias
- **Cleanup**: Limpa srcObject quando stream é removido
- **Play**: Configura event listeners para autoplay

#### **⚠️ Conflitos Potenciais:**
- **NÃO USADO ATUALMENTE** no projeto principal
- Poderia conflitar se usado junto com VideoPanelContext
- Ref comparison pode falhar se stream for recriado com mesmo conteúdo

---

## 🔴 **3. ANÁLISE DE CONFLITOS**

### **3.1 Conflito Principal: ensureLocalStream() vs toggleCameraPreview()**

#### **🚨 DUPLA ATRIBUIÇÃO IDENTIFICADA**
```javascript
// FLUXO PROBLEMÁTICO:
1. Usuário clica botão câmera
2. toggleCameraPreview() é chamado
3. Se !streamRef.current, chama ensureLocalStream()
4. ensureLocalStream() atribui: localVideoRef.current.srcObject = stream (LINHA 304)
5. toggleCameraPreview() continua e atribui: localVideoRef.current.srcObject = streamRef.current (LINHA 488)
```

#### **⚠️ RESULTADO:**
- **DUAS ATRIBUIÇÕES** para o mesmo elemento
- **TIMING RACE**: Dependendo da velocidade, pode haver conflito
- **LOGS DUPLICADOS**: "Stream conectado ao elemento de vídeo" aparece 2x

#### **🔧 SOLUÇÃO SUGERIDA:**
```javascript
// Em toggleCameraPreview(), REMOVER linha 488:
// if (localVideoRef.current) {
//   localVideoRef.current.srcObject = streamRef.current; // ❌ REMOVER
// }

// Deixar apenas ensureLocalStream() fazer a atribuição
```

---

### **3.2 Conflito de Timing: Mount vs Context Update**

#### **🚨 PROBLEMA IDENTIFICADO**
```javascript
// SEQUÊNCIA PROBLEMÁTICA:
1. VideoElement monta no DOM
2. localVideoRef.current é atribuído ao elemento
3. Context ainda não tem stream (streamRef.current = null)
4. Usuário clica câmera
5. ensureLocalStream() pode executar antes do ref estar pronto
```

#### **⚠️ RESULTADO:**
- **NULL REFERENCE**: `localVideoRef.current` pode ser null
- **ATRIBUIÇÃO PERDIDA**: srcObject não é atribuído
- **ESTADO INCONSISTENTE**: Context diz que tem stream, mas vídeo não mostra

#### **🔧 SOLUÇÃO SUGERIDA:**
```javascript
// Adicionar verificação de timing:
const ensureLocalStream = async () => {
  // Aguardar ref estar pronto
  let attempts = 0;
  while (!localVideoRef.current && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  if (!localVideoRef.current) {
    console.error('❌ localVideoRef não está pronto após timeout');
    return null;
  }
  
  // Continuar com lógica normal...
};
```

---

### **3.3 Conflito de Re-renders: Fast Refresh vs srcObject**

#### **🚨 PROBLEMA IDENTIFICADO**
```javascript
// SEQUÊNCIA PROBLEMÁTICA (Desenvolvimento):
1. Fast Refresh recarrega componente
2. VideoElement é desmontado/remontado
3. localVideoRef.current aponta para novo elemento
4. streamRef.current ainda tem stream antigo
5. srcObject é reatribuído ao novo elemento
6. Elemento antigo fica "órfão" com stream
```

#### **⚠️ RESULTADO:**
- **MEMORY LEAK**: Elementos órfãos com streams ativos
- **FLICKERING**: Vídeo pisca durante development
- **PERFORMANCE**: Múltiplos streams simultâneos

#### **🔧 SOLUÇÃO IMPLEMENTADA:**
```javascript
// next.config.mjs
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    reactRefresh: false  // ✅ DESABILITA Fast Refresh
  }
};
```

---

## 🔴 **4. MAPEAMENTO DE TRIGGERS**

### **4.1 Triggers Diretos (Usuário)**
| Ação | Função Chamada | srcObject Modificado | Elemento Afetado |
|------|----------------|---------------------|------------------|
| Clique câmera | `toggleCameraPreview()` | ✅ 2x (conflito) | `localVideoRef` |
| Clique áudio | `toggleAudio()` | ❌ (indireta via ensureLocalStream) | `localVideoRef` |
| Clique tela | `toggleScreenShare()` | ✅ 1x | `screenShareRef` |
| Clique vídeo | `toggleVideo()` | ❌ (indireta via toggleCameraPreview) | `localVideoRef` |

### **4.2 Triggers Indiretos (Sistema)**
| Evento | Função Chamada | srcObject Modificado | Contexto |
|--------|----------------|---------------------|----------|
| Component Mount | Nenhuma direta | ❌ | Aguarda ação usuário |
| Context Update | Possível re-render | ❌ | Pode causar re-atribuição |
| Stream End | `toggleCameraPreview()` | ✅ (reset para null) | Cleanup automático |
| Page Refresh | Cleanup + Mount | ✅ (reset + nova atribuição) | Desenvolvimento |

### **4.3 Triggers de Cleanup**
| Situação | Função | srcObject Action | Impacto |
|----------|--------|------------------|---------|
| Câmera OFF | `toggleCameraPreview()` | `= null` | Remove stream |
| Tela OFF | `toggleScreenShare()` | `= null` | Para compartilhamento |
| Component Unmount | `useEffect cleanup` | `= null` | Previne memory leak |
| Stream Error | Error handlers | `= null` | Recovery automático |

---

## 🔴 **5. IMPACTO NO CICLO DE VIDA DO DOM**

### **5.1 Ciclo Normal (Sem Conflitos)**
```
1. 🟢 Mount: <video ref={localVideoRef} />
2. 🟢 User Action: Clique câmera
3. 🟢 Stream Creation: getUserMedia()
4. 🟢 srcObject Assignment: localVideoRef.current.srcObject = stream
5. 🟢 Video Play: video.play()
6. 🟢 Render: Vídeo aparece na tela
```

### **5.2 Ciclo com Conflito (Atual)**
```
1. 🟢 Mount: <video ref={localVideoRef} />
2. 🟢 User Action: Clique câmera
3. 🟢 toggleCameraPreview(): Chama ensureLocalStream()
4. 🟡 ensureLocalStream(): srcObject = stream (1ª atribuição)
5. 🔴 toggleCameraPreview(): srcObject = stream (2ª atribuição - CONFLITO)
6. 🟡 Video Play: Pode falhar devido ao conflito
7. 🔴 Render: Vídeo pode piscar ou não aparecer
```

### **5.3 Ciclo com Race Condition**
```
1. 🟢 Mount: <video ref={localVideoRef} />
2. 🟢 User Action: Clique câmera (rápido)
3. 🔴 Race: ensureLocalStream() ainda executando
4. 🔴 Race: toggleCameraPreview() tenta reatribuir
5. 🔴 Conflict: srcObject atribuído a stream incompleto
6. 🔴 Error: video.play() falha
7. 🔴 Result: Vídeo não aparece
```

---

## 🔴 **6. RECOMENDAÇÕES DE CORREÇÃO**

### **6.1 Eliminar Dupla Atribuição**
```javascript
// ❌ ATUAL (toggleCameraPreview):
if (localVideoRef.current) {
  localVideoRef.current.srcObject = streamRef.current; // REMOVER
}

// ✅ CORREÇÃO: Deixar apenas ensureLocalStream() fazer atribuição
```

### **6.2 Centralizar Atribuições**
```javascript
// ✅ NOVA FUNÇÃO CENTRALIZADA:
const assignStreamToVideo = (stream, videoRef) => {
  if (!videoRef.current || !stream) return false;
  
  // Evitar atribuição desnecessária
  if (videoRef.current.srcObject === stream) {
    return true;
  }
  
  videoRef.current.srcObject = stream;
  return true;
};
```

### **6.3 Adicionar Proteções**
```javascript
// ✅ PROTEÇÃO CONTRA RACE CONDITIONS:
const ensureLocalStream = async () => {
  // Verificar se já está em execução
  if (ensureLocalStreamRef.current) {
    return ensureLocalStreamRef.current;
  }
  
  ensureLocalStreamRef.current = createStreamPromise();
  const result = await ensureLocalStreamRef.current;
  ensureLocalStreamRef.current = null;
  
  return result;
};
```

---

## 🔴 **7. RESUMO EXECUTIVO**

### **📊 Estatísticas de srcObject**
- **Total de funções**: 5 funções modificam srcObject
- **Conflitos identificados**: 3 conflitos críticos
- **Elementos afetados**: 2 refs (`localVideoRef`, `screenShareRef`)
- **Atribuições por ação**: Até 2x para mesma ação (problema)

### **🚨 Conflitos Críticos**
1. **Dupla atribuição** em `toggleCameraPreview()` + `ensureLocalStream()`
2. **Race condition** entre mount e context update
3. **Fast Refresh** causando memory leaks (parcialmente resolvido)

### **✅ Soluções Implementadas**
- Fast Refresh desabilitado
- Logs de debug removidos
- Componentes isolados com `dynamic` import

### **⚠️ Soluções Pendentes**
- Eliminar dupla atribuição
- Centralizar controle de srcObject
- Adicionar proteções contra race conditions
- Implementar cleanup mais robusto

Este mapeamento identifica todos os pontos críticos onde `srcObject` é modificado e fornece base para correções definitivas dos problemas de vídeo.



