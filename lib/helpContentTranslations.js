import { Home, User, FileText, Calendar, DollarSign, Settings, Zap, Book } from 'lucide-react';
import React from 'react';

// Translations for help content
const helpTranslations = {
    'pt-BR': {
        inicio: {
            title: 'Início',
            description: 'Tour pela plataforma KalonConnect',
            content: `
                <h2>Bem-vindo ao KalonConnect! 🎉</h2>
                
                <p>O KalonConnect é sua plataforma completa para gerenciar consultas online, documentos profissionais e muito mais.</p>
                
                <h3>O que você pode fazer:</h3>
                <ul>
                    <li><strong>Consultas Online:</strong> Realize atendimentos por vídeo com qualidade profissional</li>
                    <li><strong>Documentos:</strong> Crie e gerencie documentos personalizados com assinatura digital</li>
                    <li><strong>Agendamentos:</strong> Organize sua agenda e envie lembretes automáticos</li>
                    <li><strong>Financeiro:</strong> Controle pagamentos e assinaturas</li>
                </ul>
                
                <h3>📁 Estrutura de Pastas Recomendada (Opcional)</h3>
                <p>Para melhor organização dos seus arquivos locais, recomendamos criar esta estrutura no Google Drive ou OneDrive:</p>
                
                <pre><code>KalonConnect - [Seu Nome]/
├── 01_CLIENTES/
│   └── Cliente_001_[Nome]/
│       ├── Fichas/
│       ├── Consultas/
│       ├── Documentos/
│       ├── Gravações/
│       └── Arquivos_Compartilhados/
├── 02_MATERIAIS_CONSULTA/
│   ├── Músicas_Relaxamento/
│   ├── Frequências/
│   └── Vídeos_Terapêuticos/
├── 03_DOCUMENTOS_LEGAIS/
│   ├── Receituários/
│   ├── Recibos/
│   └── Termos_Consentimento/
├── 04_ARQUIVOS_SISTEMA/
│   ├── Logos/
│   ├── Fotos_Profissional/
│   └── Backgrounds/
├── 05_FINANCEIRO/
│   ├── Comprovantes_Pagamento/
│   └── Relatórios/
└── 06_BACKUP/</code></pre>

                <p><strong>⚠️ Nota:</strong> O KalonConnect usa armazenamento em nuvem (Supabase) automaticamente. Esta estrutura é apenas para organização pessoal dos seus arquivos locais.</p>
                
                <h3>Primeiros Passos:</h3>
                <ol>
                    <li>Configure seu perfil profissional</li>
                    <li>Escolha seu tema e cores</li>
                    <li>Crie seu primeiro documento</li>
                    <li>Configure sua sala de espera</li>
                </ol>
            `
        },
        perfil: {
            title: 'Perfil & Configurações',
            description: 'Configure seu perfil e personalize a plataforma',
            content: `
                <h2>Configuração de Perfil</h2>
                
                <h3>Dados Profissionais</h3>
                <p>Mantenha suas informações sempre atualizadas:</p>
                <ul>
                    <li>Nome completo</li>
                    <li>Especialidade</li>
                    <li>Registro profissional (CRM, CRP, etc.)</li>
                    <li>Foto de perfil</li>
                </ul>
                
                <h3>Personalização</h3>
                <p>Deixe a plataforma com sua cara:</p>
                <ul>
                    <li><strong>Temas:</strong> Escolha entre diversos temas de cores</li>
                    <li><strong>Modo Escuro:</strong> Ative para melhor conforto visual</li>
                    <li><strong>Idioma:</strong> Português, Inglês, Espanhol ou Francês</li>
                </ul>
                
                <h3>Assinatura Digital</h3>
                <p>Configure sua assinatura para documentos:</p>
                <ol>
                    <li>Acesse a aba "Assinatura"</li>
                    <li>Desenhe ou faça upload da sua assinatura</li>
                    <li>Salve para usar em documentos</li>
                </ol>
            `,
            subsections: [
                { title: 'Editar Dados Pessoais' },
                { title: 'Escolher Tema' },
                { title: 'Configurar Assinatura' }
            ]
        }
    },
    'en-US': {
        inicio: {
            title: 'Home',
            description: 'Tour of the KalonConnect platform',
            content: `
                <h2>Welcome to KalonConnect! 🎉</h2>
                
                <p>KalonConnect is your complete platform for managing online consultations, professional documents, and much more.</p>
                
                <h3>What you can do:</h3>
                <ul>
                    <li><strong>Online Consultations:</strong> Conduct video sessions with professional quality</li>
                    <li><strong>Documents:</strong> Create and manage custom documents with digital signature</li>
                    <li><strong>Appointments:</strong> Organize your schedule and send automatic reminders</li>
                    <li><strong>Financial:</strong> Control payments and subscriptions</li>
                </ul>
                
                <h3>📁 Recommended Folder Structure (Optional)</h3>
                <p>For better organization of your local files, we recommend creating this structure in Google Drive or OneDrive:</p>
                
                <pre><code>KalonConnect - [Your Name]/
├── 01_CLIENTS/
│   └── Client_001_[Name]/
│       ├── Records/
│       ├── Consultations/
│       ├── Documents/
│       ├── Recordings/
│       └── Shared_Files/
├── 02_CONSULTATION_MATERIALS/
│   ├── Relaxation_Music/
│   ├── Frequencies/
│   └── Therapeutic_Videos/
├── 03_LEGAL_DOCUMENTS/
│   ├── Prescriptions/
│   ├── Receipts/
│   └── Consent_Terms/
├── 04_SYSTEM_FILES/
│   ├── Logos/
│   ├── Professional_Photos/
│   └── Backgrounds/
├── 05_FINANCIAL/
│   ├── Payment_Receipts/
│   └── Reports/
└── 06_BACKUP/</code></pre>

                <p><strong>⚠️ Note:</strong> KalonConnect uses cloud storage (Supabase) automatically. This structure is only for personal organization of your local files.</p>
                
                <h3>First Steps:</h3>
                <ol>
                    <li>Set up your professional profile</li>
                    <li>Choose your theme and colors</li>
                    <li>Create your first document</li>
                    <li>Configure your waiting room</li>
                </ol>
            `
        },
        perfil: {
            title: 'Profile & Settings',
            description: 'Configure your profile and customize the platform',
            content: `
                <h2>Profile Configuration</h2>
                
                <h3>Professional Data</h3>
                <p>Keep your information always up to date:</p>
                <ul>
                    <li>Full name</li>
                    <li>Specialty</li>
                    <li>Professional registration (license number, etc.)</li>
                    <li>Profile photo</li>
                </ul>
                
                <h3>Customization</h3>
                <p>Make the platform your own:</p>
                <ul>
                    <li><strong>Themes:</strong> Choose from various color themes</li>
                    <li><strong>Dark Mode:</strong> Enable for better visual comfort</li>
                    <li><strong>Language:</strong> Portuguese, English, Spanish, or French</li>
                </ul>
                
                <h3>Digital Signature</h3>
                <p>Set up your signature for documents:</p>
                <ol>
                    <li>Access the "Signature" tab</li>
                    <li>Draw or upload your signature</li>
                    <li>Save to use in documents</li>
                </ol>
            `,
            subsections: [
                { title: 'Edit Personal Data' },
                { title: 'Choose Theme' },
                { title: 'Configure Signature' }
            ]
        }
    },
    'es-ES': {
        inicio: {
            title: 'Inicio',
            description: 'Tour por la plataforma KalonConnect',
            content: `
                <h2>¡Bienvenido a KalonConnect! 🎉</h2>
                
                <p>KalonConnect es su plataforma completa para gestionar consultas en línea, documentos profesionales y mucho más.</p>
                
                <h3>Lo que puedes hacer:</h3>
                <ul>
                    <li><strong>Consultas en Línea:</strong> Realiza sesiones por video con calidad profesional</li>
                    <li><strong>Documentos:</strong> Crea y gestiona documentos personalizados con firma digital</li>
                    <li><strong>Citas:</strong> Organiza tu agenda y envía recordatorios automáticos</li>
                    <li><strong>Financiero:</strong> Controla pagos y suscripciones</li>
                </ul>
                
                <h3>📁 Estructura de Carpetas Recomendada (Opcional)</h3>
                <p>Para una mejor organización de sus archivos locales, recomendamos crear esta estructura en Google Drive o OneDrive:</p>
                
                <pre><code>KalonConnect - [Su Nombre]/
├── 01_CLIENTES/
│   └── Cliente_001_[Nombre]/
│       ├── Fichas/
│       ├── Consultas/
│       ├── Documentos/
│       ├── Grabaciones/
│       └── Archivos_Compartidos/
├── 02_MATERIALES_CONSULTA/
│   ├── Musica_Relajacion/
│   ├── Frecuencias/
│   └── Videos_Terapeuticos/
├── 03_DOCUMENTOS_LEGALES/
│   ├── Recetas/
│   ├── Recibos/
│   └── Terminos_Consentimiento/
├── 04_ARCHIVOS_SISTEMA/
│   ├── Logos/
│   ├── Fotos_Profesional/
│   └── Fondos/
├── 05_FINANCIERO/
│   ├── Comprobantes_Pago/
│   └── Informes/
└── 06_RESPALDO/</code></pre>

                <p><strong>⚠️ Nota:</strong> KalonConnect usa almacenamiento en la nube (Supabase) automáticamente. Esta estructura es solo para organización personal de sus archivos locales.</p>
                
                <h3>Primeros Pasos:</h3>
                <ol>
                    <li>Configure su perfil profesional</li>
                    <li>Elija su tema y colores</li>
                    <li>Cree su primer documento</li>
                    <li>Configure su sala de espera</li>
                </ol>
            `
        },
        perfil: {
            title: 'Perfil y Configuración',
            description: 'Configure su perfil y personalice la plataforma',
            content: `
                <h2>Configuración de Perfil</h2>
                
                <h3>Datos Profesionales</h3>
                <p>Mantenga su información siempre actualizada:</p>
                <ul>
                    <li>Nombre completo</li>
                    <li>Especialidad</li>
                    <li>Registro profesional (número de licencia, etc.)</li>
                    <li>Foto de perfil</li>
                </ul>
                
                <h3>Personalización</h3>
                <p>Haga la plataforma suya:</p>
                <ul>
                    <li><strong>Temas:</strong> Elija entre varios temas de colores</li>
                    <li><strong>Modo Oscuro:</strong> Active para mejor confort visual</li>
                    <li><strong>Idioma:</strong> Portugués, Inglés, Español o Francés</li>
                </ul>
                
                <h3>Firma Digital</h3>
                <p>Configure su firma para documentos:</p>
                <ol>
                    <li>Acceda a la pestaña "Firma"</li>
                    <li>Dibuje o suba su firma</li>
                    <li>Guarde para usar en documentos</li>
                </ol>
            `,
            subsections: [
                { title: 'Editar Datos Personales' },
                { title: 'Elegir Tema' },
                { title: 'Configurar Firma' }
            ]
        }
    },
    'fr-FR': {
        inicio: {
            title: 'Accueil',
            description: 'Visite de la plateforme KalonConnect',
            content: `
                <h2>Bienvenue sur KalonConnect! 🎉</h2>
                
                <p>KalonConnect est votre plateforme complète pour gérer les consultations en ligne, les documents professionnels et bien plus encore.</p>
                
                <h3>Ce que vous pouvez faire:</h3>
                <ul>
                    <li><strong>Consultations en Ligne:</strong> Effectuez des séances vidéo avec une qualité professionnelle</li>
                    <li><strong>Documents:</strong> Créez et gérez des documents personnalisés avec signature numérique</li>
                    <li><strong>Rendez-vous:</strong> Organisez votre agenda et envoyez des rappels automatiques</li>
                    <li><strong>Financier:</strong> Contrôlez les paiements et les abonnements</li>
                </ul>
                
                <h3>📁 Structure de Dossiers Recommandée (Optionnel)</h3>
                <p>Pour une meilleure organisation de vos fichiers locaux, nous recommandons de créer cette structure dans Google Drive ou OneDrive:</p>
                
                <pre><code>KalonConnect - [Votre Nom]/
├── 01_CLIENTS/
│   └── Client_001_[Nom]/
│       ├── Fiches/
│       ├── Consultations/
│       ├── Documents/
│       ├── Enregistrements/
│       └── Fichiers_Partages/
├── 02_MATERIAUX_CONSULTATION/
│   ├── Musique_Relaxation/
│   ├── Frequences/
│   └── Videos_Therapeutiques/
├── 03_DOCUMENTS_LEGAUX/
│   ├── Ordonnances/
│   ├── Reçus/
│   └── Termes_Consentement/
├── 04_FICHIERS_SYSTEME/
│   ├── Logos/
│   ├── Photos_Professionnel/
│   └── Arriere_Plans/
├── 05_FINANCIER/
│   ├── Reçus_Paiement/
│   └── Rapports/
└── 06_SAUVEGARDE/</code></pre>

                <p><strong>⚠️ Note:</strong> KalonConnect utilise le stockage cloud (Supabase) automatiquement. Cette structure est uniquement pour l'organisation personnelle de vos fichiers locaux.</p>
                
                <h3>Premiers Pas:</h3>
                <ol>
                    <li>Configurez votre profil professionnel</li>
                    <li>Choisissez votre thème et vos couleurs</li>
                    <li>Créez votre premier document</li>
                    <li>Configurez votre salle d'attente</li>
                </ol>
            `
        },
        perfil: {
            title: 'Profil et Paramètres',
            description: 'Configurez votre profil et personnalisez la plateforme',
            content: `
                <h2>Configuration du Profil</h2>
                
                <h3>Données Professionnelles</h3>
                <p>Gardez vos informations toujours à jour:</p>
                <ul>
                    <li>Nom complet</li>
                    <li>Spécialité</li>
                    <li>Enregistrement professionnel (numéro de licence, etc.)</li>
                    <li>Photo de profil</li>
                </ul>
                
                <h3>Personnalisation</h3>
                <p>Faites de la plateforme la vôtre:</p>
                <ul>
                    <li><strong>Thèmes:</strong> Choisissez parmi divers thèmes de couleurs</li>
                    <li><strong>Mode Sombre:</strong> Activez pour un meilleur confort visuel</li>
                    <li><strong>Langue:</strong> Portugais, Anglais, Espagnol ou Français</li>
                </ul>
                
                <h3>Signature Numérique</h3>
                <p>Configurez votre signature pour les documents:</p>
                <ol>
                    <li>Accédez à l'onglet "Signature"</li>
                    <li>Dessinez ou téléchargez votre signature</li>
                    <li>Enregistrez pour utiliser dans les documents</li>
                </ol>
            `,
            subsections: [
                { title: 'Modifier les Données Personnelles' },
                { title: 'Choisir le Thème' },
                { title: 'Configurer la Signature' }
            ]
        }
    }
};

// Helper function to get translated content
export const getHelpContent = (sectionId, language = 'pt-BR') => {
    const translations = helpTranslations[language] || helpTranslations['pt-BR'];
    return translations[sectionId] || helpTranslations['pt-BR'][sectionId];
};

// Export help sections with icons (language-independent)
export const helpSections = {
    inicio: {
        id: 'inicio',
        icon: <Home className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null,
        subsections: []
    },
    perfil: {
        id: 'perfil',
        icon: <User className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    documentos: {
        id: 'documentos',
        icon: <FileText className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    agendamentos: {
        id: 'agendamentos',
        icon: <Calendar className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    financeiro: {
        id: 'financeiro',
        icon: <DollarSign className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    eventos: {
        id: 'eventos',
        icon: <Zap className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    consultas: {
        id: 'consultas',
        icon: <Settings className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    produtos: {
        id: 'produtos',
        icon: <Book className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    clientes: {
        id: 'clientes',
        icon: <User className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    configuracoes: {
        id: 'configuracoes',
        icon: <Settings className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    }
};

// Search function (needs to be language-aware)
export const searchContent = (query, language = 'pt-BR') => {
    const results = [];
    const translations = helpTranslations[language] || helpTranslations['pt-BR'];
    const lowerQuery = query.toLowerCase();

    Object.keys(translations).forEach(sectionId => {
        const section = translations[sectionId];
        const sectionData = helpSections[sectionId];

        if (section.title?.toLowerCase().includes(lowerQuery) ||
            section.description?.toLowerCase().includes(lowerQuery) ||
            section.content?.toLowerCase().includes(lowerQuery)) {
            results.push({
                section: {
                    ...sectionData,
                    ...section
                }
            });
        }
    });

    return results;
};
