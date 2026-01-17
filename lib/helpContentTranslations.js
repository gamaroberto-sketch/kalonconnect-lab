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
            title: 'Documentos',
            description: 'Crie e organize documentos profissionais',
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
            description: 'Acompanhe pagamentos e assinaturas',
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
            description: 'Realize atendimentos por videochamada com segurança',
            content: `
                <h2>Sistema de Consultas Online</h2>
                
                <h3>🚀 Como Iniciar</h3>
                <ol>
                    <li>Certifique-se de que o <strong>clientId</strong> está correto na URL ou selecione na lista.</li>
                    <li>Clique em <strong>"Copiar Link"</strong> para enviar o acesso ao seu cliente.</li>
                    <li>Clique no botão <strong>"Iniciar Sessão"</strong> (botão verde/azul central) para começar o vídeo.</li>
                </ol>

                <h3>🎮 Controles do Rodapé</h3>
                <ul>
                    <li><strong>Play / Pause / Stop:</strong> Controlam o cronômetro e o estado da sessão de vídeo.</li>
                    <li><strong>Mic e Câmera (Preview):</strong> Ative seu áudio e veja sua imagem local antes de publicar para o cliente.</li>
                    <li><strong>Video (Ícone de Câmera):</strong> Publica sua imagem na sala para que o cliente te veja.</li>
                    <li><strong>Monitor:</strong> Compartilha sua tela com o cliente em tempo real.</li>
                    <li><strong>Tela Cheia:</strong> Expande a área de vídeo para foco total no atendimento.</li>
                </ul>

                <h3>⚙️ Configurações da Sessão (Ícone de Engrenagem)</h3>
                <p>Acesse o painel de configurações para personalizar a experiência:</p>
                <ul>
                    <li><strong>Duração:</strong> Defina o tempo total da consulta (Ex: 50min, 60min).</li>
                    <li><strong>Aviso de Tempo:</strong> Configure um alerta visual para quando faltar X minutos.</li>
                    <li><strong>Fundo Virtual:</strong> Escolha entre Desfoque, Imagens Padrão ou faça <strong>upload de sua própria foto</strong> para profissionalizar seu ambiente.</li>
                    <li><strong>Legendas e Tradução:</strong> Ative a transcrição em tempo real ou tradução simultânea (disponível em planos compatíveis).</li>
                </ul>

                <h3>💡 Dica de Especialista</h3>
                <p>Use o <strong>Painel de Notas</strong> e o <strong>Prontuário</strong> simultaneamente. Eles podem ser arrastados e redimensionados na tela para que você não perca o contato visual com o cliente enquanto anota.</p>
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
            description: 'Gerencie o cadastro dos seus clientes',
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
            title: 'Documents',
            description: 'Create and organize professional documents',
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
            description: 'Track payments and subscriptions',
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
            description: 'Conduct secure video consultations',
            content: `
                <h2>Online Consultation System</h2>
                
                <h3>🚀 How to Start</h3>
                <ol>
                    <li>Ensure the <strong>clientId</strong> is correct in the URL or select one from the list.</li>
                    <li>Click <strong>"Copy Link"</strong> to send access to your client.</li>
                    <li>Click the <strong>"Start Session"</strong> button (center green/blue button) to begin the video.</li>
                </ol>

                <h3>🎮 Footer Controls</h3>
                <ul>
                    <li><strong>Play / Pause / Stop:</strong> Controls the timer and the state of the video session.</li>
                    <li><strong>Mic & Camera (Preview):</strong> Turn on your audio and see your local image before publishing to the client.</li>
                    <li><strong>Video (Camera Icon):</strong> Publishes your image to the room so the client can see you.</li>
                    <li><strong>Monitor:</strong> Shares your screen with the client in real-time.</li>
                    <li><strong>Fullscreen:</strong> Expands the video area for total focus during treatment.</li>
                </ul>

                <h3>⚙️ Session Settings (Gear Icon)</h3>
                <p>Access the settings panel to customize the experience:</p>
                <ul>
                    <li><strong>Duration:</strong> Set the total time for the consultation (e.g., 50min, 60min).</li>
                    <li><strong>Time Warning:</strong> Configure a visual alert when there are X minutes remaining.</li>
                    <li><strong>Virtual Background:</strong> Choose between Blur, Standard Images, or <strong>upload your own photo</strong> to professionalize your environment.</li>
                    <li><strong>Captions & Translation:</strong> Activate real-time transcription or simultaneous translation (available in compatible plans).</li>
                </ul>

                <h3>💡 Pro Tip</h3>
                <p>Use the <strong>Notes Panel</strong> and <strong>Client Record</strong> simultaneously. They can be dragged and resized on the screen so you don't lose eye contact with the client while taking notes.</p>
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
            description: 'Manage your client registry',
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
            title: 'Documentos',
            description: 'Cree y organice documentos profesionales',
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
            description: 'Realice un seguimiento de pagos y suscripciones',
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
            description: 'Realice videoconsultas de forma segura',
            content: `
                <h2>Sistema de Consultas en Línea</h2>
                
                <h3>🚀 Cómo Iniciar</h3>
                <ol>
                    <li>Asegúrese de que o <strong>clientId</strong> sea correcto en la URL o seleccione uno de la lista.</li>
                    <li>Haga clic en <strong>"Copiar Enlace"</strong> para enviar el acceso a su cliente.</li>
                    <li>Haga clic en el botón <strong>"Iniciar Sesión"</strong> (botón verde/azul central) para comenzar el vídeo.</li>
                </ol>

                <h3>🎮 Controles del Pie de Página</h3>
                <ul>
                    <li><strong>Play / Pausa / Stop:</strong> Controlan o cronómetro y el estado de la sesión de vídeo.</li>
                    <li><strong>Mic y Cámara (Vista Previa):</strong> Active su audio y vea su imagen local antes de publicar para el cliente.</li>
                    <li><strong>Video (Icono de Cámara):</strong> Publica su imagen en la sala para que el cliente lo vea.</li>
                    <li><strong>Monitor:</strong> Comparte su pantalla con el cliente en tiempo real.</li>
                    <li><strong>Pantalla Completa:</strong> Expande el área de vídeo para un enfoque total durante la atención.</li>
                </ul>

                <h3>⚙️ Configuración de la Sesión (Icono de Engranaje)</h3>
                <p>Acceda al panel de configuración para personalizar la experiencia:</p>
                <ul>
                    <li><strong>Duración:</strong> Defina el tiempo total de la consulta (Ej: 50min, 60min).</li>
                    <li><strong>Aviso de Tiempo:</strong> Configure uma alerta visual para cuando falten X minutos.</li>
                    <li><strong>Fondo Virtual:</strong> Elija entre Desenfoque, Imágenes Estándar o <strong>cargue su propia foto</strong> para profesionalizar su entorno.</li>
                    <li><strong>Subtítulos y Traducción:</strong> Active la transcripción en tiempo real o traducción simultánea (disponible en planes compatibles).</li>
                </ul>

                <h3>💡 Consejo de Experto</h3>
                <p>Use el <strong>Panel de Notas</strong> y el <strong>Expediente do Cliente</strong> simultáneamente. Se podem arrastrar y redimensionar en la pantalla para que no pierda el contacto visual con el cliente mientras toma notas.</p>
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
            description: 'Gestione el registro de sus clientes',
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
            title: 'Documents',
            description: 'Créez et organisez des documents professionnels',
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
            description: 'Suivez les paiements et abonnements',
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
            description: 'Effectuez des consultations vidéo en toute sécurité',
            content: `
                <h2>Système de Consultations en Ligne</h2>
                
                <h3>🚀 Comment Démarrer</h3>
                <ol>
                    <li>Assurez-vous que le <strong>clientId</strong> est correct dans l'URL ou sélectionnez-en un dans la liste.</li>
                    <li>Cliquez sur <strong>"Copier le Lien"</strong> pour envoyer l'accès à votre votre client.</li>
                    <li>Cliquez sur le bouton <strong>"Démarrer la Session"</strong> (bouton central vert/bleu) pour commencer la vidéo.</li>
                </ol>

                <h3>🎮 Commandes du Pied de Page</h3>
                <ul>
                    <li><strong>Lecture / Pause / Stop:</strong> Contrôlent le minuteur et l'état de la séance vidéo.</li>
                    <li><strong>Micro et Caméra (Aperçu):</strong> Activez votre audio et voyez votre image locale avant de publier pour le client.</li>
                    <li><strong>Vidéo (Icône Caméra):</strong> Publie votre image dans la salle pour que le client vous voie.</li>
                    <li><strong>Moniteur:</strong> Partage votre écran avec le client en temps réel.</li>
                    <li><strong>Plein Écran:</strong> Agrandit la zone vidéo pour une concentration totale pendant la séance.</li>
                </ul>

                <h3>⚙️ Paramètres de Session (Icône Engrenage)</h3>
                <p>Accédez au panneau de paramètres pour personnaliser l'expérience :</p>
                <ul>
                    <li><strong>Durée:</strong> Définissez le temps total de la consultation (Ex: 50min, 60min).</li>
                    <li><strong>Avertissement de Temps:</strong> Configurez une alerte visuelle lorsqu'il reste X minutes.</li>
                    <li><strong>Arrière-plan Virtuel:</strong> Choisissez entre Flou, Images Standard ou <strong>téléchargez votre propre photo</strong> pour professionnaliser votre environnement.</li>
                    <li><strong>Sous-titres & Traduction:</strong> Activez la transcription en temps réel ou la traduction simultanée (disponible avec les forfaits compatibles).</li>
                </ul>

                <h3>💡 Conseil de Pro</h3>
                <p>Utilisez le <strong>Panneau de Notes</strong> et le <strong>Dossier Client</strong> simultanément. Ils peuvent être glissés et redimensionnés sur l'écran afin de ne pas perdre le contact visuel avec le client tout en prenant des notes.</p>
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
            description: 'Gérez le registre de vos clients',
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
