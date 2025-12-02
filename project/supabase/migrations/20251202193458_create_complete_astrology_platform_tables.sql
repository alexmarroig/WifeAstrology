/*
  # Plataforma Completa de Astrologia - Astróloga Camila Veloso
  
  ## Visão Geral
  Sistema semi-automatizado para venda de mapas astrais com análise personalizada.
  Cliente compra → Sistema gera mapa → Camila analisa → Cliente recebe material personalizado.
  
  ## Novas Tabelas
  
  ### 1. `clients` - Dados completos dos clientes
    - `id` (uuid, PK) - ID único do cliente
    - `user_id` (uuid, FK) - Referência ao auth.users
    - `full_name` (text) - Nome completo
    - `email` (text) - Email (único)
    - `phone` (text) - Telefone/WhatsApp
    - `cpf` (text) - CPF para nota fiscal
    - `birth_date` (date) - Data de nascimento
    - `birth_time` (time) - Horário de nascimento
    - `birth_city` (text) - Cidade de nascimento
    - `birth_state` (text) - Estado de nascimento
    - `birth_latitude` (numeric) - Latitude
    - `birth_longitude` (numeric) - Longitude
    - `timezone` (text) - Timezone
    - `created_at` (timestamptz) - Data de cadastro
    - `updated_at` (timestamptz) - Última atualização
  
  ### 2. `products` - Catálogo de serviços
    - `id` (uuid, PK) - ID único do produto
    - `name` (text) - Nome do produto
    - `slug` (text) - Slug para URL
    - `description` (text) - Descrição
    - `price` (numeric) - Preço em centavos
    - `type` (text) - Tipo: 'natal', 'revolution', 'synastry', 'subscription'
    - `is_automated` (boolean) - Se é entrega automática ou analisado pela Camila
    - `delivery_days` (integer) - Prazo de entrega em dias
    - `is_active` (boolean) - Se está ativo para venda
    - `features` (jsonb) - Lista de recursos incluídos
    - `created_at` (timestamptz)
  
  ### 3. `orders` - Pedidos realizados
    - `id` (uuid, PK) - ID único do pedido
    - `order_number` (text) - Número do pedido (ex: ORD-20250102-001)
    - `client_id` (uuid, FK) - Referência ao cliente
    - `product_id` (uuid, FK) - Referência ao produto
    - `status` (text) - Status: pending_payment, paid, in_analysis, completed, cancelled
    - `amount` (numeric) - Valor pago em centavos
    - `payment_method` (text) - Forma de pagamento
    - `payment_id` (text) - ID do pagamento no gateway
    - `client_notes` (text) - Observações do cliente
    - `admin_notes` (text) - Anotações internas da Camila
    - `birth_data` (jsonb) - Dados natais específicos deste pedido
    - `docx_url` (text) - URL do DOCX gerado
    - `final_material_url` (text) - URL do material final enviado pela Camila
    - `paid_at` (timestamptz) - Data do pagamento
    - `started_at` (timestamptz) - Quando Camila iniciou análise
    - `completed_at` (timestamptz) - Quando foi concluído
    - `created_at` (timestamptz)
  
  ### 4. `subscriptions` - Assinaturas mensais
    - `id` (uuid, PK)
    - `client_id` (uuid, FK)
    - `plan_type` (text) - 'astro_plus' ou 'astro_pro'
    - `status` (text) - active, cancelled, paused
    - `price` (numeric) - Valor mensal em centavos
    - `payment_method` (text)
    - `subscription_id` (text) - ID no gateway de pagamento
    - `current_period_start` (timestamptz)
    - `current_period_end` (timestamptz)
    - `cancelled_at` (timestamptz)
    - `created_at` (timestamptz)
  
  ### 5. `affiliates` - Programa de afiliados
    - `id` (uuid, PK)
    - `user_id` (uuid, FK)
    - `code` (text) - Código único do afiliado (ex: CAMILA20)
    - `name` (text) - Nome do afiliado
    - `email` (text)
    - `phone` (text)
    - `commission_rate` (numeric) - Taxa de comissão (ex: 0.20 = 20%)
    - `total_sales` (integer) - Total de vendas realizadas
    - `total_commission` (numeric) - Comissão total em centavos
    - `pix_key` (text) - Chave PIX para pagamento
    - `is_active` (boolean)
    - `created_at` (timestamptz)
  
  ### 6. `affiliate_sales` - Vendas por afiliado
    - `id` (uuid, PK)
    - `affiliate_id` (uuid, FK)
    - `order_id` (uuid, FK)
    - `commission_amount` (numeric) - Valor da comissão em centavos
    - `status` (text) - pending, paid
    - `paid_at` (timestamptz)
    - `created_at` (timestamptz)
  
  ### 7. `email_notifications` - Log de emails enviados
    - `id` (uuid, PK)
    - `order_id` (uuid, FK)
    - `recipient` (text) - Email do destinatário
    - `subject` (text) - Assunto do email
    - `type` (text) - Tipo: new_order, payment_confirmed, analysis_started, completed
    - `sent_at` (timestamptz)
    - `status` (text) - sent, failed
  
  ### 8. `reviews` - Avaliações dos clientes
    - `id` (uuid, PK)
    - `order_id` (uuid, FK)
    - `client_id` (uuid, FK)
    - `rating` (integer) - 1 a 5 estrelas
    - `comment` (text) - Comentário do cliente
    - `is_public` (boolean) - Se pode ser exibido no site
    - `created_at` (timestamptz)
  
  ## Segurança (RLS)
  - Todas as tabelas com RLS habilitado
  - Clientes veem apenas seus próprios dados
  - Admin (Camila) tem acesso total
  - Políticas restritivas por padrão
*/

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  cpf text,
  birth_date date NOT NULL,
  birth_time time NOT NULL,
  birth_city text NOT NULL,
  birth_state text NOT NULL,
  birth_latitude numeric(10, 6) NOT NULL,
  birth_longitude numeric(10, 6) NOT NULL,
  timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  price numeric(10, 2) NOT NULL,
  type text NOT NULL CHECK (type IN ('natal', 'revolution', 'synastry', 'package', 'subscription')),
  is_automated boolean DEFAULT false,
  delivery_days integer DEFAULT 5,
  is_active boolean DEFAULT true,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  status text DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'in_analysis', 'completed', 'cancelled')),
  amount numeric(10, 2) NOT NULL,
  payment_method text,
  payment_id text,
  client_notes text,
  admin_notes text,
  birth_data jsonb NOT NULL,
  docx_url text,
  final_material_url text,
  paid_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('astro_plus', 'astro_pro')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused')),
  price numeric(10, 2) NOT NULL,
  payment_method text,
  subscription_id text,
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de afiliados
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  commission_rate numeric(3, 2) DEFAULT 0.20,
  total_sales integer DEFAULT 0,
  total_commission numeric(10, 2) DEFAULT 0,
  pix_key text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de vendas por afiliado
CREATE TABLE IF NOT EXISTS affiliate_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  commission_amount numeric(10, 2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de notificações por email
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  subject text NOT NULL,
  type text NOT NULL CHECK (type IN ('new_order', 'payment_confirmed', 'analysis_started', 'completed')),
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'failed'))
);

-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_affiliate_id ON affiliate_sales(affiliate_id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clients
CREATE POLICY "Users can view own client data"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client data"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client data"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para products (todos podem ver produtos ativos)
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Políticas RLS para orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = orders.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = orders.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Políticas RLS para subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = subscriptions.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Políticas RLS para affiliates
CREATE POLICY "Affiliates can view own data"
  ON affiliates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can update own data"
  ON affiliates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para affiliate_sales
CREATE POLICY "Affiliates can view own sales"
  ON affiliate_sales FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM affiliates
      WHERE affiliates.id = affiliate_sales.affiliate_id
      AND affiliates.user_id = auth.uid()
    )
  );

-- Políticas RLS para reviews
CREATE POLICY "Users can view public reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can create reviews for own orders"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = reviews.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Inserir produtos iniciais
INSERT INTO products (name, slug, description, price, type, is_automated, delivery_days, features) VALUES
  ('Mapa Natal Básico', 'mapa-natal-basico', 'PDF automatizado com posições planetárias e aspectos básicos. Entrega instantânea!', 37.00, 'natal', true, 0, '["Posições planetárias", "Aspectos principais", "Casas astrológicas", "PDF colorido"]'::jsonb),
  ('Mapa Natal Completo - Analisado', 'mapa-natal-completo', 'Análise completa e personalizada por Camila Veloso. Interpretação detalhada de todos os aspectos do seu mapa.', 170.00, 'natal', false, 5, '["Análise personalizada por Camila", "Interpretação completa", "Material exclusivo em Word/PDF", "Áudio opcional", "Prazo: 3-5 dias úteis"]'::jsonb),
  ('Revolução Solar Personalizada', 'revolucao-solar', 'Previsões detalhadas para o seu ano pessoal com análise profunda de Camila Veloso.', 270.00, 'revolution', false, 5, '["Análise do ano pessoal", "Previsões mensais", "Relocação incluída", "Análise por Camila", "Material completo", "Áudio opcional"]'::jsonb),
  ('Sinastria de Casal', 'sinastria-casal', 'Análise de compatibilidade e dinâmica do relacionamento entre duas pessoas.', 300.00, 'synastry', false, 7, '["Análise de compatibilidade", "Pontos fortes e desafios", "Dicas para o relacionamento", "Análise personalizada", "Material completo"]'::jsonb),
  ('Pacote Anual VIP', 'pacote-anual', 'Mapa Natal + Revolução Solar + 3 análises de trânsitos importantes. Acompanhamento completo do ano!', 500.00, 'package', false, 5, '["Mapa Natal Completo", "Revolução Solar", "3 análises de trânsitos", "Prioridade no atendimento", "Suporte por WhatsApp"]'::jsonb),
  ('Assinatura Astro Plus', 'astro-plus', 'Previsões mensais automatizadas + conteúdos exclusivos + grupo VIP.', 29.00, 'subscription', true, 0, '["Previsões mensais", "Calendário lunar", "Conteúdos exclusivos", "Grupo VIP WhatsApp", "Descontos em serviços"]'::jsonb),
  ('Assinatura Astro Pro', 'astro-pro', 'Previsões personalizadas + grupo VIP + acesso ilimitado + descontos especiais.', 79.00, 'subscription', false, 0, '["Previsões personalizadas", "Grupo VIP exclusivo", "Lives mensais com Camila", "30% desconto em serviços", "Prioridade atendimento", "Tudo ilimitado"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;
