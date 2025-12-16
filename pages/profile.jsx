"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../components/AuthContext";
import { User, Mail, Phone, FileText, MapPin, Instagram, Linkedin, Globe, Camera, Save, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialty: '',
        professional_registration: '',
        phone: '',
        bio: '',
        photo_url: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        },
        social_media: {
            instagram: '',
            linkedin: '',
            website: ''
        }
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                specialty: user.specialty || '',
                professional_registration: user.professional_registration || '',
                phone: user.phone || '',
                bio: user.bio || '',
                photo_url: user.photo_url || '',
                address: user.address || { street: '', city: '', state: '', zipCode: '' },
                social_media: user.social_media || { instagram: '', linkedin: '', website: '' }
            });
        }
    }, [user, authLoading, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value }
        }));
    };

    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            social_media: { ...prev.social_media, [name]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao atualizar perfil');
            }

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });

            // Refresh page after 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-teal-700 hover:text-teal-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar ao Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
                    <p className="text-gray-600 mt-2">Gerencie suas informações profissionais</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
                    {/* Dados Pessoais */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Dados Pessoais
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dados Profissionais */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Dados Profissionais
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
                                <input
                                    type="text"
                                    name="specialty"
                                    value={formData.specialty}
                                    onChange={handleChange}
                                    placeholder="Ex: Psicólogo Clínico"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Registro Profissional</label>
                                <input
                                    type="text"
                                    name="professional_registration"
                                    value={formData.professional_registration}
                                    onChange={handleChange}
                                    placeholder="Ex: CRP 12345/SP"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(11) 99999-9999"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Biografia</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Conte um pouco sobre você e sua experiência profissional..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Endereço */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Endereço
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.address.street}
                                    onChange={handleAddressChange}
                                    placeholder="Rua, número, complemento"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.address.city}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.address.state}
                                    onChange={handleAddressChange}
                                    placeholder="SP"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.address.zipCode}
                                    onChange={handleAddressChange}
                                    placeholder="00000-000"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Redes Sociais */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Redes Sociais
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Instagram className="w-4 h-4" />
                                    Instagram
                                </label>
                                <input
                                    type="text"
                                    name="instagram"
                                    value={formData.social_media.instagram}
                                    onChange={handleSocialChange}
                                    placeholder="@seu_usuario"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Linkedin className="w-4 h-4" />
                                    LinkedIn
                                </label>
                                <input
                                    type="text"
                                    name="linkedin"
                                    value={formData.social_media.linkedin}
                                    onChange={handleSocialChange}
                                    placeholder="linkedin.com/in/seu-perfil"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.social_media.website}
                                    onChange={handleSocialChange}
                                    placeholder="https://seusite.com.br"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
