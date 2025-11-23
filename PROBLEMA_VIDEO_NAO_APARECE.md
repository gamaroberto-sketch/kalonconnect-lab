# 🚨 PROBLEMA: Vídeo do Profissional Não Aparece no Cliente

## 📋 Situação Atual:

1. ✅ **Cliente conecta ao LiveKit** - A página do cliente (`/consultations/client/[token]`) usa `LiveKitRoomWrapped` e se conecta corretamente
2. ❌ **Profissional NÃO está usando LiveKit** - O profissional usa `VideoSurface` que usa refs locais, mas não está conectado ao LiveKit
3. ❌ **Não estão na mesma sala** - Cliente e profissional não estão na mesma sala do LiveKit

## 🔍 Análise do Código:

### Cliente (funcionando):
- **Arquivo**: `pages/consultations/client/[token].jsx`
- **Componente**: `LiveKitRoomWrapped` ✅
- **Token**: Obtido via `/api/livekit/token` com `roomName=consulta-{token}` ✅
- **Status**: Conecta corretamente ao LiveKit

### Profissional (NÃO funcionando):
- **Arquivo**: `pages/consultations.jsx`
- **Componente**: `VideoSurface` (usa refs locais, não LiveKit)
- **Token**: NÃO está obtendo token do LiveKit ❌
- **Status**: NÃO está conectado ao LiveKit ❌

## 🎯 Problema Principal:

O profissional precisa:
1. Obter o token do LiveKit usando o mesmo `consultationId` que o cliente
2. Conectar-se à mesma sala (`consulta-{token}`)
3. Publicar seu vídeo/áudio no LiveKit
4. O cliente precisa estar inscrito para receber os tracks do profissional

## 🔧 O que precisa ser feito:

### Opção 1: Integrar LiveKitRoomWrapped no profissional
- Adicionar `LiveKitRoomWrapped` na página do profissional
- Obter token do LiveKit com `isHost=true` e mesmo `roomName`
- Garantir que o `consultationId` seja o mesmo usado para gerar o link

### Opção 2: Usar VideoSurface com LiveKit
- Modificar `VideoSurface` para usar `RemoteVideoManager` quando LiveKit estiver ativo
- Conectar os refs locais ao LiveKit quando a sessão iniciar

## 📝 Informações Necessárias:

1. **Como o profissional obtém o `consultationId`?**
   - Está em `ShareConsultationLink`?
   - Precisa ser passado como prop?

2. **Quando o profissional deve conectar ao LiveKit?**
   - Ao clicar em "Iniciar Sessão"?
   - Ao compartilhar a câmera?

3. **O `consultationId` é o mesmo usado no link do cliente?**
   - Se sim, podemos usar o mesmo para gerar o token

## 🆘 PRECISA DE AJUDA:

Este é um problema de arquitetura que requer:
- Entender o fluxo completo de conexão
- Integrar LiveKit no lado do profissional
- Garantir que ambos usem a mesma sala
- Garantir que o profissional publique e o cliente receba os tracks

**Por favor, forneça:**
1. Como o profissional obtém o `consultationId` usado no link
2. Onde o profissional deveria estar usando o LiveKit
3. Se há algum componente que deveria estar fazendo essa integração





