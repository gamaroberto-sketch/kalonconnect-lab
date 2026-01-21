-- Migration: Add specialty enum structure for Stripe-level onboarding
-- Date: 2026-01-21
-- Description: Replace text-based specialty with enum + custom field structure

-- Add new enum-based specialty columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty_enum TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty_custom TEXT;

-- Create index for specialty_enum for efficient filtering
CREATE INDEX IF NOT EXISTS idx_users_specialty_enum ON users(specialty_enum);

-- Add comments for documentation
COMMENT ON COLUMN users.specialty_enum IS 'Specialty enum: TERAPEUTA_INTEGRATIVO, PSICOLOGO, MEDICO, NUTRICIONISTA, FISIOTERAPEUTA, BIOMEDICO, COACH, ADVOGADO, OUTRO';
COMMENT ON COLUMN users.specialty_custom IS 'Custom specialty description when specialty_enum = OUTRO (max 120 chars)';

-- Optional: Migrate existing data from specialty to specialty_enum
-- Uncomment if you want to preserve existing data
/*
UPDATE users 
SET specialty_enum = CASE 
    WHEN specialty ILIKE '%psicólogo%' OR specialty ILIKE '%psicologo%' THEN 'PSICOLOGO'
    WHEN specialty ILIKE '%médico%' OR specialty ILIKE '%medico%' THEN 'MEDICO'
    WHEN specialty ILIKE '%nutricionista%' THEN 'NUTRICIONISTA'
    WHEN specialty ILIKE '%fisioterapeuta%' THEN 'FISIOTERAPEUTA'
    WHEN specialty ILIKE '%biomédico%' OR specialty ILIKE '%biomedico%' THEN 'BIOMEDICO'
    WHEN specialty ILIKE '%coach%' THEN 'COACH'
    WHEN specialty ILIKE '%advogado%' THEN 'ADVOGADO'
    WHEN specialty ILIKE '%terapeuta%' THEN 'TERAPEUTA_INTEGRATIVO'
    ELSE 'OUTRO'
END,
specialty_custom = CASE 
    WHEN specialty NOT ILIKE '%psicólogo%' 
     AND specialty NOT ILIKE '%médico%' 
     AND specialty NOT ILIKE '%nutricionista%'
     AND specialty NOT ILIKE '%fisioterapeuta%'
     AND specialty NOT ILIKE '%biomédico%'
     AND specialty NOT ILIKE '%coach%'
     AND specialty NOT ILIKE '%advogado%'
     AND specialty NOT ILIKE '%terapeuta%'
    THEN specialty
    ELSE NULL
END
WHERE specialty IS NOT NULL;
*/

-- Note: Keep the old 'specialty' column for backward compatibility
-- You can drop it later after confirming all systems use the new structure
-- ALTER TABLE users DROP COLUMN IF EXISTS specialty;
