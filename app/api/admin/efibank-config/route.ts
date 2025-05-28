import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Retornar status das configurações (sem expor valores sensíveis)
    const config = {
      clientId: !!process.env.EFIBANK_CLIENT_ID,
      clientSecret: !!process.env.EFIBANK_CLIENT_SECRET,
      pixKey: process.env.EFIBANK_PIX_KEY || "",
      sandbox: process.env.EFIBANK_SANDBOX === "true",
      certificatePath: process.env.EFIBANK_CERTIFICATE_PATH || "",
      certificateBase64: !!process.env.EFIBANK_CERTIFICATE_BASE64,
    }

    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error) {
    console.error("Erro ao obter config EfiBank:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
