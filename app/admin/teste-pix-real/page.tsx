"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, QrCode, Copy, CheckCircle, XCircle, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TestePixRealPage() {
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [testProduct, setTestProduct] = useState<any>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [formData, setFormData] = useState({
    valor: "67.90",
    nome: "João Silva",
    cpf: "123.456.789-00",
    email: "joao@email.com",
    descricao: "Teste PIX Real - InfoPlatform",
  })
  const { toast } = useToast()

  // Buscar produto de teste ao carregar a página
  useEffect(() => {
    buscarProdutoTeste()
  }, [])

  const buscarProdutoTeste = async () => {
    try {
      setLoadingProduct(true)
      console.log("🔍 Buscando produto de teste...")

      const response = await fetch("/api/test-product")
      const result = await response.json()

      if (result.success) {
        setTestProduct(result.product)
        setFormData((prev) => ({
          ...prev,
          valor: Number(result.product.price || 0)
            .toFixed(2)
            .replace(".", ","),
          descricao: `Teste PIX - ${result.product.name}`,
        }))
        console.log("✅ Produto de teste:", result.product)

        if (result.created) {
          toast({
            title: "📦 Produto de teste criado",
            description: `${result.product.name} - R$ ${result.product.price}`,
          })
        }
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("❌ Erro ao buscar produto:", error)
      toast({
        title: "❌ Erro",
        description: "Erro ao buscar produto de teste",
        variant: "destructive",
      })
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData((prev) => ({
      ...prev,
      cpf: formatted,
    }))
  }

  const criarPixReal = async () => {
    if (!testProduct) {
      toast({
        title: "❌ Erro",
        description: "Produto de teste não encontrado",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setPixData(null)

    try {
      console.log("🔄 Criando PIX com produto:", testProduct.id)

      const response = await fetch("/api/payments/pix/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: testProduct.id, // Usar o ID do produto de teste
          amount: Number(formData.valor.replace(",", ".")),
          buyerName: formData.nome,
          buyerEmail: formData.email,
          buyerCpf: formData.cpf,
          description: formData.descricao,
        }),
      })

      console.log("📡 Response status:", response.status)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("❌ Resposta não é JSON:", textResponse)
        throw new Error(`Resposta inválida do servidor: ${response.status}`)
      }

      const result = await response.json()
      console.log("📋 Resultado:", result)

      if (result.success) {
        setPixData(result)
        toast({
          title: result.mock ? "🎭 PIX Mock Criado" : "✅ PIX Real Criado!",
          description: `TXID: ${result.txid}`,
        })
      } else {
        throw new Error(result.message || "Erro ao criar PIX")
      }
    } catch (error) {
      console.error("❌ Erro completo:", error)
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao criar PIX",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copiarCodigo = async () => {
    if (pixData?.copyPasteCode) {
      try {
        await navigator.clipboard.writeText(pixData.copyPasteCode)
        toast({
          title: "✅ Copiado!",
          description: "Código PIX copiado para a área de transferência",
        })
      } catch (error) {
        console.error("Erro ao copiar:", error)
      }
    }
  }

  if (loadingProduct) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando produto de teste...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <QrCode className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Teste PIX Real - EfiBank</h1>
        <Badge variant="destructive">PRODUÇÃO</Badge>
      </div>

      {/* Produto de Teste */}
      {testProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produto de Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{testProduct.name}</h3>
                <p className="text-sm text-gray-600">ID: {testProduct.id}</p>
                <p className="text-lg font-bold text-green-600">
                  R${" "}
                  {Number(testProduct.price || 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
              </div>
              <Badge variant="outline">{testProduct.status}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados para Teste</CardTitle>
            <CardDescription>Configure os dados para gerar um PIX real via EfiBank</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  name="valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  placeholder="67,90"
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  placeholder="123.456.789-00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="João Silva"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="joao@email.com"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                placeholder="Descrição do pagamento"
                rows={3}
              />
            </div>

            <Button onClick={criarPixReal} disabled={loading || !testProduct} className="w-full" size="lg">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Criando PIX Real..." : "🏦 Gerar PIX Real"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {pixData ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
              Resultado do PIX
            </CardTitle>
            <CardDescription>{pixData ? "PIX gerado com sucesso!" : "Aguardando geração do PIX..."}</CardDescription>
          </CardHeader>
          <CardContent>
            {pixData ? (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge variant={pixData.mock ? "secondary" : "default"}>{pixData.mock ? "MOCK" : "PIX REAL"}</Badge>
                  <span className="text-sm text-gray-600">TXID: {pixData.txid}</span>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border inline-block">
                    <img
                      src={pixData.qrCode || "/placeholder.svg"}
                      alt="QR Code PIX"
                      className="w-48 h-48 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=192&width=192"
                      }}
                    />
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-4">
                    R$ {Number(pixData.amount).toFixed(2).replace(".", ",")}
                  </p>
                </div>

                {/* Código PIX */}
                <div className="space-y-2">
                  <Label>Código PIX (Copia e Cola)</Label>
                  <div className="flex gap-2">
                    <Input value={pixData.copyPasteCode} readOnly className="font-mono text-xs" />
                    <Button onClick={copiarCodigo} variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Informações */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Expira em:</span>
                    <span className="font-medium">{new Date(pixData.expiresAt).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="outline">Aguardando Pagamento</Badge>
                  </div>
                </div>

                {/* Instruções */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Como testar:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Use o app do seu banco</li>
                    <li>Escaneie o QR Code ou cole o código</li>
                    <li>Confirme o pagamento</li>
                    <li>Verifique se o webhook foi recebido</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Preencha os dados e clique em "Gerar PIX Real"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      {pixData && (
        <Card>
          <CardHeader>
            <CardTitle>Logs de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">{JSON.stringify(pixData, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
