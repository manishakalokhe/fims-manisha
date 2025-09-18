/*
  # Ensure Rajya Shaishanik category exists in FIMS system

  1. New Category Added
    - Rajya Shaishanik Prashikshan (School Visit Form) with form_type = 'rajya_shaishanik'
    - Includes proper Marathi translation and description
    
  2. Security
    - Uses existing RLS policies on fims_categories table
    
  3. Data Safety
    - Uses INSERT with ON CONFLICT to avoid duplicates
    - Updates existing record if form_type already exists
*/

-- First, let's check if the category exists and insert/update it
DO $$
BEGIN
  -- Insert or update the Rajya Shaishanik category
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
    'State Educational Research and Training Council school visit form for quality assessment and educational standards verification', 
    true,
    now(),
    now()
  )
  ON CONFLICT (form_type) DO UPDATE SET
    name = EXCLUDED.name,
    name_marathi = EXCLUDED.name_marathi,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = now();
    
  -- Log the operation
  RAISE NOTICE 'Rajya Shaishanik category has been added/updated successfully';
END $$;

-- Verify the category was created
DO $$
DECLARE
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count 
  FROM fims_categories 
  WHERE form_type = 'rajya_shaishanik';
  
  IF category_count > 0 THEN
    RAISE NOTICE 'Verification: Rajya Shaishanik category exists (count: %)', category_count;
  ELSE
    RAISE WARNING 'Verification failed: Rajya Shaishanik category was not created';
  END IF;
END $$;