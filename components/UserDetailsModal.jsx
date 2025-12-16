import React from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Instagram, Linkedin, Globe, FileText, Briefcase } from 'lucide-react';

const UserDetailsModal = ({ user, onClose, themeColors }) => {
    if (!user) return null;

    const address = user.address || {};
    const social = user.social_media || {};

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Detalhes do Profissional
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="flex items-start gap-4">
                        {user.photo_url ? (
                            <img
                                src={user.photo_url}
                                alt={user.name}
                                className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                            />
                        ) : (
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-700"
                                style={{ backgroundColor: themeColors.primaryLight }}
                            >
                                <User className="w-10 h-10" style={{ color: themeColors.primary }} />
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.version === 'PRO' || user.version === 'premium'
                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                    }`}>
                                    {user.version || 'NORMAL'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Professional Data */}
                    {(user.specialty || user.professional_registration) && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" style={{ color: themeColors.primary }} />
                                Dados Profissionais
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.specialty && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Especialidade</label>
                                        <p className="text-gray-900 dark:text-white">{user.specialty}</p>
                                    </div>
                                )}
                                {user.professional_registration && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Registro Profissional</label>
                                        <p className="text-gray-900 dark:text-white">{user.professional_registration}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    {user.phone && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Phone className="w-5 h-5" style={{ color: themeColors.primary }} />
                                Contato
                            </h4>
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {user.phone}
                            </div>
                        </div>
                    )}

                    {/* Bio */}
                    {user.bio && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" style={{ color: themeColors.primary }} />
                                Biografia
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{user.bio}</p>
                        </div>
                    )}

                    {/* Address */}
                    {(address.street || address.city || address.state || address.zipCode) && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" style={{ color: themeColors.primary }} />
                                Endereço
                            </h4>
                            <div className="space-y-2 text-gray-700 dark:text-gray-300">
                                {address.street && <p>{address.street}</p>}
                                <p>
                                    {address.city && address.city}
                                    {address.city && address.state && ', '}
                                    {address.state && address.state}
                                    {address.zipCode && ` - ${address.zipCode}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Social Media */}
                    {(social.instagram || social.linkedin || social.website) && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5" style={{ color: themeColors.primary }} />
                                Redes Sociais
                            </h4>
                            <div className="space-y-3">
                                {social.instagram && (
                                    <div className="flex items-center gap-2">
                                        <Instagram className="w-4 h-4 text-pink-500" />
                                        <a
                                            href={`https://instagram.com/${social.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {social.instagram}
                                        </a>
                                    </div>
                                )}
                                {social.linkedin && (
                                    <div className="flex items-center gap-2">
                                        <Linkedin className="w-4 h-4 text-blue-600" />
                                        <a
                                            href={social.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {social.linkedin}
                                        </a>
                                    </div>
                                )}
                                {social.website && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-gray-600" />
                                        <a
                                            href={social.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {social.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* No Data Message */}
                    {!user.specialty && !user.professional_registration && !user.phone && !user.bio &&
                        !address.street && !address.city && !social.instagram && !social.linkedin && !social.website && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    Este profissional ainda não preencheu seus dados completos.
                                </p>
                            </div>
                        )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UserDetailsModal;
