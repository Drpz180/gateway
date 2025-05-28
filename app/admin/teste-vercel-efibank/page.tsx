"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Zap } from "lucide-react"

export default function TesteVercelEfiBankPage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runTest = async () => {
    setTesting(true)
    setResult(null)

    try {
      console.log("🚀 Iniciando teste EfiBank método Vercel...")

      const response = await fetch("/api/test-efibank-vercel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Teste EfiBank - Método Vercel</h1>
        <Badge variant="outline">Otimizado</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Teste com Implementação Otimizada
          </CardTitle>
          <CardDescription>Usando método que já funcionou em projetos anteriores na Vercel</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTest} disabled={testing} className="w-full mb-4">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando conexão EfiBank...
              </>
            ) : (
              "⚡ Testar EfiBank (Método Vercel)"
            )}
          </Button>

          {result && (
            <div
              className={`p-4 rounded border ${
                result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">{result.success ? "✅ Sucesso!" : "❌ Falha"}</span>
              </div>

              <p className="text-sm mb-3">{result.message}</p>

              {result.success && result.data && (
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded border">
                    <p className="text-sm font-medium">TXID: {result.data.txid}</p>
                    <p className="text-sm">Valor: R$ {result.data.valor.toFixed(2)}</p>
                    <p className="text-sm">Expira: {new Date(result.data.expiresAt).toLocaleString()}</p>
                  </div>

                  {result.data.qrCode && (
                    <div className="text-center">
                      <img
                        src={result.data.qrCode || "/placeholder.svg"}
                        alt="QR Code PIX"
                        className="mx-auto border rounded"
                        style={{ maxWidth: "200px" }}
                      />
                      <p className="text-xs text-gray-500 mt-2">QR Code PIX Real</p>
                    </div>
                  )}

                  {result.data.copyPasteCode && (
                    <div className="p-2 bg-gray-100 rounded">
                      <p className="text-xs font-medium mb-1">Código Copia e Cola:</p>
                      <p className="text-xs font-mono break-all">{result.data.copyPasteCode}</p>
                    </div>
                  )}
                </div>
              )}

              {result.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">Ver detalhes técnicos</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 Diferenças desta Implementação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span>✅</span>
            <span>Headers otimizados para Vercel</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✅</span>
            <span>Timeout configurado (15 segundos)</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✅</span>
            <span>User-Agent específico</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✅</span>
            <span>Método de requisição simplificado</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✅</span>
            <span>Tratamento de erro melhorado</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
