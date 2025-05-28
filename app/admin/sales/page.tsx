"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BarChart3, Search, DollarSign, Users, ShoppingCart } from "lucide-react"
import AdminLayout from "@/components/layouts/AdminLayout"

export default function AdminSalesPage() {
  const [sales, setSales] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  })

  useEffect(() => {
    fetchSales()
    fetchStats()
  }, [])

  const fetchSales = async () => {
    try {
      // Simular dados de vendas
      const mockSales = [
        {
          id: "1",
          productName: "Curso de Marketing Digital",
          customerName: "João Silva",
          customerEmail: "joao@email.com",
          amount: 197,
          status: "paid",
          paymentMethod: "pix",
          createdAt: "2024-01-20T10:30:00Z",
          affiliateId: "af_123",
        },
        {
          id: "2",
          productName: "E-book de Vendas",
          customerName: "Maria Santos",
          customerEmail: "maria@email.com",
          amount: 47,
          status: "paid",
          paymentMethod: "credit_card",
          createdAt: "2024-01-20T14:15:00Z",
          affiliateId: null,
        },
        {
          id: "3",
          productName: "Curso de Programação",
          customerName: "Pedro Costa",
          customerEmail: "pedro@email.com",
          amount: 297,
          status: "pending",
          paymentMethod: "pix",
          createdAt: "2024-01-20T16:45:00Z",
          affiliateId: "af_456",
        },
      ]

      setSales(mockSales)
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Simular estatísticas
      setStats({
        totalSales: 156,
        totalRevenue: 45280,
        totalCustomers: 89,
        totalProducts: 12,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const filteredSales = sales.filter(
    (sale: any) =>
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
            <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
            <p className="text-gray-600">Acompanhe todas as vendas da plataforma</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Produtos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar vendas por produto, cliente ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes ({filteredSales.length})</CardTitle>
            <CardDescription>Lista de todas as vendas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSales.length > 0 ? (
              <div className="space-y-4">
                {filteredSales.map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{sale.productName}</h3>
                        <p className="text-sm text-gray-600">
                          {sale.customerName} - {sale.customerEmail}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500 capitalize">{sale.paymentMethod}</span>
                          {sale.affiliateId && (
                            <>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-blue-600">Afiliado: {sale.affiliateId}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">R$ {sale.amount}</p>
                      </div>
                      <Badge
                        variant={
                          sale.status === "paid" ? "default" : sale.status === "pending" ? "secondary" : "destructive"
                        }
                      >
                        {sale.status === "paid" ? "Pago" : sale.status === "pending" ? "Pendente" : "Cancelado"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma venda encontrada</h3>
                <p className="text-gray-600">Não há vendas que correspondam aos critérios de busca</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
