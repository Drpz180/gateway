"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Copy, ExternalLink, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EfiBankOficialPage() {
  const [testingCredentials, setTestingCredentials] = useState(false)
  const [credentialsResult, setCredentialsResult] = useState<any>(null)
  const [generatingPix, setGeneratingPix] = useState(false)
  const [pixResult, setPixResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "João Silva",
    cpf: "12345678901",
    amount: "67,90",
    description: "Teste PIX Oficial - InfoPlatform",
  })
  const { toast } = useToast()

  const safeParseResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type")
    console.log("Content-Type:", contentType)
    console.log("Status:", response.status)

    try {
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        const text = await response.text()
        console.log("Resposta como texto:", text.substring(0, 200))

        // Tentar parsear como JSON mesmo se content-type estiver errado
        try {
          return JSON.parse(text)
        } catch {
          // Se não conseguir parsear, retornar um objeto com a resposta
          return {
            success: false,
            message: "Resposta não é JSON válido",
            rawResponse: text,
            status: response.status,
            contentType: contentType,
          }
        }
      }
    } catch (error) {
      console.error("Erro ao processar resposta:", error)
      return {
        success: false,
        message: "Erro ao processar resposta do servidor",
        error: String(error),
        status: response.status,
      }
    }
  }

  const testCredentials = async () => {
    setTestingCredentials(true)
    setCredentialsResult(null)

    try {
      console.log("🔍 Testando credenciais...")
      const response = await fetch("/api/pix/efibank-oficial")
      const data = await safeParseResponse(response)

      console.log("Dados recebidos:", data)
      setCredentialsResult(data)

      if (data.success) {
        toast({
          title: "✅ Credenciais válidas!",
          description: "Token EfiBank obtido com sucesso",
        })
      } else {
        toast({
          title: "❌ Erro nas credenciais",
          description: data.message || "Erro desconhecido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao testar credenciais:", error)
      const errorResult = {
        success: false,
        message: "Erro de conexão ou rede",
        error: String(error),
        type: "network_error",
      }
      setCredentialsResult(errorResult)
      toast({
        title: "❌ Erro de Rede",
        description: "Erro ao conectar com o servidor",
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
      console.log("🎯 Gerando PIX...")
      const response = await fetch("/api/pix/efibank-oficial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await safeParseResponse(response)
      console.log("Resultado PIX:", data)
      setPixResult(data)

      if (data.success) {
        toast({
          title: "🎉 PIX Real Criado!",
          description: `TXID: ${data.data?.txid || "N/A"}`,
        })
      } else {
        toast({
          title: "❌ Erro ao gerar PIX",
          description: data.message || "Erro desconhecido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao gerar PIX:", error)
      const errorResult = {
        success: false,
        message: "Erro de conexão ao gerar PIX",
        error: String(error),
      }
      setPixResult(errorResult)
      toast({
        title: "❌ Erro de Rede",
        description: "Erro ao conectar com o servidor",
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
        description: "Código PIX copiado",
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
        <Shield className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">EfiBank - Implementação Oficial</h1>
        <Badge variant="default">Seguindo documentação oficial</Badge>
        <a
          href="https://dev.efipay.com.br/docs/api-pix/credenciais/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Documentação
        </a>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Esta implementação segue exatamente a documentação oficial da EfiBank, incluindo autenticação OAuth2,
          certificados SSL e endpoints corretos.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teste de Credenciais */}
        <Card>
          <CardHeader>
            <CardTitle>1. Teste de Credenciais Oficial</CardTitle>
            <CardDescription>Verificar autenticação OAuth2 com a EfiBank</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testCredentials} disabled={testingCredentials} className="w-full">
              {testingCredentials ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando OAuth2...
                </>
              ) : (
                "🔐 Testar Credenciais OAuth2"
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
                    {credentialsResult.success ? "Autenticação Válida" : "Erro na Autenticação"}
                  </span>
                </div>
                <p className="text-sm mb-3">{credentialsResult.message}</p>

                {/* Debug Info */}
                {credentialsResult.status && (
                  <div className="text-xs bg-gray-100 p-2 rounded mb-3">
                    <div>
                      <strong>Status HTTP:</strong> {credentialsResult.status}
                    </div>
                    {credentialsResult.contentType && (
                      <div>
                        <strong>Content-Type:</strong> {credentialsResult.contentType}
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Response */}
                {credentialsResult.rawResponse && (
                  <div className="text-xs bg-yellow-50 p-2 rounded mb-3">
                    <div className="font-medium text-yellow-800 mb-1">Resposta Bruta:</div>
                    <div className="text-yellow-700 font-mono">
                      {credentialsResult.rawResponse.substring(0, 300)}...
                    </div>
                  </div>
                )}

                {/* Configuração */}
                {credentialsResult.config && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Configuração:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Client ID:</span>
                        <span>{credentialsResult.config.clientId ? "✅" : "❌"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Client Secret:</span>
                        <span>{credentialsResult.config.clientSecret ? "✅" : "❌"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Certificado:</span>
                        <span>{credentialsResult.config.certificate ? "✅" : "❌"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chave PIX:</span>
                        <span>{credentialsResult.config.pixKey ? "✅" : "❌"}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span>Ambiente:</span>
                        <span>{credentialsResult.config.sandbox ? "🧪 Sandbox" : "🏭 Produção"}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span>Base URL:</span>
                        <span className="font-mono text-xs">{credentialsResult.config.baseUrl}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos faltando */}
                {credentialsResult.missing && credentialsResult.missing.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded">
                    <div className="text-xs font-medium text-yellow-800">Campos faltando:</div>
                    <div className="text-xs text-yellow-700">{credentialsResult.missing.join(", ")}</div>
                  </div>
                )}

                {/* Detalhes do erro */}
                {credentialsResult.details && (
                  <div className="mt-3 p-2 bg-blue-50 rounded">
                    <div className="text-xs font-medium text-blue-800">Sugestão:</div>
                    <div className="text-xs text-blue-700">{credentialsResult.details.suggestion}</div>
                  </div>
                )}

                {/* Erro detalhado */}
                {credentialsResult.error && (
                  <div className="mt-3 p-2 bg-red-50 rounded">
                    <div className="text-xs font-medium text-red-800">Erro:</div>
                    <div className="text-xs text-red-700 font-mono">{credentialsResult.error}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geração de PIX */}
        <Card>
          <CardHeader>
            <CardTitle>2. Gerar PIX Real Oficial</CardTitle>
            <CardDescription>Criar cobrança PIX usando API oficial da EfiBank</CardDescription>
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

            <Button onClick={generatePix} disabled={generatingPix} className="w-full">
              {generatingPix ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando PIX...
                </>
              ) : (
                "🎯 Criar PIX Oficial"
              )}
            </Button>

            {!credentialsResult?.success && credentialsResult && (
              <Alert>
                <AlertDescription>⚠️ Recomendado testar as credenciais primeiro</AlertDescription>
              </Alert>
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
              Resultado PIX Oficial
              {pixResult.environment && <Badge variant="outline">{pixResult.environment}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pixResult.success ? (
              <div className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    🎉 <strong>PIX Real criado com sucesso!</strong> {pixResult.message}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg border inline-block">
                      <img
                        src={pixResult.data?.qrCode || "/placeholder.svg"}
                        alt="QR Code PIX Oficial"
                        className="w-48 h-48 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=192&width=192"
                        }}
                      />
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-4">R$ {pixResult.data?.valor}</p>
                    <p className="text-sm text-gray-600">TXID: {pixResult.data?.txid}</p>
                    <Badge variant="outline" className="mt-2">
                      {pixResult.data?.status}
                    </Badge>
                  </div>

                  {/* Informações */}
                  <div className="space-y-4">
                    <div>
                      <Label>Código PIX (Copia e Cola)</Label>
                      <div className="flex gap-2">
                        <Input value={pixResult.data?.pixCopiaECola || ""} readOnly className="font-mono text-xs" />
                        <Button onClick={copyPixCode} variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-green-800">✅ PIX Real da EfiBank!</h4>
                      <p className="text-sm text-green-700">
                        Este é um PIX real criado através da API oficial da EfiBank. Você pode usar qualquer app
                        bancário para efetuar o pagamento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erro:</strong> {pixResult.message}
                  </AlertDescription>
                </Alert>

                {/* Debug Info */}
                {pixResult.status && (
                  <div className="text-xs bg-gray-100 p-2 rounded">
                    <div>
                      <strong>Status HTTP:</strong> {pixResult.status}
                    </div>
                    {pixResult.contentType && (
                      <div>
                        <strong>Content-Type:</strong> {pixResult.contentType}
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Response */}
                {pixResult.rawResponse && (
                  <div className="text-xs bg-yellow-50 p-2 rounded">
                    <div className="font-medium text-yellow-800 mb-1">Resposta Bruta:</div>
                    <div className="text-yellow-700 font-mono">{pixResult.rawResponse.substring(0, 300)}...</div>
                  </div>
                )}

                {pixResult.details && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-800">💡 Sugestão:</h4>
                    <p className="text-sm text-blue-700">{pixResult.details.suggestion}</p>
                  </div>
                )}

                {pixResult.error && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Detalhes do Erro:</h4>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{pixResult.error}</pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
