"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, Eye, Share2, QrCode, BarChart3 } from "lucide-react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { useToast } from "@/hooks/use-toast"

export default function LinksPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        // Filtrar apenas produtos aprovados
        const approvedProducts = data.data.filter((product: any) => product.status === "approved")
        setProducts(approvedProducts)
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Link copiado!",
      description: `${type} copiado para a área de transferência`,
    })
  }

  // Função corrigida para gerar URLs sem duplo //
  const getProductUrl = (product: any) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const slug = product.slug || product.id
    return `${baseUrl}/produto/${slug}`
  }

  // Função corrigida para gerar URLs de checkout sem duplo //
  const getCheckoutUrl = (product: any) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const slug = product.slug || product.id
    return `${baseUrl}/checkout/${slug}`
  }

  const formatPrice = (price: any) => {
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Links de Divulgação</h1>
          <p className="text-gray-600">Gerencie e compartilhe os links dos seus produtos</p>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Share2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto aprovado</h3>
              <p className="text-gray-600 text-center mb-4">
                Você precisa ter produtos aprovados para gerar links de divulgação
              </p>
              <Button onClick={() => (window.location.href = "/dashboard/products/new")}>Criar Primeiro Produto</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      {product.logo_url ? (
                        <img
                          src={product.logo_url || "/placeholder.svg"}
                          alt={product.nome || product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Share2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-xl">{product.nome || product.name}</CardTitle>
                        <CardDescription>{product.descricao || product.description}</CardDescription>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary">{product.categoria || product.category}</Badge>
                          <Badge className="bg-green-100 text-green-800">
                            R$ {formatPrice(product.preco || product.price)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="produto" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="produto">Página do Produto</TabsTrigger>
                      <TabsTrigger value="checkout">Checkout Direto</TabsTrigger>
                    </TabsList>

                    <TabsContent value="produto" className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Link da Página do Produto</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Link para a página de apresentação do produto onde clientes podem ver detalhes antes de
                          comprar
                        </p>
                        <div className="flex items-center space-x-2">
                          <Input value={getProductUrl(product)} readOnly className="flex-1" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(getProductUrl(product), "Link do produto")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getProductUrl(product), "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">0</div>
                          <div className="text-sm text-gray-600">Visualizações</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">0</div>
                          <div className="text-sm text-gray-600">Cliques</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">0%</div>
                          <div className="text-sm text-gray-600">Conversão</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="checkout" className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Link do Checkout Direto</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Link direto para o checkout personalizado - clientes vão direto para a compra
                        </p>
                        <div className="flex items-center space-x-2">
                          <Input value={getCheckoutUrl(product)} readOnly className="flex-1" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(getCheckoutUrl(product), "Link do checkout")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getCheckoutUrl(product), "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">0</div>
                          <div className="text-sm text-gray-600">Acessos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">0</div>
                          <div className="text-sm text-gray-600">Vendas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">0%</div>
                          <div className="text-sm text-gray-600">Taxa de Conversão</div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4 mr-2" />
                        QR Code
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Estatísticas
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = `/dashboard/products/${product.id}/edit`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Editar Produto
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
