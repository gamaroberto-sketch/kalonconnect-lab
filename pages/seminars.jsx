"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Users } from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "../components/AuthContext";
import VideoSystemManager from "../components/VideoSystemManager";
import ChatPanel from "../components/ChatPanel";
import NotesPanel from "../components/NotesPanel";

const MAX_PARTICIPANTS = 4;

const SeminarParticipantMock = ({ name }) => (
  <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 text-white flex items-center justify-center">
    <span className="text-lg font-semibold tracking-wide">{name}</span>
    <div className="absolute bottom-3 right-3 bg-black/60 px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em]">
      ao vivo
    </div>
  </div>
);

const SeminarsPage = () => {
  const { user } = useAuth();
  const { getThemeColors } = useTheme();
  const theme = getThemeColors();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [seminarTopic, setSeminarTopic] = useState("");
  const [guestInput, setGuestInput] = useState("");
  const [guestList, setGuestList] = useState(["amiga1@kalon.com", "amiga2@kalon.com"]);

  const addGuest = () => {
    const value = guestInput.trim();
    if (!value) return;
    if (guestList.includes(value)) {
      setGuestInput("");
      return;
    }
    setGuestList((prev) => [...prev, value]);
    setGuestInput("");
  };

  const mockParticipants = guestList.slice(0, MAX_PARTICIPANTS).map((guest, index) => {
    if (index === 0) return user?.name || "Você";
    return guest.split("@")[0];
  });

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: theme.secondary || theme.secondaryLight || "#f3f4f6" }}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <Sidebar
          activeSection="seminars"
          setActiveSection={() => {}}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        <div
          className={`relative transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}
          style={{ marginTop: "var(--alturaHeader)" }}
        >
          <div className="py-10 px-4 flex justify-center">
            <div className="w-full max-w-6xl space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-8"
              >
                <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                      <Users className="w-8 h-8 text-emerald-500" />
                      Seminários em Grupo
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                      Crie eventos interativos com até 20 participantes, utilizando o sistema de vídeo simulando Google Meet ou HighMesh 4K. A integração externa será ativada em breve.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full font-semibold transition"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Criar seminário
                  </button>
                </header>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-[0.2em]">
                      Tema do Seminário
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Consciência Integrada na Prática Terapêutica"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={seminarTopic}
                      onChange={(event) => setSeminarTopic(event.target.value)}
                    />

                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-[0.2em]">
                      Convidados
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        placeholder="email@participante.com"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={guestInput}
                        onChange={(event) => setGuestInput(event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={addGuest}
                        className="px-4 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 transition"
                      >
                        Adicionar
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {guestList.map((guest) => (
                        <span
                          key={guest}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm"
                        >
                          {guest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-[0.2em]">
                      Agendamento
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="p-4 rounded-2xl border border-dashed border-emerald-400 bg-emerald-50 text-emerald-700 text-sm">
                      O link do seminário será gerado automaticamente quando a sessão for iniciada. Em breve, integraremos Google Meet e HighMesh 4K.
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-8 space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Sala do Seminário (simulação)
                </h2>
                <VideoSystemManager userPlan={user?.plan || "pro"} professionalName={user?.name} />

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-4">
                    {mockParticipants.map((participant, index) => (
                      <SeminarParticipantMock key={`${participant}-${index}`} name={participant} />
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300">
                          Chat do Seminário
                        </h3>
                      </div>
                      <div className="p-6">
                        <ChatPanel />
                      </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300">
                          Notas rápidas
                        </h3>
                      </div>
                      <div className="p-6">
                        <NotesPanel />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SeminarsPage;

const mockParticipants = [
  { id: 1, name: "Profissional Kalon", role: "host" },
  { id: 2, name: "Convidado 1", role: "guest" },
  { id: 3, name: "Convidado 2", role: "guest" },
  { id: 4, name: "Convidado 3", role: "guest" }
];

const initialMessages = [
  { id: 1, sender: "Profissional Kalon", content: "Bem-vindos ao seminário de hoje!" },
  { id: 2, sender: "Convidado 1", content: "Obrigado pelo convite." }
];

