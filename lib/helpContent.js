import { Home, User, FileText, Calendar, DollarSign, Settings, Zap, Book } from 'lucide-react';
import React from 'react';

export const helpSections = {
    inicio: {
        id: 'inicio',
        title: 'Início',
        icon: <Home className="w-6 h-6" />,
        description: 'Tour pela plataforma KalonConnect',
        videoUrl: null, // Será gravado
        thumbnail: null,
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
        `,
        subsections: []
    },

    perfil: {
        id: 'perfil',
        title: 'Perfil & Configurações',
        icon: <User className="w-6 h-6" />,
        description: 'Configure seu perfil e personalize a plataforma',
        videoUrl: null,
        thumbnail: null,
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
            {
                title: 'Editar Dados Pessoais',
                videoUrl: null
            },
            {
                title: 'Escolher Tema',
                videoUrl: null
            },
            {
                title: 'Configurar Assinatura',
                videoUrl: null
            }
        ]
    },

    documentos: {
        id: 'documentos',
        title: 'Documentos',
        icon: <FileText className="w-6 h-6" />,
        description: 'Crie e gerencie documentos profissionais',
        videoUrl: null,
        thumbnail: null,
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
            
            <h4>2. Editor de Cláusulas</h4>
            <ul>
                <li>Adicione novas cláusulas</li>
                <li>Edite cláusulas existentes</li>
                <li>Remova cláusulas desnecessárias</li>
                <li>Reordene com botões ⬆️⬇️</li>
            </ul>
            
            <h4>3. Formulário Dinâmico</h4>
            <ul>
                <li>Sistema gera formulário automaticamente</li>
                <li>Preencha os campos detectados</li>
                <li>Validação automática</li>
                <li>Progress bar mostra % preenchido</li>
            </ul>
            
            <h4>4. Gerar Documento Final</h4>
            <ul>
                <li>Visualize preview com valores preenchidos</li>
                <li>Gere documento Word final</li>
                <li>Adicione assinatura digital</li>
                <li>Envie por email ou WhatsApp</li>
            </ul>
            
            <h3>Exemplo de Marcadores</h3>
            <pre><code>
O paciente {{nome_paciente}}, CPF {{cpf}},
receberá o tratamento de {{tipo_tratamento}}
pelo período de {{duracao}} dias.

Valor: R$ {{valor_tratamento}}
Data: {{data_inicio}}
            </code></pre>
        `,
        subsections: [
            {
                title: 'Upload de Word',
                videoUrl: null
            },
            {
                title: 'Editor de Cláusulas',
                videoUrl: null
            },
            {
                title: 'Preencher Formulário',
                videoUrl: null
            },
            {
                title: 'Gerar PDF',
                videoUrl: null
            }
        ]
    },

    agendamentos: {
        id: 'agendamentos',
        title: 'Agendamentos',
        icon: <Calendar className="w-6 h-6" />,
        description: 'Gerencie sua agenda e consultas',
        videoUrl: null,
        thumbnail: null,
        content: `
            <h2>Sistema de Agendamentos</h2>
            
            <h3>Criar Consulta</h3>
            <ol>
                <li>Clique em "Nova Consulta"</li>
                <li>Selecione o paciente</li>
                <li>Escolha data e horário</li>
                <li>Defina duração</li>
                <li>Adicione observações (opcional)</li>
            </ol>
            
            <h3>Tipos de Consulta</h3>
            <ul>
                <li><strong>Online:</strong> Videochamada pela plataforma</li>
                <li><strong>Presencial:</strong> No consultório</li>
                <li><strong>Retorno:</strong> Consulta de acompanhamento</li>
            </ul>
            
            <h3>Lembretes Automáticos</h3>
            <p>Configure lembretes por:</p>
            <ul>
                <li>Email</li>
                <li>WhatsApp</li>
                <li>SMS</li>
            </ul>
        `,
        subsections: []
    },

    financeiro: {
        id: 'financeiro',
        title: 'Financeiro',
        icon: <DollarSign className="w-6 h-6" />,
        description: 'Gerencie pagamentos e assinaturas',
        videoUrl: null,
        thumbnail: null,
        content: `
            <h2>Gestão Financeira</h2>
            
            <h3>Planos de Assinatura</h3>
            <ul>
                <li><strong>Gratuito:</strong> Funcionalidades básicas</li>
                <li><strong>Profissional:</strong> Recursos avançados</li>
                <li><strong>Premium:</strong> Tudo ilimitado</li>
            </ul>
            
            <h3>Pagamentos</h3>
            <p>Aceite pagamentos de pacientes:</p>
            <ul>
                <li>Cartão de crédito</li>
                <li>PIX</li>
                <li>Boleto</li>
            </ul>
        `,
        subsections: []
    },

    avancado: {
        id: 'avancado',
        title: 'Configurações Avançadas',
        icon: <Settings className="w-6 h-6" />,
        description: 'Integrações e configurações técnicas',
        videoUrl: null,
        thumbnail: null,
        content: `
            <h2>Configurações Avançadas</h2>
            
            <h3>Sala de Espera</h3>
            <p>Personalize a experiência do paciente:</p>
            <ul>
                <li>Mensagem de boas-vindas</li>
                <li>Vídeo de apresentação</li>
                <li>Música de fundo</li>
                <li>Cores e logo</li>
            </ul>
            
            <h3>Integrações</h3>
            <ul>
                <li><strong>Google Calendar:</strong> Sincronize agendamentos</li>
                <li><strong>WhatsApp:</strong> Envie lembretes</li>
                <li><strong>Stripe:</strong> Receba pagamentos</li>
            </ul>
            
            <h3>API e Webhooks</h3>
            <p>Para desenvolvedores:</p>
            <ul>
                <li>Gere chaves de API</li>
                <li>Configure webhooks</li>
                <li>Acesse documentação técnica</li>
            </ul>
        `,
    },

    clientes: {
        id: 'clientes',
        title: 'Cadastro de Clientes',
        icon: <User className="w-6 h-6" />,
        description: 'Gerencie o cadastro dos seus clientes/pacientes',
        videoUrl: null,
        thumbnail: null,
        content: `
            <h2>Cadastro de Clientes</h2>
            
            <h3>Adicionar Novo Cliente</h3>
            <ol>
                <li>Clique no botão "+ Novo Cliente"</li>
                <li>Preencha os dados obrigatórios:
                    <ul>
                        <li>Nome completo</li>
                        <li>Email</li>
                        <li>Telefone</li>
                    </ul>
                </li>
                <li>Adicione foto (opcional) - arraste ou clique para upload</li>
                <li>Selecione idioma preferido</li>
                <li>Clique em "Cadastrar"</li>
            </ol>
            
            <h3>Buscar Clientes</h3>
            <p>Use a barra de busca para encontrar rapidamente:</p>
            <ul>
                <li>Por nome</li>
                <li>Por email</li>
                <li>Por telefone</li>
            </ul>
            
            <h3>Ações Disponíveis</h3>
            <ul>
                <li><strong>Editar:</strong> Atualizar dados do cliente</li>
                <li><strong>Excluir:</strong> Remover cliente (com confirmação)</li>
                <li><strong>Ir para Consulta:</strong> Iniciar atendimento direto</li>
            </ul>
            
            <h3>Dicas</h3>
            <ul>
                <li>📸 Adicione foto para facilitar identificação</li>
                <li>📱 Telefone é usado para lembretes WhatsApp</li>
                <li>🌍 Idioma preferido personaliza comunicações</li>
            </ul>
        `,
        subsections: []
    },

    consultas: {
        id: 'consultas',
        title: 'Consultas Online',
        icon: <Book className="w-6 h-6" />,
        description: 'Realize atendimentos por videochamada',
        videoUrl: null,
        thumbnail: null,
        content: `
            <h2>Sistema de Consultas Online</h2>
            
            <h3>Iniciar Consulta</h3>
            <ol>
                <li>Selecione o cliente na lista</li>
                <li>Clique em "Ir para Consulta"</li>
                <li>Aguarde o cliente entrar na sala</li>
                <li>Inicie o atendimento</li>
            </ol>
            
            <h3>Recursos Durante a Consulta</h3>
            
            <h4>🎥 Vídeo e Áudio</h4>
            <ul>
                <li>Ligar/desligar câmera</li>
                <li>Mutar/desmutar microfone</li>
                <li>Compartilhar tela</li>
                <li>Modo tela cheia</li>
            </ul>
            
            <h4>💬 Chat</h4>
            <ul>
                <li>Envie mensagens de texto</li>
                <li>Compartilhe links</li>
                <li>Histórico salvo automaticamente</li>
            </ul>
            
            <h4>📝 Anotações</h4>
            <ul>
                <li>Faça anotações durante consulta</li>
                <li>Salve automaticamente</li>
                <li>Acesse depois no histórico</li>
            </ul>
            
            <h4>📁 Arquivos</h4>
            <ul>
                <li>Compartilhe documentos</li>
                <li>Envie imagens/PDFs</li>
                <li>Cliente pode fazer download</li>
            </ul>
            
            <h4>🎵 Relaxamento</h4>
            <ul>
                <li>Músicas relaxantes</li>
                <li>Sons da natureza</li>
                <li>Frequências terapêuticas</li>
            </ul>
            
            <h4>⏱️ Temporizador</h4>
            <ul>
                <li>Defina duração da sessão</li>
                <li>Alerta 5 min antes do fim</li>
                <li>Controle tempo total</li>
            </ul>
            
            <h3>Configurações da Sala</h3>
            <p>Personalize sua sala de atendimento:</p>
            <ul>
                <li>Fundo virtual personalizado</li>
                <li>Logo da sua marca</li>
                <li>Cores do tema</li>
                <li>Mensagem de boas-vindas</li>
            </ul>
        `,
        subsections: [
            {
                title: 'Controles de Vídeo',
                videoUrl: null
            },
            {
                title: 'Usar Chat e Anotações',
                videoUrl: null
            },
            {
                title: 'Compartilhar Arquivos',
                videoUrl: null
            }
        ]
    },

    eventos: {
        id: 'eventos',
        title: 'Eventos e Webinars',
        icon: <Calendar className="w-6 h-6" />,
        description: 'Crie e gerencie eventos online',
        videoUrl: null,
        thumbnail: null,
        content: `
            <h2>Sistema de Eventos</h2>
            
            <h3>Criar Novo Evento</h3>
            <ol>
                <li>Clique em "+ Novo Evento"</li>
                <li>Preencha informações:
                    <ul>
                        <li>Nome do evento</li>
                        <li>Descrição</li>
                        <li>Tipo (Curso, Palestra, Workshop, Webinar)</li>
                        <li>Data e horário</li>
                        <li>Link da sala (opcional)</li>
                    </ul>
                </li>
                <li>Faça upload do banner (opcional)</li>
                <li>Defina formato (Aberto ou Fechado)</li>
                <li>Clique em "Criar Evento"</li>
            </ol>
            
            <h3>Tipos de Evento</h3>
            <ul>
                <li><strong>Curso:</strong> Evento com múltiplas aulas</li>
                <li><strong>Palestra:</strong> Apresentação única</li>
                <li><strong>Workshop:</strong> Prático e interativo</li>
                <li><strong>Webinar:</strong> Seminário online</li>
            </ul>
            
            <h3>Gerenciar Participantes</h3>
            <ul>
                <li>Veja lista de inscritos</li>
                <li>Envie convites por email</li>
                <li>Controle presença</li>
                <li>Gere certificados</li>
            </ul>
            
            <h3>Marketing Automation</h3>
            <p>Automatize divulgação do evento:</p>
            <ul>
                <li>📧 Emails de lembrete automáticos</li>
                <li>📱 Mensagens WhatsApp</li>
                <li>📊 Relatórios de engajamento</li>
                <li>🎯 Segmentação de público</li>
            </ul>
            
            <h3>Durante o Evento</h3>
            <ul>
                <li>Clique em "Entrar no Evento"</li>
                <li>Compartilhe tela para apresentações</li>
                <li>Use chat para interação</li>
                <li>Grave a sessão (se configurado)</li>
            </ul>
        `,
        subsections: []
    },

    produtos: {
        id: 'produtos',
        title: 'Meus Produtos',
        icon: <Zap className="w-6 h-6" />,
        description: 'Venda produtos e serviços digitais',
        videoUrl: null,
        thumbnail: null,
        content: `
            <h2>Catálogo de Produtos</h2>
            
            <h3>Adicionar Produto</h3>
            <ol>
                <li>Clique em "+ Novo Produto"</li>
                <li>Adicione imagem do produto (arraste ou clique)</li>
                <li>Preencha informações:
                    <ul>
                        <li>Nome do produto</li>
                        <li>Descrição</li>
                        <li>Preço (formato: 1.000,00)</li>
                    </ul>
                </li>
                <li>Escolha tipo de ação:
                    <ul>
                        <li><strong>Link:</strong> URL de venda (Hotmart, Eduzz, etc)</li>
                        <li><strong>WhatsApp:</strong> Número para contato</li>
                        <li><strong>PIX:</strong> Chave PIX para pagamento</li>
                    </ul>
                </li>
                <li>Clique em "Salvar"</li>
            </ol>
            
            <h3>Tipos de Ação</h3>
            
            <h4>🔗 Link de Venda</h4>
            <p>Para produtos em plataformas externas:</p>
            <ul>
                <li>Hotmart</li>
                <li>Eduzz</li>
                <li>Monetizze</li>
                <li>Loja própria</li>
            </ul>
            
            <h4>💬 WhatsApp</h4>
            <p>Cliente clica e abre conversa direta:</p>
            <ul>
                <li>Formato: (11) 99999-9999</li>
                <li>Abre WhatsApp automaticamente</li>
                <li>Ideal para atendimento personalizado</li>
            </ul>
            
            <h4>💳 PIX</h4>
            <p>Chave PIX copiada automaticamente:</p>
            <ul>
                <li>CPF</li>
                <li>Email</li>
                <li>Telefone</li>
                <li>Chave aleatória</li>
            </ul>
            
            <h3>Gerenciar Produtos</h3>
            <ul>
                <li><strong>Editar:</strong> Atualizar informações</li>
                <li><strong>Excluir:</strong> Remover produto</li>
                <li><strong>Visualizar:</strong> Ver como cliente vê</li>
            </ul>
            
            <h3>Dicas</h3>
            <ul>
                <li>📸 Use imagens quadradas (1:1) para melhor visualização</li>
                <li>💰 Preço é formatado automaticamente em R$</li>
                <li>📱 Teste os links antes de publicar</li>
                <li>✨ Descrições claras aumentam conversão</li>
            </ul>
        `,
        subsections: []
    },

    configuracoes: {
        id: 'configuracoes',
        title: 'Configurações',
        icon: <Settings className="w-6 h-6" />,
        description: 'Configure todas as opções da plataforma',
        videoUrl: null,
        thumbnail: null,
        content: `
            <h2>Central de Configurações</h2>
            
            <h3>📋 Aba Geral</h3>
            <h4>Dados Pessoais</h4>
            <ul>
                <li>Nome completo</li>
                <li>Email</li>
                <li>Telefone</li>
                <li>Foto de perfil</li>
            </ul>
            
            <h4>Informações Profissionais</h4>
            <ul>
                <li>Especialidade</li>
                <li>Registro profissional (CRM, CRP, etc)</li>
                <li>Endereço do consultório</li>
                <li>Horário de atendimento</li>
            </ul>
            
            <h3>🎨 Aba Aparência</h3>
            <h4>Temas</h4>
            <ul>
                <li>Escolha entre 10+ temas de cores</li>
                <li>Modo claro/escuro</li>
                <li>Preview em tempo real</li>
            </ul>
            
            <h4>Personalização</h4>
            <ul>
                <li>Logo personalizado</li>
                <li>Cores primária e secundária</li>
                <li>Fonte do sistema</li>
            </ul>
            
            <h3>✍️ Aba Assinatura</h3>
            <h4>Criar Assinatura Digital</h4>
            <ol>
                <li>Desenhe com mouse/touch</li>
                <li>Ou faça upload de imagem</li>
                <li>Ajuste tamanho e posição</li>
                <li>Salve para usar em documentos</li>
            </ol>
            
            <h3>🔐 Aba Segurança</h3>
            <ul>
                <li>Alterar senha</li>
                <li>Autenticação em dois fatores (2FA)</li>
                <li>Sessões ativas</li>
                <li>Log de atividades</li>
            </ul>
            
            <h3>🔔 Aba Notificações</h3>
            <h4>Configurar Alertas</h4>
            <ul>
                <li>Email para novos agendamentos</li>
                <li>WhatsApp para lembretes</li>
                <li>Push para mensagens</li>
                <li>Frequência de resumos</li>
            </ul>
            
            <h3>🔗 Aba Integrações</h3>
            <h4>Conectar Serviços</h4>
            <ul>
                <li><strong>Google Calendar:</strong> Sincronizar agenda</li>
                <li><strong>WhatsApp Business:</strong> Enviar mensagens</li>
                <li><strong>Stripe/PagSeguro:</strong> Receber pagamentos</li>
                <li><strong>Google Drive:</strong> Backup automático</li>
            </ul>
            
            <h3>⚙️ Aba Avançado</h3>
            <h4>Sala de Espera</h4>
            <ul>
                <li>Mensagem de boas-vindas</li>
                <li>Vídeo de apresentação</li>
                <li>Música de fundo</li>
                <li>Tempo máximo de espera</li>
            </ul>
            
            <h4>API e Webhooks</h4>
            <ul>
                <li>Gerar chaves de API</li>
                <li>Configurar webhooks</li>
                <li>Documentação técnica</li>
            </ul>
        `,
        subsections: [
            {
                title: 'Configurar Perfil',
                videoUrl: null
            },
            {
                title: 'Escolher Tema',
                videoUrl: null
            },
            {
                title: 'Criar Assinatura',
                videoUrl: null
            },
            {
                title: 'Configurar Integrações',
                videoUrl: null
            }
        ]
    }
};

export const searchContent = (query) => {
    const results = [];
    const lowerQuery = query.toLowerCase();

    Object.values(helpSections).forEach(section => {
        // Search in title
        if (section.title.toLowerCase().includes(lowerQuery)) {
            results.push({
                type: 'section',
                section: section,
                match: 'title'
            });
        }

        // Search in content
        if (section.content.toLowerCase().includes(lowerQuery)) {
            results.push({
                type: 'section',
                section: section,
                match: 'content'
            });
        }

        // Search in subsections
        section.subsections?.forEach(sub => {
            if (sub.title.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'subsection',
                    section: section,
                    subsection: sub,
                    match: 'subsection'
                });
            }
        });
    });

    return results;
};
