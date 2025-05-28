import { NextResponse } from "next/server"
import { createPixCharge } from "@/lib/gerencianet"

export async function POST(request: Request) {
  try {
    // Capturar o corpo da requisição
    const body = await request.json()
    const { name, cpf, amount, description } = body

    console.log("Recebendo solicitação para gerar Pix:", { name, cpf, amount, description })

    // Validar os dados
    if (!name || !cpf || !amount) {
      console.log("Dados incompletos")
      return NextResponse.json({ success: false, message: "Dados incompletos" }, { status: 400 })
    }

    // Converter o valor para número
    let numericAmount
    try {
      // Remover pontos e substituir vírgula por ponto
      const cleanAmount = amount.toString().replace(/\./g, "").replace(",", ".")
      numericAmount = Number.parseFloat(cleanAmount)

      if (isNaN(numericAmount) || numericAmount <= 0) {
        console.log("Valor inválido:", amount, "->", numericAmount)
        return NextResponse.json({ success: false, message: "Valor inválido" }, { status: 400 })
      }
    } catch (error) {
      console.error("Erro ao processar valor:", error)
      return NextResponse.json({ success: false, message: "Erro ao processar valor" }, { status: 400 })
    }

    console.log("Valor processado:", numericAmount)

    // Verificar se as credenciais estão configuradas
    const hasCredentials = process.env.PIX_CLIENT_ID && process.env.PIX_SECRET_KEY && process.env.PIX_KEY

    if (!hasCredentials) {
      console.error("Credenciais não configuradas")
      return NextResponse.json(
        {
          success: false,
          message:
            "Credenciais da EFI Pay não configuradas. Configure as variáveis de ambiente PIX_CLIENT_ID, PIX_SECRET_KEY e PIX_KEY.",
        },
        { status: 500 },
      )
    }

    // Usar a integração real com a EFI Pay
    try {
      console.log("Criando cobrança Pix com a EFI Pay...")
      const pixData = await createPixCharge({
        value: numericAmount,
        payerName: name,
        payerDocument: cpf,
        description,
      })

      console.log("Cobrança Pix criada com sucesso:", pixData)

      return NextResponse.json({
        success: true,
        data: pixData,
      })
    } catch (error: any) {
      console.error("Erro na integração com a EFI Pay:", error)

      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar cobrança Pix: " + (error.message || "Erro desconhecido"),
          detalhes: error.response?.data || {},
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error)

    // Garantir que sempre retornamos um JSON válido, mesmo em caso de erro
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar requisição",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
