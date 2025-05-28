"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Wallet } from "lucide-react"
import DashboardLayout from "@/components/layouts/DashboardLayout"

interface FinancialData {
  saldoDisponivel: number
  saldoTotal: number
  vendas: Array<{
    id: string
    produto: string
    valor: number
    valorLiquido: number
    status: string
    data: string
    comprador: string
  }>
  saques: Array<{
    id: string
    valor: number
    chavePix: string
    status: string
    data: string
    observacao?: string
  }>
  estatisticas: {
    vendasMes: number
    receitaMes: number
    taxasMes: number
    crescimento: number
  }
}

export default function FinanceiroPage() {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saqueDialogOpen, setSaqueDialogOpen] = useState(false)
  const [valorSaque, setValorSaque] = useState("")
  const [chavePix, setChavePix] = useState("")

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/dashboard/financeiro", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const financialData = await response.json()
        setData(financialData)
      }
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSolicitarSaque = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/dashboard/saques", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          valor: Number.parseFloat(valorSaque),
          chavePix,
          tipo: "pix",
        }),
      })

      if (response.ok) {
        setSaqueDialogOpen(false)
        setValorSaque("")
        setChavePix("")
        fetchFinancialData()
        alert("Solicitação de saque enviada com sucesso!")
      } else {
        alert("Erro ao solicitar saque")
      }
    } catch (error) {
      console.error("Erro ao solicitar saque:", error)
      alert("Erro ao solicitar saque")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pago
          </Badge>
        )
      case "pendente":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        )
      case "rejeitado":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <p>Erro ao carregar dados financeiros</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie seus ganhos, vendas e solicitações de saque</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {data.saldoDisponivel.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Disponível para saque</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {data.saldoTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Histórico total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.estatisticas.vendasMes}</div>
              <p className="text-xs text-muted-foreground">+{data.estatisticas.crescimento}% do mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {data.estatisticas.receitaMes.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Taxas: R$ {data.estatisticas.taxasMes.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Botão de saque */}
        <div className="flex justify-end">
          <Dialog open={saqueDialogOpen} onOpenChange={setSaqueDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Wallet className="w-4 h-4 mr-2" />
                Solicitar Saque
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Saque via PIX</DialogTitle>
                <DialogDescription>Saldo disponível: R$ {data.saldoDisponivel.toFixed(2)}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="valor" className="text-right">
                    Valor
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    max={data.saldoDisponivel}
                    value={valorSaque}
                    onChange={(e) => setValorSaque(e.target.value)}
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="chavePix" className="text-right">
                    Chave PIX
                  </Label>
                  <Input
                    id="chavePix"
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    className="col-span-3"
                    placeholder="CPF, e-mail ou chave aleatória"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSolicitarSaque}
                  disabled={!valorSaque || !chavePix || Number.parseFloat(valorSaque) > data.saldoDisponivel}
                >
                  Solicitar Saque
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs de histórico */}
        <Tabs defaultValue="vendas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="saques">Saques</TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>Suas vendas e comissões recebidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.vendas.map((venda) => (
                    <div key={venda.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{venda.produto}</p>
                        <p className="text-sm text-muted-foreground">Comprador: {venda.comprador}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(venda.data).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {venda.valorLiquido.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Bruto: R$ {venda.valor.toFixed(2)}</p>
                        {getStatusBadge(venda.status)}
                      </div>
                    </div>
                  ))}
                  {data.vendas.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhuma venda encontrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saques" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Saque</CardTitle>
                <CardDescription>Histórico de saques solicitados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.saques.map((saque) => (
                    <div key={saque.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">PIX: {saque.chavePix}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(saque.data).toLocaleDateString("pt-BR")}
                        </p>
                        {saque.observacao && <p className="text-sm text-muted-foreground">{saque.observacao}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {saque.valor.toFixed(2)}</p>
                        {getStatusBadge(saque.status)}
                      </div>
                    </div>
                  ))}
                  {data.saques.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhuma solicitação de saque encontrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
