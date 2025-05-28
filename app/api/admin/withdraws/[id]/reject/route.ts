import { type NextRequest, NextResponse } from "next/server"
import { WithdrawDB } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token || !token.includes("admin")) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ message: "Motivo da rejeição é obrigatório" }, { status: 400 })
    }

    console.log("❌ Rejeitando saque:", params.id, "Motivo:", reason)

    const withdraw = WithdrawDB.reject(params.id, reason)

    if (!withdraw) {
      return NextResponse.json({ message: "Saque não encontrado" }, { status: 404 })
    }

    console.log("📧 Saque rejeitado:", withdraw.userName)

    // TODO: Enviar email de rejeição
    // await sendWithdrawRejectionEmail(withdraw.userId, reason)

    return NextResponse.json({
      message: "Saque rejeitado",
      withdraw: {
        id: withdraw.id,
        userName: withdraw.userName,
        amount: withdraw.amount,
        status: withdraw.status,
        rejectionReason: reason,
      },
    })
  } catch (error) {
    console.error("Erro ao rejeitar saque:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
