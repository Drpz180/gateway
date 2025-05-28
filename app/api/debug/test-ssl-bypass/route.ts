import { NextResponse } from "next/server"

export async function GET() {
  const tests = []

  // Teste 1: Fetch padrão
  try {
    const response = await fetch("https://pix-h.api.efipay.com.br/oauth/token", {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })
    tests.push({
      name: "Fetch Padrão",
      status: response.status,
      success: true,
      headers: Object.fromEntries(response.headers.entries()),
    })
  } catch (error) {
    tests.push({
      name: "Fetch Padrão",
      success: false,
      error: error.message,
    })
  }

  // Teste 2: Com timeout maior
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s

    const response = await fetch("https://pix-h.api.efipay.com.br/oauth/token", {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Node.js/18.0.0",
        Accept: "application/json",
      },
    })

    clearTimeout(timeoutId)
    tests.push({
      name: "Fetch com Timeout 30s",
      status: response.status,
      success: true,
    })
  } catch (error) {
    tests.push({
      name: "Fetch com Timeout 30s",
      success: false,
      error: error.message,
    })
  }

  // Teste 3: Teste de DNS
  try {
    const dnsTest = await fetch("https://httpbin.org/get", {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    })
    tests.push({
      name: "DNS Test (httpbin.org)",
      status: dnsTest.status,
      success: true,
    })
  } catch (error) {
    tests.push({
      name: "DNS Test (httpbin.org)",
      success: false,
      error: error.message,
    })
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      vercel: !!process.env.VERCEL,
    },
    tests,
    recommendation: tests.some((t) => t.name.includes("EfiBank") && t.success)
      ? "✅ Conexão funcionando!"
      : "❌ Problema de SSL/TLS. Vamos usar proxy ou bypass.",
  })
}
