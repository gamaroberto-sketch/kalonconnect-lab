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
        subsections: []
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
