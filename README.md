# InfoPlatform - Plataforma de Infoprodutos

Uma plataforma completa para criação, venda e gestão de infoprodutos digitais, inspirada nas melhores práticas da Cakto, Kiwify e Eduzz.

## 🚀 Funcionalidades Principais

### 🏗️ Editor Checkout Builder
- Sistema drag-and-drop para criação de páginas de venda
- Componentes personalizáveis (texto, imagem, vantagens, cronômetro, etc.)
- Preview em tempo real (desktop e mobile)
- Customização completa de cores, fontes e layout

### 🛍️ Sistema de Produtos
- CRUD completo de produtos
- Upload de imagens e arquivos
- Múltiplas ofertas por produto
- Sistema de aprovação por administrador
- Links públicos e de checkout únicos

### 📤 Verificação de Documentos
- Upload obrigatório de documentos no cadastro
- Validação de CPF, RG/CNH e selfie com documento
- Sistema de aprovação manual pelo admin
- Status de verificação em tempo real

### 🛠️ Painel Administrativo
- Dashboard com métricas completas
- Gestão de usuários e produtos
- Aprovação de documentos e produtos
- Relatórios de vendas e comissões

### 💳 Integração de Pagamentos
- Integração com EfiBank (PIX e Cartão)
- Split automático de comissões
- Webhook para confirmação de pagamentos
- Suporte a múltiplos métodos de pagamento

### 🔗 Sistema de Afiliados
- Links únicos de afiliado
- Comissões customizáveis por produto
- Painel de performance para afiliados
- Aprovação manual ou automática

### 🎖️ Sistema de Recompensas
- Placas por faturamento (Bronze, Prata, Ouro, Platina, Diamante)
- Ranking público de usuários
- Gamificação visual
- Metas progressivas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes (compatível com FastAPI)
- **Autenticação**: JWT com bcryptjs
- **Banco de Dados**: PostgreSQL/SQLite (Neon para produção)
- **Upload**: Sistema local com fallback para S3
- **Pagamentos**: EfiBank API
- **Deploy**: Vercel

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm/yarn/pnpm

### Instalação
\`\`\`bash
# Clone o repositório
git clone <repository-url>
cd infoproducts-platform

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute o projeto
npm run dev
\`\`\`

### Variáveis de Ambiente
\`\`\`env
# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@host/database"

# EfiBank API
EFIBANK_CLIENT_ID="your-client-id"
EFIBANK_CLIENT_SECRET="your-client-secret"
EFIBANK_SANDBOX=true

# AWS S3 (opcional)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_BUCKET_NAME="your-bucket"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
\`\`\`

## 🏗️ Estrutura do Projeto

\`\`\`
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Autenticação
│   │   ├── products/          # Produtos
│   │   ├── payments/          # Pagamentos
│   │   └── admin/             # Admin APIs
│   ├── auth/                  # Páginas de autenticação
│   ├── dashboard/             # Dashboard do usuário
│   ├── admin/                 # Painel administrativo
│   ├── checkout/              # Páginas de checkout
│   ├── marketplace/           # Marketplace público
│   └── produto/               # Páginas de produto
├── components/
│   ├── ui/                    # Componentes shadcn/ui
│   └── layouts/               # Layouts da aplicação
└── lib/                       # Utilitários e tipos
\`\`\`

## 🔐 Autenticação e Segurança

- **JWT**: Tokens seguros com expiração
- **bcrypt**: Hash de senhas
- **Validação**: Validação de entrada em todas as APIs
- **CORS**: Configuração adequada para produção
- **Upload**: Validação de tipos e tamanhos de arquivo

## 💰 Sistema de Pagamentos

### EfiBank Integration
- PIX instantâneo com QR Code
- Cartão de crédito em até 12x
- Split automático de comissões
- Webhooks para confirmação

### Fluxo de Pagamento
1. Cliente escolhe produto e forma de pagamento
2. Sistema cria cobrança no EfiBank
3. Cliente realiza pagamento
4. Webhook confirma pagamento
5. Acesso liberado automaticamente
6. Comissões distribuídas

## 🎯 Roadmap

### Fase 1 - MVP ✅
- [x] Sistema de autenticação
- [x] CRUD de produtos
- [x] Checkout básico
- [x] Painel administrativo

### Fase 2 - Funcionalidades Avançadas 🚧
- [x] Sistema de afiliados
- [x] Checkout builder
- [x] Sistema de recompensas
- [ ] Integração EfiBank completa

### Fase 3 - Otimizações 📋
- [ ] Cache e performance
- [ ] Analytics avançado
- [ ] Notificações push
- [ ] App mobile

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Email: suporte@infoplatform.com
- Discord: [Link do servidor]
- Documentação: [Link da documentação]

---

Desenvolvido com ❤️ para a comunidade de infoprodutores brasileiros.
# gateway
