import { NextResponse } from "next/server"
import { efiBankVercel, EfiBankVercel } from "@/lib/efibank-vercel"

export async function POST() {
  try {
    console.log("🧪 Testando EfiBank com método Vercel-friendly...")

    if (!efiBankVercel.isConfigured()) {
      return NextResponse.json({
        success: false,
        message: "Credenciais EfiBank não configuradas",
        details: {
          clientId: !!process.env.EFIBANK_CLIENT_ID,
          clientSecret: !!process.env.EFIBANK_CLIENT_SECRET,
          pixKey: !!process.env.EFIBANK_PIX_KEY,
          sandbox: process.env.EFIBANK_SANDBOX,
        },
      })
    }

    // Dados de teste
    const testData = {
      txid: EfiBankVercel.generateTxId(),
      valor: 1.0, // R$ 1,00 para teste
      cpf: "12345678901",
      nome: "Teste Vercel",
      descricao: "Teste PIX Vercel - InfoPlatform",
      expiracao: 3600,
    }

    console.log("📋 Dados do teste:", testData)

    const result = await efiBankVercel.createPixCharge(testData)

    return NextResponse.json({
      success: true,
      message: "PIX criado com sucesso via método Vercel!",
      data: result,
    })
  } catch (error) {
    console.error("❌ Erro no teste:", error)

    return NextResponse.json({
      success: false,
      message: `Erro: ${error.message}`,
      details: {
        errorType: error.constructor.name,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    })
  }
}
