/*
  # Add Rajya Shaishanik category to FIMS system

  1. New Category Added
    - Rajya Shaishanik Prashikshan (School Visit Form) with form_type = 'rajya_shaishanik'
    
  2. Security
    - Uses existing RLS policies on fims_categories table
*/

-- Insert the Rajya Shaishanik category if it doesn't exist
INSERT INTO fims_categories (name, name_marathi, form_type, description, is_active) 
VALUES (
  'School Visit Form', 
  'आदर्श शाळा भेट प्रपत्र', 
  'rajya_shaishanik', 
  'State Educational Research and Training Council school visit form for quality assessment', 
  true
)
ON CONFLICT (form_type) DO UPDATE SET
  name = EXCLUDED.name,
  name_marathi = EXCLUDED.name_marathi,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();