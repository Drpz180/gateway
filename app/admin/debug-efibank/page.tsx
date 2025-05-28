"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function DebugEfiBankPage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [envStatus, setEnvStatus] = useState<any>(null)

  useEffect(() => {
    // Carregar status das variáveis de ambiente do servidor
    loadEnvStatus()
  }, [])

  const loadEnvStatus = async () => {
    try {
      const response = await fetch("/api/admin/efibank-env-status")
      const data = await response.json()
      setEnvStatus(data)
    } catch (error) {
      console.error("Erro ao carregar status das variáveis:", error)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/efibank-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      // Verificar se a resposta é JSON
      const contentType = response.headers.get("content-type")
      console.log("Content-Type da resposta:", contentType)

      if (!contentType?.includes("application/json")) {
        const text = await response.text()
        console.error("Resposta não é JSON:", text)
        setResult({
          success: false,
          message: "Resposta da API não é JSON",
          details: {
            "Content-Type": contentType,
            Status: response.status,
            Resposta: text.substring(0, 1000),
          },
        })
        return
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Erro no teste:", error)
      setResult({
        success: false,
        message: `Erro: ${error.message}`,
        details: {
          "Tipo do Erro": error.constructor.name,
          Stack: error.stack,
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
        <h1 className="text-2xl font-bold">Debug EfiBank</h1>
        <Badge variant="outline">Diagnóstico Avançado</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Conexão Detalhado</CardTitle>
          <CardDescription>Diagnóstico completo da integração com EfiBank</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              "Executar Teste Completo"
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
                  <span className="font-medium">{result.success ? "Sucesso" : "Erro"}</span>
                </div>
                <p className="text-sm">{result.message}</p>
              </div>

              {result.details && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalhes Técnicos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(result.details).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium text-sm">{key}:</span>
                          <div className="flex items-center gap-2">
                            {typeof value === "boolean" ? (
                              <>
                                {getStatusIcon(value)}
                                <span className="text-sm">{value ? "Sim" : "Não"}</span>
                              </>
                            ) : (
                              <span className="text-sm font-mono max-w-xs truncate" title={String(value)}>
                                {String(value)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.error && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Erro Detalhado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">{result.error}</pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {envStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Variáveis de Ambiente</CardTitle>
            <CardDescription>Status das configurações necessárias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(envStatus).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{key}:</span>
                  {getStatusIcon(Boolean(value))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
