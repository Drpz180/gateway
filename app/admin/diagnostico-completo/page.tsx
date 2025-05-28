"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Wifi, Server, Shield } from "lucide-react"

export default function DiagnosticoCompletoPage() {
  const [testing, setTesting] = useState(false)
  const [connectivityResult, setConnectivityResult] = useState<any>(null)
  const [proxyResult, setProxyResult] = useState<any>(null)

  const testConnectivity = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/test-connectivity")
      const data = await response.json()
      setConnectivityResult(data)
    } catch (error) {
      setConnectivityResult({
        error: error.message,
        tests: [],
      })
    }
  }

  const testProxy = async () => {
    try {
      const response = await fetch("/api/efibank-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      setProxyResult(data)
    } catch (error) {
      setProxyResult({
        success: false,
        message: error.message,
      })
    } finally {
      setTesting(false)
    }
  }

  const runFullDiagnostic = async () => {
    setConnectivityResult(null)
    setProxyResult(null)
    await testConnectivity()
    await testProxy()
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Server className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Diagnóstico Completo - EfiBank</h1>
        <Badge variant="outline">Conectividade</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Teste de Conectividade
          </CardTitle>
          <CardDescription>Verifica se a Vercel consegue se conectar com diferentes serviços</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runFullDiagnostic} disabled={testing} className="w-full mb-4">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executando diagnóstico...
              </>
            ) : (
              "🔍 Executar Diagnóstico Completo"
            )}
          </Button>

          {connectivityResult && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Testes de Conectividade
              </h3>

              {connectivityResult.tests?.map((test: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">{test.name}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.success)}
                    <span className="text-sm">{test.success ? `Status: ${test.status}` : `Erro: ${test.error}`}</span>
                  </div>
                </div>
              ))}

              {connectivityResult.summary && (
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm">
                    <strong>Resumo:</strong> {connectivityResult.summary.success}/{connectivityResult.summary.total}{" "}
                    testes passaram
                  </p>
                </div>
              )}
            </div>
          )}

          {proxyResult && (
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Teste EfiBank via Proxy
              </h3>

              <div
                className={`p-4 rounded border ${
                  proxyResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(proxyResult.success)}
                  <span className="font-medium">
                    {proxyResult.success ? "✅ Conexão EfiBank OK!" : "❌ Falha na conexão"}
                  </span>
                </div>
                <p className="text-sm">{proxyResult.message}</p>

                {proxyResult.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">Ver detalhes</summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(proxyResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🛠️ Soluções Recomendadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p>
              <strong>Se Google funciona mas EfiBank não:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>A Vercel pode estar bloqueando a EfiBank</li>
              <li>Certificado SSL pode ser necessário</li>
              <li>IP da Vercel pode não estar na whitelist da EfiBank</li>
            </ul>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p>
              <strong>Soluções alternativas:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Usar webhook da EfiBank ao invés de polling</li>
              <li>Implementar proxy externo</li>
              <li>Usar Edge Functions da Vercel</li>
              <li>Manter sistema mock para desenvolvimento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
