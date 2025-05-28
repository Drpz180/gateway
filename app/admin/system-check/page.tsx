"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, Key, CreditCard, CheckCircle, XCircle, AlertTriangle, Globe } from "lucide-react"

interface SystemStatus {
  database: any
  environment: any
  efibank: any
  jwt: any
}

export default function SystemCheckPage() {
  const [isChecking, setIsChecking] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)

  const runSystemCheck = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/system-check")
      const data = await response.json()
      setSystemStatus(data)
    } catch (error) {
      console.error("Erro ao verificar sistema:", error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    runSystemCheck()
  }, [])

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = (status: boolean) => {
    return status ? "text-green-700" : "text-red-700"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Verificação do Sistema</h1>
        </div>
        <Button onClick={runSystemCheck} disabled={isChecking}>
          {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verificar Novamente
        </Button>
      </div>

      {systemStatus && (
        <div className="grid gap-6">
          {/* Status do Banco de Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Banco de Dados (Neon)
              </CardTitle>
              <CardDescription>Verificação da conexão e estrutura do banco</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.database.connected)}
                <span className={getStatusColor(systemStatus.database.connected)}>
                  {systemStatus.database.connected ? "✅ Conectado" : "❌ Desconectado"}
                </span>
              </div>

              {systemStatus.database.connected && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>Host:</strong> {systemStatus.database.host}
                  </p>
                  <p>
                    <strong>Database:</strong> {systemStatus.database.database}
                  </p>
                  <p>
                    <strong>Tabelas:</strong> {systemStatus.database.tables?.length || 0}
                  </p>
                  {systemStatus.database.tables && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {systemStatus.database.tables.map((table: string) => (
                        <Badge key={table} variant="outline">
                          {table}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {systemStatus.database.error && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-700">{systemStatus.database.error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status das Variáveis de Ambiente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Variáveis de Ambiente
              </CardTitle>
              <CardDescription>Verificação das configurações necessárias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(systemStatus.environment).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">{key}</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(!!value)}
                      <span className={`text-sm ${getStatusColor(!!value)}`}>
                        {value ? "Configurada" : "Não configurada"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status do EfiBank */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                EfiBank (Pagamentos PIX)
              </CardTitle>
              <CardDescription>Verificação da integração de pagamentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.efibank.configured)}
                <span className={getStatusColor(systemStatus.efibank.configured)}>
                  {systemStatus.efibank.configured ? "✅ Configurado" : "❌ Não configurado"}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Modo Sandbox:</span>
                  <Badge variant={systemStatus.efibank.sandbox ? "secondary" : "default"}>
                    {systemStatus.efibank.sandbox ? "Ativo" : "Produção"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Client ID:</span>
                  <span className={systemStatus.efibank.clientId ? "text-green-600" : "text-red-600"}>
                    {systemStatus.efibank.clientId ? "✅" : "❌"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Client Secret:</span>
                  <span className={systemStatus.efibank.clientSecret ? "text-green-600" : "text-red-600"}>
                    {systemStatus.efibank.clientSecret ? "✅" : "❌"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>PIX Key:</span>
                  <span className={systemStatus.efibank.pixKey ? "text-green-600" : "text-red-600"}>
                    {systemStatus.efibank.pixKey ? "✅" : "❌"}
                  </span>
                </div>
              </div>

              {systemStatus.efibank.testResult && (
                <div className="space-y-2">
                  <p className="font-medium">Teste de Conexão:</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.efibank.testResult.success)}
                    <span className={getStatusColor(systemStatus.efibank.testResult.success)}>
                      {systemStatus.efibank.testResult.message}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status do JWT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Autenticação JWT
              </CardTitle>
              <CardDescription>Verificação do sistema de autenticação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.jwt.configured)}
                <span className={getStatusColor(systemStatus.jwt.configured)}>
                  {systemStatus.jwt.configured ? "✅ Configurado" : "❌ Não configurado"}
                </span>
              </div>

              {systemStatus.jwt.testResult && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Teste de Token:</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.jwt.testResult.success)}
                    <span className={getStatusColor(systemStatus.jwt.testResult.success)}>
                      {systemStatus.jwt.testResult.message}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Geral */}
          <Card
            className={`border-2 ${
              systemStatus.database.connected && systemStatus.environment.JWT_SECRET && systemStatus.efibank.configured
                ? "border-green-200 bg-green-50"
                : "border-yellow-200 bg-yellow-50"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {systemStatus.database.connected &&
                systemStatus.environment.JWT_SECRET &&
                systemStatus.efibank.configured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                Status Geral do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemStatus.database.connected &&
              systemStatus.environment.JWT_SECRET &&
              systemStatus.efibank.configured ? (
                <p className="text-green-700">
                  ✅ Sistema totalmente configurado e pronto para uso! Todas as funcionalidades estão disponíveis.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-yellow-700">
                    ⚠️ Sistema parcialmente configurado. Algumas funcionalidades podem não funcionar:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
                    {!systemStatus.database.connected && <li>Banco de dados não conectado</li>}
                    {!systemStatus.environment.JWT_SECRET && <li>JWT não configurado - login não funcionará</li>}
                    {!systemStatus.efibank.configured && <li>EfiBank não configurado - pagamentos não funcionarão</li>}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
