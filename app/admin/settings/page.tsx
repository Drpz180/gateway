"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Save, Globe, Shield, DollarSign } from "lucide-react"
import AdminLayout from "@/components/layouts/AdminLayout"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "InfoPlatform",
    siteDescription: "Plataforma de infoprodutos",
    siteUrl: "https://infoplatform.com",
    supportEmail: "suporte@infoplatform.com",
    allowRegistrations: true,
    requireEmailVerification: true,
    enableAffiliateProgram: true,
    defaultCommissionRate: 30,
    pixKey: "",
    efiClientId: "",
    efiClientSecret: "",
    efiSandbox: true,
    maintenanceMode: false,
    maintenanceMessage: "Site em manutenção. Voltamos em breve!",
  })

  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      // Simular salvamento das configurações
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Gerencie as configurações da plataforma</p>
          </div>
          <Button onClick={saveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {/* Site Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Configurações do Site</span>
            </CardTitle>
            <CardDescription>Configurações gerais da plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nome do Site</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange("siteName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">URL do Site</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => handleInputChange("siteUrl", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Descrição do Site</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Suporte</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleInputChange("supportEmail", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Configurações de Usuário</span>
            </CardTitle>
            <CardDescription>Configurações relacionadas aos usuários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir Novos Registros</Label>
                <p className="text-sm text-gray-600">Permitir que novos usuários se registrem na plataforma</p>
              </div>
              <Switch
                checked={settings.allowRegistrations}
                onCheckedChange={(checked) => handleInputChange("allowRegistrations", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Verificação de Email Obrigatória</Label>
                <p className="text-sm text-gray-600">Exigir verificação de email para novos usuários</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleInputChange("requireEmailVerification", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Programa de Afiliados</span>
            </CardTitle>
            <CardDescription>Configurações do programa de afiliados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar Programa de Afiliados</Label>
                <p className="text-sm text-gray-600">Permitir que usuários se tornem afiliados</p>
              </div>
              <Switch
                checked={settings.enableAffiliateProgram}
                onCheckedChange={(checked) => handleInputChange("enableAffiliateProgram", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultCommissionRate">Taxa de Comissão Padrão (%)</Label>
              <Input
                id="defaultCommissionRate"
                type="number"
                min="0"
                max="100"
                value={settings.defaultCommissionRate}
                onChange={(e) => handleInputChange("defaultCommissionRate", Number.parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Configurações de Pagamento</span>
            </CardTitle>
            <CardDescription>Configurações dos métodos de pagamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                value={settings.pixKey}
                onChange={(e) => handleInputChange("pixKey", e.target.value)}
                placeholder="sua-chave-pix@email.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="efiClientId">EfiBank Client ID</Label>
                <Input
                  id="efiClientId"
                  value={settings.efiClientId}
                  onChange={(e) => handleInputChange("efiClientId", e.target.value)}
                  placeholder="Client_Id_..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="efiClientSecret">EfiBank Client Secret</Label>
                <Input
                  id="efiClientSecret"
                  type="password"
                  value={settings.efiClientSecret}
                  onChange={(e) => handleInputChange("efiClientSecret", e.target.value)}
                  placeholder="Client_Secret_..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Sandbox (EfiBank)</Label>
                <p className="text-sm text-gray-600">Usar ambiente de testes do EfiBank</p>
              </div>
              <Switch
                checked={settings.efiSandbox}
                onCheckedChange={(checked) => handleInputChange("efiSandbox", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Modo Manutenção</span>
            </CardTitle>
            <CardDescription>Configurações de manutenção do site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ativar Modo Manutenção</Label>
                <p className="text-sm text-gray-600">Exibir página de manutenção para visitantes</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenanceMessage">Mensagem de Manutenção</Label>
              <Textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => handleInputChange("maintenanceMessage", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
