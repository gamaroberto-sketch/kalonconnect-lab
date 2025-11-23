"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernButton from "../components/ModernButton";
import { useTheme } from "../components/ThemeProvider";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Save,
  Instagram,
  Globe,
  MessageCircle,
  Youtube,
  Facebook,
  Music2,
  User
} from "lucide-react";

const USER_PROFILE_ENDPOINT = "/api/user/profile";

const EMPTY_PROFILE = {
  photo: "",
  specialty: "",
  name: "",
  signaturePad: "",
  signatureText: "",
  services: [],
  social: {
    instagram: "",
    whatsapp: "",
    site: "",
    tiktok: "",
    youtube: "",
    facebook: "",
    registro: ""
  }
};

const ProfilePage = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activePhotoTab, setActivePhotoTab] = useState("upload");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(USER_PROFILE_ENDPOINT, { cache: "no-cache" });
      if (!response.ok) throw new Error("Não foi possível carregar o perfil.");
      const data = await response.json();
      setProfile({ ...EMPTY_PROFILE, ...data });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const updateProfile = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocial = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        [field]: value
      }
    }));
  };

  const addService = () => {
    setProfile((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", price: "" }]
    }));
  };

  const updateService = (index, field, value) => {
    setProfile((prev) => ({
      ...prev,
      services: prev.services.map((service, idx) =>
        idx === index
          ? {
              ...service,
              [field]: field === "price" ? value.replace(/[^0-9.,]/g, "") : value
            }
          : service
      )
    }));
  };

  const removeService = (index) => {
    setProfile((prev) => ({
      ...prev,
      services: prev.services.filter((_, idx) => idx !== index)
    }));
  };

  const handlePhotoUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      const buffer = await file.arrayBuffer();
      const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;
      updateProfile("photo", base64);
    } catch (error) {
      setError("Não foi possível carregar a imagem.");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setError("Não foi possível acessar a câmera do dispositivo.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/png");
    updateProfile("photo", base64);
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const initSignaturePad = (canvas) => {
    if (!canvas) return;
    let drawing = false;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = themeColors.textPrimary;
    ctx.lineWidth = 2;

    const getPosition = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches?.length) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const startDrawing = (e) => {
      drawing = true;
      const pos = getPosition(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!drawing) return;
      const pos = getPosition(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const endDrawing = () => {
      if (!drawing) return;
      drawing = false;
      ctx.closePath();
      updateProfile("signaturePad", canvas.toDataURL("image/png"));
    };

    canvas.onmousedown = startDrawing;
    canvas.onmousemove = draw;
    canvas.onmouseup = endDrawing;
    canvas.onmouseleave = endDrawing;

    canvas.ontouchstart = (e) => {
      e.preventDefault();
      startDrawing(e);
    };
    canvas.ontouchmove = (e) => {
      e.preventDefault();
      draw(e);
    };
    canvas.ontouchend = (e) => {
      e.preventDefault();
      endDrawing();
    };
  };

  const resetSignaturePad = () => {
    const canvas = document.getElementById("signature-pad");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = themeColors.backgroundSecondary || "#f9fafb";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    updateProfile("signaturePad", "");
  };

  useEffect(() => {
    if (isLoading) return;
    const canvas = document.getElementById("signature-pad");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = themeColors.backgroundSecondary || "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (profile.signaturePad) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = profile.signaturePad;
    }
    initSignaturePad(canvas);
  }, [isLoading, profile.signaturePad, themeColors.backgroundSecondary, themeColors.textPrimary]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage("");
      const payload = {
        ...profile,
        services: profile.services.map((service) => ({
          name: service.name,
          price: Number(String(service.price).replace(/[^0-9.,]/g, "").replace(",", ".")) || 0
        }))
      };
      const response = await fetch(USER_PROFILE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Não foi possível salvar os dados.");
      const savedProfile = await response.json();
      setProfile({ ...EMPTY_PROFILE, ...savedProfile });
      setSuccessMessage("Perfil salvo com sucesso!");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: themeColors.secondary || themeColors.secondaryLight || "#f0f9f9" }}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <Sidebar
          activeSection="profile"
          setActiveSection={() => {}}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        <div
          className={`relative transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}
          style={{ marginTop: "var(--alturaHeader)" }}
        >
          <div className="py-10 px-4 flex justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center w-full max-w-4xl">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: themeColors.primary }} />
              </div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden"
              >
                <div className="relative">
                  <div
                    className="h-40"
                    style={{
                      backgroundColor: themeColors.primary || "#0f4c4c"
                    }}
                  />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center w-full px-6 md:px-12">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-lg bg-white dark:bg-gray-800">
                        {profile.photo ? (
                          <img src={profile.photo} alt="Foto do profissional" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User className="w-16 h-16" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 text-center space-y-2 w-full">
                      <input
                        type="text"
                        placeholder="Coloque o nome que você é conhecido(a)"
                        className="w-full text-lg md:text-2xl font-semibold text-gray-800 dark:text-white text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 placeholder:text-sm md:placeholder:text-base"
                        value={profile.name}
                        onChange={(e) => updateProfile("name", e.target.value)}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Esse será o nome mostrado nas boas-vindas e durante a consulta.
                      </p>
                      <input
                        type="text"
                        placeholder="Especialidade"
                        className="w-full text-sm md:text-base text-gray-600 dark:text-gray-300 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        value={profile.specialty}
                        onChange={(e) => updateProfile("specialty", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-32 px-6 md:px-12 pb-12 space-y-10">
                  {error && (
                    <div className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="rounded-lg border border-green-200 dark:border-green-500/40 bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-300">
                      {successMessage}
                    </div>
                  )}

                  <section className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Foto do profissional</h2>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center space-x-3">
                        <ModernButton
                          icon={<Camera className="w-4 h-4" />}
                          variant={activePhotoTab === "camera" ? "primary" : "outline"}
                          onClick={() => {
                            setActivePhotoTab("camera");
                            startCamera();
                          }}
                          type="button"
                        >
                          Tirar foto agora
                        </ModernButton>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                        <ModernButton
                          icon={<ImageIcon className="w-4 h-4" />}
                          variant={activePhotoTab === "upload" ? "primary" : "outline"}
                          type="button"
                          onClick={() => {
                            stopCamera();
                            setActivePhotoTab("upload");
                            fileInputRef.current?.click();
                          }}
                        >
                          Fazer upload
                        </ModernButton>
                      </div>
                      <ModernButton variant="outline" type="button" onClick={() => updateProfile("photo", "")}>
                        Remover foto atual
                      </ModernButton>
                    </div>

                    <AnimatePresence mode="wait">
                      {activePhotoTab === "camera" ? (
                        <motion.div key="camera" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-3">
                          <div className="relative w-full max-w-xl mx-auto bg-black rounded-xl overflow-hidden">
                            <video ref={videoRef} autoPlay playsInline className="w-full" />
                            <canvas ref={canvasRef} className="hidden" />
                          </div>
                          <div className="flex justify-center gap-3">
                            <ModernButton icon={<Camera className="w-4 h-4" />} type="button" variant="primary" onClick={capturePhoto}>
                              Capturar foto
                            </ModernButton>
                            <ModernButton type="button" variant="outline" onClick={stopCamera}>
                              Parar câmera
                            </ModernButton>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="text-sm text-gray-500">
                          Formatos aceitos: JPG, PNG. Tamanho recomendado: 800x800px.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>

                  <section className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Assinatura</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm text-gray-600 dark:text-gray-300">Assinatura digital</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                          <canvas
                            id="signature-pad"
                            width={600}
                            height={200}
                            className="w-full bg-gray-50 dark:bg-gray-800"
                          />
                        </div>
                        <div className="flex gap-2">
                          <ModernButton variant="outline" type="button" onClick={resetSignaturePad}>
                            Limpar
                          </ModernButton>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm text-gray-600 dark:text-gray-300">Assinatura em texto</label>
                        <input
                          value={profile.signatureText}
                          onChange={(e) => updateProfile("signatureText", e.target.value)}
                          placeholder="Nome completo"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                        />
                        <input
                          value={profile.social.registro}
                          onChange={(e) => updateSocial("registro", e.target.value)}
                          placeholder="Registro profissional (opcional)"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Valores e Serviços</h2>
                      <ModernButton icon={<Plus className="w-4 h-4" />} type="button" variant="outline" onClick={addService}>
                        Adicionar serviço
                      </ModernButton>
                    </div>
                    {profile.services.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum serviço cadastrado.</p>
                    ) : (
                      <div className="space-y-4">
                        {profile.services.map((service, index) => (
                          <div key={`service-${index}`} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-center">
                            <input
                              value={service.name}
                              onChange={(e) => updateService(index, "name", e.target.value)}
                              placeholder="Nome da terapia"
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                            />
                            <input
                              value={service.price}
                              onChange={(e) => updateService(index, "price", e.target.value)}
                              placeholder="Valor (R$)"
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                            />
                            <ModernButton icon={<Trash2 className="w-4 h-4" />} variant="outline" type="button" onClick={() => removeService(index)}>
                              Remover
                            </ModernButton>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Redes sociais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <input
                          value={profile.social.instagram}
                          onChange={(e) => updateSocial("instagram", e.target.value)}
                          placeholder="Instagram"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                        <input
                          value={profile.social.whatsapp}
                          onChange={(e) => updateSocial("whatsapp", e.target.value)}
                          placeholder="WhatsApp"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <input
                          value={profile.social.site}
                          onChange={(e) => updateSocial("site", e.target.value)}
                          placeholder="Site"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Music2 className="w-5 h-5 text-purple-500" />
                        <input
                          value={profile.social.tiktok}
                          onChange={(e) => updateSocial("tiktok", e.target.value)}
                          placeholder="TikTok"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Youtube className="w-5 h-5 text-red-500" />
                        <input
                          value={profile.social.youtube}
                          onChange={(e) => updateSocial("youtube", e.target.value)}
                          placeholder="YouTube"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <input
                          value={profile.social.facebook}
                          onChange={(e) => updateSocial("facebook", e.target.value)}
                          placeholder="Facebook"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                        />
                      </div>
                    </div>
                  </section>

                  <div className="flex justify-end">
                    <ModernButton
                      icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      variant="primary"
                      size="lg"
                      type="submit"
                      disabled={isSaving}
                    >
                      {isSaving ? "Salvando..." : "Salvar Perfil"}
                    </ModernButton>
                  </div>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
