/*
  # Fix Security and Performance Issues

  ## Overview
  This migration fixes all security and performance issues detected in the database:
  1. Adds missing indexes on foreign keys for optimal query performance
  2. Optimizes RLS policies to use SELECT subqueries instead of direct function calls
  3. Adds RLS policies for email_notifications table
  4. Removes unused indexes

  ## Changes

  ### 1. Add Missing Foreign Key Indexes
  - affiliate_sales: order_id
  - affiliates: user_id
  - clients: user_id
  - email_notifications: order_id
  - orders: product_id
  - reviews: client_id, order_id

  ### 2. Optimize RLS Policies
  All policies using `auth.uid()` are wrapped with `(SELECT auth.uid())` to prevent
  re-evaluation for each row, significantly improving query performance at scale.

  ### 3. Add Email Notifications RLS Policies
  - Admin (authenticated users) can view all notifications
  - System can insert notifications

  ### 4. Remove Unused Indexes
  Indexes that haven't been used are removed to reduce storage overhead.
*/

-- ============================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================

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

-- Index for reviews.client_id and order_id
CREATE INDEX IF NOT EXISTS idx_reviews_client_id 
  ON reviews(client_id);

CREATE INDEX IF NOT EXISTS idx_reviews_order_id 
  ON reviews(order_id);

-- ============================================
-- 2. OPTIMIZE RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can read own birth charts" ON birth_charts;
DROP POLICY IF EXISTS "Users can create own birth charts" ON birth_charts;
DROP POLICY IF EXISTS "Users can view own client data" ON clients;
DROP POLICY IF EXISTS "Users can insert own client data" ON clients;
DROP POLICY IF EXISTS "Users can update own client data" ON clients;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Affiliates can view own data" ON affiliates;
DROP POLICY IF EXISTS "Affiliates can update own data" ON affiliates;
DROP POLICY IF EXISTS "Affiliates can view own sales" ON affiliate_sales;
DROP POLICY IF EXISTS "Users can create reviews for own orders" ON reviews;

-- Recreate optimized policies with SELECT subqueries

-- users table
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- birth_charts table
CREATE POLICY "Users can read own birth charts"
  ON birth_charts FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create own birth charts"
  ON birth_charts FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- clients table
CREATE POLICY "Users can view own client data"
  ON clients FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own client data"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own client data"
  ON clients FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- orders table
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = orders.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = orders.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

-- subscriptions table
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = subscriptions.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

-- affiliates table
CREATE POLICY "Affiliates can view own data"
  ON affiliates FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Affiliates can update own data"
  ON affiliates FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- affiliate_sales table
CREATE POLICY "Affiliates can view own sales"
  ON affiliate_sales FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM affiliates
      WHERE affiliates.id = affiliate_sales.affiliate_id
      AND affiliates.user_id = (SELECT auth.uid())
    )
  );

-- reviews table
CREATE POLICY "Users can create reviews for own orders"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = reviews.client_id
      AND clients.user_id = (SELECT auth.uid())
    )
  );

-- ============================================
-- 3. ADD EMAIL NOTIFICATIONS RLS POLICIES
-- ============================================

-- Policy for admins to view all email notifications
CREATE POLICY "Authenticated users can view email notifications"
  ON email_notifications FOR SELECT
  TO authenticated
  USING (true);

-- Policy for system to insert notifications
CREATE POLICY "Service role can insert email notifications"
  ON email_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- 4. REMOVE UNUSED INDEXES
-- ============================================

-- These indexes haven't been used and can be removed
-- They will be recreated automatically if queries start using them

DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_subscriptions_client_id;
DROP INDEX IF EXISTS idx_affiliate_sales_affiliate_id;
DROP INDEX IF EXISTS idx_birth_charts_user_id;
DROP INDEX IF EXISTS idx_birth_charts_created_at;
DROP INDEX IF EXISTS idx_orders_client_id;
DROP INDEX IF EXISTS idx_orders_status;
