/*
  # Add inspector_name column to fims_anganwadi_forms table

  1. Changes
    - Add inspector_name column to fims_anganwadi_forms table
    
  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'inspector_name'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN inspector_name text;
  END IF;
END $$;