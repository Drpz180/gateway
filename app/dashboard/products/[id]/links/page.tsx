"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, ArrowLeft, Share2, QrCode, BarChart3, Eye, RefreshCw } from "lucide-react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { useToast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"

export default function ProductLinksPage() {
  const [product, setProduct] = useState<any>(null)
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string)
      loadLinks(params.id as string)
    }
  }, [params.id])

  const loadProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProduct(data.product)
        } else {
          toast({
            title: "Erro",
            description: "Produto não encontrado",
            variant: "destructive",
          })
          router.push("/dashboard/products")
        }
      }
    } catch (error) {
      console.error("Erro ao carregar produto:", error)
    }
  }

  const loadLinks = async (productId: string) => {
    try {
      const response = await fetch(`/api/payment-links?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLinks(data.links)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar links:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateLink = async (linkType: "checkout" | "product") => {
    if (!product) return

    setGenerating(true)
    try {
      const response = await fetch("/api/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          linkType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Link gerado!",
          description: "Link único criado com sucesso",
        })
        // Recarregar links
        await loadLinks(params.id as string)
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao gerar link",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao gerar link:", error)
      toast({
        title: "Erro",
        description: "Erro ao gerar link",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Link copiado!",
      description: `${type} copiado para a área de transferência`,
    })
  }

  const getCheckoutLink = () => {
    const checkoutLink = links.find((link) => link.link_type === "checkout")
    return checkoutLink?.url || null
  }

  const getProductLink = () => {
    const productLink = links.find((link) => link.link_type === "product")
    return productLink?.url || null
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

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Produto não encontrado</h3>
          <Button onClick={() => router.push("/dashboard/products")}>Voltar para Produtos</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Links de Divulgação</h1>
            <p className="text-gray-600">Links únicos para: {product.name}</p>
          </div>
        </div>

        {/* Product Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              {product.image ? (
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Share2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  <Badge className="bg-green-100 text-green-800">R$ {formatPrice(product.price)}</Badge>
                  {product.status === "approved" && <Badge className="bg-green-100 text-green-800">Aprovado</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Links Section */}
        {product.status === "approved" ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Links Únicos de Pagamento</CardTitle>
                  <CardDescription>Links seguros estilo Kirvano para compartilhar</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadLinks(params.id as string)} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="checkout" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="checkout">Checkout Direto</TabsTrigger>
                  <TabsTrigger value="produto">Página do Produto</TabsTrigger>
                </TabsList>

                <TabsContent value="checkout" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Link de Checkout Único</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Link seguro estilo Kirvano - clientes vão direto para o pagamento
                    </p>

                    {getCheckoutLink() ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Input value={getCheckoutLink()} readOnly className="flex-1 font-mono text-sm" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(getCheckoutLink(), "Link de checkout")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open(getCheckoutLink(), "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(() => {
                            const checkoutLink = links.find((link) => link.link_type === "checkout")
                            return (
                              <>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{checkoutLink?.clicks || 0}</div>
                                  <div className="text-sm text-gray-600">Cliques</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    {checkoutLink?.conversions || 0}
                                  </div>
                                  <div className="text-sm text-gray-600">Conversões</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {checkoutLink?.clicks > 0
                                      ? Math.round((checkoutLink.conversions / checkoutLink.clicks) * 100)
                                      : 0}
                                    %
                                  </div>
                                  <div className="text-sm text-gray-600">Taxa de Conversão</div>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Nenhum link de checkout gerado ainda</p>
                        <Button
                          onClick={() => generateLink("checkout")}
                          disabled={generating}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {generating ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Gerando...
                            </div>
                          ) : (
                            "Gerar Link de Checkout"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="produto" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Link da Página do Produto</h4>
                    <p className="text-sm text-gray-600 mb-3">Link para página de apresentação antes da compra</p>

                    {getProductLink() ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Input value={getProductLink()} readOnly className="flex-1 font-mono text-sm" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(getProductLink(), "Link do produto")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open(getProductLink(), "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(() => {
                            const productLink = links.find((link) => link.link_type === "product")
                            return (
                              <>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{productLink?.clicks || 0}</div>
                                  <div className="text-sm text-gray-600">Visualizações</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    {productLink?.conversions || 0}
                                  </div>
                                  <div className="text-sm text-gray-600">Cliques para Checkout</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {productLink?.clicks > 0
                                      ? Math.round((productLink.conversions / productLink.clicks) * 100)
                                      : 0}
                                    %
                                  </div>
                                  <div className="text-sm text-gray-600">Taxa de Interesse</div>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Nenhum link de produto gerado ainda</p>
                        <Button onClick={() => generateLink("product")} disabled={generating} variant="outline">
                          {generating ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                              Gerando...
                            </div>
                          ) : (
                            "Gerar Link do Produto"
                          )}
                        </Button>
                      </div>
                    )}
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
                    Relatório Detalhado
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Editar Produto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Share2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Produto não aprovado</h3>
              <p className="text-gray-600 text-center mb-4">
                Este produto precisa ser aprovado pelo administrador antes de gerar links únicos
              </p>
              <Badge className="bg-yellow-100 text-yellow-800">Status: {product.status}</Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
