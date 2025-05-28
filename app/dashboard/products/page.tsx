"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Link,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import NextLink from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name?: string
  nome?: string
  description?: string
  descricao?: string
  category?: string
  categoria?: string
  price?: number
  preco?: number
  logo_url?: string | null
  image?: string | null
  status: string
  sales?: number
  revenue?: number
  views?: number
  created_at?: string
  slug?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log("🔄 Carregando TODOS os produtos do usuário...")

      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Resposta da API:", data)

      // Verificar se a resposta tem o formato esperado
      if (data.success && Array.isArray(data.data)) {
        console.log("✅ Produtos carregados:", data.data.length)

        // Log das imagens para debug
        data.data.forEach((product: Product) => {
          const imageUrl = product.logo_url || product.image
          if (imageUrl) {
            if (imageUrl.startsWith("data:")) {
              console.log(`📸 Produto ${getProductName(product)}: imagem base64 (${imageUrl.length} chars)`)
            } else {
              console.log(`📸 Produto ${getProductName(product)}: imagem URL = ${imageUrl}`)
            }
          } else {
            console.log(`📸 Produto ${getProductName(product)}: sem imagem`)
          }
        })

        setProducts(data.data)
      } else if (data.success && data.data === null) {
        // Caso não tenha produtos
        console.log("ℹ️ Nenhum produto encontrado")
        setProducts([])
      } else {
        console.error("❌ Formato de resposta inesperado:", data)
        setProducts([])
        toast({
          title: "Aviso",
          description: "Formato de dados inesperado da API",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error)
      setProducts([])
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos. Verifique sua conexão.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Função helper para obter o nome do produto (compatibilidade com diferentes formatos)
  const getProductName = (product: Product): string => {
    return product.name || product.nome || "Produto sem nome"
  }

  // Função helper para obter a descrição do produto
  const getProductDescription = (product: Product): string => {
    return product.description || product.descricao || "Sem descrição"
  }

  // Função helper para obter a categoria do produto
  const getProductCategory = (product: Product): string => {
    return product.category || product.categoria || "digital"
  }

  // Função helper para obter o preço do produto
  const getProductPrice = (product: Product): number => {
    return product.price || product.preco || 0
  }

  // Função helper para obter a imagem do produto
  const getProductImage = (product: Product): string | null => {
    return product.logo_url || product.image || null
  }

  const filteredProducts = products.filter(
    (product) =>
      getProductName(product).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProductCategory(product).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Aprovado
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejeitado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const formatPrice = (price: any): string => {
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2)
  }

  const formatRevenue = (revenue: any): string => {
    const numRevenue = typeof revenue === "string" ? Number.parseFloat(revenue) : revenue
    return isNaN(numRevenue) ? "0" : numRevenue.toFixed(0)
  }

  const getImageUrl = (imageUrl: string | null, productName: string) => {
    // Se não tem imagem, usar placeholder
    if (!imageUrl) {
      console.log(`❌ ${productName}: Sem URL de imagem, usando placeholder`)
      return "/placeholder.svg?height=160&width=240&text=Sem+Imagem"
    }

    // Se é uma data URL (base64), usar diretamente
    if (imageUrl.startsWith("data:")) {
      console.log(`✅ ${productName}: Usando imagem base64`)
      return imageUrl
    }

    // Se é uma URL normal, usar diretamente
    if (imageUrl.startsWith("http")) {
      console.log(`✅ ${productName}: Usando URL externa:`, imageUrl)
      return imageUrl
    }

    // Se é um caminho relativo, garantir que comece com /
    let finalUrl = imageUrl
    if (!imageUrl.startsWith("/")) {
      finalUrl = `/${imageUrl}`
    }

    console.log(`✅ ${productName}: URL final:`, finalUrl)
    return finalUrl
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "Aguardando aprovação do administrador"
      case "approved":
        return "Produto aprovado e disponível para venda"
      case "rejected":
        return "Produto rejeitado pelo administrador"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600">Gerencie seus produtos digitais</p>
          </div>
          <NextLink href="/dashboard/products/new">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Produto</span>
            </Button>
          </NextLink>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aprovados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {products.filter((p) => p.status === "approved").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {products.filter((p) => p.status === "pending").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejeitados</p>
                  <p className="text-2xl font-bold text-red-600">
                    {products.filter((p) => p.status === "rejected").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "Tente ajustar sua busca" : "Comece criando seu primeiro produto"}
                </p>
                <NextLink href="/dashboard/products/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Produto
                  </Button>
                </NextLink>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{getProductName(product)}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{getProductDescription(product)}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <NextLink href={`/dashboard/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </NextLink>
                        </DropdownMenuItem>
                        {product.status === "approved" && (
                          <DropdownMenuItem asChild>
                            <NextLink href={`/produto/${product.slug || product.id}`} target="_blank">
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </NextLink>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Estatísticas
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Product Image */}
                    <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(getProductImage(product), getProductName(product)) || "/placeholder.svg"}
                        alt={getProductName(product)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          console.error(`❌ Erro ao carregar imagem para ${getProductName(product)}`)
                          target.src = "/placeholder.svg?height=160&width=240&text=Erro+na+Imagem"
                        }}
                        onLoad={() => console.log(`✅ Imagem carregada com sucesso para ${getProductName(product)}`)}
                      />
                    </div>

                    {/* Price and Status */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">
                            R$ {formatPrice(getProductPrice(product))}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{getProductCategory(product)}</p>
                      </div>
                      {getStatusBadge(product.status)}
                    </div>

                    {/* Status Message */}
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {getStatusMessage(product.status)}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{product.sales || 0}</p>
                        <p className="text-xs text-gray-600">Vendas</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">R$ {formatRevenue(product.revenue)}</p>
                        <p className="text-xs text-gray-600">Receita</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{product.views || 0}</p>
                        <p className="text-xs text-gray-600">Visualizações</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <NextLink href={`/dashboard/products/${product.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </NextLink>
                      {product.status === "approved" ? (
                        <>
                          <NextLink href={`/produto/${product.slug || product.id}`} target="_blank" className="flex-1">
                            <Button size="sm" className="w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Produto
                            </Button>
                          </NextLink>
                          <NextLink href={`/dashboard/products/${product.id}/links`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Link className="h-4 w-4 mr-2" />
                              Links
                            </Button>
                          </NextLink>
                        </>
                      ) : (
                        <Button size="sm" className="w-full" disabled>
                          <Clock className="h-4 w-4 mr-2" />
                          Aguardando
                        </Button>
                      )}
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
