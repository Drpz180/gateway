import { NextResponse } from "next/server"

export async function GET() {
  try {
    const envStatus = {
      EFIBANK_CLIENT_ID: !!process.env.EFIBANK_CLIENT_ID,
      EFIBANK_CLIENT_SECRET: !!process.env.EFIBANK_CLIENT_SECRET,
      EFIBANK_PIX_KEY: !!process.env.EFIBANK_PIX_KEY,
      EFIBANK_SANDBOX: !!process.env.EFIBANK_SANDBOX,
      EFIBANK_CERTIFICATE_BASE64: !!process.env.EFIBANK_CERTIFICATE_BASE64,
      EFIBANK_CERTIFICATE_PATH: !!process.env.EFIBANK_CERTIFICATE_PATH,
    }

    return NextResponse.json(envStatus)
  } catch (error) {
    console.error("Erro ao verificar variáveis de ambiente:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
