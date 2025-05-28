"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyInput } from "@/components/ui/currency-input"
import { parseCurrency } from "@/lib/currency"

export default function TestePrecoPage() {
  const [price, setPrice] = useState("")

  const handleTest = async () => {
    console.log("🧪 TESTE DE PREÇO")
    console.log("  Valor original:", price)
    console.log("  Valor parseado:", parseCurrency(price))

    const formData = new FormData()
    formData.append("name", "Produto Teste")
    formData.append("description", "Descrição teste")
    formData.append("price", parseCurrency(price).toString())

    console.log("📤 Enviando para API...")

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("📋 RESULTADO:", result)
    } catch (error) {
      console.error("❌ ERRO:", error)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🧪 Teste de Preço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Preço:</label>
            <CurrencyInput value={price} onChange={setPrice} placeholder="97,00" />
          </div>

          <div className="text-sm text-gray-600">
            <p>Valor atual: "{price}"</p>
            <p>Valor parseado: {parseCurrency(price)}</p>
            <p>É maior que zero: {parseCurrency(price) > 0 ? "✅ Sim" : "❌ Não"}</p>
          </div>

          <Button onClick={handleTest} className="w-full">
            🧪 Testar API
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
