"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, Copy, Zap, Globe, Webhook } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SolucaoFinalPixPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<{ [key: string]: any }>({})
  const [formData, setFormData] = useState({
    name: "João Silva",
    cpf: "12345678901",
    amount: "67,90",
    description: "Teste PIX Final - InfoPlatform",
  })
  const { toast } = useToast()

  const testSolution = async (type: string, endpoint: string, title: string) => {
    setLoading(type)

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResults((prev) => ({ ...prev, [type]: data }))

      if (data.success) {
        toast({
          title: `✅ ${title}`,
          description: `Ambiente: ${data.environment}`,
        })
      } else {
        toast({
          title: `⚠️ ${title}`,
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Erro ${type}:`, error)
      toast({
        title: `❌ ${title}`,
        description: "Erro na requisição",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const copyPixCode = (pixCode: string) => {
    navigator.clipboard.writeText(pixCode)
    toast({
      title: "✅ Copiado!",
      description: "Código PIX copiado",
    })
  }

  const formatCurrency = (value: string) => {
    value = value.replace(/\D/g, "")
    if (value === "") return ""
    const number = Number.parseInt(value, 10) / 100
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const solutions = [
    {
      id: "proxy",
      title: "Solução Proxy",
      description: "Tenta múltiplos proxies para contornar bloqueios",
      endpoint: "/api/pix/generate-proxy",
      icon: <Globe className="h-5 w-5" />,
    },
    {
      id: "webhook",
      title: "Solução Webhook",
      description: "Usa serviços externos e mock profissional",
      endpoint: "/api/pix/webhook-solution",
      icon: <Webhook className="h-5 w-5" />,
    },
    {
      id: "hybrid",
      title: "Solução Híbrida",
      description: "Edge Runtime com fallback automático",
      endpoint: "/api/pix/generate-hybrid",
      icon: <Zap className="h-5 w-5" />,
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🎯 Solução Final PIX</h1>
        <p className="text-gray-600">Múltiplas estratégias para garantir que o PIX sempre funcione</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Teste</CardTitle>
          <CardDescription>Configure os dados para testar todas as soluções</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: formatCurrency(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {solutions.map((solution) => (
          <Card key={solution.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {solution.icon}
                {solution.title}
              </CardTitle>
              <CardDescription>{solution.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => testSolution(solution.id, solution.endpoint, solution.title)}
                disabled={loading === solution.id}
                className="w-full"
              >
                {loading === solution.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  `Testar ${solution.title}`
                )}
              </Button>

              {results[solution.id] && (
                <div
                  className={`p-4 rounded-lg border ${
                    results[solution.id].success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle
                      className={`h-4 w-4 ${results[solution.id].success ? "text-green-500" : "text-red-500"}`}
                    />
                    <span className="text-sm font-medium">{results[solution.id].success ? "Sucesso!" : "Falhou"}</span>
                    {results[solution.id].environment && (
                      <Badge variant="outline" className="text-xs">
                        {results[solution.id].environment}
                      </Badge>
                    )}
                  </div>

                  {results[solution.id].message && (
                    <p className="text-xs text-gray-600 mb-2">{results[solution.id].message}</p>
                  )}

                  {results[solution.id].success && results[solution.id].data && (
                    <div className="space-y-2">
                      <div className="text-center">
                        <img
                          src={results[solution.id].data.qrCode || "/placeholder.svg"}
                          alt="QR Code"
                          className="w-32 h-32 mx-auto border rounded"
                        />
                        <p className="text-lg font-bold text-green-600">R$ {results[solution.id].data.valor}</p>
                      </div>

                      <div className="flex gap-1">
                        <Input value={results[solution.id].data.pixCopiaECola} readOnly className="text-xs font-mono" />
                        <Button
                          onClick={() => copyPixCode(results[solution.id].data.pixCopiaECola)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📋 Resumo das Soluções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">🎯 Recomendação</h4>
              <p className="text-sm text-blue-700">
                Use a <strong>Solução Webhook</strong> para desenvolvimento, pois sempre gera um PIX mock profissional.
                Para produção, configure um microserviço externo que se conecte com a EfiBank.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 border rounded">
                <h5 className="font-medium">🌐 Proxy</h5>
                <p className="text-gray-600">Tenta contornar bloqueios da Vercel usando proxies externos</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium">🔗 Webhook</h5>
                <p className="text-gray-600">Usa serviços externos ou mock profissional com formato real</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium">⚡ Híbrida</h5>
                <p className="text-gray-600">Edge Runtime com fallback automático para mock</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
