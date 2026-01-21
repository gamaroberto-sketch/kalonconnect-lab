# Guia do Profissional — KalonConnect

**Versão 1.0 | Janeiro 2026**

---

## 1. Introdução

O **KalonConnect** é uma plataforma de videochamada desenvolvida especificamente para atendimentos clínicos online — psicoterapia, orientação nutricional, consultas médicas e outras modalidades de saúde que exigem privacidade, estabilidade e registro confiável.

### Para que tipo de atendimento ele foi projetado?

- Sessões de 50 a 90 minutos
- Atendimentos individuais ou em dupla
- Ambientes onde o profissional precisa de **indicadores visuais claros** sobre o estado da conexão
- Situações onde a **gravação** pode ser necessária para fins clínicos, legais ou de supervisão

### Princípio central

> **O sistema informa estados críticos em tempo real, mas a responsabilidade clínica e ética permanece sempre com o profissional.**

O KalonConnect **não substitui** seu julgamento clínico. Ele **apoia** suas decisões ao mostrar claramente quando algo está fora do normal — conexão instável, microfone desligado, gravação pausada.

---

## 2. Durante a Sessão — O Que Sempre Verificar

Durante o atendimento, você verá **indicadores visuais** na tela. Eles existem para que você saiba, a qualquer momento, o estado real da sessão.

### 🟢 Indicador "AO VIVO"

**O que significa:**  
A conexão está ativa. Você e o cliente estão conectados em tempo real.

**O que fazer:**  
Nada. Siga normalmente.

**O que NÃO fazer:**  
Não ignore se esse indicador **desaparecer** durante a sessão.

---

### 🔴 Indicador "GRAVANDO"

**O que significa:**  
A gravação da sessão está ativa. Áudio e/ou vídeo estão sendo capturados.

**O que fazer:**  
- Confirme que o cliente **sabe** que está sendo gravado (obrigatório por lei)
- Se você pausar a gravação, um aviso amarelo aparecerá: **"GRAVAÇÃO PAUSADA"**

**O que NÃO fazer:**  
- **Nunca** inicie uma gravação sem informar o cliente
- **Nunca** assuma que a gravação está ativa só porque você clicou em "Gravar" — sempre verifique o indicador vermelho

---

### 🔇 Indicador "MICROFONE DESLIGADO"

**O que significa:**  
Seu microfone está **mudo**. O cliente não está ouvindo você.

**O que fazer:**  
- Clique no ícone do microfone para reativar
- Pergunte ao cliente se ele consegue ouvir você agora

**O que NÃO fazer:**  
- Não continue falando sem verificar se o cliente está ouvindo
- Não assuma que o problema é do lado do cliente — sempre verifique seu próprio microfone primeiro

---

### ⚠️ Indicador "RECONECTANDO"

**O que significa:**  
A conexão com o cliente foi **interrompida**. O sistema está tentando restabelecer automaticamente.

**O que fazer:**  
1. **Aguarde 10 segundos** — na maioria dos casos, a reconexão é automática
2. Se o indicador **não desaparecer**, informe ao cliente (por mensagem, se possível) que você vai reiniciar a sala
3. Se a reconexão falhar **repetidamente**, considere **pausar a sessão** e remarcar

**O que NÃO fazer:**  
- Não continue a sessão como se nada tivesse acontecido
- Não ignore reconexões frequentes — isso indica problema de rede que pode comprometer a qualidade do atendimento

---

## 3. Tradução e Legendas

O KalonConnect oferece legendas com tradução em tempo real para facilitar a comunicação em atendimentos multilíngues.

### Tradução automática — Versão Gratuita

A tradução automática gratuita foi projetada para testes e situações pontuais.
Ela permite aproximadamente **8–10 minutos de fala traduzida por dia**.

Em atendimentos longos ou com tradução contínua, recomenda-se utilizar a **versão profissional**, quando disponível.

---

## 4. Gravação de Sessões (Ética e Evidência)

### O que o sistema grava?

Você escolhe o modo de gravação:
- **Somente áudio do profissional**
- **Somente áudio do cliente**
- **Áudio de ambos**
- **Vídeo + áudio**

### O que a gravação NÃO substitui?

**A gravação NÃO substitui o consentimento verbal.**

Mesmo que você marque a opção "Avisar cliente", a **boa prática clínica e legal** exige que você:

1. Peça ao cliente para **dizer em voz alta**: *"Eu autorizo a gravação desta sessão."*
2. Explique **para que** a gravação será usada (supervisão, registro clínico, evidência legal)
3. Informe onde ela será armazenada e por quanto tempo

### Como o sistema protege a integridade da gravação?

O KalonConnect implementa **mecanismos de segurança forense**:

- **Hash criptográfico (SHA-256)**: Cada gravação recebe uma "impressão digital" única. Se alguém alterar o arquivo depois, isso será detectável.
- **Timestamp do servidor**: A data e hora da gravação são registradas pelo servidor, não pelo seu computador — isso impede manipulação de horários.
- **Backup incremental**: A cada 5 minutos, o sistema salva o progresso da gravação. Se o navegador travar, você perde no máximo os últimos 5 minutos.

### Limitações de gravações longas

- **Sessões acima de 90 minutos**: Podem gerar arquivos muito grandes. Recomendamos pausar e salvar em blocos de 60–90 minutos.
- **Dispositivos móveis**: Não são recomendados para gravações longas (veja seção 5).

---

## 5. Conexão e Qualidade

### O que acontece quando a conexão oscila?

O sistema monitora a qualidade da conexão em tempo real. Se detectar instabilidade, você verá:

- **Toast amarelo**: "Conexão Instável — Qualidade Reduzida"
- **Indicador "Reconectando"**: A conexão foi perdida e está sendo restabelecida

### O que significa "Reconectando"?

Significa que a comunicação entre você e o cliente foi **interrompida**. Isso pode acontecer por:

- Oscilação de Wi-Fi
- Troca de rede (4G para Wi-Fi, por exemplo)
- Sobrecarga de banda (alguém baixando arquivos grandes na mesma rede)

### Quando o profissional deve pausar a sessão?

**Pause a sessão se:**

- O indicador "Reconectando" aparecer **mais de 3 vezes** em 10 minutos
- A qualidade do áudio ou vídeo estiver **consistentemente ruim** (travamentos, cortes)
- Você ou o cliente **não conseguirem se ouvir claramente**

**Não tente "forçar" uma sessão com conexão ruim.** Isso prejudica a qualidade do atendimento e pode gerar problemas éticos.

### Como agir em sessões longas (acima de 60 minutos)?

- **Verifique a conexão antes de começar**: Peça ao cliente para confirmar que o áudio e vídeo estão claros
- **Faça pausas técnicas**: Em sessões de 90 minutos, considere uma pausa de 2 minutos no meio para "respirar" a conexão
- **Monitore os indicadores**: Se aparecer "Reconectando" após 40 minutos, avalie se vale a pena continuar ou remarcar

---

## 6. Uso em Celular / iPad

### Limitações do Safari / iOS

O Safari (navegador do iPhone e iPad) tem **restrições técnicas** que afetam videochamadas:

- **Ao bloquear a tela**: A conexão é **interrompida** automaticamente
- **Ao trocar de app**: A câmera e o microfone são **desligados**
- **Em sessões longas**: A bateria pode acabar, encerrando a sessão abruptamente

### O que acontece ao bloquear a tela?

**A sessão é desconectada.**

Se você ou o cliente bloquearem a tela do celular (mesmo sem querer), a conexão cai. O sistema tenta reconectar, mas isso pode levar de 10 a 30 segundos.

### Por que sessões longas são recomendadas no desktop?

- **Estabilidade**: Computadores têm conexão mais estável (cabo de rede ou Wi-Fi fixo)
- **Bateria**: Não dependem de bateria
- **Tela maior**: Facilita a visualização de indicadores e controles
- **Gravação**: Arquivos grandes são processados melhor em desktops

### O que fazer se precisar atender em mobile?

**Se você não tiver escolha:**

1. **Avise o cliente** que você está em dispositivo móvel
2. **Mantenha o celular conectado ao carregador**
3. **Não bloqueie a tela** durante a sessão
4. **Não grave sessões longas** (acima de 30 minutos)
5. **Prefira áudio apenas** (desabilite o vídeo para economizar banda e bateria)

---

## 7. Segurança e LGPD (Sem Juridiquês)

### Como os dados são protegidos?

- **Conexão criptografada**: Tudo que você e o cliente falam é transmitido de forma criptografada (ninguém "no meio" consegue ouvir)
- **Gravações com hash**: Cada gravação tem uma "impressão digital" que detecta alterações
- **Logs de acesso**: Sempre que você baixa uma gravação, o sistema registra quem, quando e qual arquivo

### O que é registrado?

O sistema registra:

- **Quem** acessou ou baixou gravações (seu ID de profissional)
- **Quando** isso aconteceu (data e hora do servidor)
- **Qual** sessão foi acessada (ID da sessão)

**Por quê?** Para cumprir a LGPD (Lei Geral de Proteção de Dados). Se houver uma auditoria ou solicitação do cliente, você pode provar que os dados foram acessados apenas por você.

### O que fica sob responsabilidade do profissional?

- **Armazenamento local**: Se você baixar uma gravação para seu computador, **você** é responsável por protegê-la (senha, criptografia, backup seguro)
- **Compartilhamento**: Nunca envie gravações por e-mail ou WhatsApp sem criptografia
- **Exclusão**: Quando não precisar mais da gravação, **exclua** do sistema e do seu computador

### Boas práticas recomendadas

1. **Não deixe gravações abertas** em pastas públicas do computador
2. **Use senhas fortes** para acessar o KalonConnect
3. **Não compartilhe** sua conta com assistentes ou estagiários (cada um deve ter sua própria conta)
4. **Revise periodicamente** quais gravações você ainda precisa manter

---

## 8. Checklist Rápido (Antes de Cada Sessão)

Use este checklist **antes de iniciar** qualquer atendimento:

- [ ] **Cliente conectado** — Vejo o vídeo/áudio do cliente?
- [ ] **Meu áudio confirmado** — O cliente confirma que está me ouvindo?
- [ ] **Meu vídeo confirmado** (se aplicável) — O cliente confirma que está me vendo?
- [ ] **Indicador "AO VIVO" ativo** — A conexão está estável?
- [ ] **Gravação iniciada** (se aplicável) — Vejo o indicador vermelho "GRAVANDO"?
- [ ] **Consentimento registrado** — O cliente autorizou verbalmente a gravação?
- [ ] **Ambiente estável** — Estou em local silencioso, com boa conexão?
- [ ] **Bateria/carregador** (se mobile) — Tenho autonomia para a sessão completa?

---

## 9. Limites do Sistema

### O que o sistema NÃO garante?

O KalonConnect **não garante**:

- **Conexão perfeita 100% do tempo** — Oscilações de rede podem acontecer
- **Qualidade de áudio/vídeo em redes ruins** — Se sua internet está lenta, o sistema não pode compensar completamente
- **Recuperação de gravações perdidas por crash do navegador** — Embora haja backup incremental, crashes graves podem causar perda parcial
- **Compatibilidade total com navegadores antigos** — Use sempre a versão mais recente do Chrome, Edge ou Firefox

### Situações onde o profissional deve interromper ou remarcar

**Interrompa a sessão se:**

- O cliente **não consegue ouvir você** após 3 tentativas de ajuste
- A conexão **cai mais de 3 vezes** em 10 minutos
- Você ou o cliente estão em **ambiente com muito ruído** (obras, trânsito, crianças chorando)
- A **gravação falha** repetidamente e você precisa dela para fins legais

**Remarque se:**

- A qualidade técnica está **comprometendo a qualidade clínica** do atendimento
- Você ou o cliente estão **frustrados** com problemas técnicos
- A sessão já foi **interrompida 2 ou mais vezes** por questões de conexão

### Transparência absoluta

**Este sistema foi projetado para ser confiável, mas não é infalível.**

Tecnologia de videochamada depende de:
- Qualidade da sua internet
- Qualidade da internet do cliente
- Estabilidade dos servidores intermediários
- Compatibilidade do navegador

**Sua responsabilidade como profissional é:**
- Monitorar os indicadores visuais
- Agir quando algo estiver errado
- Priorizar sempre a qualidade do atendimento sobre a conveniência técnica

### Atendimentos prolongados (3 a 4 horas)

O KalonConnect foi **testado e preparado para sessões de longa duração**. Diferente de ferramentas gratuitas que cortam a conexão, nosso sistema mantém a sala ativa enquanto houver estabilidade técnica.

Para garantir segurança em sessões de 3 ou 4 horas:
- **Monitore os indicadores**: O sistema informa o estado da conexão. Se notar lentidão após muitas horas, é sinal natural de uso de memória do navegador.
- **Gravação em blocos**: Para integridade do arquivo, recomendamos salvar a gravação a cada 90 minutos (pare e inicie novamente).
- **O sistema informa, você decide**: A ferramenta garante a disponibilidade da sala, mas a estabilidade final depende da sua rede e dispositivo. Pausas técnicas de 2 minutos restauram a performance do navegador.

---

## Suporte Técnico

Se você encontrar problemas **recorrentes** que não consegue resolver:

1. **Documente** o problema (tire prints dos indicadores, anote horários)
2. **Entre em contato** com o suporte técnico do KalonConnect
3. **Não tente "forçar" sessões** com problemas técnicos graves

---

**Última atualização:** Janeiro 2026  
**Versão do documento:** 1.0  
**Baseado em:** Auditoria Clínica de Robustez (Mobile + Gravação)
