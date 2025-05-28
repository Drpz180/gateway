"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TesteProdutoPage() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testarCriacao = async () => {
    setLoading(true)
    setResultado(null)

    try {
      // Dados de teste simples
      const formData = new FormData()
      formData.append("nome", "Produto Teste")
      formData.append("descricao", "Descrição do produto teste")
      formData.append("preco", "97.00")
      formData.append("cor_fundo", "#ffffff")
      formData.append("cor_botao", "#00b894")
      formData.append("cor_texto", "#000000")
      formData.append("titulo", "Produto Teste")
      formData.append("subtitulo", "Subtítulo teste")

      console.log("🧪 TESTE: Enviando dados...")

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      console.log("📋 RESULTADO:", result)
      setResultado({
        status: response.status,
        success: result.success,
        data: result,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("❌ ERRO no teste:", error)
      setResultado({
        status: "ERROR",
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const testarListagem = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/products")
      const result = await response.json()

      setResultado({
        status: response.status,
        success: result.success,
        data: result,
        timestamp: new Date().toISOString(),
        type: "LISTAGEM",
      })
    } catch (error) {
      setResultado({
        status: "ERROR",
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const verificarStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/produtos")
      const result = await response.json()

      setResultado({
        status: response.status,
        success: result.success,
        data: result,
        timestamp: new Date().toISOString(),
        type: "STATUS",
      })
    } catch (error) {
      setResultado({
        status: "ERROR",
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🧪 Teste de Produtos</h1>
        <p className="text-gray-600">Debug e teste do sistema de produtos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={testarCriacao} disabled={loading} className="h-20">
          {loading ? "Testando..." : "🧪 Testar Criação"}
        </Button>

        <Button onClick={testarListagem} disabled={loading} variant="outline" className="h-20">
          {loading ? "Carregando..." : "📋 Testar Listagem"}
        </Button>

        <Button onClick={verificarStatus} disabled={loading} variant="secondary" className="h-20">
          {loading ? "Verificando..." : "🔍 Verificar Status"}
        </Button>
      </div>

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultado do Teste</span>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  resultado.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {resultado.success ? "✅ SUCESSO" : "❌ ERRO"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong> {resultado.status}
                </div>
                <div>
                  <strong>Timestamp:</strong> {resultado.timestamp}
                </div>
              </div>

              <div>
                <Label>Resposta Completa:</Label>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(resultado.data, null, 2)}
                </pre>
              </div>

              {resultado.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <strong className="text-red-800">Erro:</strong>
                  <p className="text-red-700 mt-1">{resultado.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📝 Teste Manual</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setLoading(true)

              const formData = new FormData(e.target as HTMLFormElement)

              try {
                const response = await fetch("/api/products", {
                  method: "POST",
                  body: formData,
                })

                const result = await response.json()
                setResultado({
                  status: response.status,
                  success: result.success,
                  data: result,
                  timestamp: new Date().toISOString(),
                  type: "MANUAL",
                })
              } catch (error) {
                setResultado({
                  status: "ERROR",
                  success: false,
                  error: error instanceof Error ? error.message : "Erro desconhecido",
                  timestamp: new Date().toISOString(),
                })
              } finally {
                setLoading(false)
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" defaultValue="Produto Manual" required />
              </div>
              <div>
                <Label htmlFor="preco">Preço</Label>
                <Input id="preco" name="preco" type="number" step="0.01" defaultValue="97.00" required />
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" name="descricao" defaultValue="Descrição do produto manual" required />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "🚀 Testar Manualmente"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
