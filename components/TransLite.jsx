import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

/**
 * TransLite
 * 
 * Componente leve para renderização de texto rico internacionalizado.
 * Suporta tags numeradas simples: <0>Texto</0>, <1>Texto</1>
 * Mapeia para o array de componentes fornecido.
 * 
 * @param {string} i18nKey - Chave de tradução
 * @param {Object} values - Valores para interpolação (opcional)
 * @param {Array} components - Array de componentes React para substituir as tags
 * @param {string} defaults - Texto padrão caso a chave não exista (opcional)
 */
const TransLite = ({ i18nKey, values = {}, components = [], defaults }) => {
    const { t } = useTranslation();

    // Obtém o texto traduzido
    // Se defaults for fornecido e a chave não existir (retornar a própria chave), usa defaults
    let text = t(i18nKey, values);

    // Verificação básica se a tradução falhou (assumindo que t retorna a chave se falhar)
    if (text === i18nKey && defaults) {
        text = defaults;
    }

    if (!text) return null;

    // Se não houver tags no texto, retorna string direta
    if (!text.includes('<') || !text.includes('>')) {
        return <>{text}</>;
    }

    // Função para processar o texto e substituir tags
    const renderNodes = (inputText) => {
        // Regex para capturar tags de abertura <N>, fechamento </N> ou conteúdo
        // Captura: (<(\d+)>) ou (<\/(\d+)>)
        // Isso divide a string mantendo os delimitadores
        const parts = inputText.split(/(<\/?\d+>)/);

        const nodes = [];
        const stack = []; // Armazena índices dos componentes abertos

        // Estrutura para montar a árvore
        // Cada nível tem { children: [], componentIndex: number | null }
        // Root é nível 0
        let currentLevel = { children: [] };
        const levelStack = [currentLevel];

        parts.forEach((part, index) => {
            if (!part) return;

            // Verifica tag de abertura: <1>
            const openMatch = part.match(/^<(\d+)>$/);
            // Verifica tag de fechamento: </1>
            const closeMatch = part.match(/^<\/(\d+)>$/);

            if (openMatch) {
                const compIndex = parseInt(openMatch[1], 10);
                // Cria novo nível
                const newLevel = { children: [], componentIndex: compIndex };
                levelStack[levelStack.length - 1].children.push(newLevel);
                levelStack.push(newLevel);
            } else if (closeMatch) {
                const compIndex = parseInt(closeMatch[1], 10);
                // Fecha nível atual se corresponder
                if (levelStack.length > 1) {
                    const current = levelStack[levelStack.length - 1];
                    if (current.componentIndex === compIndex) {
                        levelStack.pop();
                    } else {
                        // Tag de fechamento incompatível ou desbalanceada, trata como texto
                        // (Simplificação: apenas ignora ou adiciona como texto se for crítico)
                        // Aqui, vamos adicionar como texto para não quebrar
                        levelStack[levelStack.length - 1].children.push(part);
                    }
                } else {
                    levelStack[levelStack.length - 1].children.push(part);
                }
            } else {
                // Conteúdo de texto
                levelStack[levelStack.length - 1].children.push(part);
            }
        });

        // Helper recursivo para renderizar a árvore estruturada
        const buildReactTree = (levelNode, keyPrefix) => {
            // Se for um nó folha (string), retorna
            if (typeof levelNode === 'string') return levelNode;

            // Se tiver componentIndex, envolve os filhos no componente correspondente
            const children = levelNode.children.map((child, i) => buildReactTree(child, `${keyPrefix}-${i}`));

            if (levelNode.componentIndex !== undefined && components[levelNode.componentIndex]) {
                const Component = components[levelNode.componentIndex];

                // Se for um elemento React válido já instanciado (ex: <strong />)
                if (React.isValidElement(Component)) {
                    return React.cloneElement(Component, { key: keyPrefix }, children);
                }
                // Se for função ou classe? (Simplificação: cloneElement espera elemento)
                return children;
            }

            // Root level
            return children;
        };

        // O currentLevel root tem structure { children: [...] }
        // O primeiro nível de children pode misturar strings e objetos level
        return levelStack[0].children.map((child, i) => buildReactTree(child, `root-${i}`));
    };

    try {
        return <>{renderNodes(text)}</>;
    } catch (e) {
        console.error("TransLite Error parsing:", text, e);
        return <>{text}</>;
    }
};

export default TransLite;
