"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function DebugEfiBankSimplePage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testConnection = async () => {
    setTesting(true)
    setResult(null)

    try {
      console.log("🧪 Iniciando teste...")

      const response = await fetch("/api/admin/efibank-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      console.log("📡 Status da resposta:", response.status)
      console.log("📡 Headers:", Object.fromEntries(response.headers.entries()))

      // Ler como texto primeiro
      const responseText = await response.text()
      console.log("📄 Resposta bruta:", responseText)

      // Tentar fazer parse do JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Erro ao fazer parse:", parseError)
        setResult({
          success: false,
          message: "Resposta da API não é JSON válido",
          details: {
            "Status HTTP": response.status,
            "Content-Type": response.headers.get("content-type"),
            Resposta: responseText.substring(0, 1000),
            "Parse Error": parseError.message,
          },
        })
        return
      }

      setResult(data)
    } catch (error) {
      console.error("❌ Erro no teste:", error)
      setResult({
        success: false,
        message: `Erro: ${error.message}`,
        details: {
          "Tipo do Erro": error.constructor.name,
          Mensagem: error.message,
        },
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Debug EfiBank - Simples</h1>
        <Badge variant="outline">Teste Direto</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Conexão EfiBank</CardTitle>
          <CardDescription>Teste direto da API EfiBank sem dependências</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              "🚀 Testar Conexão EfiBank"
            )}
          </Button>

          {result && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border ${
                  result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{result.success ? "✅ Sucesso!" : "❌ Erro"}</span>
                </div>
                <p className="text-sm">{result.message}</p>
              </div>

              {result.details && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📋 Detalhes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(result.details).map(([key, value]) => (
                        <div key={key} className="flex items-start justify-between p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium">{key}:</span>
                          <div className="flex items-center gap-2 max-w-md">
                            {typeof value === "boolean" ? (
                              <>
                                {getStatusIcon(value)}
                                <span>{value ? "Sim" : "Não"}</span>
                              </>
                            ) : (
                              <span className="font-mono text-xs break-all">{String(value)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 Dicas de Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            • <strong>Status 401:</strong> Credenciais incorretas (Client ID/Secret)
          </p>
          <p>
            • <strong>Status 403:</strong> Certificado necessário ou chave PIX inválida
          </p>
          <p>
            • <strong>Status 500:</strong> Erro interno da EfiBank
          </p>
          <p>
            • <strong>Timeout:</strong> Problema de rede ou firewall
          </p>
          <p>
            • <strong>JSON inválido:</strong> EfiBank retornou HTML (erro de servidor)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
