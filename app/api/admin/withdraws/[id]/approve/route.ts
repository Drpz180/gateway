import { type NextRequest, NextResponse } from "next/server"
import { WithdrawDB } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token || !token.includes("admin")) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    console.log("💰 Aprovando saque:", params.id)

    const withdraw = WithdrawDB.approve(params.id)

    if (!withdraw) {
      return NextResponse.json({ message: "Saque não encontrado" }, { status: 404 })
    }

    console.log("✅ Saque aprovado:", withdraw.userName, "R$", withdraw.amount)

    // TODO: Processar pagamento real
    // await processPayment(withdraw)

    return NextResponse.json({
      message: "Saque aprovado com sucesso",
      withdraw: {
        id: withdraw.id,
        userName: withdraw.userName,
        amount: withdraw.amount,
        status: withdraw.status,
      },
    })
  } catch (error) {
    console.error("Erro ao aprovar saque:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
