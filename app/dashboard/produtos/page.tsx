"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: string
  logo_url: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const result = await response.json()

      if (result.success) {
        setProducts(result.data)
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    } as const

    const labels = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
    }

    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meus Produtos</h1>
          <p className="text-gray-600">Gerencie seus infoprodutos</p>
        </div>
        <Link href="/dashboard/produtos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Lista de Produtos */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
              <p className="text-gray-600">Crie seu primeiro produto para começar</p>
              <Link href="/dashboard/produtos/novo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Produto
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{product.nome}</CardTitle>
                    <CardDescription className="text-sm">{product.categoria}</CardDescription>
                  </div>
                  {getStatusBadge(product.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Logo */}
                {product.logo_url && (
                  <div className="flex justify-center">
                    <img
                      src={product.logo_url || "/placeholder.svg"}
                      alt={product.nome}
                      className="w-16 h-16 object-contain rounded-lg border"
                    />
                  </div>
                )}

                {/* Descrição */}
                <p className="text-sm text-gray-600 line-clamp-2">{product.descricao}</p>

                {/* Preço */}
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatPrice(product.preco)}</p>
                </div>

                {/* Data */}
                <p className="text-xs text-gray-500 text-center">
                  Criado em {new Date(product.createdAt).toLocaleDateString("pt-BR")}
                </p>

                {/* Ações */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
