"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernButton from "./ModernButton";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "./AuthContext";
import PrescriptionTemplateUpload from "./settings/PrescriptionTemplateUpload";
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
    User,
    Copy
} from "lucide-react";

const USER_PROFILE_ENDPOINT = "/api/user/profile";

const EMPTY_PROFILE = {
    photo: "",
    specialty: "",
    name: "",
    phone: "",
    bio: "",
    signaturePad: "",
    signatureText: "",
    services: [],
    social: {
        instagram: [],
        whatsapp: [],
        site: [],
        linkedin: [],
        tiktok: [],
        youtube: [],
        facebook: [],
        registro: ""
    },
    address: {
        street: "",
        city: "",
        state: "",
        zipCode: ""
    },
    city: "",
    pixKeys: [],
    currency: "BRL",
    slug: ""
};

const ProfileEditor = () => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const { t } = useTranslation();
    const { user } = useAuth();

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

    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(savedDarkMode);
    }, []);

    const loadProfile = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`${USER_PROFILE_ENDPOINT}?userId=${user.id}`, {
                cache: "no-cache",
                headers: {
                    'x-user-id': user.id
                }
            });
            if (!response.ok) throw new Error(t('profile.errors.load'));
            const data = await response.json();
            setProfile({ ...EMPTY_PROFILE, ...data });
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSocialArray = (network, index, value) => {
        setProfile(prev => {
            const newArray = [...(prev.social[network] || [])];
            newArray[index] = value;
            return {
                ...prev,
                social: {
                    ...prev.social,
                    [network]: newArray
                }
            };
        });
    };

    const addSocial = (network) => {
        setProfile(prev => ({
            ...prev,
            social: {
                ...prev.social,
                [network]: [...(prev.social[network] || []), ""]
            }
        }));
    };

    const removeSocial = (network, index) => {
        setProfile(prev => {
            const newArray = [...(prev.social[network] || [])];
            newArray.splice(index, 1);
            return {
                ...prev,
                social: {
                    ...prev.social,
                    [network]: newArray
                }
            };
        });
    };

    const renderSocialInputs = (network, icon, placeholder) => {
        const items = profile.social[network] || [];

        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10" style={{ backgroundColor: themeColors.primary + '20' }}>
                        {React.cloneElement(icon, { className: "w-5 h-5", style: { color: themeColors.primary } })}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{placeholder}</span>
                </div>

                {items.map((item, index) => (
                    <div key={`${network}-${index}`} className="flex gap-2">
                        <input
                            value={item}
                            onChange={(e) => updateSocialArray(network, index, e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            style={{ borderColor: themeColors.border }}
                        />
                        <ModernButton
                            icon={<Trash2 className="w-4 h-4" />}
                            variant="outline"
                            type="button"
                            size="sm"
                            onClick={() => removeSocial(network, index)}
                            className="shrink-0 !w-10 !p-0 flex items-center justify-center"
                        />
                    </div>
                ))}

                <ModernButton
                    icon={<Plus className="w-4 h-4" />}
                    variant="ghost"
                    type="button"
                    onClick={() => addSocial(network)}
                    className="w-full border-dashed border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                    style={{ borderColor: themeColors.border || '#e5e7eb' }}
                >
                    {t('common.add')} {placeholder}
                </ModernButton>
            </div>
        );
    };

    useEffect(() => {
        loadProfile();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, [user]);

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

    const addPixKey = () => {
        setProfile((prev) => ({
            ...prev,
            pixKeys: [...(prev.pixKeys || []), { label: "", key: "" }]
        }));
    };

    const updatePixKey = (index, field, value) => {
        setProfile((prev) => ({
            ...prev,
            pixKeys: (prev.pixKeys || []).map((item, idx) =>
                idx === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removePixKey = (index) => {
        setProfile((prev) => ({
            ...prev,
            pixKeys: (prev.pixKeys || []).filter((_, idx) => idx !== index)
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
            setError(t('profile.errors.imageLoad'));
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
            setError(t('profile.errors.camera'));
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
                    price: String(service.price || "0,00") // Keep as formatted string
                }))
            };
            const response = await fetch(`${USER_PROFILE_ENDPOINT}?userId=${user.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user.id
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(t('profile.errors.save'));
            const savedProfile = await response.json();
            setProfile({ ...EMPTY_PROFILE, ...savedProfile });
            setSuccessMessage(t('profile.success.save'));
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSuccessMessage(""), 4000);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: themeColors.primary }} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <form onSubmit={handleSubmit} className="w-full bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden">
                {/* Banner with Color */}
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
                                placeholder={t('profile.namePlaceholder')}
                                className="w-full text-lg md:text-2xl font-semibold text-gray-800 dark:text-white text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 placeholder:text-sm md:placeholder:text-base"
                                value={profile.name}
                                onChange={(e) => updateProfile("name", e.target.value)}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('profile.nameHelp')}
                            </p>
                            <input
                                type="text"
                                placeholder={t('profile.specialty')}
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

                    {/* Slug Section */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Link Personalizado</h2>
                        <div className="w-full">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                {t('profile.customLink.help')}
                            </p>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-gray-400 text-sm">/client/</span>
                                <input
                                    type="text"
                                    placeholder="seu-nome-aqui"
                                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={profile.slug}
                                    onChange={(e) => {
                                        const val = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                                        updateProfile("slug", val);
                                    }}
                                />
                            </div>

                            {profile.slug && (
                                <div
                                    className="flex items-center gap-2 p-2 rounded-lg border transition-colors"
                                    style={{
                                        backgroundColor: themeColors.primary ? `${themeColors.primary}15` : '#eff6ff',
                                        borderColor: themeColors.primary ? `${themeColors.primary}40` : '#dbeafe'
                                    }}
                                >
                                    <Globe className="w-4 h-4" style={{ color: themeColors.primary }} />
                                    <span className="flex-1 text-xs truncate font-mono" style={{ color: themeColors.primary }}>
                                        {typeof window !== 'undefined' ? `${window.location.origin}/consultations/client/${profile.slug}` : `.../${profile.slug}`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const link = `${window.location.origin}/consultations/client/${profile.slug}`;
                                            navigator.clipboard.writeText(link);
                                            setSuccessMessage("Link copiado!");
                                            setTimeout(() => setSuccessMessage(""), 2000);
                                        }}
                                        className="p-1.5 hover:opacity-80 rounded-md transition-opacity"
                                        title="Copiar Link"
                                    >
                                        <Copy className="w-4 h-4" style={{ color: themeColors.primary }} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`${USER_PROFILE_ENDPOINT}?userId=${user.id}`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        "x-user-id": user.id
                                                    },
                                                    body: JSON.stringify({ ...profile, slug: profile.slug })
                                                });
                                                if (!response.ok) throw new Error("Erro ao salvar");
                                                setSuccessMessage("Link salvo!");
                                                setTimeout(() => setSuccessMessage(""), 2000);
                                            } catch (error) {
                                                setError("Erro ao salvar link");
                                            }
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                                        style={{
                                            backgroundColor: themeColors.primary,
                                            color: 'white'
                                        }}
                                        title="Salvar Link"
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Photo Section */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('profile.photoTitle')}</h2>
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
                                    {t('profile.camera.take')}
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
                                    {t('profile.camera.upload')}
                                </ModernButton>
                            </div>
                            <ModernButton variant="outline" type="button" onClick={() => updateProfile("photo", "")}>
                                {t('profile.camera.remove')}
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
                                            {t('profile.camera.capture')}
                                        </ModernButton>
                                        <ModernButton type="button" variant="outline" onClick={stopCamera}>
                                            {t('profile.camera.stop')}
                                        </ModernButton>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="text-sm text-gray-500">
                                    {t('profile.camera.formats')}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    {/* Signature Section */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('profile.signature.title')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm text-gray-600 dark:text-gray-300">{t('profile.signature.digital')}</label>
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
                                        {t('profile.signature.clear')}
                                    </ModernButton>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm text-gray-600 dark:text-gray-300">{t('profile.signature.text')}</label>
                                <input
                                    value={profile.signatureText}
                                    onChange={(e) => updateProfile("signatureText", e.target.value)}
                                    placeholder={t('profile.signature.fullName')}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                                />
                                <input
                                    value={profile.social.registro}
                                    onChange={(e) => updateSocial("registro", e.target.value)}
                                    placeholder={t('profile.signature.registry')}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                                />
                                <input
                                    value={profile.city}
                                    onChange={(e) => updateProfile("city", e.target.value)}
                                    placeholder="Cidade (Ex: São Paulo, SP)"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Services Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('profile.services.title')}</h2>
                            <ModernButton icon={<Plus className="w-4 h-4" />} type="button" variant="outline" onClick={addService}>
                                {t('profile.services.add')}
                            </ModernButton>
                        </div>
                        {profile.services.length === 0 ? (
                            <p className="text-sm text-gray-500">{t('profile.services.empty')}</p>
                        ) : (
                            <div className="space-y-4">
                                {profile.services.map((service, index) => (
                                    <div key={`service-${index}`} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-center">
                                        <input
                                            value={service.name}
                                            onChange={(e) => updateService(index, "name", e.target.value)}
                                            placeholder={t('profile.services.namePlaceholder')}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                                        />
                                        <input
                                            value={service.price}
                                            onChange={(e) => {
                                                // Format as currency
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value) {
                                                    value = (parseInt(value) / 100).toFixed(2);
                                                    value = value.replace('.', ',');
                                                    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                                                }
                                                updateService(index, "price", value);
                                            }}
                                            placeholder="0,00"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
                                        />
                                        <ModernButton icon={<Trash2 className="w-4 h-4" />} variant="outline" type="button" onClick={() => removeService(index)}>
                                            {t('common.remove')}
                                        </ModernButton>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Contact Info Section */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Informações de Contato</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Telefone</label>
                                <input
                                    type="tel"
                                    value={profile.phone || ""}
                                    onChange={(e) => updateProfile("phone", e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Biografia Profissional</label>
                            <textarea
                                value={profile.bio || ""}
                                onChange={(e) => updateProfile("bio", e.target.value)}
                                placeholder="Conte um pouco sobre você e sua experiência profissional..."
                                rows="4"
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                    </section>

                    {/* Address Section */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Endereço</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Rua</label>
                                <input
                                    type="text"
                                    value={profile.address?.street || ""}
                                    onChange={(e) => setProfile(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                                    placeholder="Rua, número, complemento"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Estado</label>
                                <input
                                    type="text"
                                    value={profile.address?.state || ""}
                                    onChange={(e) => setProfile(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                                    placeholder="SP"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">CEP</label>
                                <input
                                    type="text"
                                    value={profile.address?.zipCode || ""}
                                    onChange={(e) => setProfile(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))}
                                    placeholder="00000-000"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Prescription Template Section */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">📄 Template de Receituário</h2>
                        <PrescriptionTemplateUpload
                            currentTemplate={profile.prescription_template_url}
                            currentSize={profile.prescription_template_size || 'A4'}
                            onUpload={(url, size) => {
                                setProfile(prev => ({
                                    ...prev,
                                    prescription_template_url: url,
                                    prescription_template_size: size
                                }));
                            }}
                        />
                    </section>

                    {/* Social Section */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('profile.social.title')}</h2>
                        <div className="grid grid-cols-1 gap-6">
                            {renderSocialInputs("instagram", <Instagram />, "Instagram")}
                            {renderSocialInputs("facebook", <Facebook />, "Facebook")}
                            {renderSocialInputs("linkedin", <Globe />, "LinkedIn")}
                            {renderSocialInputs("site", <Globe />, "Site")}
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <ModernButton
                            icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            variant="primary"
                            size="lg"
                            type="submit"
                            disabled={isSaving}
                        >
                            {t('common.save') || 'Salvar Alterações'}
                        </ModernButton>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default ProfileEditor;
