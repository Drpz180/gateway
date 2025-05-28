"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Book, Zap, Shield } from "lucide-react"
import AdminLayout from "@/components/layouts/AdminLayout"

export default function DocumentacaoApiPage() {
  const endpoints = [
    {
      method: "POST",
      path: "/api/payments/pix/create",
      description: "Criar cobrança PIX",
      body: {
        productId: "string",
        offerId: "string",
        amount: "number",
        buyerName: "string",
        buyerEmail: "string",
        buyerCpf: "string",
        description: "string",
      },
      response: {
        success: "boolean",
        txid: "string",
        qrCode: "string (base64)",
        copyPasteCode: "string",
        linkPagamento: "string",
        expiresAt: "string (ISO date)",
        amount: "number",
      },
    },
    {
      method: "POST",
      path: "/api/webhooks/efibank/pix",
      description: "Webhook de confirmação EfiBank",
      body: {
        evento: "string",
        cobranca: {
          txid: "string",
          valor: { original: "string" },
        },
      },
      response: {
        message: "string",
        txid: "string",
        status: "string",
      },
    },
    {
      method: "GET",
      path: "/api/dashboard/financeiro",
      description: "Dados financeiros do vendedor",
      headers: {
        Authorization: "Bearer {token}",
      },
      response: {
        saldo: {
          saldoDisponivel: "number",
          saldoTotalRecebido: "number",
          vendasMes: "number",
          ticketMedio: "number",
        },
        vendas: "array",
        saques: "array",
      },
    },
    {
      method: "POST",
      path: "/api/dashboard/saques",
      description: "Solicitar saque",
      headers: {
        Authorization: "Bearer {token}",
      },
      body: {
        valor: "number",
        pixKey: "string",
      },
      response: {
        message: "string",
        saque: "object",
      },
    },
  ]

  const webhookFlow = [
    {
      step: 1,
      title: "Cliente gera PIX",
      description: "Checkout chama /api/payments/pix/create",
      color: "bg-blue-500",
    },
    {
      step: 2,
      title: "EfiBank cria cobrança",
      description: "API externa gera QR Code e código PIX",
      color: "bg-purple-500",
    },
    {
      step: 3,
      title: "Cliente paga PIX",
      description: "Pagamento realizado no app bancário",
      color: "bg-green-500",
    },
    {
      step: 4,
      title: "EfiBank envia webhook",
      description: "POST para /api/webhooks/efibank/pix",
      color: "bg-orange-500",
    },
    {
      step: 5,
      title: "Sistema processa",
      description: "Atualiza saldo e registra venda",
      color: "bg-red-500",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Book className="h-8 w-8 mr-3 text-blue-600" />
            Documentação da API
          </h1>
          <p className="text-gray-600">Referência completa da integração EfiBank PIX</p>
        </div>

        <Tabs defaultValue="endpoints" className="space-y-4">
          <TabsList>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo de Pagamento</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-4">
            <div className="grid gap-6">
              {endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Badge variant={endpoint.method === "POST" ? "default" : "secondary"} className="mr-3">
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </CardTitle>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {endpoint.headers && (
                      <div>
                        <h4 className="font-semibold mb-2">Headers:</h4>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                          <code>{JSON.stringify(endpoint.headers, null, 2)}</code>
                        </pre>
                      </div>
                    )}

                    {endpoint.body && (
                      <div>
                        <h4 className="font-semibold mb-2">Request Body:</h4>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                          <code>{JSON.stringify(endpoint.body, null, 2)}</code>
                        </pre>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Response:</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        <code>{JSON.stringify(endpoint.response, null, 2)}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fluxo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo Completo de Pagamento PIX</CardTitle>
                <CardDescription>Sequência de eventos desde a criação até a confirmação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {webhookFlow.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div
                        className={`w-8 h-8 ${item.color} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}
                      >
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Webhook</CardTitle>
                <CardDescription>Como configurar e testar webhooks da EfiBank</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">URL do Webhook:</h4>
                  <code className="bg-gray-100 p-2 rounded block">
                    https://seu-dominio.com/api/webhooks/efibank/pix
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Eventos Suportados:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <code>cobranca_paga</code> - Pagamento confirmado
                    </li>
                    <li>
                      <code>cobranca_vencida</code> - Cobrança expirada
                    </li>
                    <li>
                      <code>cobranca_cancelada</code> - Cobrança cancelada
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Exemplo de Payload:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <code>
                      {JSON.stringify(
                        {
                          evento: "cobranca_paga",
                          cobranca: {
                            txid: "TXN1234567890ABCDEF",
                            valor: {
                              original: "80.00",
                            },
                            status: "CONCLUIDA",
                          },
                        },
                        null,
                        2,
                      )}
                    </code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Teste Local:</h4>
                  <p className="text-sm text-gray-600 mb-2">Para testar localmente, use o endpoint GET:</p>
                  <code className="bg-gray-100 p-2 rounded block text-sm">
                    GET /api/webhooks/efibank/pix?txid=SEU_TXID&status=paid
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Segurança e Boas Práticas
                </CardTitle>
                <CardDescription>Medidas de segurança implementadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Variáveis de Ambiente:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <code>PIX_CLIENT_ID</code> - ID do cliente EfiBank
                    </li>
                    <li>
                      <code>PIX_SECRET_KEY</code> - Chave secreta EfiBank
                    </li>
                    <li>
                      <code>PIX_BASE_URL</code> - URL base da API
                    </li>
                    <li>
                      <code>PIX_KEY</code> - Chave PIX para recebimento
                    </li>
                    <li>
                      <code>PIX_CERTIFICADO</code> - Certificado .p12 (base64)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Validações Implementadas:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Validação de assinatura do webhook</li>
                    <li>Prevenção de processamento duplicado</li>
                    <li>Validação de CPF e dados obrigatórios</li>
                    <li>Logs detalhados para auditoria</li>
                    <li>Timeout de 1 hora para cobranças PIX</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Monitoramento:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Logs de todas as transações</li>
                    <li>Alertas para falhas de webhook</li>
                    <li>Métricas de conversão de pagamento</li>
                    <li>Auditoria de alterações de saldo</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    Importante para Produção:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    <li>Configure certificado SSL válido</li>
                    <li>Implemente rate limiting nos endpoints</li>
                    <li>Configure backup automático do banco</li>
                    <li>Monitore logs de erro em tempo real</li>
                    <li>Teste webhooks em ambiente de homologação</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
