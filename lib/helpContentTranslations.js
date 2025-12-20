import { Home, User, FileText, Calendar, DollarSign, Settings, Zap, Book, Users, Video } from 'lucide-react';
import React from 'react';

// UI Translations
export const uiTranslations = {
    'pt-BR': {
        backToSections: 'Voltar para todas as seções',
        searchPlaceholder: 'Buscar na ajuda...',
        resultsFound: 'resultados encontrados',
        resultFound: 'resultado encontrado'
    },
    'en-US': {
        backToSections: 'Back to all sections',
        searchPlaceholder: 'Search help...',
        resultsFound: 'results found',
        resultFound: 'result found'
    },
    'es-ES': {
        backToSections: 'Volver a todas las secciones',
        searchPlaceholder: 'Buscar en la ayuda...',
        resultsFound: 'resultados encontrados',
        resultFound: 'resultado encontrado'
    },
    'fr-FR': {
        backToSections: 'Retour à toutes les sections',
        searchPlaceholder: 'Rechercher dans l\'aide...',
        resultsFound: 'résultats trouvés',
        resultFound: 'résultat trouvé'
    }
};

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
        },
        configuracoes: {
            title: 'Configurações e Perfil',
            description: 'Complete seu perfil profissional',
            content: `
                <h3>Como Configurar Seu Perfil</h3>
                <p>Seu perfil profissional é essencial para gerar documentos e sua página de agendamento.</p>
                
                <h4>📸 Foto Profissional</h4>
                <p>Adicione uma foto que aparecerá nos documentos gerados e na sua página de agendamento.</p>
                
                <h4>🔗 Link de Agendamento</h4>
                <p>Crie um slug personalizado para seus clientes agendarem consultas.</p>
                
                <h4>📋 Informações Básicas</h4>
                <p>Defina sua especialidade profissional.</p>
                
                <h4>📞 Informações de Contato</h4>
                <ul>
                    <li><strong>Nome Completo:</strong> Para assinatura em documentos</li>
                    <li><strong>Registro Profissional:</strong> Ex: CRM, CRP, CRTH, etc.</li>
                    <li><strong>Telefone:</strong> Contato para clientes</li>
                    <li><strong>Biografia:</strong> Sua experiência profissional</li>
                </ul>
                
                <h4>📍 Endereço</h4>
                <p>Endereço completo usado nos documentos gerados.</p>
                
                <h4>🌐 Redes Sociais</h4>
                <p>Instagram, Facebook, LinkedIn e Site para sua página de agendamento.</p>
            `
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
                    <li><strong>Online Consultations:</strong> Conduct professional video sessions</li>
                    <li><strong>Documents:</strong> Create and manage custom documents with digital signatures</li>
                    <li><strong>Appointments:</strong> Organize your schedule and send automatic reminders</li>
                    <li><strong>Financial:</strong> Control payments and subscriptions</li>
                </ul>
            `
        },
        perfil: {
            title: 'Profile & Settings',
            description: 'Configure your profile and customize the platform',
            content: `
                <h2>Profile Configuration</h2>
                <h3>Professional Information</h3>
                <p>Keep your information always up to date:</p>
                <ul>
                    <li>Full name</li>
                    <li>Specialty</li>
                    <li>Professional registration (license number)</li>
                    <li>Profile photo</li>
                </ul>
            `
        },
        documentos: {
            title: 'Documents',
            description: 'Create and manage professional documents',
            content: `
                <h2>Document System</h2>
                <h3>Custom Documents</h3>
                <p>Create fully customized documents for your practice:</p>
                <h4>1. Upload Word Document</h4>
                <ul>
                    <li>Upload .docx files</li>
                    <li>System automatically detects <code>{{field}}</code> markers</li>
                    <li>Extracts clauses from document</li>
                </ul>
            `
        },
        agendamentos: {
            title: 'Appointments',
            description: 'Manage your schedule and consultations',
            content: `
                <h2>Appointment System</h2>
                <h3>Create Consultation</h3>
                <ol>
                    <li>Click "New Consultation"</li>
                    <li>Select patient</li>
                    <li>Choose date and time</li>
                    <li>Set duration</li>
                </ol>
            `
        },
        financeiro: {
            title: 'Financial',
            description: 'Manage payments and subscriptions',
            content: `
                <h2>Financial Management</h2>
                <h3>Subscription Plans</h3>
                <ul>
                    <li><strong>Normal:</strong> $49/month - Essential features</li>
                    <li><strong>Pro:</strong> $99/month - Advanced features</li>
                    <li><strong>Premium:</strong> $149/month - Everything unlimited</li>
                </ul>
            `
        },
        eventos: {
            title: 'Events and Webinars',
            description: 'Create and manage online events',
            content: `
                <h2>Event System</h2>
                <h3>Create New Event</h3>
                <ol>
                    <li>Click "+ New Event"</li>
                    <li>Fill in information (name, description, type, date)</li>
                    <li>Upload banner (optional)</li>
                    <li>Click "Create Event"</li>
                </ol>
            `
        },
        consultas: {
            title: 'Online Consultations',
            description: 'Conduct video call sessions',
            content: `
                <h2>Online Consultation System</h2>
                <h3>Start Consultation</h3>
                <ol>
                    <li>Select client from list</li>
                    <li>Click "Go to Consultation"</li>
                    <li>Wait for client to join room</li>
                    <li>Start session</li>
                </ol>
            `
        },
        produtos: {
            title: 'My Products',
            description: 'Sell digital products and services',
            content: `
                <h2>Product Catalog</h2>
                <h3>Add Product</h3>
                <ol>
                    <li>Click "+ New Product"</li>
                    <li>Add product image</li>
                    <li>Fill in name, description, and price</li>
                    <li>Choose action type (Link, WhatsApp, or PIX)</li>
                    <li>Click "Save"</li>
                </ol>
            `
        },
        clientes: {
            title: 'Client Registration',
            description: 'Manage your client/patient records',
            content: `
                <h2>Client Registration</h2>
                <h3>Add New Client</h3>
                <ol>
                    <li>Click "+ New Client" button</li>
                    <li>Fill in full name, email, and phone</li>
                    <li>Add photo (optional)</li>
                    <li>Select preferred language</li>
                    <li>Click "Register"</li>
                </ol>
            `
        },
        configuracoes: {
            title: 'Settings & Profile',
            description: 'Complete your professional profile',
            content: `
                <h3>How to Configure Your Profile</h3>
                <p>Your professional profile is essential for generating documents and your booking page.</p>
                
                <h4>📸 Professional Photo</h4>
                <p>Add a photo that will appear in generated documents and on your booking page.</p>
                
                <h4>🔗 Booking Link</h4>
                <p>Create a custom slug for your clients to book appointments.</p>
                
                <h4>📋 Basic Information</h4>
                <p>Define your professional specialty.</p>
                
                <h4>📞 Contact Information</h4>
                <ul>
                    <li><strong>Full Name:</strong> For document signatures</li>
                    <li><strong>Professional Registration:</strong> E.g.: MD, RN, PT, etc.</li>
                    <li><strong>Phone:</strong> Contact for clients</li>
                    <li><strong>Bio:</strong> Your professional experience</li>
                </ul>
                
                <h4>📍 Address</h4>
                <p>Complete address used in generated documents.</p>
                
                <h4>🌐 Social Media</h4>
                <p>Instagram, Facebook, LinkedIn and Website for your booking page.</p>
            `
        }
    },
    'es-ES': {
        inicio: {
            title: 'Inicio',
            description: 'Tour por la plataforma KalonConnect',
            content: `
                <h2>¡Bienvenido a KalonConnect! 🎉</h2>
                <p>KalonConnect es su plataforma completa para gestionar consultas online, documentos profesionales y mucho más.</p>
                <h3>Lo que puede hacer:</h3>
                <ul>
                    <li><strong>Consultas Online:</strong> Realice sesiones de video profesionales</li>
                    <li><strong>Documentos:</strong> Cree y gestione documentos personalizados con firma digital</li>
                    <li><strong>Citas:</strong> Organice su agenda y envíe recordatorios automáticos</li>
                    <li><strong>Financiero:</strong> Controle pagos y suscripciones</li>
                </ul>
            `
        },
        perfil: {
            title: 'Perfil y Configuración',
            description: 'Configure su perfil y personalice la plataforma',
            content: `
                <h2>Configuración de Perfil</h2>
                <h3>Información Profesional</h3>
                <p>Mantenga su información siempre actualizada:</p>
                <ul>
                    <li>Nombre completo</li>
                    <li>Especialidad</li>
                    <li>Registro profesional (número de licencia)</li>
                    <li>Foto de perfil</li>
                </ul>
            `
        },
        documentos: {
            title: 'Documentos',
            description: 'Cree y gestione documentos profesionales',
            content: `
                <h2>Sistema de Documentos</h2>
                <h3>Documentos Personalizados</h3>
                <p>Cree documentos totalmente personalizados para su práctica:</p>
                <h4>1. Cargar Documento Word</h4>
                <ul>
                    <li>Cargue archivos .docx</li>
                    <li>El sistema detecta automáticamente marcadores <code>{{campo}}</code></li>
                    <li>Extrae cláusulas del documento</li>
                </ul>
            `
        },
        agendamentos: {
            title: 'Citas',
            description: 'Gestione su agenda y consultas',
            content: `
                <h2>Sistema de Citas</h2>
                <h3>Crear Consulta</h3>
                <ol>
                    <li>Haga clic en "Nueva Consulta"</li>
                    <li>Seleccione paciente</li>
                    <li>Elija fecha y hora</li>
                    <li>Establezca duración</li>
                </ol>
            `
        },
        financeiro: {
            title: 'Financiero',
            description: 'Gestione pagos y suscripciones',
            content: `
                <h2>Gestión Financiera</h2>
                <h3>Planes de Suscripción</h3>
                <ul>
                    <li><strong>Normal:</strong> $49/mes - Funciones esenciales</li>
                    <li><strong>Pro:</strong> $99/mes - Funciones avanzadas</li>
                    <li><strong>Premium:</strong> $149/mes - Todo ilimitado</li>
                </ul>
            `
        },
        eventos: {
            title: 'Eventos y Webinars',
            description: 'Cree y gestione eventos en línea',
            content: `
                <h2>Sistema de Eventos</h2>
                <h3>Crear Nuevo Evento</h3>
                <ol>
                    <li>Haga clic en "+ Nuevo Evento"</li>
                    <li>Complete la información (nombre, descripción, tipo, fecha)</li>
                    <li>Cargue banner (opcional)</li>
                    <li>Haga clic en "Crear Evento"</li>
                </ol>
            `
        },
        consultas: {
            title: 'Consultas en Línea',
            description: 'Realice sesiones por videollamada',
            content: `
                <h2>Sistema de Consultas en Línea</h2>
                <h3>Iniciar Consulta</h3>
                <ol>
                    <li>Seleccione cliente de la lista</li>
                    <li>Haga clic en "Ir a Consulta"</li>
                    <li>Espere a que el cliente se una a la sala</li>
                    <li>Inicie la sesión</li>
                </ol>
            `
        },
        produtos: {
            title: 'Mis Productos',
            description: 'Venda productos y servicios digitales',
            content: `
                <h2>Catálogo de Productos</h2>
                <h3>Agregar Producto</h3>
                <ol>
                    <li>Haga clic en "+ Nuevo Producto"</li>
                    <li>Agregue imagen del producto</li>
                    <li>Complete nombre, descripción y precio</li>
                    <li>Elija tipo de acción (Link, WhatsApp o PIX)</li>
                    <li>Haga clic en "Guardar"</li>
                </ol>
            `
        },
        clientes: {
            title: 'Registro de Clientes',
            description: 'Gestiona el registro de tus clientes/pacientes',
            content: `
                <h2>Registro de Clientes</h2>
                <h3>Añadir Nuevo Cliente</h3>
                <ol>
                    <li>Haz clic en el botón "+ Nuevo Cliente"</li>
                    <li>Completa nombre completo, email y teléfono</li>
                    <li>Añade foto (opcional)</li>
                    <li>Selecciona idioma preferido</li>
                    <li>Haz clic en "Registrar"</li>
                </ol>
            `
        },
        configuracoes: {
            title: 'Configuración y Perfil',
            description: 'Completa tu perfil profesional',
            content: `
                <h3>Cómo Configurar Tu Perfil</h3>
                <p>Tu perfil profesional es esencial para generar documentos y tu página de reservas.</p>
                
                <h4>📸 Foto Profesional</h4>
                <p>Añade una foto que aparecerá en los documentos generados y en tu página de reservas.</p>
                
                <h4>🔗 Enlace de Reservas</h4>
                <p>Crea un slug personalizado para que tus clientes reserven citas.</p>
                
                <h4>📋 Información Básica</h4>
                <p>Define tu especialidad profesional.</p>
                
                <h4>📞 Información de Contacto</h4>
                <ul>
                    <li><strong>Nombre Completo:</strong> Para firmas en documentos</li>
                    <li><strong>Registro Profesional:</strong> Ej: CRM, CRP, CRTH, etc.</li>
                    <li><strong>Teléfono:</strong> Contacto para clientes</li>
                    <li><strong>Biografía:</strong> Tu experiencia profesional</li>
                </ul>
                
                <h4>📍 Dirección</h4>
                <p>Dirección completa usada en los documentos generados.</p>
                
                <h4>🌐 Redes Sociales</h4>
                <p>Instagram, Facebook, LinkedIn y Sitio Web para tu página de reservas.</p>
            `
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
                    <li><strong>Consultations en Ligne:</strong> Réalisez des séances vidéo professionnelles</li>
                    <li><strong>Documents:</strong> Créez et gérez des documents personnalisés avec signature numérique</li>
                    <li><strong>Rendez-vous:</strong> Organisez votre agenda et envoyez des rappels automatiques</li>
                    <li><strong>Financier:</strong> Contrôlez les paiements et abonnements</li>
                </ul>
            `
        },
        perfil: {
            title: 'Profil et Paramètres',
            description: 'Configurez votre profil',
            content: `
                <h2>Configuration du Profil</h2>
                <h3>Informations Professionnelles</h3>
                <p>Maintenez vos informations toujours à jour:</p>
                <ul>
                    <li>Nom complet</li>
                    <li>Spécialité</li>
                    <li>Numéro d'enregistrement professionnel</li>
                    <li>Photo de profil</li>
                </ul>
            `
        },
        documentos: {
            title: 'Documents',
            description: 'Créez et gérez des documents',
            content: `
                <h2>Système de Documents</h2>
                <h3>Documents Personnalisés</h3>
                <p>Créez des documents entièrement personnalisés pour votre pratique:</p>
                <h4>1. Télécharger un Document Word</h4>
                <ul>
                    <li>Téléchargez des fichiers .docx</li>
                    <li>Le système détecte automatiquement les marqueurs <code>{{champ}}</code></li>
                    <li>Extrait les clauses du document</li>
                </ul>
            `
        },
        agendamentos: {
            title: 'Rendez-vous',
            description: 'Gérez votre agenda',
            content: `
                <h2>Système de Rendez-vous</h2>
                <h3>Créer une Consultation</h3>
                <ol>
                    <li>Cliquez sur "Nouvelle Consultation"</li>
                    <li>Sélectionnez le patient</li>
                    <li>Choisissez la date et l'heure</li>
                    <li>Définissez la durée</li>
                </ol>
            `
        },
        financeiro: {
            title: 'Financier',
            description: 'Gérez les paiements',
            content: `
                <h2>Gestion Financière</h2>
                <h3>Plans d'Abonnement</h3>
                <ul>
                    <li><strong>Normal:</strong> 49$/mois - Fonctionnalités essentielles</li>
                    <li><strong>Pro:</strong> 99$/mois - Fonctionnalités avancées</li>
                    <li><strong>Premium:</strong> 149$/mois - Tout illimité</li>
                </ul>
            `
        },
        eventos: {
            title: 'Événements et Webinaires',
            description: 'Créez des événements',
            content: `
                <h2>Système d'Événements</h2>
                <h3>Créer un Nouvel Événement</h3>
                <ol>
                    <li>Cliquez sur "+ Nouvel Événement"</li>
                    <li>Remplissez les informations (nom, description, type, date)</li>
                    <li>Téléchargez une bannière (optionnel)</li>
                    <li>Cliquez sur "Créer Événement"</li>
                </ol>
            `
        },
        consultas: {
            title: 'Consultations en Ligne',
            description: 'Séances par appel vidéo',
            content: `
                <h2>Système de Consultations en Ligne</h2>
                <h3>Démarrer une Consultation</h3>
                <ol>
                    <li>Sélectionnez le client dans la liste</li>
                    <li>Cliquez sur "Aller à la Consultation"</li>
                    <li>Attendez que le client rejoigne la salle</li>
                    <li>Démarrez la séance</li>
                </ol>
            `
        },
        produtos: {
            title: 'Mes Produits',
            description: 'Vendez des produits',
            content: `
                <h2>Catalogue de Produits</h2>
                <h3>Ajouter un Produit</h3>
                <ol>
                    <li>Cliquez sur "+ Nouveau Produit"</li>
                    <li>Ajoutez une image du produit</li>
                    <li>Remplissez le nom, la description et le prix</li>
                    <li>Choisissez le type d'action (Lien, WhatsApp ou PIX)</li>
                    <li>Cliquez sur "Enregistrer"</li>
                </ol>
            `
        },
        clientes: {
            title: 'Enregistrement des Clients',
            description: 'Gérez l\'enregistrement de vos clients/patients',
            content: `
                <h2>Enregistrement des Clients</h2>
                <h3>Ajouter un Nouveau Client</h3>
                <ol>
                    <li>Cliquez sur le bouton "+ Nouveau Client"</li>
                    <li>Remplissez le nom complet, l\'email et le téléphone</li>
                    <li>Ajoutez une photo (optionnel)</li>
                    <li>Sélectionnez la langue préférée</li>
                    <li>Cliquez sur "Enregistrer"</li>
                </ol>
            `
        },
        configuracoes: {
            title: 'Paramètres et Profil',
            description: 'Complétez votre profil professionnel',
            content: `
                <h3>Comment Configurer Votre Profil</h3>
                <p>Votre profil professionnel est essentiel pour générer des documents et votre page de réservation.</p>
                
                <h4>📸 Photo Professionnelle</h4>
                <p>Ajoutez une photo qui apparaîtra dans les documents générés et sur votre page de réservation.</p>
                
                <h4>🔗 Lien de Réservation</h4>
                <p>Créez un slug personnalisé pour que vos clients réservent des consultations.</p>
                
                <h4>📋 Informations de Base</h4>
                <p>Définissez votre spécialité professionnelle.</p>
                
                <h4>📞 Informations de Contact</h4>
                <ul>
                    <li><strong>Nom Complet:</strong> Pour les signatures dans les documents</li>
                    <li><strong>Enregistrement Professionnel:</strong> Ex: MD, RN, PT, etc.</li>
                    <li><strong>Teléfono:</strong> Contact pour les clients</li>
                    <li><strong>Biographie:</strong> Votre expérience professionnelle</li>
                </ul>
                
                <h4>📍 Adresse</h4>
                <p>Adresse complète utilisée dans les documents générés.</p>
                
                <h4>🌐 Réseaux Sociaux</h4>
                <p>Instagram, Facebook, LinkedIn et Site Web pour votre page de réservation.</p>
            `
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
