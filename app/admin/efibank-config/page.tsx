"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, Settings, CheckCircle, XCircle, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EfiBankConfigPage() {
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [config, setConfig] = useState({
    clientId: "",
    clientSecret: "",
    pixKey: "",
    sandbox: true,
    certificatePath: "",
    certificateBase64: "",
  })
  const [testResult, setTestResult] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Carregar configurações atuais (sem expor valores sensíveis)
    checkCurrentConfig()
  }, [])

  const checkCurrentConfig = async () => {
    try {
      const response = await fetch("/api/admin/efibank-config")
      const result = await response.json()

      if (result.success) {
        setConfig({
          clientId: result.config.clientId ? "***configurado***" : "",
          clientSecret: result.config.clientSecret ? "***configurado***" : "",
          pixKey: result.config.pixKey || "",
          sandbox: result.config.sandbox,
          certificatePath: result.config.certificatePath || "",
          certificateBase64: result.config.certificateBase64 ? "***configurado***" : "",
        })
      }
    } catch (error) {
      console.error("Erro ao carregar config:", error)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const testConnection = async () => {
    setTestLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/admin/efibank-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      const result = await response.json()
      setTestResult(result)

      if (result.success) {
        toast({
          title: "✅ Teste realizado com sucesso!",
          description: "Conexão com EfiBank funcionando",
        })
      } else {
        toast({
          title: "❌ Teste falhou",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Erro no teste",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configuração EfiBank</h1>
        <Badge variant={config.sandbox ? "secondary" : "destructive"}>{config.sandbox ? "SANDBOX" : "PRODUÇÃO"}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Credenciais EfiBank</CardTitle>
            <CardDescription>
              Configure suas credenciais da EfiBank para PIX.{" "}
              <a
                href="https://dev.efipay.com.br/docs/api-pix/credenciais/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Ver documentação <ExternalLink className="h-3 w-3" />
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="sandbox"
                checked={config.sandbox}
                onCheckedChange={(checked) => handleInputChange("sandbox", checked)}
              />
              <Label htmlFor="sandbox">Modo Sandbox (Homologação)</Label>
            </div>

            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={config.clientId}
                onChange={(e) => handleInputChange("clientId", e.target.value)}
                placeholder="Client_Id_..."
                type="password"
              />
            </div>

            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                value={config.clientSecret}
                onChange={(e) => handleInputChange("clientSecret", e.target.value)}
                placeholder="Client_Secret_..."
                type="password"
              />
            </div>

            <div>
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                value={config.pixKey}
                onChange={(e) => handleInputChange("pixKey", e.target.value)}
                placeholder="sua-chave@pix.com ou CPF/CNPJ"
              />
            </div>

            <div>
              <Label htmlFor="certificateBase64">Certificado Base64 (Produção)</Label>
              <textarea
                id="certificateBase64"
                value={config.certificateBase64}
                onChange={(e) => handleInputChange("certificateBase64", e.target.value)}
                placeholder="Cole aqui o conteúdo do certificado.p12 convertido em base64"
                className="w-full h-32 p-2 border rounded-md text-xs font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Converta seu certificado.p12 para base64: <code>base64 certificado.p12</code>
              </p>
            </div>

            <div>
              <Label htmlFor="certificatePath">OU Caminho do Certificado</Label>
              <Input
                id="certificatePath"
                value={config.certificatePath}
                onChange={(e) => handleInputChange("certificatePath", e.target.value)}
                placeholder="/path/to/certificate.p12"
              />
              <p className="text-xs text-gray-500 mt-1">Alternativa ao base64 (para ambiente local)</p>
            </div>

            <Button onClick={testConnection} disabled={testLoading} className="w-full">
              {testLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {testLoading ? "Testando..." : "🔍 Testar Conexão"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado do Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult ? (
                testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )
              ) : (
                <Settings className="h-5 w-5 text-gray-400" />
              )}
              Resultado do Teste
            </CardTitle>
            <CardDescription>
              {testResult
                ? testResult.success
                  ? "Conexão funcionando corretamente!"
                  : "Erro na conexão"
                : "Clique em 'Testar Conexão' para verificar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={testResult.success ? "default" : "destructive"}>
                    {testResult.success ? "SUCESSO" : "ERRO"}
                  </Badge>
                </div>

                {testResult.details && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Detalhes:</h4>
                    <ul className="text-sm space-y-1">
                      {Object.entries(testResult.details).map(([key, value]) => (
                        <li key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span
                            className={typeof value === "boolean" ? (value ? "text-green-600" : "text-red-600") : ""}
                          >
                            {typeof value === "boolean" ? (value ? "✅" : "❌") : String(value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {testResult.message && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm">{testResult.message}</p>
                  </div>
                )}

                {testResult.error && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600">{testResult.error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure as credenciais e teste a conexão</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documentação */}
      <Card>
        <CardHeader>
          <CardTitle>Como configurar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">1. Obter credenciais na EfiBank:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Acesse o painel da EfiBank</li>
                <li>Vá em API → Aplicações</li>
                <li>Crie uma nova aplicação PIX</li>
                <li>Copie o Client ID e Client Secret</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">2. Configurar chave PIX:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Use uma chave PIX válida (email, CPF, CNPJ ou aleatória)</li>
                <li>A chave deve estar cadastrada na sua conta EfiBank</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">3. Ambiente:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>Sandbox:</strong> Para testes (não processa pagamentos reais)
                </li>
                <li>
                  <strong>Produção:</strong> Para pagamentos reais (requer certificado)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
