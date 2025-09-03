/*
  # Add location_detected column to fims_inspections table

  1. Changes
    - Add `location_detected` column to `fims_inspections` table
    - Column will store the Google Maps detected location name
    - Column is optional (nullable) for backward compatibility

  2. Security
    - No changes to RLS policies needed
    - Existing permissions remain the same
*/

-- Add location_detected column to fims_inspections table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_inspections' AND column_name = 'location_detected'
  ) THEN
    ALTER TABLE fims_inspections ADD COLUMN location_detected text;
  END IF;
END $$;