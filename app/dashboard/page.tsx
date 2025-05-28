"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, Wallet, CreditCard, Smartphone, Gift, Target, RefreshCw } from "lucide-react"

interface SellerStats {
  todaySales: number
  monthSales: number
  availableBalance: number
  salesData: Array<{ date: string; amount: number }>
  paymentMethods: Array<{ method: string; amount: number; count: number }>
  totalProducts: number
  totalSales: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<SellerStats>({
    todaySales: 0,
    monthSales: 0,
    availableBalance: 0,
    salesData: [],
    paymentMethods: [{ method: "PIX", amount: 0, count: 0 }],
    totalProducts: 0,
    totalSales: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/seller/stats?sellerId=1&period=7`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      const formattedStats: SellerStats = {
        todaySales: Number(data.todaySales) || 0,
        monthSales: Number(data.monthSales) || 0,
        availableBalance: Number(data.availableBalance) || 0,
        salesData: Array.isArray(data.salesData) ? data.salesData : [],
        paymentMethods: Array.isArray(data.paymentMethods)
          ? data.paymentMethods
          : [{ method: "PIX", amount: 0, count: 0 }],
        totalProducts: Number(data.totalProducts) || 0,
        totalSales: Number(data.totalSales) || 0,
      }

      setStats(formattedStats)
      setError(null)
    } catch (err: any) {
      console.error("❌ Error:", err)
      setError(err.message || "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com botão de atualizar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={fetchStats} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Cards de Métricas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total em Vendas hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.todaySales.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total em Vendas este mês</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.monthSales.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo disponível</CardTitle>
              <Wallet className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.availableBalance.toFixed(2)}</div>
              <p className="text-xs text-blue-600 mt-1 cursor-pointer hover:underline">Detalhes →</p>
            </CardContent>
          </Card>
        </div>

        {/* Seção Principal */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Métodos de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Métodos de Pagamento</CardTitle>
              <p className="text-sm text-muted-foreground">Estatísticas por método de pagamento</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-dashed border-green-300 rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <Smartphone className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">PIX</p>
                    <p className="text-sm text-muted-foreground">Transferências instantâneas via PIX</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">R$ {stats.paymentMethods[0]?.amount?.toFixed(2) || "0,00"}</p>
                  <p className="text-xs text-green-600">{stats.paymentMethods[0]?.count || 0} vendas</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cartão</p>
                    <p className="text-sm text-muted-foreground">Pagamentos com cartão de crédito e débito</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">R$ ***</p>
                  <p className="text-xs text-muted-foreground">Em breve</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programa de Recompensas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-500" />
                Programa de Recompensas
              </CardTitle>
              <p className="text-sm text-muted-foreground">Acompanhe seu progresso e resgate suas recompensas</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-6 rounded-lg text-white text-center min-w-[120px]">
                  <div className="text-2xl font-bold">Viper</div>
                  <div className="text-lg">1k</div>
                  <div className="text-xs opacity-80">1 mil</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-2">Sobre esta recompensa</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comemore R$ 1.000 em vendas com esta exclusiva pulseira, símbolo do seu sucesso!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Continue vendendo para alcançar sua próxima recompensa
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sua Próxima Meta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Sua próxima meta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progresso atual</span>
                <span className="font-bold">R$ {stats.monthSales.toFixed(0)} / 1K</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((stats.monthSales / 1000) * 100, 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Dicas para alcançar sua meta</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Compartilhe seus produtos nas redes sociais</li>
                  <li>• Ofereça descontos para clientes recorrentes</li>
                  <li>• Crie promoções especiais para datas comemorativas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Vendas - Substituto do gráfico */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Resumo de Vendas</CardTitle>
            <p className="text-sm text-muted-foreground">Últimas vendas registradas</p>
          </CardHeader>
          <CardContent>
            {stats.salesData.length > 0 ? (
              <div className="space-y-3">
                {stats.salesData.map((sale, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Venda #{index + 1}</p>
                      <p className="text-sm text-gray-500">{new Date(sale.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">R$ {Number(sale.amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">PIX</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma venda registrada ainda</p>
                <p className="text-sm mt-1">Suas vendas aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
