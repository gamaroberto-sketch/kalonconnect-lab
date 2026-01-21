import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from './ThemeProvider';
import { ChevronLeft, ChevronRight, Upload, Check, Eye, EyeOff } from 'lucide-react';

const SPECIALTIES = [
    'Terapeuta Integrativo',
    'Psicólogo(a)',
    'Médico(a)',
    'Nutricionista',
    'Fisioterapeuta',
    'Biomédico(a)',
    'Coach',
    'Advogado(a)',
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [customSpecialty, setCustomSpecialty] = useState('');


    const [formData, setFormData] = useState({
        // Step 1: Basic
        name: '',
        email: '',
        password: '',
        confirmPassword: '',

        // Step 2: Professional
        specialty: '',
        phone: ''
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
        if (formData.specialty === 'Outro' && !customSpecialty.trim()) {
            setError('Por favor, descreva sua atuação');
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

        // Step 2 is final, submit directly
        if (step === 2) {
            handleSubmit();
        } else if (step < 2) {
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
            // Map specialty to enum
            const specialtyEnumMap = {
                'Terapeuta Integrativo': 'TERAPEUTA_INTEGRATIVO',
                'Psicólogo(a)': 'PSICOLOGO',
                'Médico(a)': 'MEDICO',
                'Nutricionista': 'NUTRICIONISTA',
                'Fisioterapeuta': 'FISIOTERAPEUTA',
                'Biomédico(a)': 'BIOMEDICO',
                'Coach': 'COACH',
                'Advogado(a)': 'ADVOGADO',
                'Outro': 'OUTRO'
            };

            const specialty_enum = specialtyEnumMap[formData.specialty] || null;
            const specialty_custom = formData.specialty === 'Outro' && customSpecialty.trim()
                ? customSpecialty.trim()
                : null;

            // Prepare user data
            const userData = {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                specialty_enum,
                specialty_custom,
                phone: formData.phone || null
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
                        Criar Conta - Etapa {step}/2
                    </h2>
                    <div className="flex gap-2 mt-4">
                        {[1, 2].map(i => (
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
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 pr-10"
                                        style={{
                                            borderColor: border,
                                            backgroundColor: background,
                                            color: textPrimary
                                        }}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                                        style={{ color: textPrimary }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Confirmar Senha *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 pr-10"
                                        style={{
                                            borderColor: border,
                                            backgroundColor: background,
                                            color: textPrimary
                                        }}
                                        placeholder="Digite a senha novamente"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                                        style={{ color: textPrimary }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
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

                            {/* Custom Specialty Field (shown when 'Outro' is selected) */}
                            {formData.specialty === 'Outro' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                        Se quiser, descreva sua atuação
                                    </label>
                                    <input
                                        type="text"
                                        value={customSpecialty}
                                        onChange={(e) => setCustomSpecialty(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                                        style={{
                                            borderColor: border,
                                            backgroundColor: background,
                                            color: textPrimary
                                        }}
                                        placeholder="Ex: Terapeuta corporal, Educador emocional..."
                                        maxLength={120}
                                    />
                                    <p className="text-xs mt-1" style={{ color: textSecondary }}>
                                        Opcional - Máximo 120 caracteres
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                                    Telefone / WhatsApp *
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
                                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                                    Opcional, mas recomendado para suporte
                                </p>
                            </div>

                            {/* Microcopy */}
                            <div className="text-center pt-2">
                                <p className="text-sm" style={{ color: textSecondary }}>
                                    Você pode completar seu perfil depois em Configurações.
                                </p>
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

                    <button
                        onClick={handleNext}
                        className="px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                        style={{ backgroundColor: primary, color: '#ffffff' }}
                        disabled={loading}
                    >
                        {loading ? 'Criando...' : (
                            step === 2 ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Criar Conta
                                </>
                            ) : (
                                <>
                                    Próximo
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
