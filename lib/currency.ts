// Utilitários para formatação de moeda brasileira

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function parseCurrency(value: string | number): number {
  // Se já é um número, retorna ele
  if (typeof value === "number") return value

  // Se está vazio ou null, retorna 0
  if (!value || value === "") return 0

  // Converter para string se necessário
  const stringValue = value.toString()

  // Remove todos os caracteres que não são dígitos, vírgula ou ponto
  const cleanValue = stringValue.replace(/[^\d,.-]/g, "")

  // Se está vazio após limpeza, retorna 0
  if (!cleanValue) return 0

  console.log("🔍 PARSING CURRENCY:", {
    original: value,
    cleaned: cleanValue,
  })

  // Se tem vírgula, trata como decimal brasileiro (123,45)
  if (cleanValue.includes(",")) {
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto
    const normalized = cleanValue.replace(/\./g, "").replace(",", ".")
    const result = Number.parseFloat(normalized) || 0
    console.log("  Resultado (vírgula):", result)
    return result
  }

  // Se só tem ponto, trata como decimal americano (123.45)
  const result = Number.parseFloat(cleanValue) || 0
  console.log("  Resultado (ponto):", result)
  return result
}

export function formatCurrencyInput(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "")

  // Se está vazio, retorna vazio
  if (!numbers) return ""

  // Converte para centavos
  const cents = Number.parseInt(numbers, 10)

  // Converte de volta para reais
  const reais = cents / 100

  // Formata como moeda brasileira sem o símbolo R$
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
