"use client"

interface ChartData {
  date: string
  amount: number
}

interface LineChartProps {
  data: ChartData[]
  period?: string
}

export function LineChart({ data, period = "7" }: LineChartProps) {
  // Preencher dados baseado no período
  const getDaysData = () => {
    const days = Number.parseInt(period)
    const result = []

    for (let i = days - 1; i >= 0; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const existingData = data?.find((item) => item.date === dateStr)
      result.push({
        date: dateStr,
        amount: existingData ? Number(existingData.amount) : 0,
        day: date.getDate(),
        month: date.toLocaleDateString("pt-BR", { month: "short" }),
        label: `${date.getDate()} ${date.toLocaleDateString("pt-BR", { month: "short" })}`,
      })
    }

    return result
  }

  const chartData = getDaysData()
  const maxAmount = Math.max(...chartData.map((d) => d.amount), 100)
  const totalSales = chartData.reduce((sum, item) => sum + item.amount, 0)

  // Função para criar o path SVG da linha
  const createPath = () => {
    const width = 600
    const height = 200
    const padding = 40

    if (chartData.length === 0) return ""

    const xStep = (width - padding * 2) / (chartData.length - 1)

    let path = ""

    chartData.forEach((point, index) => {
      const x = padding + index * xStep
      const y = height - padding - (point.amount / maxAmount) * (height - padding * 2)

      if (index === 0) {
        path += `M ${x} ${y}`
      } else {
        // Criar curva suave usando quadratic bezier
        const prevX = padding + (index - 1) * xStep
        const prevY = height - padding - (chartData[index - 1].amount / maxAmount) * (height - padding * 2)
        const cpX = (prevX + x) / 2

        path += ` Q ${cpX} ${prevY} ${x} ${y}`
      }
    })

    return path
  }

  // Função para formatar valores do eixo Y
  const formatYAxisValue = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
    return `${value.toFixed(0)}`
  }

  // Gerar valores do eixo Y
  const yAxisValues = []
  const steps = 5
  for (let i = 0; i <= steps; i++) {
    yAxisValues.push((maxAmount / steps) * i)
  }

  return (
    <div className="w-full">
      {/* Header reorganizado */}
      <div className="mb-6">
        {/* Título principal centralizado */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">GRÁFICO DE FATURAMENTO</h3>
        </div>

        {/* Valor de vendas centralizado */}
        <div className="text-center">
          <span className="text-lg font-medium text-gray-600 mr-2">VENDAS</span>
          <span className="text-xl font-bold text-gray-900">R$ {totalSales.toFixed(2).replace(".", ",")}</span>
        </div>
      </div>

      {/* Gráfico SVG */}
      <div className="relative">
        <svg width="100%" height="240" viewBox="0 0 600 240" className="overflow-visible">
          {/* Grid lines horizontais */}
          {yAxisValues.map((value, index) => {
            const y = 200 - 40 - (value / maxAmount) * 120
            return (
              <g key={index}>
                <line x1="40" y1={y} x2="560" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x="30" y={y + 4} textAnchor="end" className="text-xs fill-gray-400">
                  {formatYAxisValue(value)}
                </text>
              </g>
            )
          })}

          {/* Linha principal */}
          <path
            d={createPath()}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />

          {/* Pontos na linha */}
          {chartData.map((point, index) => {
            const x = 40 + index * ((600 - 80) / (chartData.length - 1))
            const y = 200 - 40 - (point.amount / maxAmount) * 120

            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-6 transition-all"
                />
                {/* Tooltip invisível para hover */}
                <circle cx={x} cy={y} r="12" fill="transparent" className="cursor-pointer">
                  <title>
                    {point.label}: R$ {point.amount.toFixed(2)}
                  </title>
                </circle>
              </g>
            )
          })}

          {/* Labels do eixo X */}
          {chartData.map((point, index) => {
            const x = 40 + index * ((600 - 80) / (chartData.length - 1))
            const showLabel = chartData.length <= 7 || index % Math.ceil(chartData.length / 7) === 0

            if (!showLabel) return null

            return (
              <text key={index} x={x} y="230" textAnchor="middle" className="text-xs fill-gray-500">
                {point.label}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Legenda centralizada */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-0.5 bg-blue-500 rounded"></div>
          <span>Faturamento por período</span>
        </div>
      </div>
    </div>
  )
}
