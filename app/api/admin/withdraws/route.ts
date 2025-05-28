import { type NextRequest, NextResponse } from "next/server"
import { WithdrawDB } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token || !token.includes("admin")) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    const withdraws = WithdrawDB.findAll()

    return NextResponse.json({
      withdraws: withdraws.map((w) => ({
        id: w.id,
        userName: w.userName,
        amount: w.amount,
        method: w.method,
        pixKey: w.pixKey,
        bankData: w.bankData,
        status: w.status,
        rejectionReason: w.rejectionReason,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })),
    })
  } catch (error) {
    console.error("Erro ao buscar saques:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
