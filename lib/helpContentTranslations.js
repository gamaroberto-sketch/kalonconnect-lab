// COMPLETE HELP CONTENT TRANSLATIONS - All inline for client-side compatibility
import { Home, User, FileText, Calendar, DollarSign, Settings, Zap, Book, Users, Video } from 'lucide-react';
import React from 'react';

// All translations inline (no external imports needed)
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
            `
        },
        documentos: {
            title: 'Documentos',
            description: 'Crie e gerencie documentos profissionais',
            content: `
                <h2>Sistema de Documentos</h2>
                <h3>Documentos Customizados</h3>
                <p>Crie documentos totalmente personalizados para sua prática:</p>
                <h4>1. Upload de Documento Word</h4>
                <ul>
                    <li>Faça upload de arquivos .docx</li>
                    <li>Sistema detecta automaticamente marcadores <code>{{campo}}</code></li>
                    <li>Extrai cláusulas do documento</li>
                </ul>
            `
        },
        agendamentos: {
            title: 'Agendamentos',
            description: 'Gerencie sua agenda e consultas',
            content: `
                <h2>Sistema de Agendamentos</h2>
                <h3>Criar Consulta</h3>
                <ol>
                    <li>Clique em "Nova Consulta"</li>
                    <li>Selecione o paciente</li>
                    <li>Escolha data e horário</li>
                    <li>Defina duração</li>
                </ol>
            `
        },
        financeiro: {
            title: 'Financeiro',
            description: 'Gerencie pagamentos e assinaturas',
            content: `
                <h2>Gestão Financeira</h2>
                <h3>Planos de Assinatura</h3>
                <ul>
                    <li><strong>Normal:</strong> R$ 49/mês - Funcionalidades essenciais</li>
                    <li><strong>Pro:</strong> R$ 99/mês - Recursos avançados</li>
                    <li><strong>Premium:</strong> R$ 149/mês - Tudo ilimitado</li>
                </ul>
            `
        },
        eventos: {
            title: 'Eventos e Webinars',
            description: 'Crie e gerencie eventos online',
            content: `
                <h2>Sistema de Eventos</h2>
                <h3>Criar Novo Evento</h3>
                <ol>
                    <li>Clique em "+ Novo Evento"</li>
                    <li>Preencha informações (nome, descrição, tipo, data)</li>
                    <li>Faça upload do banner (opcional)</li>
                    <li>Clique em "Criar Evento"</li>
                </ol>
            `
        },
        consultas: {
            title: 'Consultas Online',
            description: 'Realize atendimentos por videochamada',
            content: `
                <h2>Sistema de Consultas Online</h2>
                <h3>Iniciar Consulta</h3>
                <ol>
                    <li>Selecione o cliente na lista</li>
                    <li>Clique em "Ir para Consulta"</li>
                    <li>Aguarde o cliente entrar na sala</li>
                    <li>Inicie o atendimento</li>
                </ol>
            `
        },
        produtos: {
            title: 'Meus Produtos',
            description: 'Venda produtos e serviços digitais',
            content: `
                <h2>Catálogo de Produtos</h2>
                <h3>Adicionar Produto</h3>
                <ol>
                    <li>Clique em "+ Novo Produto"</li>
                    <li>Adicione imagem do produto</li>
                    <li>Preencha nome, descrição e preço</li>
                    <li>Escolha tipo de ação (Link, WhatsApp ou PIX)</li>
                    <li>Clique em "Salvar"</li>
                </ol>
            `
        },
        clientes: {
            title: 'Cadastro de Clientes',
            description: 'Gerencie o cadastro dos seus clientes/pacientes',
            content: `
                <h2>Cadastro de Clientes</h2>
                <h3>Adicionar Novo Cliente</h3>
                <ol>
                    <li>Clique no botão "+ Novo Cliente"</li>
                    <li>Preencha nome completo, email e telefone</li>
                    <li>Adicione foto (opcional)</li>
                    <li>Selecione idioma preferido</li>
                    <li>Clique em "Cadastrar"</li>
                </ol>
            `
        }
    },
    'en-US': {
        inicio: {
            title: 'Home',
            description: 'Tour of the KalonConnect platform',
            content: `<h2>Welcome to KalonConnect! 🎉</h2><p>KalonConnect is your complete platform for managing online consultations, professional documents, and much more.</p>`
        },
        perfil: {
            title: 'Profile & Settings',
            description: 'Configure your profile and customize the platform',
            content: `<h2>Profile Configuration</h2><p>Keep your information always up to date.</p>`
        },
        documentos: {
            title: 'Documents',
            description: 'Create and manage professional documents',
            content: `<h2>Document System</h2><p>Create fully customized documents for your practice.</p>`
        },
        agendamentos: {
            title: 'Appointments',
            description: 'Manage your schedule and consultations',
            content: `<h2>Appointment System</h2><p>Organize your schedule efficiently.</p>`
        },
        financeiro: {
            title: 'Financial',
            description: 'Manage payments and subscriptions',
            content: `<h2>Financial Management</h2><p>Control your finances.</p>`
        },
        eventos: {
            title: 'Events and Webinars',
            description: 'Create and manage online events',
            content: `<h2>Event System</h2><p>Host webinars and courses.</p>`
        },
        consultas: {
            title: 'Online Consultations',
            description: 'Conduct video call sessions',
            content: `<h2>Online Consultation System</h2><p>Professional video consultations.</p>`
        },
        produtos: {
            title: 'My Products',
            description: 'Sell digital products and services',
            content: `<h2>Product Catalog</h2><p>Manage your product offerings.</p>`
        },
        clientes: {
            title: 'Client Registration',
            description: 'Manage your client/patient records',
            content: `<h2>Client Registration</h2><p>Keep client information organized.</p>`
        }
    },
    'es-ES': {
        inicio: {
            title: 'Inicio',
            description: 'Tour por la plataforma KalonConnect',
            content: `<h2>¡Bienvenido a KalonConnect! 🎉</h2><p>KalonConnect es su plataforma completa.</p>`
        },
        perfil: {
            title: 'Perfil y Configuración',
            description: 'Configure su perfil y personalice la plataforma',
            content: `<h2>Configuración de Perfil</h2><p>Mantenga su información actualizada.</p>`
        },
        documentos: {
            title: 'Documentos',
            description: 'Cree y gestione documentos profesionales',
            content: `<h2>Sistema de Documentos</h2><p>Documentos personalizados.</p>`
        },
        agendamentos: {
            title: 'Citas',
            description: 'Gestione su agenda y consultas',
            content: `<h2>Sistema de Citas</h2><p>Organice su agenda.</p>`
        },
        financeiro: {
            title: 'Financiero',
            description: 'Gestione pagos y suscripciones',
            content: `<h2>Gestión Financiera</h2><p>Control financiero.</p>`
        },
        eventos: {
            title: 'Eventos y Webinars',
            description: 'Cree y gestione eventos en línea',
            content: `<h2>Sistema de Eventos</h2><p>Webinars y cursos.</p>`
        },
        consultas: {
            title: 'Consultas en Línea',
            description: 'Realice sesiones por videollamada',
            content: `<h2>Sistema de Consultas</h2><p>Consultas profesionales.</p>`
        },
        produtos: {
            title: 'Mis Productos',
            description: 'Venda productos y servicios digitales',
            content: `<h2>Catálogo de Productos</h2><p>Gestione productos.</p>`
        },
        clientes: {
            title: 'Registro de Clientes',
            description: 'Gestione el registro de sus clientes',
            content: `<h2>Registro de Clientes</h2><p>Información organizada.</p>`
        }
    },
    'fr-FR': {
        inicio: {
            title: 'Accueil',
            description: 'Visite de la plateforme KalonConnect',
            content: `<h2>Bienvenue sur KalonConnect! 🎉</h2><p>Votre plateforme complète.</p>`
        },
        perfil: {
            title: 'Profil et Paramètres',
            description: 'Configurez votre profil',
            content: `<h2>Configuration du Profil</h2><p>Informations à jour.</p>`
        },
        documentos: {
            title: 'Documents',
            description: 'Créez et gérez des documents',
            content: `<h2>Système de Documents</h2><p>Documents personnalisés.</p>`
        },
        agendamentos: {
            title: 'Rendez-vous',
            description: 'Gérez votre agenda',
            content: `<h2>Système de Rendez-vous</h2><p>Organisez votre agenda.</p>`
        },
        financeiro: {
            title: 'Financier',
            description: 'Gérez les paiements',
            content: `<h2>Gestion Financière</h2><p>Contrôle financier.</p>`
        },
        eventos: {
            title: 'Événements et Webinaires',
            description: 'Créez des événements',
            content: `<h2>Système d'Événements</h2><p>Webinaires et cours.</p>`
        },
        consultas: {
            title: 'Consultations en Ligne',
            description: 'Séances par appel vidéo',
            content: `<h2>Système de Consultations</h2><p>Consultations professionnelles.</p>`
        },
        produtos: {
            title: 'Mes Produits',
            description: 'Vendez des produits',
            content: `<h2>Catalogue de Produits</h2><p>Gérez vos produits.</p>`
        },
        clientes: {
            title: 'Enregistrement des Clients',
            description: 'Gérez vos clients',
            content: `<h2>Enregistrement des Clients</h2><p>Informations organisées.</p>`
        }
    }
};

// Helper function
export const getHelpContent = (sectionId, language = 'pt-BR') => {
    const translations = helpTranslations[language] || helpTranslations['pt-BR'];
    return translations[sectionId] || helpTranslations['pt-BR'][sectionId];
};

// Export help sections with icons
export const helpSections = {
    inicio: { id: 'inicio', icon: <Home className="w-6 h-6" /> },
    perfil: { id: 'perfil', icon: <User className="w-6 h-6" /> },
    documentos: { id: 'documentos', icon: <FileText className="w-6 h-6" /> },
    agendamentos: { id: 'agendamentos', icon: <Calendar className="w-6 h-6" /> },
    financeiro: { id: 'financeiro', icon: <DollarSign className="w-6 h-6" /> },
    eventos: { id: 'eventos', icon: <Zap className="w-6 h-6" /> },
    consultas: { id: 'consultas', icon: <Video className="w-6 h-6" /> },
    produtos: { id: 'produtos', icon: <Book className="w-6 h-6" /> },
    clientes: { id: 'clientes', icon: <Users className="w-6 h-6" /> }
};

// Search function
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
