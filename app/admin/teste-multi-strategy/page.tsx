"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Target, Copy } from "lucide-react"

export default function TesteMultiStrategyPage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    valor: "67.90",
    cpf: "12345678901",
    nome: "João Silva",
    descricao: "Teste PIX Multi-Strategy - InfoPlatform",
  })

  const runTest = async () => {
    setTesting(true)
    setResult(null)

    try {
      console.log("🎯 Testando PIX com múltiplas estratégias...")

      const response = await fetch("/api/efibank-multi-strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          valor: Number.parseFloat(formData.valor),
          cpf: formData.cpf,
          nome: formData.nome,
          descricao: formData.descricao,
        }),
      })

      const data = await response.json()
      setResult(data)

      console.log("📊 Resultado:", data)
    } catch (error) {
      console.error("❌ Erro no teste:", error)
      setResult({
        success: false,
        message: `Erro de conexão: ${error.message}`,
      })
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Teste PIX - Multi-Strategy</h1>
        <Badge variant="outline">Sandbox + Produção + Headers Alt</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados para Teste</CardTitle>
            <CardDescription>Teste com múltiplas estratégias de conexão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="12345678901"
              />
            </div>

            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>

            <Button onClick={runTest} disabled={testing} className="w-full">
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando estratégias...
                </>
              ) : (
                "🎯 Testar Multi-Strategy"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : result ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Target className="h-5 w-5 text-gray-400" />
              )}
              Resultado do PIX
            </CardTitle>
            <CardDescription>
              {result ? (result.mock ? "PIX Mock gerado" : "PIX Real gerado") : "Aguardando teste..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "✅ Sucesso" : "❌ Erro"}
                  </Badge>
                  {result.mock && <Badge variant="secondary">MOCK</Badge>}
                  {result.data?.environment && <Badge variant="outline">{result.data.environment.toUpperCase()}</Badge>}
                </div>

                <p className="text-sm">{result.message}</p>

                {result.success && result.data && (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded border">
                      <p className="text-sm font-medium">TXID: {result.data.txid}</p>
                      <p className="text-sm">Valor: R$ {result.data.valor.toFixed(2)}</p>
                      <p className="text-sm">Expira: {new Date(result.data.expiresAt).toLocaleString()}</p>
                      {result.data.environment && <p className="text-sm">Ambiente: {result.data.environment}</p>}
                    </div>

                    {result.data.qrCode && (
                      <div className="text-center">
                        <img
                          src={result.data.qrCode || "/placeholder.svg"}
                          alt="QR Code PIX"
                          className="mx-auto border rounded"
                          style={{ maxWidth: "200px" }}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          {result.mock ? "QR Code Mock" : "QR Code PIX Real"}
                        </p>
                      </div>
                    )}

                    {result.data.copyPasteCode && (
                      <div className="space-y-2">
                        <Label>Código Copia e Cola:</Label>
                        <div className="flex gap-2">
                          <Input value={result.data.copyPasteCode} readOnly className="font-mono text-xs" />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(result.data.copyPasteCode)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Preencha os dados e clique em "Testar Multi-Strategy"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Estratégias de Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span>1️⃣</span>
            <span>
              <strong>Sandbox primeiro:</strong> Testa ambiente de desenvolvimento (mais provável de funcionar)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span>2️⃣</span>
            <span>
              <strong>Produção:</strong> Testa ambiente real se sandbox falhar
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span>3️⃣</span>
            <span>
              <strong>Headers alternativos:</strong> Usa User-Agent e headers diferentes
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span>🔄</span>
            <span>
              <strong>Fallback mock:</strong> Se tudo falhar, gera PIX mock para desenvolvimento
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
