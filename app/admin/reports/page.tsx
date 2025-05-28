"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, TrendingUp, DollarSign, Users, Calendar } from "lucide-react"
import AdminLayout from "@/components/layouts/AdminLayout"

export default function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      // Simular dados de relatórios
      const mockReports = [
        {
          id: "1",
          name: "Relatório de Vendas - Janeiro 2024",
          type: "sales",
          period: "monthly",
          status: "ready",
          createdAt: "2024-01-31T23:59:00Z",
          fileSize: "2.3 MB",
        },
        {
          id: "2",
          name: "Relatório de Usuários - Janeiro 2024",
          type: "users",
          period: "monthly",
          status: "ready",
          createdAt: "2024-01-31T23:59:00Z",
          fileSize: "1.8 MB",
        },
        {
          id: "3",
          name: "Relatório de Produtos - Janeiro 2024",
          type: "products",
          period: "monthly",
          status: "processing",
          createdAt: "2024-01-31T23:59:00Z",
          fileSize: null,
        },
        {
          id: "4",
          name: "Relatório Financeiro - Q4 2023",
          type: "financial",
          period: "quarterly",
          status: "ready",
          createdAt: "2023-12-31T23:59:00Z",
          fileSize: "5.1 MB",
        },
      ]

      setReports(mockReports)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type: string) => {
    try {
      console.log(`Generating ${type} report...`)
      // Aqui você faria a chamada para gerar o relatório
      // await fetch(`/api/admin/reports/generate`, { method: 'POST', body: JSON.stringify({ type }) })
    } catch (error) {
      console.error("Error generating report:", error)
    }
  }

  const downloadReport = async (reportId: string) => {
    try {
      console.log(`Downloading report ${reportId}...`)
      // Aqui você faria o download do relatório
      // window.open(`/api/admin/reports/${reportId}/download`)
    } catch (error) {
      console.error("Error downloading report:", error)
    }
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case "sales":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "users":
        return <Users className="h-5 w-5 text-blue-600" />
      case "products":
        return <FileText className="h-5 w-5 text-purple-600" />
      case "financial":
        return <DollarSign className="h-5 w-5 text-orange-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getReportTypeName = (type: string) => {
    switch (type) {
      case "sales":
        return "Vendas"
      case "users":
        return "Usuários"
      case "products":
        return "Produtos"
      case "financial":
        return "Financeiro"
      default:
        return "Relatório"
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Gere e baixe relatórios detalhados da plataforma</p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Gerar Novos Relatórios</CardTitle>
            <CardDescription>Clique nos botões abaixo para gerar relatórios atualizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => generateReport("sales")}
              >
                <TrendingUp className="h-6 w-6 text-green-600" />
                <span>Relatório de Vendas</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => generateReport("users")}
              >
                <Users className="h-6 w-6 text-blue-600" />
                <span>Relatório de Usuários</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => generateReport("products")}
              >
                <FileText className="h-6 w-6 text-purple-600" />
                <span>Relatório de Produtos</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => generateReport("financial")}
              >
                <DollarSign className="h-6 w-6 text-orange-600" />
                <span>Relatório Financeiro</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis ({reports.length})</CardTitle>
            <CardDescription>Lista de relatórios gerados e disponíveis para download</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getReportIcon(report.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{report.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(report.createdAt).toLocaleDateString("pt-BR")}</span>
                          <span>•</span>
                          <span>{getReportTypeName(report.type)}</span>
                          {report.fileSize && (
                            <>
                              <span>•</span>
                              <span>{report.fileSize}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          report.status === "ready"
                            ? "default"
                            : report.status === "processing"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {report.status === "ready" ? "Pronto" : report.status === "processing" ? "Processando" : "Erro"}
                      </Badge>
                      {report.status === "ready" && (
                        <Button variant="outline" size="sm" onClick={() => downloadReport(report.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum relatório encontrado</h3>
                <p className="text-gray-600">Gere seu primeiro relatório usando os botões acima</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
