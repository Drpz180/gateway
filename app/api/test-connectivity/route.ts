import { NextResponse } from "next/server"

export async function GET() {
  const tests = []

  // Teste 1: Google (deve funcionar)
  try {
    const googleResponse = await fetch("https://www.google.com", {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    })
    tests.push({
      name: "Google",
      status: googleResponse.status,
      success: googleResponse.ok,
    })
  } catch (error) {
    tests.push({
      name: "Google",
      status: "ERRO",
      success: false,
      error: error.message,
    })
  }

  // Teste 2: EfiBank Sandbox
  try {
    const efiBankResponse = await fetch("https://pix-h.api.efipay.com.br", {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    })
    tests.push({
      name: "EfiBank Sandbox",
      status: efiBankResponse.status,
      success: efiBankResponse.ok,
    })
  } catch (error) {
    tests.push({
      name: "EfiBank Sandbox",
      status: "ERRO",
      success: false,
      error: error.message,
    })
  }

  // Teste 3: EfiBank Produção
  try {
    const efiBankProdResponse = await fetch("https://pix.api.efipay.com.br", {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    })
    tests.push({
      name: "EfiBank Produção",
      status: efiBankProdResponse.status,
      success: efiBankProdResponse.ok,
    })
  } catch (error) {
    tests.push({
      name: "EfiBank Produção",
      status: "ERRO",
      success: false,
      error: error.message,
    })
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    tests,
    summary: {
      total: tests.length,
      success: tests.filter((t) => t.success).length,
      failed: tests.filter((t) => !t.success).length,
    },
  })
}
