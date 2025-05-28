"use client"

interface ChartData {
  date: string
  amount: number
}

interface SimpleChartProps {
  data: ChartData[]
}

export function SimpleChart({ data }: SimpleChartProps) {
  console.log("Chart data received:", data) // Debug

  // Preencher dados dos últimos 7 dias
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const existingData = data?.find((item) => item.date === dateStr)
    last7Days.push({
      date: dateStr,
      amount: existingData ? Number(existingData.amount) : 0,
      day: date.getDate(),
    })
  }

  console.log("Last 7 days data:", last7Days) // Debug

  const maxAmount = Math.max(...last7Days.map((d) => d.amount), 1)
  console.log("Max amount:", maxAmount) // Debug

  return (
    <div className="h-48 w-full">
      <div className="h-40 flex items-end justify-between gap-2 px-4">
        {last7Days.map((item, index) => {
          // Garantir altura mínima visível
          const percentage = maxAmount > 0 ? item.amount / maxAmount : 0
          const height = Math.max(percentage * 120, item.amount > 0 ? 8 : 4)

          return (
            <div key={index} className="flex flex-col items-center flex-1 max-w-[50px]">
              <div className="relative group w-full flex justify-center">
                <div
                  className={`rounded-t transition-all duration-300 cursor-pointer ${
                    item.amount > 0 ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-200"
                  }`}
                  style={{
                    height: `${height}px`,
                    width: "24px",
                  }}
                />
                {/* Tooltip */}
                {item.amount > 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    R$ {item.amount.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dias */}
      <div className="h-8 flex items-center justify-between gap-2 px-4 border-t border-gray-200">
        {last7Days.map((item, index) => (
          <div key={index} className="flex-1 max-w-[50px] text-center">
            <span className="text-xs text-muted-foreground font-medium">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
