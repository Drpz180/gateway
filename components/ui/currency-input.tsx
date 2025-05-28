"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { formatCurrencyInput, parseCurrency } from "@/lib/currency"

interface CurrencyInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  name?: string
  required?: boolean
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0,00",
  className,
  id,
  name,
  required,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("")

  useEffect(() => {
    // Inicializar com o valor formatado
    if (value) {
      const numericValue = parseCurrency(value)
      if (numericValue > 0) {
        setDisplayValue(formatCurrencyInput((numericValue * 100).toString()))
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    console.log("💰 CURRENCY INPUT CHANGE:", {
      inputValue,
      currentDisplayValue: displayValue,
    })

    // Formatar o valor para exibição
    const formatted = formatCurrencyInput(inputValue)
    setDisplayValue(formatted)

    // Enviar o valor numérico para o componente pai
    const numericValue = parseCurrency(formatted)

    console.log("💰 SENDING TO PARENT:", {
      formatted,
      numericValue,
      asString: numericValue.toString(),
    })

    // Enviar como string formatada brasileira para manter consistência
    onChange(formatted)
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
      <Input
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`pl-10 ${className}`}
        required={required}
      />
      {/* Campo hidden para garantir que o valor seja enviado no form */}
      <input type="hidden" name={name} value={parseCurrency(displayValue).toString()} />
    </div>
  )
}
