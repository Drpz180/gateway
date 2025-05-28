"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Download,
  Eye,
  Search,
  Filter,
  CreditCard,
  Smartphone,
  FileText,
  MessageCircle,
} from "lucide-react"
import DashboardLayout from "@/components/layouts/DashboardLayout"

interface Sale {
  id: string
  transactionId: string
  productName: string
  productId: string
  buyerName: string
  buyerEmail: string
  buyerCpf?: string
  buyerPhone?: string
  amount: number
  commission: number
  status: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

interface SalesStats {
  totalSales: number
  totalRevenue: number
  totalCommission: number
  averageTicket: number
  conversionRate: number
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalCommission: 0,
    averageTicket: 0,
    conversionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")

  const fetchSales = async (status = "all") => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Buscando vendas com status:", status)

      const response = await fetch(`/api/sales?sellerId=1&status=${status}`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("📊 Data received:", data)

      if (data.success) {
        // Garantir que sales é sempre um array
        const salesArray = Array.isArray(data.sales) ? data.sales : []
        setSales(salesArray)
        setStats(
          data.stats || {
            totalSales: 0,
            totalRevenue: 0,
            totalCommission: 0,
            averageTicket: 0,
            conversionRate: 0,
          },
        )
        console.log("✅ Vendas carregadas:", salesArray.length)
      } else {
        throw new Error(data.error || "Erro ao carregar vendas")
      }
    } catch (error) {
      console.error("❌ Erro ao buscar vendas:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
      // Definir valores padrão em caso de erro
      setSales([])
      setStats({
        totalSales: 0,
        totalRevenue: 0,
        totalCommission: 0,
        averageTicket: 0,
        conversionRate: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales(selectedTab)
  }, [selectedTab])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aprovada</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "pix":
        return <Smartphone className="h-4 w-4 text-blue-600" />
      case "credit_card":
      case "cartao":
        return <CreditCard className="h-4 w-4 text-purple-600" />
      case "boleto":
        return <FileText className="h-4 w-4 text-orange-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method?.toLowerCase()) {
      case "pix":
        return "PIX"
      case "credit_card":
      case "cartao":
        return "Cartão de Crédito"
      case "boleto":
        return "Boleto"
      default:
        return method || "N/A"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return (
        date.toLocaleDateString("pt-BR") +
        " às " +
        date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    } catch {
      return "Data inválida"
    }
  }

  const openWhatsApp = (phone: string, name: string, product: string) => {
    if (!phone) return

    const message = `Olá ${name}! Obrigado pela compra do ${product}. Como posso ajudá-lo?`
    const whatsappUrl = `https://wa.me/55${phone?.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // Garantir que sales é um array antes de filtrar
  const filteredSales = Array.isArray(sales)
    ? sales.filter((sale) => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        return (
          sale.buyerName?.toLowerCase().includes(searchLower) ||
          sale.buyerEmail?.toLowerCase().includes(searchLower) ||
          sale.buyerCpf?.includes(searchTerm) ||
          sale.transactionId?.toLowerCase().includes(searchLower) ||
          sale.productName?.toLowerCase().includes(searchLower)
        )
      })
    : []

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando vendas...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
            <p className="text-gray-600">Acompanhe suas vendas e performance</p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">❌ {error}</p>
            <Button onClick={() => fetchSales(selectedTab)} className="mt-2" size="sm">
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por CPF, transação, e-mail ou nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros: 3
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">COMISSÃO:</span>
              <span className="ml-2 font-bold">R$ {stats.totalCommission.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">TOTAL:</span>
              <span className="ml-2 font-bold">R$ {stats.totalRevenue.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">QUANTIDADE DE VENDAS:</span>
              <span className="ml-2 font-bold">{stats.totalSales}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">vendas realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">em vendas aprovadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.averageTicket.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">valor médio por venda</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalCommission.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">em comissões pagas</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todas as Vendas</TabsTrigger>
            <TabsTrigger value="completed">Aprovadas</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedTab === "all" && "Todas as Vendas"}
                  {selectedTab === "completed" && "Vendas Aprovadas"}
                  {selectedTab === "pending" && "Vendas Pendentes"}
                  {selectedTab === "cancelled" && "Vendas Canceladas"}
                </CardTitle>
                <CardDescription>
                  {filteredSales.length} {filteredSales.length === 1 ? "venda encontrada" : "vendas encontradas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredSales.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma venda encontrada</p>
                    <p className="text-sm text-gray-500">
                      {searchTerm ? "Tente ajustar os filtros de busca" : "Suas vendas aparecerão aqui"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSales.map((sale) => (
                      <div key={sale.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Left side - Product and customer info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{sale.productName}</h3>
                              {getStatusBadge(sale.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">
                                  <strong>ID:</strong> #{sale.transactionId}
                                </p>
                                <p className="text-gray-600">
                                  <strong>Cliente:</strong> {sale.buyerName}
                                </p>
                                <p className="text-gray-600">{sale.buyerEmail}</p>
                                {sale.buyerCpf && <p className="text-gray-600">CPF: {sale.buyerCpf}</p>}
                              </div>

                              <div>
                                <p className="text-gray-600">
                                  <strong>Período:</strong>
                                </p>
                                <p className="text-gray-600">{formatDate(sale.createdAt)}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {getPaymentIcon(sale.paymentMethod)}
                                  <span className="text-gray-600">{getPaymentMethodLabel(sale.paymentMethod)}</span>
                                </div>
                              </div>

                              <div>
                                {sale.commission > 0 ? (
                                  <>
                                    <p className="text-gray-600">
                                      <strong>Comissão:</strong> R$ {sale.commission.toFixed(2)}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-gray-600">
                                    <strong>Venda Direta</strong>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right side - Value and actions */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">R$ {sale.amount.toFixed(2)}</p>
                            </div>

                            <div className="flex gap-2">
                              {sale.buyerPhone && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openWhatsApp(sale.buyerPhone!, sale.buyerName, sale.productName)}
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              )}

                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Detalhes
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
