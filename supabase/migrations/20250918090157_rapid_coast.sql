/*
  # Create fims_school_inspection_forms table for Rajya Shaishanik Prashikshan form

  1. New Tables
    - `fims_school_inspection_forms`
      - Basic school information fields
      - Teacher and student enrollment data
      - Khan Academy portal information
      - SQDP and Nipun Bharat verification
      - Learning outcomes assessment tables
      - Educational quality assessment
      - Materials and technology usage
      - Officer feedback and recommendations

  2. Security
    - Enable RLS on the new table
    - Add policies for CRUD operations based on inspection ownership
*/

-- Create the fims_school_inspection_forms table
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
  school_achievement_self text, -- A/B/C/D
  school_achievement_external text, -- A/B/C/D
  
  -- Teacher information
  sanctioned_posts integer DEFAULT 0,
  working_posts integer DEFAULT 0,
  present_teachers integer DEFAULT 0,
  
  -- Class-wise enrollment data (JSON to store flexible class data)
  class_enrollment_data jsonb DEFAULT '{}',
  
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
  
  -- Learning outcomes data (JSON to store subject-wise data)
  learning_outcomes_data jsonb DEFAULT '{}',
  
  -- Officer feedback
  officer_feedback text,
  innovative_initiatives text,
  suggested_changes text,
  srujanrang_articles text,
  future_articles text,
  ngo_involvement text,
  
  -- Materials and technology usage (JSON to store table data)
  materials_usage_data jsonb DEFAULT '{}',
  
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fims_school_inspection_forms_inspection_id 
  ON fims_school_inspection_forms(inspection_id);

CREATE INDEX IF NOT EXISTS idx_fims_school_inspection_forms_created_at 
  ON fims_school_inspection_forms(created_at);