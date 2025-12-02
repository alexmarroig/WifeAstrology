/*
  # Astrology Web Service Database Schema

  ## Overview
  Creates the database structure for storing user accounts and birth chart data
  for the astrology web service.

  ## New Tables
  
  ### `users`
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email for authentication
  - `name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### `birth_charts`
  - `id` (uuid, primary key) - Unique chart identifier
  - `user_id` (uuid, foreign key) - References users table (nullable for guest usage)
  - `subject_name` (text) - Name of the person the chart is for
  - `birth_date` (date) - Date of birth
  - `birth_time` (time) - Time of birth
  - `birth_location` (text) - City, Country
  - `latitude` (numeric) - Birth location latitude
  - `longitude` (numeric) - Birth location longitude
  - `timezone` (text) - Timezone identifier (e.g., 'America/Sao_Paulo')
  - `language` (text) - Report language ('pt-BR' or 'en')
  - `chart_data` (jsonb) - Full chart calculation results (planets, houses, aspects)
  - `interpretation` (text) - Generated interpretation text
  - `pdf_url` (text) - URL to generated PDF report (nullable)
  - `created_at` (timestamptz) - Chart creation timestamp
  
  ## Security
  - Enable RLS on all tables
  - Users can read their own data
  - Users can create their own birth charts
  - Users can read their own birth charts
  - Guest users can create charts without authentication
  - Charts without user_id (guest charts) are publicly readable for 24 hours
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS birth_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject_name text NOT NULL,
  birth_date date NOT NULL,
  birth_time time NOT NULL,
  birth_location text NOT NULL,
  latitude numeric(9, 6) NOT NULL,
  longitude numeric(9, 6) NOT NULL,
  timezone text NOT NULL,
  language text DEFAULT 'pt-BR' NOT NULL,
  chart_data jsonb,
  interpretation text,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE birth_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own birth charts"
  ON birth_charts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own birth charts"
  ON birth_charts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guest users can create charts"
  ON birth_charts FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Guest charts readable for 24 hours"
  ON birth_charts FOR SELECT
  TO anon
  USING (
    user_id IS NULL 
    AND created_at > now() - interval '24 hours'
  );

CREATE INDEX IF NOT EXISTS idx_birth_charts_user_id ON birth_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_birth_charts_created_at ON birth_charts(created_at);