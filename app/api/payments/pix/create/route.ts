export const runtime = "nodejs" // ESSENCIAL para usar certificado com HTTPS

import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { efiBankService, EfiBankService } from "@/lib/efibank-service"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    console.log("💳 Iniciando criação de cobrança PIX...")

    const { productId, amount, buyerName, buyerEmail, buyerCpf, description } = await request.json()

    if (!productId || !amount || !buyerName || !buyerEmail || !buyerCpf) {
      return NextResponse.json({ success: false, message: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    const productResult = await sql`
      SELECT id, nome as name, preco as price, user_id, status 
      FROM products 
      WHERE id = ${productId}
    `

    if (productResult.length === 0) {
      return NextResponse.json({ success: false, message: "Produto não encontrado" }, { status: 404 })
    }

    const product = productResult[0]

    if (product.status !== "approved") {
      return NextResponse.json({ success: false, message: "Produto não aprovado para venda" }, { status: 400 })
    }

    const txid = EfiBankService.generateTxId()
    console.log("🆔 TXID gerado:", txid)

    let pixResult
    let isMock = false

    if (efiBankService.isConfigured()) {
      try {
        console.log("🏦 Criando PIX real via EfiBank...")

        pixResult = await efiBankService.createPixCharge({
          txid,
          valor: Number(amount),
          cpf: buyerCpf,
          nome: buyerName,
          descricao: description || `Pagamento - ${product.name}`,
          expiracao: 3600,
        })

        console.log("✅ PIX real criado com sucesso!")
      } catch (efiBankError: any) {
        console.error("❌ Erro no EfiBank:", efiBankError.message)
        console.log("🔄 Fallback para PIX mock...")

        pixResult = createMockPix(txid, Number(amount), buyerName, description || product.name)
        isMock = true
      }
    } else {
      console.log("⚠️ Credenciais EfiBank não configuradas, usando mock...")
      pixResult = createMockPix(txid, Number(amount), buyerName, description || product.name)
      isMock = true
    }

    const saleResult = await sql`
      INSERT INTO sales (
        product_id, user_id, amount, status, payment_method, 
        transaction_id, buyer_name, buyer_email, buyer_cpf,
        pix_qr_code, pix_copy_paste, expires_at
      ) VALUES (
        ${productId}, ${product.user_id}, ${amount}, 'pending', 'pix',
        ${pixResult.txid}, ${buyerName}, ${buyerEmail}, ${buyerCpf},
        ${pixResult.qrCode}, ${pixResult.copyPasteCode}, ${pixResult.expiresAt}
      ) RETURNING id
    `

    console.log("✅ Venda registrada com sucesso. ID:", saleResult[0].id)

    return NextResponse.json({
      success: true,
      txid: pixResult.txid,
      qrCode: pixResult.qrCode,
      copyPasteCode: pixResult.copyPasteCode,
      linkPagamento: pixResult.linkPagamento,
      expiresAt: pixResult.expiresAt,
      amount: pixResult.valor,
      message: isMock ? "PIX mock gerado (credenciais não configuradas)" : "PIX real gerado com sucesso",
      mock: isMock,
      saleId: saleResult[0].id,
    })
  } catch (error: any) {
    console.error("❌ Erro geral:", error)
    return NextResponse.json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }, { status: 500 })
  }
}

function createMockPix(txid: string, amount: number, buyerName: string, description: string) {
  const qrCodeSVG = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="10" y="10" width="20" height="20" fill="black"/>
      <rect x="40" y="10" width="20" height="20" fill="black"/>
      <rect x="70" y="10" width="20" height="20" fill="black"/>
      <rect x="100" y="10" width="20" height="20" fill="black"/>
      <rect x="130" y="10" width="20" height="20" fill="black"/>
      <rect x="160" y="10" width="20" height="20" fill="black"/>
      <text x="100" y="195" text-anchor="middle" font-family="Arial" font-size="12" fill="black">PIX MOCK</text>
    </svg>
  `

  const base64SVG = Buffer.from(qrCodeSVG).toString("base64")

  return {
    txid,
    qrCode: `data:image/svg+xml;base64,${base64SVG}`,
    copyPasteCode: `00020126580014br.gov.bcb.pix0136mock@pix.com0208${description.substring(0, 25)}5204000053039865802BR5925${buyerName.substring(0, 25)}6009SAO PAULO62070503***6304ABCD`,
    linkPagamento: `https://mock-pix.com/qr/${txid}`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    valor: amount,
  }
}
