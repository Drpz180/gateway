"use client"

import { useState, useEffect } from "react"

interface SellerStats {
  todaySales: number
  monthSales: number
  availableBalance: number
  salesData: Array<{ date: string; amount: number }>
  paymentMethods: Array<{ method: string; amount: number; count: number }>
  totalProducts: number
  totalSales: number
}

export function useSellerStats(sellerId: string) {
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/seller/stats?sellerId=${sellerId}`)
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    if (sellerId) {
      fetchStats()
    }
  }, [sellerId])

  return { stats, loading }
}
