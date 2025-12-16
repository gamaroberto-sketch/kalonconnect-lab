import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from './ThemeProvider';
import { ChevronLeft, ChevronRight, Upload, Check } from 'lucide-react';

const SPECIALTIES = [
    'Psicólogo Clínico',
    'Psicólogo Organizacional',
    'Neuropsicólogo',
    'Terapeuta Cognitivo-Comportamental',
    'Psicanalista',
    'Coach de Vida',
    'Coach Executivo',
    'Terapeuta Familiar',
    'Psicopedagogo',
    'Advogado',
    'Médico',
    'Fisioterapeuta',
    'Nutricionista',
    'Outro'
];

const BRAZILIAN_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function SignupWizard({ onClose }) {
    const router = useRouter();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        // Step 1: Basic
        name: '',
        email: '',
        password: '',
        confirmPassword: '',

        // Step 2: Professional
        specialty: '',
        professionalRegistration: '',
        phone: '',
        bio: '',

        // Step 3: Photo & Extras
        photoFile: null,
        photoPreview: null,
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        },
        socialMedia: {
            instagram: '',
            linkedin: '',
            website: ''
        }
    });

    const primary = themeColors?.primary || '#0f172a';
    const background = themeColors?.background || '#ffffff';
    const textPrimary = themeColors?.textPrimary || '#1f2937';
    const textSecondary = themeColors?.textSecondary || '#6b7280';
    const border = themeColors?.border || '#e5e7eb';

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Foto deve ter no máximo 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    photoFile: file,
                    photoPreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateStep1 = () => {
        if (!formData.name.trim()) {
            setError('Nome é obrigatório');
            return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setError('Email válido é obrigatório');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Senha deve ter no mínimo 6 caracteres');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Senhas não conferem');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.specialty) {
            setError('Especialidade é obrigatória');
            return false;
        }
        if (!formData.phone.trim()) {
            setError('Telefone é obrigatório');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;

        if (step < 3) {
            setStep(step + 1);
            setError('');
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            setError('');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            // Upload photo if provided
            let photoUrl = null;
            if (formData.photoFile) {
                // TODO: Implement Supabase Storage upload
                // For now, we'll skip photo upload
            }

            // Prepare user data
            const userData = {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                specialty: formData.specialty,
                professional_registration: formData.professionalRegistration,
                phone: formData.phone,
                bio: formData.bio,
                photo_url: photoUrl,
                address: formData.address.street ? formData.address : null,
                social_media: (formData.socialMedia.instagram || formData.socialMedia.linkedin || formData.socialMedia.website)
                    ? formData.socialMedia
                    : null
            };

            // Call signup API
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao criar conta');
            }

            // Success! Redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className="w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                style={{ backgroundColor: background }}
            >
                {/* Header */}
                <div
                    className="p-6 border-b"
                    style={{ borderColor: border }}
                >
                    <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>
                        Criar Conta - Etapa {step}/3
                    </h2>
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="flex-1 h-2 rounded-full transition-all"
                                style={{
                                    backgroundColor: i <= step ? primary : `${primary}20`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div
                            className="mb-4 p-3 rounded-lg border"
                            style={{
                                backgroundColor: '#fef2f2',
                                borderColor: '#fecaca',
                                color: '#991b1b'
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-4" style={{ color: textPrimary }}>
                                Informações Básicas
                            </h3>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                                    style={{
                                        borderColor: border,
                                        backgroundColor: background,
                                        color: textPrimary
                                    }}
                                    placeholder="Seu nome completo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                                    style={{
                                        borderColor: border,
                                        backgroundColor: background,
                                        color: textPrimary
                                    }}
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Senha *
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                                    style={{
                                        borderColor: border,
                                        backgroundColor: background,
                                        color: textPrimary
                                    }}
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Confirmar Senha *
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                                    style={{
                                        borderColor: border,
                                        backgroundColor: background,
                                        color: textPrimary
                                    }}
                                    placeholder="Digite a senha novamente"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Professional Info */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-4" style={{ color: textPrimary }}>
                                Informações Profissionais
                            </h3>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Especialidade *
                                </label>
                                <select
                                    value={formData.specialty}
                                    onChange={(e) => handleChange('specialty', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                                    style={{
                                        borderColor: border,
                                        backgroundColor: background,
                                        color: textPrimary
                                    }}
                                >
                                    <option value="">Selecione...</option>
                                    {SPECIALTIES.map(spec => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Registro Profissional
                                </label>
                                <input
                                    type="text"
                                    value={formData.professionalRegistration}
                                    onChange={(e) => handleChange('professionalRegistration', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                                    style={{
                                        borderColor: border,
                                        backgroundColor: background,
                                        color: textPrimary
                                    }}
                                    placeholder="Ex: CRP 12345/SP, OAB 123456"
                                />
                                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                                    CRP, OAB, CRM, CREFITO, CRN, etc. (opcional)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Telefone *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                                    style={{
                                        borderColor: border,
                                        backgroundColor: background,
                                        color: textPrimary
                                    }}
                                    placeholder="(11) 98765-4321"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Biografia
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => handleChange('bio', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 resize-none"
                                    style={{
                                        borderColor: border,
                                        backgroundColor: background,
                                        color: textPrimary
                                    }}
                                    placeholder="Conte um pouco sobre você e sua experiência profissional..."
                                />
                                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                                    Opcional - Aparecerá no seu perfil público
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Photo & Extras */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold mb-4" style={{ color: textPrimary }}>
                                Foto e Informações Adicionais
                            </h3>

                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Foto de Perfil
                                </label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    style={{ borderColor: border }}
                                    onClick={() => document.getElementById('photo-upload').click()}
                                >
                                    {formData.photoPreview ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <img
                                                src={formData.photoPreview}
                                                alt="Preview"
                                                className="w-32 h-32 rounded-full object-cover"
                                            />
                                            <p className="text-sm" style={{ color: textSecondary }}>
                                                Clique para alterar
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <Upload className="w-12 h-12" style={{ color: textSecondary }} />
                                            <p style={{ color: textPrimary }}>
                                                Clique para fazer upload
                                            </p>
                                            <p className="text-sm" style={{ color: textSecondary }}>
                                                PNG, JPG até 5MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Address (Optional) */}
                            <div>
                                <h4 className="text-sm font-semibold mb-3" style={{ color: textPrimary }}>
                                    Endereço do Consultório (Opcional)
                                </h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.address.street}
                                        onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border outline-none"
                                        style={{ borderColor: border, backgroundColor: background, color: textPrimary }}
                                        placeholder="Rua, Número"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={formData.address.city}
                                            onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                                            className="px-4 py-2 rounded-lg border outline-none"
                                            style={{ borderColor: border, backgroundColor: background, color: textPrimary }}
                                            placeholder="Cidade"
                                        />
                                        <select
                                            value={formData.address.state}
                                            onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                                            className="px-4 py-2 rounded-lg border outline-none"
                                            style={{ borderColor: border, backgroundColor: background, color: textPrimary }}
                                        >
                                            <option value="">Estado</option>
                                            {BRAZILIAN_STATES.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.address.zipCode}
                                        onChange={(e) => handleNestedChange('address', 'zipCode', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border outline-none"
                                        style={{ borderColor: border, backgroundColor: background, color: textPrimary }}
                                        placeholder="CEP"
                                    />
                                </div>
                            </div>

                            {/* Social Media (Optional) */}
                            <div>
                                <h4 className="text-sm font-semibold mb-3" style={{ color: textPrimary }}>
                                    Redes Sociais (Opcional)
                                </h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.socialMedia.instagram}
                                        onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border outline-none"
                                        style={{ borderColor: border, backgroundColor: background, color: textPrimary }}
                                        placeholder="📷 Instagram (@usuario)"
                                    />
                                    <input
                                        type="text"
                                        value={formData.socialMedia.linkedin}
                                        onChange={(e) => handleNestedChange('socialMedia', 'linkedin', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border outline-none"
                                        style={{ borderColor: border, backgroundColor: background, color: textPrimary }}
                                        placeholder="💼 LinkedIn (linkedin.com/in/usuario)"
                                    />
                                    <input
                                        type="text"
                                        value={formData.socialMedia.website}
                                        onChange={(e) => handleNestedChange('socialMedia', 'website', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border outline-none"
                                        style={{ borderColor: border, backgroundColor: background, color: textPrimary }}
                                        placeholder="🌐 Website (www.site.com)"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="p-6 border-t flex justify-between"
                    style={{ borderColor: border }}
                >
                    <button
                        onClick={step === 1 ? onClose : handleBack}
                        className="px-6 py-3 rounded-lg border transition-colors flex items-center gap-2"
                        style={{ borderColor: primary, color: primary }}
                        disabled={loading}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {step === 1 ? 'Cancelar' : 'Voltar'}
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                            style={{ backgroundColor: primary, color: '#ffffff' }}
                            disabled={loading}
                        >
                            Próximo
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                            style={{ backgroundColor: primary, color: '#ffffff' }}
                            disabled={loading}
                        >
                            {loading ? 'Criando...' : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Criar Conta
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
