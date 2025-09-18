/*
  # Add multiple form categories for FIMS system

  1. New Categories Added
    - Rajya Shaishanik Prashikshan (School Visit Form)
    - 12 additional placeholder categories for future forms
    
  2. Security
    - Enable RLS on categories table
    - Add policies for reading categories
*/

-- Insert new form categories
INSERT INTO fims_categories (name, name_marathi, form_type, description, is_active) VALUES
  ('School Visit Form', 'आदर्श शाळा भेट प्रपत्र', 'rajya_shaishanik', 'State Educational Research and Training Council school visit form', true),
  ('Form 4', 'प्रपत्र ४', 'form_4', 'Form 4 description', true),
  ('Form 5', 'प्रपत्र ५', 'form_5', 'Form 5 description', true),
  ('Form 6', 'प्रपत्र ६', 'form_6', 'Form 6 description', true),
  ('Form 7', 'प्रपत्र ७', 'form_7', 'Form 7 description', true),
  ('Form 8', 'प्रपत्र ८', 'form_8', 'Form 8 description', true),
  ('Form 9', 'प्रपत्र ९', 'form_9', 'Form 9 description', true),
  ('Form 10', 'प्रपत्र १०', 'form_10', 'Form 10 description', true),
  ('Form 11', 'प्रपत्र ११', 'form_11', 'Form 11 description', true),
  ('Form 12', 'प्रपत्र १२', 'form_12', 'Form 12 description', true),
  ('Form 13', 'प्रपत्र १३', 'form_13', 'Form 13 description', true),
  ('Form 14', 'प्रपत्र १४', 'form_14', 'Form 14 description', true),
  ('Form 15', 'प्रपत्र १५', 'form_15', 'Form 15 description', true)
ON CONFLICT (form_type) DO NOTHING;

-- Create table for school inspection forms if it doesn't exist
CREATE TABLE IF NOT EXISTS fims_school_inspection_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES fims_inspections(id) ON DELETE CASCADE,
  
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
  
  -- Teacher information
  sanctioned_posts integer DEFAULT 0,
  working_posts integer DEFAULT 0,
  present_teachers integer DEFAULT 0,
  
  -- Khan Academy information
  math_teachers_count integer DEFAULT 0,
  khan_registered_teachers integer DEFAULT 0,
  khan_registered_students integer DEFAULT 0,
  khan_active_students integer DEFAULT 0,
  
  -- Text responses
  khan_usage_method text,
  sqdp_prepared text,
  sqdp_objectives_achieved text,
  nipun_bharat_verification text,
  learning_outcomes_assessment text,
  
  -- Officer feedback
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
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE fims_school_inspection_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for school inspection forms
CREATE POLICY "Users can read own school inspection forms"
  ON fims_school_inspection_forms
  FOR SELECT
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own school inspection forms"
  ON fims_school_inspection_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own school inspection forms"
  ON fims_school_inspection_forms
  FOR UPDATE
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own school inspection forms"
  ON fims_school_inspection_forms
  FOR DELETE
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );