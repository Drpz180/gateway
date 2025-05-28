import { type NextRequest, NextResponse } from "next/server"
import { ProductDB, UserDB, WithdrawDB, SalesDB } from "@/lib/database"

function validateAdminJWT(token: string): { userId: string; role: string } | null {
  try {
    if (!token || token.length < 10) {
      return null
    }

    if (token.includes("admin") || token.length > 50) {
      return { userId: "admin", role: "admin" }
    }

    return null
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const decoded = validateAdminJWT(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    // Buscar dados do dashboard
    const products = ProductDB.findAll()
    const users = UserDB.findAll()
    const withdrawRequests = WithdrawDB.findAll()

    // Estatísticas de vendas
    const salesStats = SalesDB.getStats()

    const stats = {
      totalUsers: users.length,
      pendingUsers: users.filter((u) => u.status === "pending").length,
      approvedUsers: users.filter((u) => u.status === "approved").length,
      blockedUsers: users.filter((u) => u.status === "blocked").length,
      totalProducts: products.length,
      pendingProducts: products.filter((p) => p.status === "pending").length,
      approvedProducts: products.filter((p) => p.status === "approved").length,
      rejectedProducts: products.filter((p) => p.status === "rejected").length,
      totalSales: salesStats.totalSales,
      totalRevenue: salesStats.totalRevenue,
      pendingWithdraws: withdrawRequests.filter((w) => w.status === "pending").length,
      totalWithdraws: withdrawRequests.length,
      paymentMethodStats: salesStats.paymentMethodStats,
      salesByDate: salesStats.salesByDate,
    }

    const pendingUsers = users
      .filter((u) => u.status === "pending")
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        documents: user.documents,
        createdAt: user.createdAt,
      }))

    const pendingProducts = products
      .filter((p) => p.status === "pending")
      .map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        creator: product.creator,
        status: product.status,
        image: product.image,
        price: product.price,
        createdAt: product.createdAt,
      }))

    const pendingWithdraws = withdrawRequests
      .filter((w) => w.status === "pending")
      .map((withdraw) => ({
        id: withdraw.id,
        userName: withdraw.userName,
        amount: withdraw.amount,
        method: withdraw.method,
        pixKey: withdraw.pixKey,
        bankData: withdraw.bankData,
        createdAt: withdraw.createdAt,
      }))

    return NextResponse.json({
      stats,
      pendingUsers,
      pendingProducts,
      pendingWithdraws,
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
