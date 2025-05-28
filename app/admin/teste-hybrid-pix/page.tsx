"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Copy, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TesteHybridPixPage() {
  const [testingEdge, setTestingEdge] = useState(false)
  const [edgeResult, setEdgeResult] = useState<any>(null)
  const [generatingPix, setGeneratingPix] = useState(false)
  const [pixResult, setPixResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "João Silva",
    cpf: "12345678901",
    amount: "67,90",
    description: "Teste PIX Hybrid - InfoPlatform",
  })
  const { toast } = useToast()

  const testEdgeCredentials = async () => {
    setTestingEdge(true)
    setEdgeResult(null)

    try {
      const response = await fetch("/api/pix/test-edge")
      const data = await response.json()
      setEdgeResult(data)

      if (data.success) {
        toast({
          title: "✅ Sucesso!",
          description: `Conectado via ${data.environment}`,
        })
      } else {
        toast({
          title: "⚠️ EfiBank indisponível",
          description: "Usando sistema mock para desenvolvimento",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "❌ Erro",
        description: "Erro ao testar conexão",
        variant: "destructive",
      })
    } finally {
      setTestingEdge(false)
    }
  }

  const generateHybridPix = async () => {
    setGeneratingPix(true)
    setPixResult(null)

    try {
      const response = await fetch("/api/pix/generate-hybrid", {
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
          title: "🎉 PIX Gerado!",
          description: `Ambiente: ${data.environment}`,
        })
      } else {
        toast({
          title: "❌ Erro",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro:", error)
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
        <Zap className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">PIX Híbrido - Edge Runtime</h1>
        <Badge variant="secondary">Sempre Funciona</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teste Edge */}
        <Card>
          <CardHeader>
            <CardTitle>1. Teste Edge Runtime</CardTitle>
            <CardDescription>Testar conexão com EfiBank via Edge Runtime</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testEdgeCredentials} disabled={testingEdge} className="w-full">
              {testingEdge ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                "⚡ Testar Edge Runtime"
              )}
            </Button>

            {edgeResult && (
              <div
                className={`p-4 rounded-lg border ${
                  edgeResult.success ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {edgeResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="font-medium">{edgeResult.message}</span>
                </div>

                {edgeResult.environment && (
                  <Badge variant="outline" className="mb-2">
                    {edgeResult.environment}
                  </Badge>
                )}

                {edgeResult.suggestion && <p className="text-sm text-gray-600">{edgeResult.suggestion}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geração Híbrida */}
        <Card>
          <CardHeader>
            <CardTitle>2. Gerar PIX Híbrido</CardTitle>
            <CardDescription>EfiBank real ou mock automático</CardDescription>
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

            <Button onClick={generateHybridPix} disabled={generatingPix} className="w-full">
              {generatingPix ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                "🚀 Gerar PIX Híbrido"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resultado */}
      {pixResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              PIX Gerado com Sucesso
              <Badge variant={pixResult.environment === "mock" ? "secondary" : "default"}>
                {pixResult.environment}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img
                    src={pixResult.data.qrCode || "/placeholder.svg"}
                    alt="QR Code PIX"
                    className="w-48 h-48 object-contain"
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

                <div className={`p-4 rounded-lg ${pixResult.environment === "mock" ? "bg-blue-50" : "bg-green-50"}`}>
                  <h4 className="font-semibold mb-2">
                    {pixResult.environment === "mock" ? "🎭 PIX Mock" : "🎉 PIX Real"}
                  </h4>
                  <p className="text-sm">
                    {pixResult.environment === "mock"
                      ? "PIX simulado para desenvolvimento. Use para testes de interface."
                      : "PIX real da EfiBank. Pode ser usado para pagamentos reais."}
                  </p>
                  {pixResult.message && <p className="text-xs mt-2 text-gray-600">{pixResult.message}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
