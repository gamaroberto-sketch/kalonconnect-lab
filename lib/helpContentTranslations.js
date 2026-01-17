import { Home, User, FileText, Calendar, DollarSign, Settings, Zap, Book, Users, Video } from 'lucide-react';
import React from 'react';

// UI Translations
export const uiTranslations = {
    'pt-BR': {
        backToSections: 'Voltar para todas as seções',
        searchPlaceholder: 'Buscar no guia...',
        resultsFound: 'resultados encontrados',
        resultFound: 'resultado encontrado'
    },
    'en-US': {
        backToSections: 'Back to all sections',
        searchPlaceholder: 'Search in guide...',
        resultsFound: 'results found',
        resultFound: 'result found'
    },
    'es-ES': {
        backToSections: 'Volver a todas las secciones',
        searchPlaceholder: 'Buscar en la guía...',
        resultsFound: 'resultados encontrados',
        resultFound: 'resultado encontrado'
    },
    'fr-FR': {
        backToSections: 'Retour à toutes les sections',
        searchPlaceholder: 'Rechercher dans le guide...',
        resultsFound: 'résultats trouvés',
        resultFound: 'résultat trouvé'
    }
};

// All translations inline (no external imports needed)
const helpTranslations = {
    'pt-BR': {
        inicio: {
            title: 'Início',
            description: 'Conheça a plataforma KalonConnect',
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
            description: 'Configure seu perfil e personalize sua experiência',
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
            title: 'Documentos Inteligentes',
            description: 'Gere receitas e atestados em segundos',
            content: `
                <h2>Como Criar um Documento</h2>
                <p>Utilize modelos prontos para agilizar sua rotina.</p>
                <ol>
                    <li>No menu <strong>Documentos</strong>, clique em <strong>Novo Documento</strong>.</li>
                    <li>Escolha um modelo (ex: Atestado, Receita, Contrato) ou comece em branco.</li>
                    <li>O sistema preencherá automaticamente os dados do cliente selecionado.</li>
                    <li>Edite o conteúdo conforme necessário e clique em <strong>Gerar PDF</strong> ou <strong>Imprimir</strong>.</li>
                </ol>
            `
        },
        agendamentos: {
            title: 'Agenda e Sessões',
            description: 'Organize seus horários e evite conflitos',
            content: `
                <h2>Como Agendar uma Nova Sessão</h2>
                <p>Gerencie sua disponibilidade de forma simples.</p>
                <ol>
                    <li>Vá para a seção <strong>Agendamentos</strong>.</li>
                    <li>Clique em um horário livre no calendário ou no botão <strong>Novo Agendamento</strong>.</li>
                    <li>Selecione o <strong>Cliente</strong> e defina a <strong>Data</strong> e <strong>Hora</strong>.</li>
                    <li>Escolha o tipo de serviço e a duração.</li>
                    <li>Confirme clicando em <strong>Agendar</strong>.</li>
                </ol>
            `
        },
        financeiro: {
            title: 'Controle Financeiro',
            description: 'Acompanhe seus ganhos e pendências',
            content: `
                <h2>Gerenciando suas Finanças</h2>
                <p>Tenha clareza sobre o fluxo de caixa do seu consultório.</p>
                <ul>
                    <li><strong>Visão Geral:</strong> Acompanhe o total recebido e a receber no mês.</li>
                    <li><strong>Registrar Pagamento:</strong> Marque sessões como pagas diretamente na lista de agendamentos.</li>
                    <li><strong>Relatórios:</strong> Exporte demonstrativos para seu controle ou contabilidade.</li>
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
            description: 'Realize atendimentos por vídeo com segurança',
            content: `
                <h2>Como Iniciar uma Consulta de Vídeo</h2>
                <p>Conecte-se com seus pacientes em um ambiente seguro e estável.</p>
                <ol>
                    <li>Acesse o menu <strong>Consultas</strong>.</li>
                    <li>Localize o agendamento desejado na lista de "Próximas Consultas".</li>
                    <li>Clique em <strong>Iniciar Sessão</strong>.</li>
                    <li>Verifique sua câmera e microfone na tela de preparação e entre na sala.</li>
                </ol>
                <p><strong>Funcionalidades na Sala:</strong> Compartilhamento de tela, chat integrado e anotações privadas durante a sessão.</p>
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
            title: 'Gestão de Clientes',
            description: 'Cadastre e organize seus pacientes',
            content: `
                <h2>Como Cadastrar um Novo Cliente</h2>
                <p>Mantenha sua base de pacientes organizada e acessível.</p>
                <ol>
                    <li>No menu lateral, clique em <strong>Clientes</strong>.</li>
                    <li>Pressione o botão <strong>Novo Cliente</strong> no canto superior direito.</li>
                    <li>Preencha as informações essenciais: <strong>Nome Completo</strong> e <strong>Telefone</strong> (para envio de links).</li>
                    <li>Clique em <strong>Salvar</strong>.</li>
                </ol>
                <p><strong>Dica:</strong> Você pode adicionar notas privadas e visualizar o histórico de consultas no perfil de cada cliente.</p>
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
            description: 'Discover the KalonConnect platform',
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
            description: 'Configure your profile and personalize your experience',
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
            title: 'Smart Documents',
            description: 'Generate prescriptions and certificates in seconds',
            content: `
                <h2>How to Create a Document</h2>
                <p>Use ready-made templates to streamline your routine.</p>
                <ol>
                    <li>In the <strong>Documents</strong> menu, click <strong>New Document</strong>.</li>
                    <li>Choose a template (e.g., Certificate, Prescription, Contract) or start blank.</li>
                    <li>The system will automatically fill in the selected client's data.</li>
                    <li>Edit the content as needed and click <strong>Generate PDF</strong> or <strong>Print</strong>.</li>
                </ol>
            `
        },
        agendamentos: {
            title: 'Schedule & Sessions',
            description: 'Organize your time and avoid conflicts',
            content: `
                <h2>How to Schedule a New Session</h2>
                <p>Manage your availability simply.</p>
                <ol>
                    <li>Go to the <strong>Appointments</strong> section.</li>
                    <li>Click on a free time slot in the calendar or the <strong>New Appointment</strong> button.</li>
                    <li>Select the <strong>Client</strong> and define the <strong>Date</strong> and <strong>Time</strong>.</li>
                    <li>Choose the service type and duration.</li>
                    <li>Confirm by clicking <strong>Schedule</strong>.</li>
                </ol>
            `
        },
        financeiro: {
            title: 'Financial Control',
            description: 'Track your earnings and pending payments',
            content: `
                <h2>Managing Your Finances</h2>
                <p>Have clarity about your practice's cash flow.</p>
                <ul>
                    <li><strong>Overview:</strong> Track the total received and receivable for the month.</li>
                    <li><strong>Record Payment:</strong> Mark sessions as paid directly in the appointment list.</li>
                    <li><strong>Reports:</strong> Export statements for your control or accounting.</li>
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
            description: 'Conduct secure video sessions',
            content: `
                <h2>How to Start a Video Consultation</h2>
                <p>Connect with your patients in a secure and stable environment.</p>
                <ol>
                    <li>Go to the <strong>Consultations</strong> menu.</li>
                    <li>Locate the desired appointment in the "Upcoming Consultations" list.</li>
                    <li>Click <strong>Start Session</strong>.</li>
                    <li>Check your camera and microphone on the preparation screen and enter the room.</li>
                </ol>
                <p><strong>In-Room Features:</strong> Screen sharing, integrated chat, and private notes during the session.</p>
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
            title: 'Client Management',
            description: 'Register and organize your patients',
            content: `
                <h2>How to Register a New Client</h2>
                <p>Keep your patient base organized and accessible.</p>
                <ol>
                    <li>In the sidebar menu, click on <strong>Clients</strong>.</li>
                    <li>Press the <strong>New Client</strong> button in the top right corner.</li>
                    <li>Fill in the essential information: <strong>Full Name</strong> and <strong>Phone</strong> (for sending links).</li>
                    <li>Click <strong>Save</strong>.</li>
                </ol>
                <p><strong>Tip:</strong> You can add private notes and view consultation history on each client's profile.</p>
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
            description: 'Conozca la plataforma KalonConnect',
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
            description: 'Configure su perfil y personalice su experiencia',
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
            title: 'Documentos Inteligentes',
            description: 'Genere recetas y certificados en segundos',
            content: `
                <h2>Cómo Crear un Documento</h2>
                <p>Utilice plantillas listas para agilizar su rutina.</p>
                <ol>
                    <li>En el menú <strong>Documentos</strong>, haga clic en <strong>Nuevo Documento</strong>.</li>
                    <li>Elija una plantilla (ej: Certificado, Receta, Contrato) o comience en blanco.</li>
                    <li>El sistema completará automáticamente los datos del cliente seleccionado.</li>
                    <li>Edite el contenido según sea necesario y haga clic en <strong>Generar PDF</strong> o <strong>Imprimir</strong>.</li>
                </ol>
            `
        },
        agendamentos: {
            title: 'Agenda y Sesiones',
            description: 'Organice sus horarios y evite conflictos',
            content: `
                <h2>Cómo Agendar una Nueva Sesión</h2>
                <p>Gestione su disponibilidad de forma sencilla.</p>
                <ol>
                    <li>Vaya a la sección <strong>Citas</strong>.</li>
                    <li>Haga clic en un horario libre en el calendario o en el botón <strong>Nueva Cita</strong>.</li>
                    <li>Seleccione el <strong>Cliente</strong> y defina la <strong>Fecha</strong> y <strong>Hora</strong>.</li>
                    <li>Elija el tipo de servicio y la duración.</li>
                    <li>Confirme haciendo clic en <strong>Agendar</strong>.</li>
                </ol>
            `
        },
        financeiro: {
            title: 'Control Financiero',
            description: 'Acompañe sus ganancias y pendientes',
            content: `
                <h2>Gestionando sus Finanzas</h2>
                <p>Tenga claridad sobre el flujo de caja de su consultorio.</p>
                <ul>
                    <li><strong>Visión General:</strong> Acompañe el total recibido y por recibir en el mes.</li>
                    <li><strong>Registrar Pago:</strong> Marque sesiones como pagadas directamente en la lista de citas.</li>
                    <li><strong>Informes:</strong> Exporte demostrativos para su control o contabilidad.</li>
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
            description: 'Realice videoconsultas de forma segura',
            content: `
                <h2>Cómo Iniciar una Videoconsulta</h2>
                <p>Conéctese con sus pacientes en un entorno seguro y estable.</p>
                <ol>
                    <li>Acceda al menú <strong>Consultas</strong>.</li>
                    <li>Localice la cita deseada en la lista de "Próximas Citas".</li>
                    <li>Haga clic en <strong>Iniciar Sesión</strong>.</li>
                    <li>Verifique su cámara y micrófono en la pantalla de preparación y entre en la sala.</li>
                </ol>
                <p><strong>Funciones en la Sala:</strong> Compartir pantalla, chat integrado y notas privadas durante la sesión.</p>
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
            title: 'Gestión de Clientes',
            description: 'Registre y organice a sus pacientes',
            content: `
                <h2>Cómo Registrar un Nuevo Cliente</h2>
                <p>Mantenga su base de pacientes organizada y accesible.</p>
                <ol>
                    <li>En el menú lateral, haga clic en <strong>Clientes</strong>.</li>
                    <li>Presione el botón <strong>Nuevo Cliente</strong> en la esquina superior derecha.</li>
                    <li>Complete la información esencial: <strong>Nombre Completo</strong> y <strong>Teléfono</strong> (para enviar enlaces).</li>
                    <li>Haga clic en <strong>Guardar</strong>.</li>
                </ol>
                <p><strong>Consejo:</strong> Puede agregar notas privadas y ver el historial de consultas en el perfil de cada cliente.</p>
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
            description: 'Découvrez la plateforme KalonConnect',
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
            description: 'Configurez votre profil et personnalisez votre expérience',
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
            title: 'Documents Intelligents',
            description: 'Générez des ordonnances et certificats en quelques secondes',
            content: `
                <h2>Comment Créer un Document</h2>
                <p>Utilisez des modèles prêts pour accélérer votre routine.</p>
                <ol>
                    <li>Dans le menu <strong>Documents</strong>, cliquez sur <strong>Nouveau Document</strong>.</li>
                    <li>Choisissez un modèle (ex : Certificat, Ordonnance, Contrat) ou commencez à vide.</li>
                    <li>Le système remplira automatiquement les données du client sélectionné.</li>
                    <li>Modifiez le contenu si nécessaire et cliquez sur <strong>Générer PDF</strong> ou <strong>Imprimer</strong>.</li>
                </ol>
            `
        },
        agendamentos: {
            title: 'Agenda et Sessions',
            description: 'Organisez vos horaires et évitez les conflits',
            content: `
                <h2>Comment Planifier une Nouvelle Session</h2>
                <p>Gérez votre disponibilité simplement.</p>
                <ol>
                    <li>Allez dans la section <strong>Rendez-vous</strong>.</li>
                    <li>Cliquez sur un créneau libre dans le calendrier ou sur le bouton <strong>Nouveau Rendez-vous</strong>.</li>
                    <li>Sélectionnez le <strong>Client</strong> et définissez la <strong>Date</strong> et l'<strong>Heure</strong>.</li>
                    <li>Choisissez le type de service et la durée.</li>
                    <li>Confirmez en cliquant sur <strong>Planifier</strong>.</li>
                </ol>
            `
        },
        financeiro: {
            title: 'Contrôle Financier',
            description: 'Suivez vos gains et paiements en attente',
            content: `
                <h2>Gérer vos Finances</h2>
                <p>Ayez une vision claire de la trésorerie de votre cabinet.</p>
                <ul>
                    <li><strong>Vue d'ensemble :</strong> Suivez le total reçu et à recevoir dans le mois.</li>
                    <li><strong>Enregistrer un Paiement :</strong> Marquez les sessions comme payées directement dans la liste des rendez-vous.</li>
                    <li><strong>Rapports :</strong> Exportez des relevés pour votre contrôle ou comptabilité.</li>
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
            description: 'Effectuez des consultations vidéo en toute sécurité',
            content: `
                <h2>Comment Démarrer une Consultation Vidéo</h2>
                <p>Connectez-vous avec vos patients dans un environnement sécurisé et stable.</p>
                <ol>
                    <li>Accédez au menu <strong>Consultations</strong>.</li>
                    <li>Localisez le rendez-vous souhaité dans la liste des "Prochaines Consultations".</li>
                    <li>Cliquez sur <strong>Démarrer la Session</strong>.</li>
                    <li>Vérifiez votre caméra et votre micro sur l'écran de préparation et entrez dans la salle.</li>
                </ol>
                <p><strong>Fonctionnalités dans la Salle :</strong> Partage d'écran, chat intégré et notes privées pendant la session.</p>
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
            title: 'Gestion des Clients',
            description: 'Inscrivez et organisez vos patients',
            content: `
                <h2>Comment Inscrire un Nouveau Client</h2>
                <p>Gardez votre base de patients organisée et accessible.</p>
                <ol>
                    <li>Dans le menu latéral, cliquez sur <strong>Clients</strong>.</li>
                    <li>Appuyez sur le bouton <strong>Nouveau Client</strong> en haut à droite.</li>
                    <li>Remplissez les informations essentielles : <strong>Nom Complet</strong> et <strong>Téléphone</strong> (pour l'envoi de liens).</li>
                    <li>Cliquez sur <strong>Enregistrer</strong>.</li>
                </ol>
                <p><strong>Astuce :</strong> Vous pouvez ajouter des notes privées et consulter l'historique des consultations sur le profil de chaque client.</p>
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
