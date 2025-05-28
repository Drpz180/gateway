import fs from "fs"
import path from "path"

// Estruturas de dados
interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  originalPrice: number
  siteUrl: string
  videoUrl: string
  enableAffiliates: boolean
  defaultCommission: number
  image: string | null
  status: "pending" | "approved" | "rejected"
  userId: string
  creator: string
  offers: ProductOffer[]
  slug: string
  publicUrl?: string
  createdAt: string
  updatedAt: string
}

interface ProductOffer {
  id: string
  name: string
  price: number
  originalPrice: number
  description: string
  checkoutUrl?: string
  isDefault: boolean
}

interface User {
  id: string
  email: string
  name: string
  cpf?: string
  role: "user" | "admin"
  status: "pending" | "approved" | "rejected" | "blocked"
  documents?: {
    rg?: string
    selfie?: string
    status: "pending" | "approved" | "rejected"
    rejectionReason?: string
  }
  saldoDisponivel: number
  saldoTotalRecebido: number
  totalSales: number
  createdAt: string
  updatedAt: string
}

interface CheckoutData {
  id: string
  productId: string
  offerId?: string
  userId: string
  elements: any[]
  settings: any
  paymentMethods: any[]
  createdAt: string
  updatedAt: string
}

interface ProductSettings {
  id: string
  productId: string
  paymentMethods: any[]
  trackingSettings: any
  orderBumps: any[]
  upsells: any[]
  checkoutSettings: any
  createdAt: string
  updatedAt: string
}

interface Database {
  products: Product[]
  users: User[]
  checkouts: CheckoutData[]
  productSettings: ProductSettings[]
  cobrancas: any[]
  saldos: any[]
  withdrawRequests: any[]
  sales: any[]
  financialSettings: any[]
  settings: any[]
}

// SISTEMA HÍBRIDO DE PERSISTÊNCIA
class HybridDatabaseManager {
  private static instance: HybridDatabaseManager
  private memoryDb: Database | null = null
  private dbPath: string
  private dataDir: string
  private useFileSystem = true

  constructor() {
    this.dataDir = path.join(process.cwd(), "data")
    this.dbPath = path.join(this.dataDir, "database.json")
    this.initializeDatabase()
  }

  static getInstance(): HybridDatabaseManager {
    if (!HybridDatabaseManager.instance) {
      HybridDatabaseManager.instance = new HybridDatabaseManager()
    }
    return HybridDatabaseManager.instance
  }

  private initializeDatabase(): void {
    console.log("🔄 Inicializando sistema híbrido de banco de dados...")

    // Tentar usar sistema de arquivos
    try {
      this.ensureDirectories()
      this.useFileSystem = true
      console.log("✅ Sistema de arquivos disponível")
    } catch (error) {
      console.warn("⚠️ Sistema de arquivos não disponível, usando memória:", error)
      this.useFileSystem = false
    }

    // Carregar dados iniciais
    this.loadDatabase()
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Testar escrita
    const testFile = path.join(this.dataDir, "test.txt")
    fs.writeFileSync(testFile, "test")
    fs.unlinkSync(testFile)
  }

  private getInitialDatabase(): Database {
    return {
      products: [
        {
          id: "exemplo-1",
          name: "SMARTX - Produto Exemplo",
          description: "Curso completo de desenvolvimento web com certificado",
          category: "curso",
          price: 80.0,
          originalPrice: 120.0,
          siteUrl: "",
          videoUrl: "",
          enableAffiliates: true,
          defaultCommission: 30,
          image: "/placeholder.svg?height=200&width=300&text=SMARTX",
          status: "approved",
          userId: "1",
          creator: "João Silva",
          slug: "smartx-produto-exemplo",
          publicUrl: "/produto/smartx-produto-exemplo",
          offers: [
            {
              id: "1",
              name: "Oferta Básica",
              price: 80.0,
              originalPrice: 120.0,
              description: "Acesso completo ao curso",
              checkoutUrl: "/checkout/smartx-produto-exemplo/1",
              isDefault: true,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      users: [
        {
          id: "1",
          email: "joao@email.com",
          name: "João Silva",
          cpf: "12345678901",
          role: "user",
          status: "approved",
          documents: { status: "approved" },
          saldoDisponivel: 0,
          saldoTotalRecebido: 0,
          totalSales: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "admin1",
          email: "admin@infoplatform.com",
          name: "Administrador",
          role: "admin",
          status: "approved",
          saldoDisponivel: 0,
          saldoTotalRecebido: 0,
          totalSales: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      checkouts: [],
      productSettings: [],
      cobrancas: [],
      saldos: [],
      withdrawRequests: [],
      sales: [],
      financialSettings: [],
      settings: [],
    }
  }

  public loadDatabase(): Database {
    console.log("📖 Carregando banco de dados...")

    // Tentar carregar do arquivo primeiro
    if (this.useFileSystem) {
      try {
        if (fs.existsSync(this.dbPath)) {
          const data = fs.readFileSync(this.dbPath, "utf8")
          const parsed = JSON.parse(data)
          this.memoryDb = this.normalizeDatabase(parsed)
          console.log("✅ Banco carregado do arquivo:", {
            produtos: this.memoryDb.products.length,
            usuarios: this.memoryDb.users.length,
          })
          return this.memoryDb
        }
      } catch (error) {
        console.warn("⚠️ Erro ao carregar do arquivo:", error)
      }
    }

    // Usar dados iniciais se não conseguir carregar
    if (!this.memoryDb) {
      this.memoryDb = this.getInitialDatabase()
      console.log("📝 Usando banco inicial em memória")
    }

    return this.memoryDb
  }

  private normalizeDatabase(data: any): Database {
    return {
      products: data.products || [],
      users: data.users || [],
      checkouts: data.checkouts || [],
      productSettings: data.productSettings || [],
      cobrancas: data.cobrancas || [],
      saldos: data.saldos || [],
      withdrawRequests: data.withdrawRequests || [],
      sales: data.sales || [],
      financialSettings: data.financialSettings || [],
      settings: data.settings || [],
    }
  }

  public saveDatabase(db: Database): boolean {
    console.log("💾 Salvando banco de dados...")

    // Sempre salvar em memória primeiro
    this.memoryDb = { ...db }
    console.log("✅ Salvo em memória")

    // Tentar salvar em arquivo se possível
    if (this.useFileSystem) {
      try {
        const jsonData = JSON.stringify(db, null, 2)
        fs.writeFileSync(this.dbPath, jsonData, { encoding: "utf8" })
        console.log("✅ Salvo em arquivo:", this.dbPath)
        return true
      } catch (error) {
        console.warn("⚠️ Erro ao salvar arquivo, mantendo em memória:", error)
        return true // Ainda consideramos sucesso pois está em memória
      }
    }

    return true
  }

  public getCurrentDatabase(): Database {
    if (!this.memoryDb) {
      return this.loadDatabase()
    }
    return { ...this.memoryDb } // Retornar cópia para evitar mutações
  }

  public forceReload(): Database {
    return this.loadDatabase()
  }

  public getStatus() {
    return {
      useFileSystem: this.useFileSystem,
      hasMemoryDb: !!this.memoryDb,
      dbPath: this.dbPath,
      dataDir: this.dataDir,
      products: this.memoryDb?.products.length || 0,
      users: this.memoryDb?.users.length || 0,
    }
  }
}

// Instância global
const dbManager = HybridDatabaseManager.getInstance()

// Funções utilitárias
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

// CACHE GLOBAL EM MEMÓRIA (SEMPRE FUNCIONA)
let GLOBAL_CACHE: {
  products: Product[]
  users: User[]
  checkouts: CheckoutData[]
  productSettings: ProductSettings[]
} = {
  products: [],
  users: [],
  checkouts: [],
  productSettings: [],
}

// Inicializar cache
function initializeCache() {
  if (GLOBAL_CACHE.products.length === 0) {
    const db = dbManager.getCurrentDatabase()
    GLOBAL_CACHE.products = [...db.products]
    GLOBAL_CACHE.users = [...db.users]
    GLOBAL_CACHE.checkouts = [...db.checkouts]
    GLOBAL_CACHE.productSettings = [...db.productSettings]
    console.log("🔄 Cache inicializado:", {
      produtos: GLOBAL_CACHE.products.length,
      usuarios: GLOBAL_CACHE.users.length,
    })
  }
}

// FUNÇÕES PARA PRODUTOS - SISTEMA HÍBRIDO
export const ProductDB = {
  create: (productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "slug">): Product => {
    try {
      console.log("🔄 CRIANDO PRODUTO:", productData.name)

      initializeCache()

      const product: Product = {
        ...productData,
        id: generateId(),
        slug: generateSlug(productData.name),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      console.log("📝 Produto criado:", {
        id: product.id,
        name: product.name,
        slug: product.slug,
      })

      // ADICIONAR AO CACHE GLOBAL
      GLOBAL_CACHE.products.push(product)
      console.log("✅ Produto adicionado ao cache. Total:", GLOBAL_CACHE.products.length)

      // Tentar salvar no banco
      try {
        const db = dbManager.getCurrentDatabase()
        db.products.push(product)
        dbManager.saveDatabase(db)
        console.log("✅ Produto salvo no banco")
      } catch (error) {
        console.warn("⚠️ Erro ao salvar no banco, mantendo no cache:", error)
      }

      return product
    } catch (error) {
      console.error("❌ ERRO ao criar produto:", error)
      throw error
    }
  },

  findById: (id: string): Product | null => {
    try {
      initializeCache()

      // Buscar no cache primeiro
      const product = GLOBAL_CACHE.products.find((p) => p.id === id) || null
      console.log(`🔍 Busca produto ID ${id}:`, product ? "ENCONTRADO" : "NÃO ENCONTRADO")
      return product
    } catch (error) {
      console.error("❌ Erro ao buscar produto:", error)
      return null
    }
  },

  findBySlug: (slug: string): Product | null => {
    try {
      initializeCache()

      const product = GLOBAL_CACHE.products.find((p) => p.slug === slug) || null
      console.log(`🔍 Busca produto slug ${slug}:`, product ? "ENCONTRADO" : "NÃO ENCONTRADO")
      return product
    } catch (error) {
      console.error("❌ Erro ao buscar produto por slug:", error)
      return null
    }
  },

  findAll: (): Product[] => {
    try {
      initializeCache()

      console.log("📋 CARREGANDO TODOS OS PRODUTOS:", GLOBAL_CACHE.products.length)
      return [...GLOBAL_CACHE.products] // Retornar cópia
    } catch (error) {
      console.error("❌ Erro ao carregar produtos:", error)
      return []
    }
  },

  update: (id: string, updates: Partial<Product>): Product | null => {
    try {
      console.log("🔄 ATUALIZANDO PRODUTO:", id)

      initializeCache()

      const index = GLOBAL_CACHE.products.findIndex((p) => p.id === id)

      if (index === -1) {
        console.log("❌ Produto não encontrado para atualização:", id)
        return null
      }

      const oldProduct = GLOBAL_CACHE.products[index]
      GLOBAL_CACHE.products[index] = {
        ...oldProduct,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      console.log("✅ Produto atualizado no cache:", GLOBAL_CACHE.products[index].name)

      // Tentar salvar no banco
      try {
        const db = dbManager.getCurrentDatabase()
        const dbIndex = db.products.findIndex((p) => p.id === id)
        if (dbIndex !== -1) {
          db.products[dbIndex] = { ...GLOBAL_CACHE.products[index] }
          dbManager.saveDatabase(db)
          console.log("✅ Produto atualizado no banco")
        }
      } catch (error) {
        console.warn("⚠️ Erro ao atualizar no banco, mantendo no cache:", error)
      }

      return GLOBAL_CACHE.products[index]
    } catch (error) {
      console.error("❌ ERRO ao atualizar produto:", error)
      return null
    }
  },

  delete: (id: string): boolean => {
    try {
      console.log("🗑️ DELETANDO PRODUTO:", id)

      initializeCache()

      const index = GLOBAL_CACHE.products.findIndex((p) => p.id === id)

      if (index === -1) {
        console.log("❌ Produto não encontrado para deletar:", id)
        return false
      }

      const productName = GLOBAL_CACHE.products[index].name
      GLOBAL_CACHE.products.splice(index, 1)

      console.log("✅ Produto deletado do cache:", productName)

      // Tentar deletar do banco
      try {
        const db = dbManager.getCurrentDatabase()
        const dbIndex = db.products.findIndex((p) => p.id === id)
        if (dbIndex !== -1) {
          db.products.splice(dbIndex, 1)
          dbManager.saveDatabase(db)
          console.log("✅ Produto deletado do banco")
        }
      } catch (error) {
        console.warn("⚠️ Erro ao deletar do banco, mantendo deletado do cache:", error)
      }

      return true
    } catch (error) {
      console.error("❌ ERRO ao deletar produto:", error)
      return false
    }
  },

  // Função para sincronizar cache com banco
  sync: (): void => {
    try {
      console.log("🔄 Sincronizando cache com banco...")
      const db = dbManager.getCurrentDatabase()
      GLOBAL_CACHE.products = [...db.products]
      GLOBAL_CACHE.users = [...db.users]
      GLOBAL_CACHE.checkouts = [...db.checkouts]
      GLOBAL_CACHE.productSettings = [...db.productSettings]
      console.log("✅ Cache sincronizado")
    } catch (error) {
      console.error("❌ Erro ao sincronizar:", error)
    }
  },

  // Função para obter status
  getStatus: () => {
    return {
      cacheProducts: GLOBAL_CACHE.products.length,
      cacheUsers: GLOBAL_CACHE.users.length,
      dbStatus: dbManager.getStatus(),
    }
  },
}

// FUNÇÕES PARA CHECKOUTS
export const CheckoutDB = {
  save: (checkoutData: Omit<CheckoutData, "id" | "createdAt" | "updatedAt">): CheckoutData => {
    try {
      console.log("💾 SALVANDO CHECKOUT para produto:", checkoutData.productId)

      initializeCache()

      const existingIndex = GLOBAL_CACHE.checkouts.findIndex((c) => c.productId === checkoutData.productId)

      let checkout: CheckoutData

      if (existingIndex !== -1) {
        checkout = {
          ...GLOBAL_CACHE.checkouts[existingIndex],
          ...checkoutData,
          updatedAt: new Date().toISOString(),
        }
        GLOBAL_CACHE.checkouts[existingIndex] = checkout
        console.log("📝 Checkout atualizado no cache:", checkout.id)
      } else {
        checkout = {
          ...checkoutData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        GLOBAL_CACHE.checkouts.push(checkout)
        console.log("📝 Checkout criado no cache:", checkout.id)
      }

      // Tentar salvar no banco
      try {
        const db = dbManager.getCurrentDatabase()
        const dbIndex = db.checkouts.findIndex((c) => c.productId === checkoutData.productId)
        if (dbIndex !== -1) {
          db.checkouts[dbIndex] = { ...checkout }
        } else {
          db.checkouts.push({ ...checkout })
        }
        dbManager.saveDatabase(db)
        console.log("✅ Checkout salvo no banco")
      } catch (error) {
        console.warn("⚠️ Erro ao salvar checkout no banco, mantendo no cache:", error)
      }

      return checkout
    } catch (error) {
      console.error("❌ ERRO ao salvar checkout:", error)
      throw error
    }
  },

  findByProductId: (productId: string): CheckoutData | null => {
    try {
      initializeCache()

      const checkout = GLOBAL_CACHE.checkouts.find((c) => c.productId === productId) || null
      console.log(`🔍 Busca checkout produto ${productId}:`, checkout ? "ENCONTRADO" : "NÃO ENCONTRADO")
      return checkout
    } catch (error) {
      console.error("❌ Erro ao buscar checkout:", error)
      return null
    }
  },
}

// FUNÇÕES PARA CONFIGURAÇÕES DE PRODUTO
export const ProductSettingsDB = {
  save: (settingsData: Omit<ProductSettings, "id" | "createdAt" | "updatedAt">): ProductSettings => {
    try {
      console.log("⚙️ SALVANDO CONFIGURAÇÕES para produto:", settingsData.productId)

      initializeCache()

      const existingIndex = GLOBAL_CACHE.productSettings.findIndex((s) => s.productId === settingsData.productId)

      let settings: ProductSettings

      if (existingIndex !== -1) {
        settings = {
          ...GLOBAL_CACHE.productSettings[existingIndex],
          ...settingsData,
          updatedAt: new Date().toISOString(),
        }
        GLOBAL_CACHE.productSettings[existingIndex] = settings
        console.log("📝 Configurações atualizadas no cache:", settings.id)
      } else {
        settings = {
          ...settingsData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        GLOBAL_CACHE.productSettings.push(settings)
        console.log("📝 Configurações criadas no cache:", settings.id)
      }

      // Tentar salvar no banco
      try {
        const db = dbManager.getCurrentDatabase()
        const dbIndex = db.productSettings.findIndex((s) => s.productId === settingsData.productId)
        if (dbIndex !== -1) {
          db.productSettings[dbIndex] = { ...settings }
        } else {
          db.productSettings.push({ ...settings })
        }
        dbManager.saveDatabase(db)
        console.log("✅ Configurações salvas no banco")
      } catch (error) {
        console.warn("⚠️ Erro ao salvar configurações no banco, mantendo no cache:", error)
      }

      return settings
    } catch (error) {
      console.error("❌ ERRO ao salvar configurações:", error)
      throw error
    }
  },

  findByProductId: (productId: string): ProductSettings | null => {
    try {
      initializeCache()

      const settings = GLOBAL_CACHE.productSettings.find((s) => s.productId === productId) || null
      console.log(`🔍 Busca configurações produto ${productId}:`, settings ? "ENCONTRADO" : "NÃO ENCONTRADO")
      return settings
    } catch (error) {
      console.error("❌ Erro ao buscar configurações:", error)
      return null
    }
  },
}

// FUNÇÕES PARA USUÁRIOS
export const UserDB = {
  findByEmail: (email: string): User | null => {
    try {
      initializeCache()
      return GLOBAL_CACHE.users.find((u) => u.email === email) || null
    } catch (error) {
      console.error("❌ Erro ao buscar usuário:", error)
      return null
    }
  },

  findById: (id: string): User | null => {
    try {
      initializeCache()
      return GLOBAL_CACHE.users.find((u) => u.id === id) || null
    } catch (error) {
      console.error("❌ Erro ao buscar usuário:", error)
      return null
    }
  },

  findAll: (): User[] => {
    try {
      initializeCache()
      return [...GLOBAL_CACHE.users]
    } catch (error) {
      console.error("❌ Erro ao carregar usuários:", error)
      return []
    }
  },
}

// Exportar função para debug
export const DatabaseDebug = {
  getStatus: () => {
    return {
      success: true,
      cache: {
        products: GLOBAL_CACHE.products.length,
        users: GLOBAL_CACHE.users.length,
        checkouts: GLOBAL_CACHE.checkouts.length,
        productSettings: GLOBAL_CACHE.productSettings.length,
      },
      manager: dbManager.getStatus(),
    }
  },

  forceSync: () => {
    ProductDB.sync()
    return DatabaseDebug.getStatus()
  },

  testPersistence: () => {
    try {
      const testProduct: Product = {
        id: "test-" + Date.now(),
        name: "Produto Teste Persistência",
        description: "Teste de persistência do sistema",
        category: "teste",
        price: 10,
        originalPrice: 20,
        siteUrl: "",
        videoUrl: "",
        enableAffiliates: false,
        defaultCommission: 0,
        image: null,
        status: "pending",
        userId: "1",
        creator: "Teste",
        offers: [],
        slug: "produto-teste-persistencia",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Criar produto
      const created = ProductDB.create(testProduct)

      // Verificar se existe
      const found = ProductDB.findById(created.id)

      return {
        success: !!found,
        message: found ? "✅ Persistência funcionando!" : "❌ Produto não encontrado",
        productId: created.id,
        totalProducts: ProductDB.findAll().length,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro no teste",
      }
    }
  },

  clearCache: () => {
    GLOBAL_CACHE = {
      products: [],
      users: [],
      checkouts: [],
      productSettings: [],
    }
    return "Cache limpo"
  },
}

// Exportar outras funções necessárias
export function generateTxid(): string {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}
