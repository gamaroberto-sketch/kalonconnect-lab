-- Migration: Add Prescription Template Support
-- Description: Adds fields for custom prescription template (A4/A5) with positioning

-- Add columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS prescription_template_url TEXT,
ADD COLUMN IF NOT EXISTS prescription_template_size VARCHAR(3) DEFAULT 'A4' CHECK (prescription_template_size IN ('A4', 'A5')),
ADD COLUMN IF NOT EXISTS prescription_template_positions JSONB DEFAULT '{
  "patientName": {"top": "8cm", "left": "3cm", "fontSize": "14pt", "fontWeight": "bold"},
  "medications": {"top": "12cm", "left": "3cm", "fontSize": "12pt", "fontWeight": "normal", "maxWidth": "15cm"},
  "instructions": {"top": "20cm", "left": "3cm", "fontSize": "11pt", "fontWeight": "normal", "maxWidth": "15cm"},
  "date": {"top": "25cm", "left": "3cm", "fontSize": "12pt", "fontWeight": "normal"},
  "registry": {"top": "26cm", "left": "3cm", "fontSize": "11pt", "fontWeight": "normal"}
}'::jsonb;

-- Add comment
COMMENT ON COLUMN users.prescription_template_url IS 'URL do template de receituário personalizado (Supabase Storage)';
COMMENT ON COLUMN users.prescription_template_size IS 'Tamanho do template: A4 (21x29.7cm) ou A5 (14.8x21cm)';
COMMENT ON COLUMN users.prescription_template_positions IS 'Posições dos campos no template (top, left, fontSize, fontWeight)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_prescription_template ON users(prescription_template_url) WHERE prescription_template_url IS NOT NULL;
