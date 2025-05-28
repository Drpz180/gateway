"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { TestTube, QrCode, CheckCircle, AlertCircle, Copy } from "lucide-react"
import AdminLayout from "@/components/layouts/AdminLayout"

export default function TestePixPage() {
  const [testData, setTestData] = useState({
    productId: "1",
    offerId: "1",
    amount: 80.0,
    buyerName: "João da Silva",
    buyerEmail: "joao@teste.com",
    buyerCpf: "12345678901",
  })

  const [pixResult, setPixResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [webhookLoading, setWebhookLoading] = useState(false)

  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setTestData((prev) => ({
      ...prev,
      [field]: field === "amount" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const testCreatePix = async () => {
    setLoading(true)
    setPixResult(null)

    try {
      console.log("🧪 Testando criação de PIX...")

      const response = await fetch("/api/payments/pix/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...testData,
          description: `Teste PIX - ${testData.buyerName}`,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setPixResult(result)
        toast({
          title: "✅ PIX criado com sucesso!",
          description: `TXID: ${result.txid}`,
        })
      } else {
        throw new Error(result.message || "Erro ao criar PIX")
      }
    } catch (error) {
      console.error("Erro no teste:", error)
      toast({
        title: "❌ Erro no teste",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async (status: "paid" | "expired") => {
    if (!pixResult?.txid) return

    setWebhookLoading(true)

    try {
      console.log(`🧪 Testando webhook: ${status}`)

      const response = await fetch(`/api/webhooks/efibank/pix?txid=${pixResult.txid}&status=${status}`, {
        method: "GET",
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: `✅ Webhook ${status} processado!`,
          description: result.message,
        })
      } else {
        throw new Error(result.message || "Erro no webhook")
      }
    } catch (error) {
      console.error("Erro no webhook:", error)
      toast({
        title: "❌ Erro no webhook",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setWebhookLoading(false)
    }
  }

  const copyPixCode = () => {
    if (pixResult?.copyPasteCode) {
      navigator.clipboard.writeText(pixResult.copyPasteCode)
      toast({
        title: "📋 Copiado!",
        description: "Código PIX copiado para a área de transferência",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TestTube className="h-8 w-8 mr-3 text-blue-600" />
            Teste de Integração PIX
          </h1>
          <p className="text-gray-600">Teste a integração com EfiBank em ambiente controlado</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Teste */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Teste</CardTitle>
              <CardDescription>Configure os dados para testar a criação do PIX</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productId">ID do Produto</Label>
                  <Input
                    id="productId"
                    value={testData.productId}
                    onChange={(e) => handleInputChange("productId", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="offerId">ID da Oferta</Label>
                  <Input
                    id="offerId"
                    value={testData.offerId}
                    onChange={(e) => handleInputChange("offerId", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={testData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="buyerName">Nome do Comprador</Label>
                <Input
                  id="buyerName"
                  value={testData.buyerName}
                  onChange={(e) => handleInputChange("buyerName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="buyerEmail">Email do Comprador</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  value={testData.buyerEmail}
                  onChange={(e) => handleInputChange("buyerEmail", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="buyerCpf">CPF do Comprador</Label>
                <Input
                  id="buyerCpf"
                  value={testData.buyerCpf}
                  onChange={(e) => handleInputChange("buyerCpf", e.target.value)}
                  placeholder="Apenas números"
                />
              </div>

              <Button onClick={testCreatePix} disabled={loading} className="w-full">
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando PIX...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <QrCode className="h-4 w-4 mr-2" />
                    Criar PIX de Teste
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado do Teste */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado do Teste</CardTitle>
              <CardDescription>Resultado da criação do PIX e testes de webhook</CardDescription>
            </CardHeader>
            <CardContent>
              {!pixResult ? (
                <div className="text-center py-8">
                  <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Clique em "Criar PIX de Teste" para começar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      PIX Criado
                    </Badge>
                  </div>

                  {/* Dados do PIX */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">TXID:</span>
                      <span className="font-mono">{pixResult.txid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-medium">R$ {pixResult.amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expira em:</span>
                      <span>{new Date(pixResult.expiresAt).toLocaleString("pt-BR")}</span>
                    </div>
                    {pixResult.mock && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Modo:</span>
                        <Badge variant="secondary">Desenvolvimento</Badge>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* QR Code */}
                  {pixResult.qrCode && (
                    <div className="text-center">
                      <Label className="text-sm font-medium">QR Code PIX</Label>
                      <div className="bg-white p-4 rounded-lg border mt-2">
                        <img
                          src={`data:image/png;base64,${pixResult.qrCode}`}
                          alt="QR Code PIX"
                          className="mx-auto max-w-48"
                        />
                      </div>
                    </div>
                  )}

                  {/* Código Copia e Cola */}
                  <div>
                    <Label className="text-sm font-medium">Código PIX (Copia e Cola)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input value={pixResult.copyPasteCode} readOnly className="text-xs font-mono" />
                      <Button onClick={copyPixCode} size="sm" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Testes de Webhook */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Simular Webhooks</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => testWebhook("paid")}
                        disabled={webhookLoading}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Pago
                      </Button>
                      <Button
                        onClick={() => testWebhook("expired")}
                        disabled={webhookLoading}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Expirado
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como Testar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  <h3 className="font-semibold">Criar PIX</h3>
                </div>
                <p className="text-sm text-gray-600 ml-9">
                  Preencha os dados e clique em "Criar PIX de Teste" para gerar uma cobrança
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  <h3 className="font-semibold">Simular Pagamento</h3>
                </div>
                <p className="text-sm text-gray-600 ml-9">
                  Use os botões "Pago" ou "Expirado" para simular o webhook da EfiBank
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  <h3 className="font-semibold">Verificar Resultado</h3>
                </div>
                <p className="text-sm text-gray-600 ml-9">
                  Verifique o saldo do vendedor em "Usuários" e o histórico em "Financeiro"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
