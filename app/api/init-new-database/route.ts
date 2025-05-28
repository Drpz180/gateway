import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    console.log("🚀 Inicializando estrutura do banco de dados...")

    // Criar tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        cpf VARCHAR(14),
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'pending',
        documents JSONB DEFAULT '{}',
        saldo_disponivel DECIMAL(10,2) DEFAULT 0,
        saldo_total_recebido DECIMAL(10,2) DEFAULT 0,
        total_sales INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Criar tabela de produtos
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        site_url VARCHAR(500),
        video_url VARCHAR(500),
        enable_affiliates BOOLEAN DEFAULT false,
        default_commission INTEGER DEFAULT 30,
        image VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending',
        user_id INTEGER REFERENCES users(id),
        creator VARCHAR(255),
        offers JSONB DEFAULT '[]',
        slug VARCHAR(255) UNIQUE,
        public_url VARCHAR(500),
        sales INTEGER DEFAULT 0,
        revenue DECIMAL(10,2) DEFAULT 0,
        views INTEGER DEFAULT 0,
        conversion_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Criar tabela de vendas
    await sql`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        user_id INTEGER REFERENCES users(id),
        affiliate_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        commission DECIMAL(10,2) DEFAULT 0,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(255),
        customer_email VARCHAR(255),
        customer_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Criar tabela de pagamentos
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER REFERENCES sales(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(255) UNIQUE,
        pix_qr_code TEXT,
        pix_copy_paste TEXT,
        expires_at TIMESTAMP,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Criar tabela de saques
    await sql`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        pix_key VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Criar tabela de configurações
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Criar tabela de checkouts
    await sql`
      CREATE TABLE IF NOT EXISTS checkouts (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        offer_id VARCHAR(50),
        user_id INTEGER REFERENCES users(id),
        elements JSONB DEFAULT '[]',
        settings JSONB DEFAULT '{}',
        payment_methods JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Inserir usuários padrão
    await sql`
      INSERT INTO users (email, password, name, role, status) 
      VALUES 
        ('admin@infoplatform.com', 'admin123', 'Administrador', 'admin', 'approved'),
        ('joao@email.com', '123456', 'João Silva', 'user', 'approved')
      ON CONFLICT (email) DO NOTHING
    `

    // Inserir produto exemplo
    await sql`
      INSERT INTO products (
        name, description, category, price, original_price, 
        status, user_id, creator, slug, enable_affiliates, default_commission
      ) 
      VALUES (
        'SMARTX - Produto Exemplo',
        'Curso completo de desenvolvimento web com certificado',
        'curso',
        80.00,
        120.00,
        'approved',
        2,
        'João Silva',
        'smartx-produto-exemplo',
        true,
        30
      )
      ON CONFLICT (slug) DO NOTHING
    `

    // Inserir configurações padrão
    await sql`
      INSERT INTO settings (key, value, description) 
      VALUES 
        ('platform_name', 'InfoProdutos Platform', 'Nome da plataforma'),
        ('commission_rate', '30', 'Taxa de comissão padrão'),
        ('min_withdrawal', '50', 'Valor mínimo para saque'),
        ('pix_enabled', 'true', 'PIX habilitado')
      ON CONFLICT (key) DO NOTHING
    `

    console.log("✅ Banco de dados inicializado com sucesso!")

    return Response.json({
      success: true,
      message: "✅ Banco de dados inicializado com sucesso!",
      tables: ["users", "products", "sales", "payments", "withdrawals", "settings", "checkouts"],
    })
  } catch (error) {
    console.error("❌ Erro ao inicializar banco:", error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        message: "❌ Falha ao inicializar banco de dados",
      },
      { status: 500 },
    )
  }
}
