"use client";

export const processRecording = async ({
  clientId,
  clientName,
  professionalId,
  sessionId,
  recordingPath,
  duration,
  recordingMode,
  recordedAt
}) => {
  try {
    const transcribeResponse = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        clientName,
        professionalId,
        sessionId,
        recordingPath,
        duration,
        mode: recordingMode,
        recordedAt
      })
    });

    if (!transcribeResponse.ok) {
      throw new Error("Falha ao transcrever a gravação.");
    }

    const transcribePayload = await transcribeResponse.json();
    const transcript = transcribePayload.transcript || "";

    const summarizeResponse = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        clientName,
        professionalId,
        sessionId,
        transcript,
        recordedAt
      })
    });

    if (!summarizeResponse.ok) {
      throw new Error("Falha ao gerar o resumo terapêutico.");
    }

    const summarizePayload = await summarizeResponse.json();

    return {
      transcript,
      summary: summarizePayload.summary || "",
      keywords: summarizePayload.keywords || [],
      duration: transcribePayload.duration,
      mode: transcribePayload.mode
    };
  } catch (error) {
    console.error("Erro ao processar a gravação:", error);
    throw error;
  }
};



