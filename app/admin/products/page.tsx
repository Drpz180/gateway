"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search, CheckCircle, XCircle, Eye, DollarSign, Edit, Trash2 } from "lucide-react"
import AdminLayout from "@/components/layouts/AdminLayout"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log("🔄 Carregando produtos para admin...")
      const response = await fetch("/api/admin/products")

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Produtos carregados:", data.products)
        setProducts(data.products || [])
      } else {
        console.error("❌ Erro na resposta:", response.status)
        toast({
          title: "Erro",
          description: "Erro ao carregar produtos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Erro ao carregar produtos:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const approveProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Produto aprovado",
          description: "O produto foi aprovado com sucesso",
        })
        fetchProducts()
      } else {
        toast({
          title: "Erro",
          description: "Erro ao aprovar produto",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar produto",
        variant: "destructive",
      })
    }
  }

  const rejectProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Produto rejeitado",
          description: "O produto foi rejeitado",
        })
        fetchProducts()
      } else {
        toast({
          title: "Erro",
          description: "Erro ao rejeitar produto",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar produto",
        variant: "destructive",
      })
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}/delete`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Produto excluído",
          description: "O produto foi excluído com sucesso",
        })
        fetchProducts()
      } else {
        toast({
          title: "Erro",
          description: "Erro ao excluir produto",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      })
    }
  }

  // Função para formatar preço com verificação de segurança
  const formatPrice = (price: any) => {
    if (!price) return "0,00"
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return isNaN(numPrice) ? "0,00" : numPrice.toFixed(2).replace(".", ",")
  }

  // Função para obter status em português
  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprovado"
      case "pending":
        return "Pendente"
      case "rejected":
        return "Rejeitado"
      default:
        return "Desconhecido"
    }
  }

  // Função para obter variante do badge
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Filtrar produtos com verificação de segurança
  const filteredProducts = products.filter((product: any) => {
    if (!product) return false

    const productName = product.nome || product.name || ""
    const productCategory = product.categoria || product.category || ""
    const searchLower = searchTerm.toLowerCase()

    return productName.toLowerCase().includes(searchLower) || productCategory.toLowerCase().includes(searchLower)
  })

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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Produtos</h1>
            <p className="text-gray-600">Visualize e gerencie todos os produtos da plataforma</p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar produtos por nome ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos ({filteredProducts.length})</CardTitle>
            <CardDescription>Lista de todos os produtos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProducts.length > 0 ? (
              <div className="space-y-4">
                {filteredProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.logo_url || "/placeholder.svg?height=64&width=64"}
                        alt={product.nome || product.name || "Produto"}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg truncate">
                          {product.nome || product.name || "Produto sem nome"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {product.categoria || product.category || "Sem categoria"}
                        </p>
                        <p className="text-sm text-gray-600">Por: {product.creator || "Usuário"}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            R$ {formatPrice(product.preco || product.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge variant={getStatusVariant(product.status || "pending")}>
                        {getStatusText(product.status || "pending")}
                      </Badge>

                      {/* Botões de ação */}
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        {product.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => approveProduct(product.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => rejectProduct(product.id)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600">Não há produtos que correspondam aos critérios de busca</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
