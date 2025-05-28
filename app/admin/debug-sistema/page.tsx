"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, Upload, ImageIcon, CheckCircle, XCircle, TestTube, Zap } from "lucide-react"
import AdminLayout from "@/components/layouts/AdminLayout"
import { useToast } from "@/hooks/use-toast"

interface SystemStatus {
  database: {
    accessible: boolean
    products: number
    users: number
    lastUpdate: string
    cache: any
    manager: any
  }
  upload: {
    accessible: boolean
    directory: string
    permissions: boolean
  }
  products: any[]
}

export default function DebugSistemaPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testFile, setTestFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [persistenceTest, setPersistenceTest] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      setLoading(true)
      console.log("🔍 Verificando status do sistema...")

      // Verificar produtos
      const productsResponse = await fetch("/api/products")
      const productsData = await productsResponse.json()

      // Verificar debug do banco
      const debugResponse = await fetch("/api/debug/database")
      const debugData = await debugResponse.json()

      const systemStatus: SystemStatus = {
        database: {
          accessible: productsResponse.ok,
          products: productsData.products?.length || 0,
          users: 0,
          lastUpdate: new Date().toISOString(),
          cache: debugData.cache || {},
          manager: debugData.manager || {},
        },
        upload: {
          accessible: true,
          directory: "/uploads/products/",
          permissions: true,
        },
        products: productsData.products || [],
      }

      setStatus(systemStatus)
      console.log("✅ Status do sistema verificado:", systemStatus)
    } catch (error) {
      console.error("❌ Erro ao verificar sistema:", error)
      toast({
        title: "Erro",
        description: "Erro ao verificar status do sistema",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testPersistence = async () => {
    try {
      console.log("🧪 Testando persistência...")

      const response = await fetch("/api/debug/test-persistence", {
        method: "POST",
      })

      const result = await response.json()
      setPersistenceTest(result)

      console.log("📊 Resultado do teste de persistência:", result)

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Teste de persistência passou!",
        })
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro no teste de persistência",
          variant: "destructive",
        })
      }

      // Atualizar status após teste
      await checkSystemStatus()
    } catch (error) {
      console.error("❌ Erro no teste de persistência:", error)
      toast({
        title: "Erro",
        description: "Erro ao executar teste de persistência",
        variant: "destructive",
      })
    }
  }

  const testUpload = async () => {
    if (!testFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para testar",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("🧪 Testando upload...")

      const formData = new FormData()
      formData.append("file", testFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      setUploadResult(result)

      console.log("📊 Resultado do teste:", result)

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Upload testado com sucesso!",
        })
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro no upload",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Erro no teste de upload:", error)
      toast({
        title: "Erro",
        description: "Erro ao testar upload",
        variant: "destructive",
      })
    }
  }

  const forceSync = async () => {
    try {
      console.log("🔄 Forçando sincronização...")

      const response = await fetch("/api/debug/force-sync", {
        method: "POST",
      })

      const result = await response.json()

      console.log("📊 Resultado da sincronização:", result)

      toast({
        title: "Sucesso",
        description: "Sincronização forçada executada!",
      })

      await checkSystemStatus()
    } catch (error) {
      console.error("❌ Erro na sincronização:", error)
      toast({
        title: "Erro",
        description: "Erro ao forçar sincronização",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Debug do Sistema</h1>
            <p className="text-gray-600">Verificação e diagnóstico do sistema híbrido</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={checkSystemStatus} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Status
            </Button>
            <Button onClick={forceSync} variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Forçar Sync
            </Button>
          </div>
        </div>

        {/* Status do Sistema Híbrido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Sistema Híbrido de Persistência</span>
            </CardTitle>
            <CardDescription>Status do sistema de cache + arquivo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {status?.database.accessible ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <p className="font-semibold">{status?.database.accessible ? "Online" : "Offline"}</p>
                <p className="text-sm text-gray-600">Sistema</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{status?.database.products || 0}</p>
                <p className="text-sm text-gray-600">Produtos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{status?.database.cache?.products || 0}</p>
                <p className="text-sm text-gray-600">Cache</p>
              </div>
              <div className="text-center">
                <Badge variant={status?.database.manager?.useFileSystem ? "default" : "secondary"}>
                  {status?.database.manager?.useFileSystem ? "Arquivo + Cache" : "Só Cache"}
                </Badge>
                <p className="text-sm text-gray-600">Modo</p>
              </div>
            </div>

            {status?.database.manager && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Detalhes do Sistema:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>Arquivo:</strong> {status.database.manager.useFileSystem ? "✅ Ativo" : "❌ Inativo"}
                  </div>
                  <div>
                    <strong>Cache:</strong> {status.database.manager.hasMemoryDb ? "✅ Ativo" : "❌ Inativo"}
                  </div>
                  <div>
                    <strong>Diretório:</strong> {status.database.manager.dataDir}
                  </div>
                  <div>
                    <strong>Arquivo DB:</strong> {status.database.manager.dbPath}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teste de Persistência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Teste de Persistência</span>
            </CardTitle>
            <CardDescription>Teste completo do sistema de persistência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testPersistence} className="w-full">
              <TestTube className="h-4 w-4 mr-2" />
              Executar Teste de Persistência
            </Button>

            {persistenceTest && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Resultado do Teste:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {persistenceTest.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={persistenceTest.success ? "text-green-700" : "text-red-700"}>
                      {persistenceTest.message}
                    </span>
                  </div>
                  {persistenceTest.productId && (
                    <p className="text-sm text-gray-600">ID do Produto: {persistenceTest.productId}</p>
                  )}
                  {persistenceTest.totalProducts && (
                    <p className="text-sm text-gray-600">Total de Produtos: {persistenceTest.totalProducts}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sistema de Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Sistema de Upload</span>
            </CardTitle>
            <CardDescription>Teste do sistema de upload de imagens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Testar Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={testUpload} disabled={!testFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Testar Upload
                </Button>
              </div>
            </div>

            {uploadResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Resultado do Upload:</h4>
                <pre className="text-sm overflow-auto">{JSON.stringify(uploadResult, null, 2)}</pre>
                {uploadResult.success && uploadResult.url && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Imagem Carregada:</p>
                    <img
                      src={uploadResult.url || "/placeholder.svg"}
                      alt="Teste de upload"
                      className="max-w-xs h-auto border rounded"
                      onError={(e) => {
                        console.log("❌ Erro ao carregar imagem de teste")
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                      }}
                      onLoad={() => {
                        console.log("✅ Imagem de teste carregada com sucesso")
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Produtos no Sistema</span>
            </CardTitle>
            <CardDescription>Lista de todos os produtos salvos</CardDescription>
          </CardHeader>
          <CardContent>
            {status?.products && status.products.length > 0 ? (
              <div className="space-y-4">
                {status.products.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=64&width=64&text=Erro"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">R$ {product.price?.toFixed(2) || "0.00"}</Badge>
                        <Badge
                          variant={
                            product.status === "approved"
                              ? "default"
                              : product.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">ID: {product.id}</p>
                      <p className="text-xs text-gray-500">
                        Criado: {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum produto encontrado no sistema</p>
                <Button onClick={testPersistence} className="mt-4">
                  Criar Produto de Teste
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
