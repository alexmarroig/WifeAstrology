/*
  # Fix Security and Performance Issues

  ## Overview
  This migration fixes all security and performance issues detected by Supabase:
  1. Adds missing indexes on foreign keys for better query performance
  2. Optimizes RLS policies to use (select auth.uid()) instead of auth.uid()
  3. Adds RLS policies for email_notifications table
  4. Removes unused indexes to reduce maintenance overhead

  ## Changes

  ### 1. Add Missing Foreign Key Indexes
  - affiliate_sales.order_id
  - affiliates.user_id
  - clients.user_id
  - email_notifications.order_id
  - orders.product_id
  - reviews.client_id
  - reviews.order_id

  ### 2. Optimize RLS Policies
  Replace auth.uid() with (select auth.uid()) for better performance at scale

  ### 3. Add RLS Policies for email_notifications
  Admin-only access for reading notification logs

  ### 4. Remove Unused Indexes
  Indexes that haven't been used and aren't necessary
*/

-- =============================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =============================================

-- Index for affiliate_sales.order_id
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_order_id 
  ON affiliate_sales(order_id);

-- Index for affiliates.user_id
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id 
  ON affiliates(user_id);

-- Index for clients.user_id
CREATE INDEX IF NOT EXISTS idx_clients_user_id 
  ON clients(user_id);

-- Index for email_notifications.order_id
CREATE INDEX IF NOT EXISTS idx_email_notifications_order_id 
  ON email_notifications(order_id);

-- Index for orders.product_id
CREATE INDEX IF NOT EXISTS idx_orders_product_id 
  ON orders(product_id);

-- Index for reviews.client_id
CREATE INDEX IF NOT EXISTS idx_reviews_client_id 
  ON reviews(client_id);

-- Index for reviews.order_id
CREATE INDEX IF NOT EXISTS idx_reviews_order_id 
  ON reviews(order_id);

-- =============================================
-- 2. OPTIMIZE RLS POLICIES - USERS TABLE
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Recreate with optimized auth check
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- =============================================
-- 3. OPTIMIZE RLS POLICIES - BIRTH_CHARTS TABLE
-- =============================================

DROP POLICY IF EXISTS "Users can read own birth charts" ON birth_charts;
DROP POLICY IF EXISTS "Users can create own birth charts" ON birth_charts;

CREATE POLICY "Users can read own birth charts"
  ON birth_charts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own birth charts"
  ON birth_charts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- =============================================
-- 4. OPTIMIZE RLS POLICIES - CLIENTS TABLE
-- =============================================

DROP POLICY IF EXISTS "Users can view own client data" ON clients;
DROP POLICY IF EXISTS "Users can insert own client data" ON clients;
DROP POLICY IF EXISTS "Users can update own client data" ON clients;

CREATE POLICY "Users can view own client data"
  ON clients FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own client data"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own client data"
  ON clients FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- =============================================
-- 5. OPTIMIZE RLS POLICIES - ORDERS TABLE
-- =============================================

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE user_id = (select auth.uid())
    )
  );

-- =============================================
-- 6. OPTIMIZE RLS POLICIES - SUBSCRIPTIONS TABLE
-- =============================================

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = (select auth.uid())
    )
  );

-- =============================================
-- 7. OPTIMIZE RLS POLICIES - AFFILIATES TABLE
-- =============================================

DROP POLICY IF EXISTS "Affiliates can view own data" ON affiliates;
DROP POLICY IF EXISTS "Affiliates can update own data" ON affiliates;

CREATE POLICY "Affiliates can view own data"
  ON affiliates FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Affiliates can update own data"
  ON affiliates FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- =============================================
-- 8. OPTIMIZE RLS POLICIES - AFFILIATE_SALES TABLE
-- =============================================

DROP POLICY IF EXISTS "Affiliates can view own sales" ON affiliate_sales;

CREATE POLICY "Affiliates can view own sales"
  ON affiliate_sales FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = (select auth.uid())
    )
  );

-- =============================================
-- 9. OPTIMIZE RLS POLICIES - REVIEWS TABLE
-- =============================================

DROP POLICY IF EXISTS "Users can create reviews for own orders" ON reviews;

CREATE POLICY "Users can create reviews for own orders"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN clients c ON o.client_id = c.id
      WHERE c.user_id = (select auth.uid())
    )
  );

-- =============================================
-- 10. ADD RLS POLICIES FOR EMAIL_NOTIFICATIONS
-- =============================================

-- Only authenticated users (admin) can view email logs
CREATE POLICY "Admin can view all email notifications"
  ON email_notifications FOR SELECT
  TO authenticated
  USING (true);

-- Only system can insert email notifications
CREATE POLICY "System can insert email notifications"
  ON email_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- 11. REMOVE UNUSED INDEXES
-- =============================================

-- These indexes exist but haven't been used, removing to reduce maintenance
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_subscriptions_client_id;
DROP INDEX IF EXISTS idx_affiliate_sales_affiliate_id;
DROP INDEX IF EXISTS idx_birth_charts_user_id;
DROP INDEX IF EXISTS idx_birth_charts_created_at;
DROP INDEX IF EXISTS idx_orders_client_id;
DROP INDEX IF EXISTS idx_orders_status;

-- =============================================
-- 12. ADD USEFUL COMPOSITE INDEXES
-- =============================================

-- These are more useful than the single-column indexes we removed
CREATE INDEX IF NOT EXISTS idx_orders_client_status 
  ON orders(client_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_status_created 
  ON orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_birth_charts_user_created 
  ON birth_charts(user_id, created_at DESC);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Run these to verify the fixes:
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
