"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function TestePagamento() {
  const [txid, setTxid] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const simularPagamento = async () => {
    if (!txid.trim()) {
      toast({
        title: "Erro",
        description: "Digite um TXID válido",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid: txid.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: `Pagamento simulado: R$ ${data.valorLiquido.toFixed(2)} creditado`,
        })
        setTxid("")
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao simular pagamento",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🧪 Teste de Pagamento</CardTitle>
          <p className="text-sm text-gray-600">Simule um pagamento PIX para desenvolvimento</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="txid">TXID da Transação</Label>
            <Input
              id="txid"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              placeholder="Ex: TXN1234567890ABC"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Cole aqui o TXID gerado quando você criou um PIX</p>
          </div>

          <Button onClick={simularPagamento} disabled={loading} className="w-full">
            {loading ? "Processando..." : "Simular Pagamento"}
          </Button>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Como usar:</h4>
            <ol className="text-xs space-y-1 list-decimal list-inside">
              <li>Gere um PIX em qualquer checkout</li>
              <li>Copie o TXID do console ou resposta</li>
              <li>Cole aqui e clique em "Simular Pagamento"</li>
              <li>O saldo será creditado automaticamente</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
