"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, TrendingUp, DollarSign, Copy, Eye, CheckCircle, XCircle, Search } from "lucide-react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { useToast } from "@/hooks/use-toast"

export default function AffiliatesPage() {
  const [affiliateStats, setAffiliateStats] = useState({
    totalAffiliates: 8,
    activeAffiliates: 5,
    totalCommissions: 1250,
    pendingCommissions: 340,
  })

  const [affiliates, setAffiliates] = useState([
    {
      id: "1",
      name: "Carlos Silva",
      email: "carlos@email.com",
      status: "active",
      sales: 12,
      commission: 450,
      joinDate: "2024-01-15",
      lastSale: "2024-01-20",
    },
    {
      id: "2",
      name: "Ana Santos",
      email: "ana@email.com",
      status: "pending",
      sales: 0,
      commission: 0,
      joinDate: "2024-01-18",
      lastSale: null,
    },
  ])

  const [products, setProducts] = useState([
    {
      id: "1",
      name: "Curso de Marketing Digital",
      affiliateUrl: "https://infoplatform.com/af/curso-marketing/abc123",
      commission: 30,
      sales: 15,
      clicks: 245,
      conversion: 6.1,
    },
  ])

  const { toast } = useToast()

  const copyAffiliateLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copiado!",
      description: "O link de afiliado foi copiado para a área de transferência",
    })
  }

  const approveAffiliate = async (affiliateId: string) => {
    // API call to approve affiliate
    toast({
      title: "Afiliado aprovado",
      description: "O afiliado foi aprovado com sucesso",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Afiliados</h1>
          <p className="text-gray-600">Gerencie seus afiliados e acompanhe as vendas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Afiliados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affiliateStats.totalAffiliates}</div>
              <p className="text-xs text-muted-foreground">{affiliateStats.activeAffiliates} ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {affiliateStats.totalCommissions}</div>
              <p className="text-xs text-muted-foreground">R$ {affiliateStats.pendingCommissions} pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas por Afiliados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">+12% este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.2%</div>
              <p className="text-xs text-muted-foreground">+0.5% este mês</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="affiliates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
          </TabsList>

          <TabsContent value="affiliates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciar Afiliados</CardTitle>
                    <CardDescription>Aprove e gerencie seus afiliados</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar afiliados..." className="pl-8" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {affiliates.map((affiliate) => (
                    <div key={affiliate.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold">{affiliate.name}</h3>
                          <p className="text-sm text-gray-600">{affiliate.email}</p>
                          <p className="text-xs text-gray-500">
                            Membro desde {new Date(affiliate.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{affiliate.sales} vendas</p>
                          <p className="text-sm text-gray-600">R$ {affiliate.commission}</p>
                        </div>
                        <Badge variant={affiliate.status === "active" ? "default" : "secondary"}>
                          {affiliate.status === "active" ? "Ativo" : "Pendente"}
                        </Badge>
                        {affiliate.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => approveAffiliate(affiliate.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button variant="destructive" size="sm">
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Links de Afiliados</CardTitle>
                <CardDescription>Gerencie os links de afiliados dos seus produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600">Comissão: {product.commission}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{product.sales} vendas</p>
                          <p className="text-sm text-gray-600">{product.clicks} cliques</p>
                          <p className="text-sm text-green-600">{product.conversion}% conversão</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Input value={product.affiliateUrl} readOnly className="flex-1" />
                        <Button size="sm" onClick={() => copyAffiliateLink(product.affiliateUrl)}>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Estatísticas
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Comissões</CardTitle>
                <CardDescription>Acompanhe o pagamento de comissões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "1",
                      affiliate: "Carlos Silva",
                      product: "Curso de Marketing",
                      amount: 59.1,
                      status: "paid",
                      date: "2024-01-20",
                    },
                    {
                      id: "2",
                      affiliate: "Ana Santos",
                      product: "E-book de Vendas",
                      amount: 14.1,
                      status: "pending",
                      date: "2024-01-19",
                    },
                    {
                      id: "3",
                      affiliate: "Carlos Silva",
                      product: "Curso de Marketing",
                      amount: 59.1,
                      status: "paid",
                      date: "2024-01-18",
                    },
                  ].map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{commission.affiliate}</h3>
                        <p className="text-sm text-gray-600">{commission.product}</p>
                        <p className="text-xs text-gray-500">{new Date(commission.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {commission.amount.toFixed(2)}</p>
                        <Badge variant={commission.status === "paid" ? "default" : "secondary"}>
                          {commission.status === "paid" ? "Pago" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
