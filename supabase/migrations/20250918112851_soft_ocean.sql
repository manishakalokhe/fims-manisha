/*
  # Create Rajya Shaishanik forms table for school inspection data

  1. New Tables
    - `fims_rajya_shaishanik_forms`
      - Comprehensive form data storage for Rajya Shaishanik inspections
      - Linked to main inspection via inspection_id foreign key
      - All form fields for complete data logging

  2. Security
    - Enable RLS on the new table
    - Add policies for CRUD operations based on inspection ownership

  3. Data Integrity
    - Foreign key constraint to fims_inspections
    - Proper indexes for performance
    - Cascade delete when inspection is removed
*/

-- Drop table if it exists (in case of previous failed attempts)
DROP TABLE IF EXISTS fims_rajya_shaishanik_forms CASCADE;

-- Create the fims_rajya_shaishanik_forms table
CREATE TABLE fims_rajya_shaishanik_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL,
  
  -- Basic school information
  visit_date text,
  school_name text,
  school_address text,
  principal_name text,
  principal_mobile text,
  udise_number text,
  center text,
  taluka text,
  district text,
  management_type text,
  school_achievement_self text,
  school_achievement_external text,
  
  -- Teacher and student information
  sanctioned_posts integer DEFAULT 0,
  working_posts integer DEFAULT 0,
  present_teachers integer DEFAULT 0,
  
  -- Class-wise enrollment data
  class_1_boys integer DEFAULT 0,
  class_1_girls integer DEFAULT 0,
  class_2_boys integer DEFAULT 0,
  class_2_girls integer DEFAULT 0,
  class_3_boys integer DEFAULT 0,
  class_3_girls integer DEFAULT 0,
  class_4_boys integer DEFAULT 0,
  class_4_girls integer DEFAULT 0,
  class_5_boys integer DEFAULT 0,
  class_5_girls integer DEFAULT 0,
  class_6_boys integer DEFAULT 0,
  class_6_girls integer DEFAULT 0,
  class_7_boys integer DEFAULT 0,
  class_7_girls integer DEFAULT 0,
  class_8_boys integer DEFAULT 0,
  class_8_girls integer DEFAULT 0,
  
  -- Khan Academy information
  math_teachers_count integer DEFAULT 0,
  khan_registered_teachers integer DEFAULT 0,
  khan_registered_students integer DEFAULT 0,
  khan_active_students integer DEFAULT 0,
  khan_usage_method text,
  
  -- SQDP information
  sqdp_prepared text,
  sqdp_objectives_achieved text,
  
  -- Nipun Bharat verification
  nipun_bharat_verification text,
  
  -- Learning outcomes assessment (JSON to store table data)
  learning_outcomes_data jsonb DEFAULT '{}',
  
  -- Materials and technology usage (JSON to store table data)
  materials_usage_data jsonb DEFAULT '{}',
  
  -- Officer feedback and recommendations
  officer_feedback text,
  innovative_initiatives text,
  suggested_changes text,
  srujanrang_articles text,
  future_articles text,
  ngo_involvement text,
  
  -- Inspector information
  inspector_name text,
  inspector_designation text,
  visit_date_inspector text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE fims_rajya_shaishanik_forms 
ADD CONSTRAINT fims_rajya_shaishanik_forms_inspection_id_fkey 
FOREIGN KEY (inspection_id) REFERENCES fims_inspections(id) ON DELETE CASCADE;

-- Enable RLS on the new table
ALTER TABLE fims_rajya_shaishanik_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for rajya shaishanik forms
CREATE POLICY "Users can read own rajya shaishanik forms"
  ON fims_rajya_shaishanik_forms
  FOR SELECT
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own rajya shaishanik forms"
  ON fims_rajya_shaishanik_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own rajya shaishanik forms"
  ON fims_rajya_shaishanik_forms
  FOR UPDATE
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own rajya shaishanik forms"
  ON fims_rajya_shaishanik_forms
  FOR DELETE
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_fims_rajya_shaishanik_forms_inspection_id 
  ON fims_rajya_shaishanik_forms(inspection_id);

CREATE INDEX idx_fims_rajya_shaishanik_forms_created_at 
  ON fims_rajya_shaishanik_forms(created_at);

-- Add the rajya_shaishanik category to fims_categories if it doesn't exist
INSERT INTO fims_categories (
  id,
  name, 
  name_marathi, 
  form_type, 
  description, 
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'School Visit Form', 
  'आदर्श शाळा भेट प्रपत्र', 
  'rajya_shaishanik', 
  'State Educational Research and Training Council school visit form for educational quality assessment and standards verification', 
  true,
  now(),
  now()
) ON CONFLICT (form_type) DO UPDATE SET
  name = EXCLUDED.name,
  name_marathi = EXCLUDED.name_marathi,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Verify the table was created
DO $$
DECLARE
  table_count INTEGER;
  category_count INTEGER;
BEGIN
  -- Check if table exists
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_name = 'fims_rajya_shaishanik_forms' 
  AND table_schema = 'public';
  
  -- Check if category exists
  SELECT COUNT(*) INTO category_count 
  FROM fims_categories 
  WHERE form_type = 'rajya_shaishanik';
  
  IF table_count > 0 THEN
    RAISE NOTICE 'SUCCESS: fims_rajya_shaishanik_forms table created successfully';
  ELSE
    RAISE WARNING 'FAILED: fims_rajya_shaishanik_forms table was not created';
  END IF;
  
  IF category_count > 0 THEN
    RAISE NOTICE 'SUCCESS: rajya_shaishanik category exists';
  ELSE
    RAISE WARNING 'FAILED: rajya_shaishanik category was not created';
  END IF;
END $$;