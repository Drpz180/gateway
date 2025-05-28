"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function TestePIXMock() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    transactionId: "",
    status: "paid",
  })

  const handleSimulatePayment = async () => {
    if (!formData.transactionId) {
      alert("Digite o ID da transação")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txid: formData.transactionId,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Erro:", error)
      setResult({ error: "Erro ao simular pagamento" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Teste PIX Mock</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Simular Pagamento PIX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="transactionId">ID da Transação</Label>
              <Input
                id="transactionId"
                value={formData.transactionId}
                onChange={(e) => setFormData((prev) => ({ ...prev, transactionId: e.target.value }))}
                placeholder="TXN123456789"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 border rounded"
              >
                <option value="paid">Pago</option>
                <option value="cancelled">Cancelado</option>
                <option value="expired">Expirado</option>
              </select>
            </div>

            <Button onClick={handleSimulatePayment} disabled={loading} className="w-full">
              {loading ? "Simulando..." : "Simular Pagamento"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            {result && (
              <Textarea value={JSON.stringify(result, null, 2)} readOnly rows={15} className="font-mono text-sm" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>1.</strong> Gere um PIX no checkout de qualquer produto
            </p>
            <p>
              <strong>2.</strong> Copie o ID da transação (TXN...)
            </p>
            <p>
              <strong>3.</strong> Cole aqui e clique em "Simular Pagamento"
            </p>
            <p>
              <strong>4.</strong> O sistema atualizará o status do pagamento automaticamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
