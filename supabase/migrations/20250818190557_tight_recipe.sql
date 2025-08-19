/*
  # Add inspector_designation column to fims_anganwadi_forms

  1. Changes
    - Add `inspector_designation` column to `fims_anganwadi_forms` table
    - Column type: text (to store designation information)
    - Nullable: true (to maintain compatibility with existing data)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'inspector_designation'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN inspector_designation text;
  END IF;
END $$;