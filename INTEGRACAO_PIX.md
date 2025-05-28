# 🔥 Integração EfiBank PIX - InfoPlatform

## 📋 Visão Geral

Esta documentação detalha a integração completa com a EfiBank (efipay) para pagamentos PIX na plataforma de infoprodutos.

## 🚀 Funcionalidades Implementadas

### ✅ **1. Geração Automática de Links**
- **Produto aprovado** → URLs geradas automaticamente
- **Link público**: `/produto/{slug}`
- **Links de checkout**: `/checkout/{slug}/{oferta_id}`

### ✅ **2. Pagamento PIX Completo**
- Integração com API EfiBank
- QR Code dinâmico
- Código copia-e-cola
- Expiração configurável (1 hora)
- Validação de CPF e dados

### ✅ **3. Webhook Automático**
- Confirmação em tempo real
- Processamento de saldo
- Cálculo de taxas
- Histórico de transações

### ✅ **4. Sistema Financeiro**
- Saldo disponível e total
- Histórico de vendas
- Solicitações de saque
- Configuração de taxas

## 🔧 Configuração

### Variáveis de Ambiente
\`\`\`bash
PIX_CLIENT_ID=Client_Id_51ad0bd205d25949896124b3b2fa5ced8937ce2d
PIX_SECRET_KEY=Client_Secret_2143914e88a9076aeb203ea92fccba93e26c7c98
PIX_BASE_URL=https://pix.api.efipay.com.br
PIX_KEY=3f792f3e-33f8-4f0e-af7c-c23232a18bc0
PIX_CERTIFICADO=[certificado .p12 em base64]
\`\`\`

### Estrutura do Banco
\`\`\`typescript
// Novas tabelas adicionadas:
- cobrancas: Pagamentos PIX
- saldos: Histórico financeiro  
- financialSettings: Configurações de taxas
- withdrawRequests: Solicitações de saque
\`\`\`

## 🛠️ APIs Implementadas

### **POST** `/api/payments/pix/create`
Cria uma nova cobrança PIX

**Request:**
\`\`\`json
{
  "productId": "1",
  "offerId": "1", 
  "amount": 80.00,
  "buyerName": "João Silva",
  "buyerEmail": "joao@email.com",
  "buyerCpf": "12345678901",
  "description": "Curso de Marketing Digital"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "txid": "TXN1234567890",
  "qrCode": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
  "copyPasteCode": "00020126580014br.gov.bcb.pix...",
  "linkPagamento": "https://pix.efipay.com.br/...",
  "expiresAt": "2024-01-15T15:30:00.000Z",
  "amount": 80.00
}
\`\`\`

### **POST** `/api/webhooks/efibank/pix`
Recebe confirmações de pagamento da EfiBank

**Webhook Payload:**
\`\`\`json
{
  "evento": "cobranca_paga",
  "cobranca": {
    "txid": "TXN1234567890",
    "valor": {
      "original": "80.00"
    }
  }
}
\`\`\`

### **GET** `/api/dashboard/financeiro`
Dados financeiros do vendedor (requer autenticação)

**Response:**
\`\`\`json
{
  "saldo": {
    "saldoDisponivel": 150.50,
    "saldoTotalRecebido": 500.00,
    "vendasMes": 8,
    "ticketMedio": 85.50
  },
  "vendas": [...],
  "saques": [...]
}
\`\`\`

## 💰 Sistema de Taxas

### Configuração Padrão
- **Taxa de retenção**: 10% sobre o valor da venda
- **Taxa fixa**: R$ 1,99 por venda
- **Taxa de saque PIX**: 1,5% sobre o valor do saque

### Exemplo de Cálculo
\`\`\`
Venda de R$ 80,00:
- Valor bruto: R$ 80,00
- Taxa de retenção (10%): -R$ 8,00
- Taxa fixa: -R$ 1,99
- Valor líquido: R$ 70,01
\`\`\`

## 🔄 Fluxo Completo

1. **Cliente acessa** `/produto/smartx`
2. **Escolhe oferta** e vai para `/checkout/smartx/1`
3. **Preenche dados** e clica "Pagar com PIX"
4. **Sistema gera PIX** via EfiBank API
5. **Cliente paga** no app bancário
6. **EfiBank envia webhook** confirmando pagamento
7. **Sistema processa** e credita saldo do vendedor
8. **Vendedor pode** solicitar saque

## 🧪 Como Testar

### 1. Teste Manual
1. Acesse `/admin/teste-pix`
2. Preencha os dados de teste
3. Clique "Criar PIX de Teste"
4. Use "Simular Webhook" para testar confirmação

### 2. Teste de Integração
\`\`\`bash
# Criar PIX
curl -X POST http://localhost:3000/api/payments/pix/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "offerId": "1",
    "amount": 80.00,
    "buyerName": "Teste",
    "buyerEmail": "teste@email.com",
    "buyerCpf": "12345678901"
  }'

# Simular webhook
curl "http://localhost:3000/api/webhooks/efibank/pix?txid=SEU_TXID&status=paid"
\`\`\`

## 🔐 Segurança

### Validações Implementadas
- ✅ Assinatura do webhook EfiBank
- ✅ Prevenção de processamento duplicado
- ✅ Validação de CPF e dados obrigatórios
- ✅ Logs detalhados para auditoria
- ✅ Timeout de expiração para cobranças

### Boas Práticas
- Todas as chaves sensíveis em variáveis de ambiente
- Logs de todas as transações
- Validação de entrada em todos os endpoints
- Rate limiting (recomendado para produção)

## 📊 Monitoramento

### Logs Importantes
\`\`\`bash
# Criação de PIX
💳 Cobrança criada: TXN123 - R$ 80.00

# Confirmação de pagamento  
💰 Pagamento confirmado: TXN123
💵 Cálculo financeiro: valorBruto=80, taxas=9.99, líquido=70.01
✅ Saldo adicionado: João Silva +R$ 70.01

# Solicitação de saque
💸 Solicitação de saque criada: João Silva - R$ 50.00
\`\`\`

### Métricas Recomendadas
- Taxa de conversão PIX
- Tempo médio de confirmação
- Volume de vendas por dia
- Valor médio por transação
- Taxa de chargebacks/estornos

## 🚀 Deploy em Produção

### Checklist Pré-Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Certificado SSL válido
- [ ] Webhook URL configurada na EfiBank
- [ ] Backup do banco de dados
- [ ] Monitoramento de logs ativo
- [ ] Teste de webhook em homologação

### Configuração EfiBank
1. Acesse o painel EfiBank
2. Configure a URL do webhook: `https://seu-dominio.com/api/webhooks/efibank/pix`
3. Ative os eventos: `cobranca_paga`, `cobranca_vencida`
4. Teste a conectividade

## 📞 Suporte

### Logs de Debug
Para ativar logs detalhados, defina:
\`\`\`bash
DEBUG=efibank:*
\`\`\`

### Problemas Comuns
1. **Webhook não recebido**: Verificar URL e SSL
2. **PIX não gerado**: Validar credenciais EfiBank
3. **Saldo não creditado**: Verificar logs do webhook
4. **Erro de certificado**: Validar PIX_CERTIFICADO

### Contatos
- **Suporte EfiBank**: suporte@efipay.com.br
- **Documentação**: https://dev.efipay.com.br
- **Status da API**: https://status.efipay.com.br

---

## 🎉 Conclusão

A integração está completa e pronta para produção! O sistema oferece:

- ✅ Pagamentos PIX automáticos
- ✅ Gestão financeira completa  
- ✅ Webhooks em tempo real
- ✅ Interface administrativa
- ✅ Testes automatizados
- ✅ Documentação completa

**Próximos passos**: Deploy, configuração do webhook na EfiBank e monitoramento em produção.
