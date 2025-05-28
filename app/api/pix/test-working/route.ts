import { type NextRequest, NextResponse } from "next/server"
import { createPixCharge } from "@/lib/gerencianet-working"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testando PIX com implementação que funciona...")

    const { amount, payerName, payerDocument, description } = await request.json()

    const result = await createPixCharge({
      value: Number(amount),
      payerName,
      payerDocument,
      description,
    })

    console.log("✅ PIX criado com implementação que funciona!")

    return NextResponse.json({
      success: true,
      txid: result.txid,
      qrCode: result.qrCode,
      copyPasteCode: result.pixCopiaECola,
      status: result.status,
      amount: result.valor,
      message: "PIX criado com implementação que funciona!",
    })
  } catch (error) {
    console.error("❌ Erro na implementação que funciona:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        error: error.stack,
      },
      { status: 500 },
    )
  }
}
