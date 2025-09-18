/*
  # Add indexes and ensure proper relationships for school inspection forms

  1. Changes
    - Add foreign key constraint for inspection_id if not exists
    - Add indexes for better query performance
    - Ensure proper relationship between fims_school_inspection_forms and fims_inspections
    
  2. Security
    - No changes to RLS policies needed
*/

-- Ensure foreign key constraint exists (it should already exist from previous migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fims_school_inspection_forms_inspection_id_fkey'
    AND table_name = 'fims_school_inspection_forms'
  ) THEN
    ALTER TABLE fims_school_inspection_forms 
    ADD CONSTRAINT fims_school_inspection_forms_inspection_id_fkey 
    FOREIGN KEY (inspection_id) REFERENCES fims_inspections(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fims_school_inspection_forms_inspection_id_category 
  ON fims_school_inspection_forms(inspection_id);

-- Add index on fims_inspections for category_id lookups
CREATE INDEX IF NOT EXISTS idx_fims_inspections_category_id 
  ON fims_inspections(category_id);

-- Add index on fims_inspections for inspector_id
CREATE INDEX IF NOT EXISTS idx_fims_inspections_inspector_id 
  ON fims_inspections(inspector_id);