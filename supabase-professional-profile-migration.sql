-- Migration: Add professional profile fields to users table
-- Date: 2024-12-16
-- Description: Enhance user profile with professional information

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_registration TEXT; -- CRP, OAB, CRM, etc.
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_media JSONB;

-- Add indexes for search and filtering
CREATE INDEX IF NOT EXISTS idx_users_specialty ON users(specialty);
CREATE INDEX IF NOT EXISTS idx_users_professional_registration ON users(professional_registration);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Add comments for documentation
COMMENT ON COLUMN users.specialty IS 'Professional specialty (e.g., Psicólogo Clínico, Advogado, Coach)';
COMMENT ON COLUMN users.professional_registration IS 'Professional registration number (e.g., CRP 12345/SP, OAB 123456)';
COMMENT ON COLUMN users.phone IS 'Contact phone number';
COMMENT ON COLUMN users.bio IS 'Professional biography/description';
COMMENT ON COLUMN users.photo_url IS 'URL to profile photo in Supabase Storage';
COMMENT ON COLUMN users.address IS 'JSON object with address fields: {street, city, state, zipCode}';
COMMENT ON COLUMN users.social_media IS 'JSON object with social media links: {instagram, linkedin, website}';

-- Create glossary table for cross-browser sync
CREATE TABLE IF NOT EXISTS glossary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Changed from UUID to TEXT
  term TEXT NOT NULL,
  translation TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  from_lang TEXT DEFAULT 'pt-BR',
  to_lang TEXT DEFAULT 'en-US',
  case_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate terms for same language pair
  UNIQUE(professional_id, term, from_lang, to_lang)
);

-- Add indexes for glossary
CREATE INDEX IF NOT EXISTS idx_glossary_professional ON glossary(professional_id);
CREATE INDEX IF NOT EXISTS idx_glossary_langs ON glossary(from_lang, to_lang);
CREATE INDEX IF NOT EXISTS idx_glossary_category ON glossary(category);

-- Enable Row Level Security for glossary
ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for glossary (with type casting)
CREATE POLICY "Users can view own glossary"
  ON glossary FOR SELECT
  USING (auth.uid()::text = professional_id);

CREATE POLICY "Users can insert own glossary"
  ON glossary FOR INSERT
  WITH CHECK (auth.uid()::text = professional_id);

CREATE POLICY "Users can update own glossary"
  ON glossary FOR UPDATE
  USING (auth.uid()::text = professional_id);

CREATE POLICY "Users can delete own glossary"
  ON glossary FOR DELETE
  USING (auth.uid()::text = professional_id);

-- Add comments for glossary table
COMMENT ON TABLE glossary IS 'Custom glossary terms for improving caption translations';
COMMENT ON COLUMN glossary.professional_id IS 'Reference to the professional who owns this glossary';
COMMENT ON COLUMN glossary.term IS 'Original term in source language';
COMMENT ON COLUMN glossary.translation IS 'Translation of the term in target language';
COMMENT ON COLUMN glossary.category IS 'Category: general, medical, name, jargon, acronym';
COMMENT ON COLUMN glossary.from_lang IS 'Source language code (e.g., pt-BR)';
COMMENT ON COLUMN glossary.to_lang IS 'Target language code (e.g., en-US)';
COMMENT ON COLUMN glossary.case_sensitive IS 'Whether the term matching should be case-sensitive';
