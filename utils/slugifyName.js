// utils/slugifyName.js

/**
 * Converte um nome em slug seguro para uso em URLs e identificadores
 * @param {string} name - Nome a ser convertido
 * @returns {string} Slug normalizado e seguro
 */
export function slugifyName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")     // remover acentos
    .replace(/[^a-zA-Z0-9]+/g, "-")       // transformar separadores em '-'
    .replace(/^-+|-+$/g, "")              // remover hífens no início/fim
    .toLowerCase();
}





