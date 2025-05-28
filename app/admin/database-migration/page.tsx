"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function DatabaseMigrationPage() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [initResult, setInitResult] = useState<any>(null)

  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      const response = await fetch("/api/test-new-neon")
      const data = await response.json()
      setConnectionResult(data)
    } catch (error) {
      setConnectionResult({
        success: false,
        message: "Erro ao testar conexão",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const initializeDatabase = async () => {
    setIsInitializing(true)
    try {
      const response = await fetch("/api/init-new-database", {
        method: "POST",
      })
      const data = await response.json()
      setInitResult(data)

      // Testar conexão novamente após inicialização
      if (data.success) {
        setTimeout(() => {
          testConnection()
        }, 1000)
      }
    } catch (error) {
      setInitResult({
        success: false,
        message: "Erro ao inicializar banco",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Migração do Banco de Dados</h1>
      </div>

      {/* Teste de Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Teste de Conexão
          </CardTitle>
          <CardDescription>Verificar se a conexão com o novo banco Neon está funcionando</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={isTestingConnection} className="w-full">
            {isTestingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Testar Conexão
          </Button>

          {connectionResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {connectionResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={connectionResult.success ? "text-green-700" : "text-red-700"}>
                  {connectionResult.message}
                </span>
              </div>

              {connectionResult.success && connectionResult.data && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>Hora do Banco:</strong> {new Date(connectionResult.data.currentTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>Versão:</strong> {connectionResult.data.dbVersion}
                  </p>
                  <p>
                    <strong>Tabelas Encontradas:</strong> {connectionResult.data.counts.totalTables}
                  </p>

                  {connectionResult.data.tables.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Tabelas:</p>
                      <div className="flex flex-wrap gap-1">
                        {connectionResult.data.tables.map((table: any) => (
                          <Badge key={table.name} variant="outline">
                            {table.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="font-medium">Variáveis de Ambiente:</p>
                      <div className="space-y-1 text-sm">
                        {Object.entries(connectionResult.data.environment).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className={value === "✅ Configurada" ? "text-green-600" : "text-red-600"}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {connectionResult.data.sampleData && (
                      <div>
                        <p className="font-medium">Dados de Exemplo:</p>
                        <div className="space-y-1 text-sm">
                          <p>Usuários: {connectionResult.data.counts.sampleUsers}</p>
                          <p>Produtos: {connectionResult.data.counts.sampleProducts}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!connectionResult.success && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-700">{connectionResult.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inicialização do Banco */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Inicialização do Banco
          </CardTitle>
          <CardDescription>Criar tabelas e inserir dados iniciais no novo banco</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={initializeDatabase}
            disabled={isInitializing || !connectionResult?.success}
            className="w-full"
            variant={connectionResult?.success ? "default" : "secondary"}
          >
            {isInitializing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Inicializar Banco de Dados
          </Button>

          {!connectionResult?.success && <p className="text-sm text-gray-600">Execute o teste de conexão primeiro</p>}

          {initResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {initResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={initResult.success ? "text-green-700" : "text-red-700"}>{initResult.message}</span>
              </div>

              {initResult.success && initResult.tables && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Tabelas Criadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {initResult.tables.map((table: string) => (
                      <Badge key={table} variant="default">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!initResult.success && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-700">{initResult.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Geral */}
      {connectionResult?.success && initResult?.success && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Migração Concluída
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              ✅ O banco de dados foi configurado com sucesso! Você pode agora usar a plataforma normalmente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
