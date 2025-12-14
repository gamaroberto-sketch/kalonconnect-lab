// utils/getActiveConsultationId.js

/**
 * Função central para obter o ID da consulta ativa
 * Ordem de prioridade:
 * 1. State global/context (se disponível)
 * 2. localStorage.getItem("lastOpenedConsultationId")
 * 3. null
 */
export function getActiveConsultationId() {
  // 1. Tentar buscar do localStorage (fonte de verdade)
  if (typeof window !== "undefined") {
    const savedId = localStorage.getItem("lastOpenedConsultationId");
    if (savedId && 
        savedId !== "null" && 
        savedId !== "undefined" && 
        !savedId.startsWith("temp-") &&
        savedId.trim() !== "") {
      return savedId.trim();
    }
  }

  // 2. Se não encontrou, retornar null
  return null;
}

/**
 * Salva o ID da consulta ativa no localStorage
 */
export function setActiveConsultationId(consultationId) {
  if (typeof window === "undefined") return;
  
  if (consultationId && 
      consultationId !== "null" && 
      consultationId !== "undefined" && 
      !consultationId.startsWith("temp-") &&
      consultationId.trim() !== "") {
    localStorage.setItem("lastOpenedConsultationId", consultationId.trim());
  } else {
    localStorage.removeItem("lastOpenedConsultationId");
  }
}





