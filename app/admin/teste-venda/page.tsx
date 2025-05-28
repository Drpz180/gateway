"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, CreditCard, Package } from "lucide-react"

export default function TesteVenda() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    productId: "8", // SmartX
    buyerName: "Cliente Teste",
    buyerEmail: "cliente@teste.com",
    buyerCpf: "12345678901",
    amount: "67.90", // Preço do SmartX
  })

  const generateTxid = () => {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  const createSale = async () => {
    setLoading(true)
    setResult(null)

    try {
      const txid = generateTxid()

      console.log("🛒 Criando venda:", { ...formData, txid })

      // Criar venda no banco
      const response = await fetch("/api/sales/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.productId,
          userId: "1", // Vendedor padrão
          amount: Number.parseFloat(formData.amount),
          buyerName: formData.buyerName,
          buyerEmail: formData.buyerEmail,
          buyerCpf: formData.buyerCpf,
          transactionId: txid,
          paymentMethod: "PIX",
          status: "pending",
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar venda")
      }

      const saleData = await response.json()
      console.log("✅ Venda criada:", saleData)

      // Simular pagamento
      console.log("💳 Simulando pagamento...")
      const paymentResponse = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txid }),
      })

      if (!paymentResponse.ok) {
        throw new Error("Erro ao simular pagamento")
      }

      const paymentResult = await paymentResponse.json()
      console.log("✅ Pagamento simulado:", paymentResult)

      setResult({
        sale: saleData,
        payment: paymentResult,
        txid,
      })
    } catch (error) {
      console.error("❌ Erro:", error)
      setResult({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Simulador de Vendas</h1>
        <p className="text-muted-foreground">Crie vendas de teste para verificar se aparecem na dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Criar Venda de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
              <p className="text-sm font-medium text-blue-800 mb-1">Produtos disponíveis:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <div>
                  • ID: <code>1</code> - Curso de Marketing Digital (R$ 197,00)
                </div>
                <div>
                  • ID: <code>8</code> - SmartX (R$ 67,90)
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productId">ID do Produto</Label>
              <Input
                id="productId"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                placeholder="exemplo-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="67.90"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="buyerName">Nome do Comprador</Label>
              <Input
                id="buyerName"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                placeholder="Cliente Teste"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerEmail">Email do Comprador</Label>
              <Input
                id="buyerEmail"
                type="email"
                value={formData.buyerEmail}
                onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                placeholder="cliente@teste.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerCpf">CPF do Comprador</Label>
              <Input
                id="buyerCpf"
                value={formData.buyerCpf}
                onChange={(e) => setFormData({ ...formData, buyerCpf: e.target.value })}
                placeholder="12345678901"
              />
            </div>

            <Button onClick={createSale} disabled={loading} className="w-full">
              {loading ? "Processando..." : "🚀 Criar Venda + Simular Pagamento"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Resultado da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result && (
              <div className="text-center text-muted-foreground py-8">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Preencha o formulário e clique em "Criar Venda" para ver o resultado</p>
              </div>
            )}

            {result?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">❌ Erro</h3>
                <p className="text-red-700">{result.error}</p>
              </div>
            )}

            {result?.payment && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Venda Processada!</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>TXID:</span>
                      <Badge variant="outline">{result.txid}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Produto:</span>
                      <span className="font-medium">{result.payment.produto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vendedor:</span>
                      <span className="font-medium">{result.payment.vendedor}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">💰 Valores</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Valor Bruto:</span>
                      <span className="font-medium">R$ {result.payment.valorBruto.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa Total:</span>
                      <span className="text-red-600">-R$ {result.payment.taxaTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Valor Líquido:</span>
                      <span className="font-bold text-green-600">R$ {result.payment.valorLiquido.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">📊 Próximos Passos</h4>
                  <div className="space-y-2 text-sm text-purple-700">
                    <p>• ✅ Venda criada no banco de dados</p>
                    <p>• ✅ Pagamento processado</p>
                    <p>• ✅ Saldo do vendedor atualizado</p>
                    <p>• ✅ Estatísticas do produto atualizadas</p>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <a href="/dashboard">📈 Ver Dashboard Atualizada</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
