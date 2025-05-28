"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, DollarSign, Percent, Calculator } from "lucide-react"
import AdminLayout from "@/components/layouts/AdminLayout"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracoesFinanceirasPage() {
  const [settings, setSettings] = useState({
    taxaSaquePix: 1.5,
    taxaRetencaoVenda: 10.0,
    taxaFixaVenda: 1.99,
  })

  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/configuracoes-financeiras", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
    }
  }

  const handleSave = async () => {
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/configuracoes-financeiras", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Configurações salvas com sucesso",
        })
      } else {
        throw new Error("Erro ao salvar")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setSettings((prev) => ({
      ...prev,
      [field]: numValue,
    }))
  }

  const calcularExemplo = (valorVenda: number) => {
    const taxaRetencao = (valorVenda * settings.taxaRetencaoVenda) / 100
    const taxaFixa = settings.taxaFixaVenda
    const valorLiquido = valorVenda - taxaRetencao - taxaFixa

    return {
      valorBruto: valorVenda,
      taxaRetencao,
      taxaFixa,
      valorLiquido: Math.max(0, valorLiquido),
    }
  }

  const exemplo80 = calcularExemplo(80)
  const exemplo150 = calcularExemplo(150)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações Financeiras</h1>
          <p className="text-gray-600">Configure as taxas e comissões da plataforma</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Taxas da Plataforma
              </CardTitle>
              <CardDescription>Configure as taxas aplicadas nas vendas e saques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="taxaRetencao">Taxa de Retenção por Venda (%)</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Percent className="h-4 w-4 text-gray-400" />
                  <Input
                    id="taxaRetencao"
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={settings.taxaRetencaoVenda}
                    onChange={(e) => handleInputChange("taxaRetencaoVenda", e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Percentual retido sobre o valor de cada venda</p>
              </div>

              <div>
                <Label htmlFor="taxaFixa">Taxa Fixa por Venda (R$)</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <Input
                    id="taxaFixa"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.taxaFixaVenda}
                    onChange={(e) => handleInputChange("taxaFixaVenda", e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Valor fixo descontado de cada venda</p>
              </div>

              <div>
                <Label htmlFor="taxaSaque">Taxa de Saque PIX (%)</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Percent className="h-4 w-4 text-gray-400" />
                  <Input
                    id="taxaSaque"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={settings.taxaSaquePix}
                    onChange={(e) => handleInputChange("taxaSaquePix", e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Taxa cobrada sobre saques via PIX</p>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardContent>
          </Card>

          {/* Simulador */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Simulador de Taxas
              </CardTitle>
              <CardDescription>Veja como as taxas são aplicadas nas vendas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Exemplo 1 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Venda de R$ 80,00</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor bruto:</span>
                    <span className="font-medium">R$ {exemplo80.valorBruto.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Taxa de retenção ({settings.taxaRetencaoVenda}%):</span>
                    <span>-R$ {exemplo80.taxaRetencao.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Taxa fixa:</span>
                    <span>-R$ {exemplo80.taxaFixa.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Valor líquido:</span>
                    <span>R$ {exemplo80.valorLiquido.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Exemplo 2 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Venda de R$ 150,00</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor bruto:</span>
                    <span className="font-medium">R$ {exemplo150.valorBruto.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Taxa de retenção ({settings.taxaRetencaoVenda}%):</span>
                    <span>-R$ {exemplo150.taxaRetencao.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Taxa fixa:</span>
                    <span>-R$ {exemplo150.taxaFixa.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Valor líquido:</span>
                    <span>R$ {exemplo150.valorLiquido.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Informações */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Como funciona</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Taxa de retenção é calculada sobre o valor total</li>
                  <li>• Taxa fixa é descontada independente do valor</li>
                  <li>• Vendedor recebe o valor líquido no saldo</li>
                  <li>• Saques têm taxa adicional de {settings.taxaSaquePix}%</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
