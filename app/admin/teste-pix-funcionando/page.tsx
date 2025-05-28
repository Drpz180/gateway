"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Copy, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TestePixFuncionandoPage() {
  const [testingCredentials, setTestingCredentials] = useState(false)
  const [credentialsResult, setCredentialsResult] = useState<any>(null)
  const [generatingPix, setGeneratingPix] = useState(false)
  const [pixResult, setPixResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "João Silva",
    cpf: "12345678901",
    amount: "67,90",
    description: "Teste PIX Real - InfoPlatform",
  })
  const { toast } = useToast()

  const testCredentials = async () => {
    setTestingCredentials(true)
    setCredentialsResult(null)

    try {
      console.log("🚀 Iniciando teste de credenciais...")

      const response = await fetch("/api/pix/test-credentials")

      console.log("📡 Status da resposta:", response.status)
      console.log("📋 Headers:", Object.fromEntries(response.headers.entries()))

      // Verificar se a resposta é JSON
      const contentType = response.headers.get("content-type")
      console.log("📄 Content-Type:", contentType)

      if (!contentType?.includes("application/json")) {
        const text = await response.text()
        console.error("❌ Resposta não é JSON:", text.substring(0, 200))
        throw new Error(`Resposta não é JSON. Content-Type: ${contentType}. Resposta: ${text.substring(0, 100)}`)
      }

      const data = await response.json()
      console.log("📊 Dados recebidos:", data)

      setCredentialsResult(data)

      if (data.success) {
        toast({
          title: "✅ Credenciais válidas!",
          description: "Token obtido com sucesso da EfiBank",
        })
      } else {
        toast({
          title: "❌ Erro nas credenciais",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Erro ao testar credenciais:", error)

      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
        error: String(error),
      }

      setCredentialsResult(errorResult)

      toast({
        title: "❌ Erro",
        description: "Erro ao testar credenciais",
        variant: "destructive",
      })
    } finally {
      setTestingCredentials(false)
    }
  }

  const generatePix = async () => {
    setGeneratingPix(true)
    setPixResult(null)

    try {
      const response = await fetch("/api/pix/generate-real", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setPixResult(data)

      if (data.success) {
        toast({
          title: "🎉 PIX Real Criado!",
          description: `TXID: ${data.data.txid}`,
        })
      } else {
        toast({
          title: "❌ Erro ao gerar PIX",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao gerar PIX:", error)
      toast({
        title: "❌ Erro",
        description: "Erro ao gerar PIX",
        variant: "destructive",
      })
    } finally {
      setGeneratingPix(false)
    }
  }

  const copyPixCode = () => {
    if (pixResult?.data?.pixCopiaECola) {
      navigator.clipboard.writeText(pixResult.data.pixCopiaECola)
      toast({
        title: "✅ Copiado!",
        description: "Código PIX copiado para área de transferência",
      })
    }
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const formatCurrency = (value: string) => {
    value = value.replace(/\D/g, "")
    if (value === "") return ""

    const number = Number.parseInt(value, 10) / 100
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-6 w-6 text-green-500" />
        <h1 className="text-2xl font-bold">Teste PIX - Método que Funciona</h1>
        <Badge variant="default">Baseado no projeto anterior</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teste de Credenciais */}
        <Card>
          <CardHeader>
            <CardTitle>1. Teste de Credenciais</CardTitle>
            <CardDescription>Verificar se as credenciais EfiBank estão funcionando</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testCredentials} disabled={testingCredentials} className="w-full">
              {testingCredentials ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                "🔑 Testar Credenciais"
              )}
            </Button>

            {credentialsResult && (
              <div
                className={`p-4 rounded-lg border ${
                  credentialsResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {credentialsResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {credentialsResult.success ? "Credenciais Válidas" : "Erro nas Credenciais"}
                  </span>
                </div>
                <p className="text-sm mb-3">{credentialsResult.message}</p>

                {/* Detalhes do erro */}
                {!credentialsResult.success && (
                  <div className="space-y-2">
                    {credentialsResult.status && (
                      <div className="text-xs">
                        <strong>Status HTTP:</strong> {credentialsResult.status}
                      </div>
                    )}
                    {credentialsResult.contentType && (
                      <div className="text-xs">
                        <strong>Content-Type:</strong> {credentialsResult.contentType}
                      </div>
                    )}
                    {credentialsResult.responseText && (
                      <div className="text-xs">
                        <strong>Resposta:</strong>
                        <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {credentialsResult.responseText}
                        </pre>
                      </div>
                    )}
                    {credentialsResult.error && (
                      <div className="text-xs">
                        <strong>Erro:</strong> {credentialsResult.error}
                      </div>
                    )}
                  </div>
                )}

                {/* Variáveis de ambiente */}
                {credentialsResult.envVars && (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs font-medium">Variáveis de Ambiente:</div>
                    {Object.entries(credentialsResult.envVars).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span>{key}:</span>
                        <span>{typeof value === "boolean" ? (value ? "✅" : "❌") : String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Informações de sucesso */}
                {credentialsResult.success && (
                  <div className="mt-3 space-y-1 text-xs">
                    {credentialsResult.tokenType && (
                      <div>
                        <strong>Token Type:</strong> {credentialsResult.tokenType}
                      </div>
                    )}
                    {credentialsResult.expiresIn && (
                      <div>
                        <strong>Expires In:</strong> {credentialsResult.expiresIn}s
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geração de PIX */}
        <Card>
          <CardHeader>
            <CardTitle>2. Gerar PIX Real</CardTitle>
            <CardDescription>Criar uma cobrança PIX real usando a EfiBank</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                maxLength={14}
              />
            </div>

            <div>
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: formatCurrency(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <Button onClick={generatePix} disabled={generatingPix || !credentialsResult?.success} className="w-full">
              {generatingPix ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando PIX...
                </>
              ) : (
                "🎯 Gerar PIX Real"
              )}
            </Button>

            {!credentialsResult?.success && credentialsResult && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span>Teste as credenciais primeiro antes de gerar PIX</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resultado do PIX */}
      {pixResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {pixResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Resultado do PIX
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pixResult.success ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg border inline-block">
                      <img
                        src={pixResult.data.qrCode || "/placeholder.svg"}
                        alt="QR Code PIX"
                        className="w-48 h-48 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=192&width=192"
                        }}
                      />
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-4">R$ {pixResult.data.valor}</p>
                    <p className="text-sm text-gray-600">TXID: {pixResult.data.txid}</p>
                  </div>

                  {/* Informações */}
                  <div className="space-y-4">
                    <div>
                      <Label>Status</Label>
                      <Badge variant="outline">{pixResult.data.status}</Badge>
                    </div>

                    <div>
                      <Label>Código PIX (Copia e Cola)</Label>
                      <div className="flex gap-2">
                        <Input value={pixResult.data.pixCopiaECola} readOnly className="font-mono text-xs" />
                        <Button onClick={copyPixCode} variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">🎉 PIX Real Criado!</h4>
                      <p className="text-sm">
                        Este é um PIX real da EfiBank. Você pode usar seu app bancário para testar o pagamento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">{pixResult.message}</p>
                {pixResult.detalhes && (
                  <pre className="text-xs mt-2 bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify(pixResult.detalhes, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
