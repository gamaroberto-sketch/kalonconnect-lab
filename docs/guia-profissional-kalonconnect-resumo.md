# Guia Rápido — KalonConnect

**Princípio Central:** O sistema informa estados críticos em tempo real, mas a responsabilidade clínica e ética permanece sempre com o profissional.

## 1. Indicadores Críticos

| Indicador | Significado | Ação Obrigatória |
| :--- | :--- | :--- |
| 🟢 **AO VIVO** | Conexão ativa, tudo certo. | Seguir normalmente. |
| 🔴 **GRAVANDO** | Mídia sendo capturada. | **Confirmar consentimento** verbal. |
| 🔇 **MUTADO** | Seu microfone está desligado. | Reativar para ser ouvido. |
| ⚠️ **RECONECTANDO** | Conexão interrompida. | Aguardar 10s. Se persistir, avisar. |

## 2. Gravação: Regras de Ouro
*   **Consentimento Verbal:** Peça sempre ao cliente para dizer *"Eu autorizo a gravação"* no início.
*   **Integridade:** O sistema garante autenticidade (Hash SHA-256), mas você guarda o sigilo.
*   **Backup:** Ocorre a cada 5 min. Em caso de crash, perda máxima é de 5 min.

## 3. Limitações Importantes
*   **Sessões Longas (>90min):** Risco de instabilidade. Recomendado pausar/salvar a cada 60min.
*   **Mobile / iOS (Safari):** **Não bloqueie a tela!** Isso corta a conexão imediatamente no iPhone/iPad.
*   **Redes Instáveis:** O sistema não "corrige" internet ruim. Se cair 3x, pause.
*   **Tradução Automática:** Recurso de apoio (8-10 min/dia na versão gratuita). Monitore a qualidade.

## 4. Checklist Pré-Sessão
1. [ ] Cliente conectado (Audio/Video OK)?
2. [ ] Meu áudio confirmado pelo cliente?
3. [ ] Indicador 🟢 **AO VIVO** visível?
4. [ ] Botão 🔴 **GRAVAR** ativado (se aplicável)?
5. [ ] Consentimento registrado?
6. [ ] Ambiente silencioso?

## 5. Quando PAUSAR ou REMARCAR
Interrompa imediatamente se:
1.  O indicador **⚠️ RECONECTANDO** aparecer mais de **3 vezes** em 10 minutos.
2.  O cliente **não conseguir ouvir** você após tentativas de ajuste.
3.  A qualidade técnica estiver comprometendo o **vínculo ou o processo clínico**.

---
*Versão Resumida 1.0 | Janeiro 2026 | Consulte o Guia Completo para detalhes.*
