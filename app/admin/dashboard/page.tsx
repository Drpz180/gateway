"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import AdminLayout from "@/components/layouts/AdminLayout"

interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalSales: number
  totalRevenue: number
  pendingProducts: number
  pendingWithdraws: number
  recentSales: Array<{
    id: string
    product: string
    buyer: string
    amount: number
    date: string
    status: string
  }>
  recentUsers: Array<{
    id: string
    name: string
    email: string
    status: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h2>
          <p className="text-muted-foreground">Visão geral da plataforma de infoprodutos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">{stats?.pendingProducts || 0} aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSales || 0}</div>
              <p className="text-xs text-muted-foreground">+8% em relação ao mês passado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {(stats?.totalRevenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">+15% em relação ao mês passado</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Ações Pendentes
              </CardTitle>
              <CardDescription>Itens que precisam da sua atenção</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span>Produtos para aprovação</span>
                </div>
                <Badge variant="secondary">{stats?.pendingProducts || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span>Saques pendentes</span>
                </div>
                <Badge variant="secondary">{stats?.pendingWithdraws || 0}</Badge>
              </div>
              <div className="pt-2">
                <Button className="w-full" onClick={() => (window.location.href = "/admin/products")}>
                  Ver Produtos Pendentes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>Últimas transações na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentSales?.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{sale.product}</p>
                      <p className="text-xs text-muted-foreground">{sale.buyer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        R$ {sale.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center gap-1">
                        {sale.status === "paid" ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : sale.status === "pending" ? (
                          <Clock className="h-3 w-3 text-orange-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(sale.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                )) || <p className="text-sm text-muted-foreground">Nenhuma venda recente</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Recentes</CardTitle>
            <CardDescription>Novos usuários cadastrados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentUsers?.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status === "active" ? "Ativo" : "Pendente"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground">Nenhum usuário recente</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
