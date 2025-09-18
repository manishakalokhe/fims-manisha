/*
  # Add Rajya Shaishanik category to FIMS system

  1. New Category Added
    - School Visit Form (आदर्श शाळा भेट प्रपत्र) with form_type = 'rajya_shaishanik'
    
  2. Security
    - Uses existing RLS policies on fims_categories table
    
  3. Data Safety
    - Direct INSERT with proper error handling
*/

-- Direct insert of the Rajya Shaishanik category
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
  'State Educational Research and Training Council school visit form for educational quality assessment', 
  true,
  now(),
  now()
) ON CONFLICT (form_type) DO NOTHING;

-- Also add office inspection category if missing
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
  'Office Inspection', 
  'दफ्तर निरीक्षण', 
  'office', 
  'Office inspection form for administrative and operational assessment', 
  true,
  now(),
  now()
) ON CONFLICT (form_type) DO NOTHING;

-- Verify the categories exist
DO $$
DECLARE
  rajya_count INTEGER;
  office_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rajya_count FROM fims_categories WHERE form_type = 'rajya_shaishanik';
  SELECT COUNT(*) INTO office_count FROM fims_categories WHERE form_type = 'office';
  
  RAISE NOTICE 'Rajya Shaishanik categories: %', rajya_count;
  RAISE NOTICE 'Office categories: %', office_count;
  
  IF rajya_count = 0 THEN
    RAISE WARNING 'Failed to create Rajya Shaishanik category';
  END IF;
  
  IF office_count = 0 THEN
    RAISE WARNING 'Failed to create Office category';
  END IF;
END $$;