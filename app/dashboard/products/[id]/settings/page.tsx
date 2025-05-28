"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash2, CreditCard, Smartphone, Apple } from "lucide-react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface PaymentMethod {
  id: string
  name: string
  enabled: boolean
  icon: any
}

interface OrderBump {
  id: string
  name: string
  description: string
  price: number
  enabled: boolean
}

interface Upsell {
  id: string
  name: string
  description: string
  price: number
  enabled: boolean
  trigger: "after_purchase" | "exit_intent"
}

export default function ProductSettingsPage({ params }: { params: { id: string } }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: "pix", name: "PIX", enabled: true, icon: Smartphone },
    { id: "credit_card", name: "Cartão de Crédito", enabled: true, icon: CreditCard },
    { id: "apple_pay", name: "Apple Pay", enabled: false, icon: Apple },
    { id: "google_pay", name: "Google Pay", enabled: false, icon: Smartphone },
  ])

  const [trackingSettings, setTrackingSettings] = useState({
    facebookPixel: "",
    googleAdsId: "",
    googleAnalytics: "",
    enableTracking: true,
  })

  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([
    {
      id: "1",
      name: "Garantia Estendida",
      description: "Garantia adicional de 2 anos",
      price: 29.9,
      enabled: true,
    },
  ])

  const [upsells, setUpsells] = useState<Upsell[]>([
    {
      id: "1",
      name: "Produto Complementar",
      description: "Produto que combina perfeitamente",
      price: 97.0,
      enabled: true,
      trigger: "after_purchase",
    },
  ])

  const [checkoutSettings, setCheckoutSettings] = useState({
    enableOrderBumps: true,
    enableUpsells: true,
    enableAbandonedCart: true,
    abandonedCartDelay: 30,
    enableExitIntent: true,
  })

  const { toast } = useToast()

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods((methods) =>
      methods.map((method) => (method.id === id ? { ...method, enabled: !method.enabled } : method)),
    )
  }

  const addOrderBump = () => {
    const newBump: OrderBump = {
      id: Date.now().toString(),
      name: "Nova Oferta",
      description: "Descrição da oferta",
      price: 0,
      enabled: true,
    }
    setOrderBumps([...orderBumps, newBump])
  }

  const updateOrderBump = (id: string, field: string, value: any) => {
    setOrderBumps((bumps) => bumps.map((bump) => (bump.id === id ? { ...bump, [field]: value } : bump)))
  }

  const removeOrderBump = (id: string) => {
    setOrderBumps((bumps) => bumps.filter((bump) => bump.id !== id))
  }

  const addUpsell = () => {
    const newUpsell: Upsell = {
      id: Date.now().toString(),
      name: "Novo Upsell",
      description: "Descrição do upsell",
      price: 0,
      enabled: true,
      trigger: "after_purchase",
    }
    setUpsells([...upsells, newUpsell])
  }

  const updateUpsell = (id: string, field: string, value: any) => {
    setUpsells((upsells) => upsells.map((upsell) => (upsell.id === id ? { ...upsell, [field]: value } : upsell)))
  }

  const removeUpsell = (id: string) => {
    setUpsells((upsells) => upsells.filter((upsell) => upsell.id !== id))
  }

  const saveSettings = async () => {
    try {
      const settingsData = {
        paymentMethods,
        trackingSettings,
        orderBumps,
        upsells,
        checkoutSettings,
      }

      const response = await fetch(`/api/products/${params.id}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(settingsData),
      })

      if (response.ok) {
        toast({
          title: "Configurações salvas!",
          description: "Todas as configurações foram atualizadas com sucesso.",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/products/${params.id}/edit`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações do Produto</h1>
              <p className="text-gray-600">Configure métodos de pagamento, tracking e ofertas</p>
            </div>
          </div>
          <Button onClick={saveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments">Métodos de Pagamento</TabsTrigger>
            <TabsTrigger value="tracking">Tracking & Pixels</TabsTrigger>
            <TabsTrigger value="bumps">Order Bumps</TabsTrigger>
            <TabsTrigger value="upsells">Upsells</TabsTrigger>
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
          </TabsList>

          {/* Payment Methods */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>Configure quais métodos de pagamento estarão disponíveis no checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-gray-600" />
                        <div>
                          <h3 className="font-semibold">{method.name}</h3>
                          <p className="text-sm text-gray-600">
                            {method.id === "pix" && "Pagamento instantâneo via PIX"}
                            {method.id === "credit_card" && "Cartão de crédito em até 12x"}
                            {method.id === "apple_pay" && "Pagamento rápido com Apple Pay"}
                            {method.id === "google_pay" && "Pagamento rápido com Google Pay"}
                          </p>
                        </div>
                      </div>
                      <Switch checked={method.enabled} onCheckedChange={() => togglePaymentMethod(method.id)} />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking & Pixels */}
          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle>Tracking & Pixels</CardTitle>
                <CardDescription>Configure pixels de conversão e ferramentas de analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ativar Tracking</Label>
                    <p className="text-sm text-gray-600">Habilita todos os pixels e ferramentas de tracking</p>
                  </div>
                  <Switch
                    checked={trackingSettings.enableTracking}
                    onCheckedChange={(checked) => setTrackingSettings({ ...trackingSettings, enableTracking: checked })}
                  />
                </div>

                {trackingSettings.enableTracking && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="facebookPixel">Facebook Pixel ID</Label>
                      <Input
                        id="facebookPixel"
                        placeholder="123456789012345"
                        value={trackingSettings.facebookPixel}
                        onChange={(e) => setTrackingSettings({ ...trackingSettings, facebookPixel: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Encontre seu Pixel ID no Gerenciador de Eventos do Facebook
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="googleAds">Google Ads Conversion ID</Label>
                      <Input
                        id="googleAds"
                        placeholder="AW-123456789"
                        value={trackingSettings.googleAdsId}
                        onChange={(e) => setTrackingSettings({ ...trackingSettings, googleAdsId: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ID de conversão do Google Ads para tracking de vendas
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                      <Input
                        id="googleAnalytics"
                        placeholder="G-XXXXXXXXXX"
                        value={trackingSettings.googleAnalytics}
                        onChange={(e) => setTrackingSettings({ ...trackingSettings, googleAnalytics: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ID do Google Analytics 4 para análise de comportamento
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order Bumps */}
          <TabsContent value="bumps">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order Bumps</CardTitle>
                    <CardDescription>Ofertas adicionais exibidas durante o checkout</CardDescription>
                  </div>
                  <Button onClick={addOrderBump}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Order Bump
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ativar Order Bumps</Label>
                    <p className="text-sm text-gray-600">Exibe ofertas adicionais no checkout</p>
                  </div>
                  <Switch
                    checked={checkoutSettings.enableOrderBumps}
                    onCheckedChange={(checked) =>
                      setCheckoutSettings({ ...checkoutSettings, enableOrderBumps: checked })
                    }
                  />
                </div>

                {checkoutSettings.enableOrderBumps && (
                  <div className="space-y-4">
                    {orderBumps.map((bump) => (
                      <div key={bump.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Switch
                            checked={bump.enabled}
                            onCheckedChange={(checked) => updateOrderBump(bump.id, "enabled", checked)}
                          />
                          <Button variant="destructive" size="sm" onClick={() => removeOrderBump(bump.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nome da Oferta</Label>
                            <Input
                              value={bump.name}
                              onChange={(e) => updateOrderBump(bump.id, "name", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Preço (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={bump.price}
                              onChange={(e) => updateOrderBump(bump.id, "price", Number.parseFloat(e.target.value))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Descrição</Label>
                          <Textarea
                            value={bump.description}
                            onChange={(e) => updateOrderBump(bump.id, "description", e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upsells */}
          <TabsContent value="upsells">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upsells</CardTitle>
                    <CardDescription>Ofertas apresentadas após a compra ou em exit intent</CardDescription>
                  </div>
                  <Button onClick={addUpsell}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Upsell
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ativar Upsells</Label>
                    <p className="text-sm text-gray-600">Exibe ofertas após a compra</p>
                  </div>
                  <Switch
                    checked={checkoutSettings.enableUpsells}
                    onCheckedChange={(checked) => setCheckoutSettings({ ...checkoutSettings, enableUpsells: checked })}
                  />
                </div>

                {checkoutSettings.enableUpsells && (
                  <div className="space-y-4">
                    {upsells.map((upsell) => (
                      <div key={upsell.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Switch
                            checked={upsell.enabled}
                            onCheckedChange={(checked) => updateUpsell(upsell.id, "enabled", checked)}
                          />
                          <Button variant="destructive" size="sm" onClick={() => removeUpsell(upsell.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Nome do Upsell</Label>
                            <Input
                              value={upsell.name}
                              onChange={(e) => updateUpsell(upsell.id, "name", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Preço (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={upsell.price}
                              onChange={(e) => updateUpsell(upsell.id, "price", Number.parseFloat(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>Trigger</Label>
                            <Select
                              value={upsell.trigger}
                              onValueChange={(value) => updateUpsell(upsell.id, "trigger", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="after_purchase">Após Compra</SelectItem>
                                <SelectItem value="exit_intent">Exit Intent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Descrição</Label>
                          <Textarea
                            value={upsell.description}
                            onChange={(e) => updateUpsell(upsell.id, "description", e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checkout Settings */}
          <TabsContent value="checkout">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Checkout</CardTitle>
                <CardDescription>Configurações gerais do processo de checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Carrinho Abandonado</Label>
                    <p className="text-sm text-gray-600">Envia emails para carrinhos abandonados</p>
                  </div>
                  <Switch
                    checked={checkoutSettings.enableAbandonedCart}
                    onCheckedChange={(checked) =>
                      setCheckoutSettings({ ...checkoutSettings, enableAbandonedCart: checked })
                    }
                  />
                </div>

                {checkoutSettings.enableAbandonedCart && (
                  <div>
                    <Label>Delay para Carrinho Abandonado (minutos)</Label>
                    <Input
                      type="number"
                      value={checkoutSettings.abandonedCartDelay}
                      onChange={(e) =>
                        setCheckoutSettings({
                          ...checkoutSettings,
                          abandonedCartDelay: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exit Intent</Label>
                    <p className="text-sm text-gray-600">Exibe popup quando usuário tenta sair</p>
                  </div>
                  <Switch
                    checked={checkoutSettings.enableExitIntent}
                    onCheckedChange={(checked) =>
                      setCheckoutSettings({ ...checkoutSettings, enableExitIntent: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
