import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🔄 Testando EfiBank com diferentes estratégias...")

    // Estratégia 1: Usar proxy CORS
    const corsProxyTest = async () => {
      try {
        const proxyUrl = "https://cors-anywhere.herokuapp.com/"
        const targetUrl = "https://pix-h.api.efipay.com.br/oauth/token"

        const response = await fetch(proxyUrl + targetUrl, {
          method: "GET",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        })

        return {
          success: true,
          status: response.status,
          method: "CORS Proxy",
        }
      } catch (error) {
        return {
          success: false,
          error: error.message,
          method: "CORS Proxy",
        }
      }
    }

    // Estratégia 2: Simular requisição OAuth
    const simulateOAuth = async () => {
      try {
        // Simular dados que seriam enviados
        const credentials = {
          client_id: process.env.EFIBANK_CLIENT_ID || "test",
          client_secret: process.env.EFIBANK_CLIENT_SECRET || "test",
          grant_type: "client_credentials",
        }

        return {
          success: true,
          method: "OAuth Simulation",
          credentials: {
            client_id: credentials.client_id ? "✅ Configurado" : "❌ Faltando",
            client_secret: credentials.client_secret ? "✅ Configurado" : "❌ Faltando",
          },
          nextStep: "Testar com credenciais reais",
        }
      } catch (error) {
        return {
          success: false,
          error: error.message,
          method: "OAuth Simulation",
        }
      }
    }

    // Estratégia 3: Teste local vs Vercel
    const environmentTest = () => {
      const isLocal = !process.env.VERCEL
      const hasCredentials = !!(process.env.EFIBANK_CLIENT_ID && process.env.EFIBANK_CLIENT_SECRET)

      return {
        success: true,
        method: "Environment Check",
        environment: isLocal ? "🏠 Local" : "☁️ Vercel",
        credentials: hasCredentials ? "✅ Configuradas" : "❌ Faltando",
        recommendation: isLocal ? "Use hotspot do celular ou VPN" : "Deploy no Vercel pode resolver SSL",
      }
    }

    const results = await Promise.all([corsProxyTest(), simulateOAuth(), Promise.resolve(environmentTest())])

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      tests: results,
      solutions: [
        {
          title: "🔥 Solução 1: Hotspot do Celular",
          description: "Conecte o PC no 4G do celular e teste",
          priority: "Alta",
        },
        {
          title: "🚀 Solução 2: Deploy no Vercel",
          description: "Faça deploy e teste na nuvem",
          priority: "Alta",
        },
        {
          title: "🔧 Solução 3: Implementar Proxy",
          description: "Criar endpoint proxy interno",
          priority: "Média",
        },
        {
          title: "📱 Solução 4: Usar SDK Oficial",
          description: "Instalar SDK oficial da EfiBank",
          priority: "Baixa",
        },
      ],
      nextSteps: [
        "1. Teste com hotspot do celular",
        "2. Se funcionar, o problema é sua rede",
        "3. Configure VPN ou use Vercel",
        "4. Implemente proxy se necessário",
      ],
    })
  } catch (error) {
    console.error("❌ Erro no teste proxy:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
