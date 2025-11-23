# 🚀 GUIA DE INSTALAÇÃO E USO - KALON OS
**Versão**: Visual Padronizada  
**Data**: Outubro 2025

---

## 📋 PRÉ-REQUISITOS

### **Sistema Operacional:**
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 18.04+)

### **Software Necessário:**
- ✅ **Node.js** 16.0 ou superior
- ✅ **npm** 8.0 ou superior
- ✅ **Git** (para controle de versão)

---

## 📦 PREPARAÇÃO PRÉVIA (RECOMENDADO)

> **💡 Importante**: Organizar tudo antes de começar garantirá uma experiência completa e fluida desde o primeiro uso do sistema!

Antes de iniciar a instalação e configuração do Kalon OS, recomendamos que você prepare sua estrutura de arquivos e contas. Isso permitirá que você tenha uma experiência completa desde o primeiro uso.

### **1. Estrutura de Pastas na Nuvem**

Crie uma pasta principal no seu serviço de nuvem preferido (**Google Drive**, **Dropbox**, **OneDrive** ou similar) com o seguinte nome:

**Pasta Principal:** `Kalon OS - [Seu Nome]`

Dentro desta pasta, crie as seguintes subpastas seguindo exatamente esta estrutura:

```
Kalon OS - [Seu Nome]/
│
├── 📁 01_CLIENTES/
│   ├── 📁 Cliente_001_[Nome do Cliente]/
│   │   ├── 📁 Fichas/
│   │   ├── 📁 Consultas/
│   │   ├── 📁 Documentos/
│   │   ├── 📁 Gravações/
│   │   └── 📁 Arquivos_Compartilhados/
│   ├── 📁 Cliente_002_[Nome do Cliente]/
│   └── ... (uma pasta para cada cliente)
│
├── 📁 02_MATERIAIS_CONSULTA/
│   ├── 📁 Músicas_Relaxamento/
│   ├── 📁 Frequências/
│   ├── 📁 Vídeos_Terapêuticos/
│   ├── 📁 Áudios_Guia/
│   └── 📁 Meditações/
│
├── 📁 03_DOCUMENTOS_LEGAIS/
│   ├── 📁 Receituários/
│   ├── 📁 Recibos/
│   ├── 📁 Termos_Consentimento/
│   └── 📁 Contratos/
│
├── 📁 04_ARQUIVOS_SISTEMA/
│   ├── 📁 Logos/
│   ├── 📁 Fotos_Profissional/
│   ├── 📁 Backgrounds/
│   └── 📁 Templates/
│
├── 📁 05_FINANCEIRO/
│   ├── 📁 Comprovantes_Pagamento/
│   ├── 📁 Relatórios/
│   └── 📁 Declarações/
│
└── 📁 06_BACKUP/
    └── (para cópias de segurança)
```

#### **📋 Explicação das Pastas:**

- **01_CLIENTES/**: Cada cliente terá sua própria pasta numerada com nome completo. Dentro dela, 5 subpastas para organizar todo o conteúdo relacionado.
- **02_MATERIAIS_CONSULTA/**: Materiais que você usará durante as sessões (músicas, frequências, vídeos).
- **03_DOCUMENTOS_LEGAIS/**: Documentos gerados pelo sistema (receituários, recibos, termos).
- **04_ARQUIVOS_SISTEMA/**: Imagens e arquivos para personalização do sistema (logos, fotos, backgrounds).
- **05_FINANCEIRO/**: Documentos financeiros e comprovantes.
- **06_BACKUP/**: Cópias de segurança periódicas.

#### **✅ Dica Importante:**
- O sistema pode ser configurado para conectar automaticamente à pasta `02_MATERIAIS_CONSULTA/Músicas_Relaxamento/` para carregar músicas no Player
- Os documentos gerados serão salvos automaticamente nas pastas correspondentes
- As gravações das sessões serão organizadas automaticamente nas pastas dos clientes

---

### **2. Conta de Videoconferência (Opcional - Pode Fazer Depois)**

O Kalon OS funciona com plataformas de videoconferência para as consultas online. Você pode criar sua conta antes ou depois da instalação.

#### **Opção A: Whereby (Recomendado para iniciantes)**
- 🌐 **Site**: [whereby.com/signup](https://whereby.com/signup)
- ✅ **Gratuito** até 4 participantes por sala
- ✅ Interface simples e intuitiva
- ✅ Não precisa instalar nada
- ✅ Funciona direto no navegador

**Como fazer:**
1. Acesse [whereby.com/signup](https://whereby.com/signup)
2. Crie sua conta (gratuita)
3. Escolha um nome para sua sala (ex: `seu-nome-consulta`)
4. Copie o link da sua sala (ex: `https://whereby.com/seu-nome-consulta`)
5. Você usará este link nas configurações do Kalon OS

#### **Opção B: Jitsi Meet (Totalmente gratuito)**
- 🌐 **Site**: [jitsi.org/get-started/](https://jitsi.org/get-started/)
- ✅ **100% gratuito** e ilimitado
- ✅ Código aberto
- ✅ Você pode hospedar seu próprio servidor
- ⚠️ Requer mais configuração inicial

**Como fazer:**
1. Acesse [jitsi.org/get-started/](https://jitsi.org/get-started/)
2. Siga as instruções para criar sua sala
3. Ou use o serviço público: [meet.jit.si](https://meet.jit.si)
4. Copie o link da sua sala
5. Você usará este link nas configurações do Kalon OS

#### **💡 Quando Configurar:**
- ✅ **Agora**: Se quiser ter tudo pronto antes de começar
- ✅ **Depois**: O sistema funciona sem o link, você só não poderá iniciar videoconferências até configurar

---

### **📝 Checklist de Preparação:**

Antes de começar a instalação, verifique:

- [ ] Pasta principal "Kalon OS - [Seu Nome]" criada na nuvem
- [ ] Todas as 6 pastas principais criadas (01 a 06)
- [ ] Subpastas dentro de cada pasta principal criadas
- [ ] Permissões da pasta configuradas (se compartilhar)
- [ ] Conta Whereby ou Jitsi criada (ou marcado para fazer depois)
- [ ] Link da sala de videoconferência copiado (se já criou)

**⏱️ Tempo estimado:** 15-20 minutos para organizar tudo

---

## 🔧 INSTALAÇÃO

### **1. Clone do Repositório**
```bash
git clone https://github.com/seu-usuario/kalon-os.git
cd kalon-os
```

### **2. Instalação de Dependências**
```bash
npm install
```

### **3. Configuração do Ambiente**
```bash
# Copiar arquivo de configuração
cp .env.example .env.local

# Editar variáveis de ambiente (se necessário)
nano .env.local
```

### **4. Executar o Projeto**
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm run build
npm start
```

### **5. Acessar a Aplicação**
- 🌐 **URL**: http://localhost:3000
- 🔐 **Login**: Use suas credenciais

---

## 🎨 SISTEMA DE TEMAS

### **Temas Disponíveis:**
1. **Verde** (padrão) - Cores naturais e relaxantes
2. **Azul** - Cores profissionais e confiáveis  
3. **Caramelo** - Cores quentes e acolhedoras

### **Como Alterar o Tema:**
1. Acesse **Configurações** → **Identidade**
2. Selecione o tema desejado
3. O sistema aplicará automaticamente

### **Persistência:**
- ✅ Tema salvo no navegador
- ✅ Mantido entre sessões
- ✅ Aplicado em todas as páginas

---

## 🖥️ NAVEGAÇÃO DO SISTEMA

### **Páginas Principais:**

#### **🏠 INÍCIO**
- Dashboard principal
- Acesso rápido a todas as funcionalidades
- Logo personalizado com tema

#### **👤 CADASTRO**
- Gerenciamento de clientes
- Formulários padronizados
- Validação automática

#### **📹 CONSULTAS**
- Sessões de vídeo online
- Janelas draggable organizadas
- Controles de gravação

#### **📅 AGENDAMENTOS**
- Calendário interativo
- Criação de sessões
- Gestão de horários

#### **📄 DOCUMENTOS**
- Receituários digitais
- Termos e contratos
- Assinatura eletrônica

#### **💰 FINANCEIRO**
- Controle de pagamentos
- Relatórios financeiros
- Integração com bancos

#### **⚙️ CONFIGURAÇÕES**
- Personalização do sistema
- Configurações avançadas
- Gerenciamento de usuários

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### **1. Sistema de Temas Dinâmico**
- **Aplicação automática** em todos os componentes
- **Contraste otimizado** para acessibilidade
- **Persistência** entre sessões

### **2. Interface Responsiva**
- **Adaptação automática** a diferentes telas
- **Navegação fluida** entre páginas
- **Componentes otimizados** para mobile

### **3. Janelas Draggable**
- **Posicionamento inteligente** para evitar sobreposição
- **Redimensionamento** com limites
- **Persistência** de posições

### **4. Sistema de Contraste**
- **Cores escuras**: Texto branco + negrito
- **Cores claras**: Texto cor primária + negrito
- **Visibilidade máxima** em todos os elementos

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### **Acessibilidade:**
- **Alto contraste** disponível
- **Tamanhos de fonte** ajustáveis
- **Navegação por teclado** suportada

### **Personalização:**
- **Temas personalizados** (desenvolvedores)
- **Cores customizadas** (configuração avançada)
- **Layout adaptável** (preferências do usuário)

### **Performance:**
- **Carregamento otimizado** de temas
- **Cache inteligente** de componentes
- **Lazy loading** de páginas

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### **Problemas Comuns:**

#### **Tema não aplica:**
```bash
# Limpar cache do navegador
Ctrl + F5 (Windows/Linux)
Cmd + Shift + R (macOS)
```

#### **Ícones não aparecem:**
- Verificar conexão com internet
- Limpar cache do navegador
- Reiniciar aplicação

#### **Janelas não abrem:**
- Verificar JavaScript habilitado
- Limpar localStorage: `localStorage.clear()`
- Recarregar página

#### **Cores não atualizam:**
- Verificar se tema foi salvo
- Limpar cache do navegador
- Reiniciar aplicação

### **Logs de Debug:**
```bash
# Modo debug
npm run dev -- --debug

# Verificar console do navegador
F12 → Console
```

---

## 📱 COMPATIBILIDADE

### **Navegadores Suportados:**
- ✅ **Chrome** 90+
- ✅ **Firefox** 88+
- ✅ **Safari** 14+
- ✅ **Edge** 90+

### **Dispositivos:**
- ✅ **Desktop** (Windows, macOS, Linux)
- ✅ **Tablet** (iPad, Android)
- ✅ **Mobile** (iOS, Android)

---

## 🔒 SEGURANÇA

### **Autenticação:**
- **Login seguro** com validação
- **Sessões protegidas** com timeout
- **Logout automático** por inatividade

### **Dados:**
- **Criptografia** de informações sensíveis
- **Backup automático** de configurações
- **Privacidade** respeitada

---

## 📞 SUPORTE

### **Documentação:**
- 📖 **README.md** - Informações básicas
- 📊 **RELATORIO_MELHORIAS_VISUAIS.md** - Detalhes técnicos
- 🎯 **Este guia** - Instalação e uso

### **Contato:**
- 📧 **Email**: suporte@kalon-os.com
- 💬 **Chat**: Sistema integrado
- 🐛 **Bugs**: GitHub Issues

---

## 🚀 PRÓXIMAS VERSÕES

### **Melhorias Planejadas:**
- 🎨 **Novos temas** personalizados
- 📱 **App mobile** nativo
- 🔄 **Sincronização** em tempo real
- 🤖 **IA integrada** para sugestões
- 📊 **Analytics** avançados

---

## ✅ CHECKLIST DE INSTALAÇÃO

### **Preparação Prévia:**
- [ ] Pasta principal "Kalon OS - [Seu Nome]" criada na nuvem
- [ ] Todas as 6 pastas principais criadas (01 a 06)
- [ ] Subpastas dentro de cada pasta principal criadas
- [ ] Conta Whereby ou Jitsi criada (ou marcado para fazer depois)
- [ ] Link da sala de videoconferência copiado (se já criou)

### **Instalação Técnica:**
- [ ] Node.js instalado (16.0+)
- [ ] npm instalado (8.0+)
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Aplicação executando (`npm run dev`)
- [ ] Acesso local funcionando (localhost:3000)

### **Configuração Inicial:**
- [ ] Login realizado com sucesso
- [ ] Tema aplicado corretamente
- [ ] Navegação funcionando
- [ ] Todas as páginas carregando
- [ ] Link de videoconferência configurado (nas Configurações)
- [ ] Pasta Google Drive conectada (nas Configurações)

---

## 🎉 CONCLUSÃO

O **Kalon OS** está pronto para uso com:

- ✅ **Interface moderna** e profissional
- ✅ **Sistema de temas** dinâmico
- ✅ **Contraste otimizado** para acessibilidade
- ✅ **Navegação intuitiva** e fluida
- ✅ **Funcionalidades completas** para gestão terapêutica

**Bem-vindo ao futuro da gestão terapêutica digital!** 🌟

---

*Guia atualizado em Outubro 2025*  
*Kalon OS - Sistema de Consciência Integrada*

