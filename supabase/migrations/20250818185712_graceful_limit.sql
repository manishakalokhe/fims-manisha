/*
  # Add new fields to Anganwadi forms table

  1. New Columns Added
    - `building_type` (text) - Type of building (own/rented/free/no building)
    - `independent_kitchen` (boolean) - Independent closed kitchen facility
    - `women_health_checkup_space` (boolean) - Space for women's health checkup
    - `baby_weighing_scale` (boolean) - Baby weighing scale availability
    - `hammock_weighing_scale` (boolean) - Hammock weighing scale availability
    - `adult_weighing_scale` (boolean) - Adult weighing scale availability
    - `cooking_utensils` (boolean) - Cooking utensils availability
    - `water_storage_containers` (boolean) - Water storage containers availability
    - `medicine_kits` (boolean) - Medicine kits availability
    - `pre_school_kit` (boolean) - Pre-school kit availability
    - `all_registers` (boolean) - All required registers availability
    - `monthly_progress_reports` (boolean) - Monthly progress reports availability
    - `timetable_available` (boolean) - Timetable availability
    - `timetable_followed` (boolean) - Whether timetable is followed
    - `supervisor_regular_attendance` (boolean) - Supervisor regular attendance
    - `monthly_25_days_meals` (boolean) - 25 days monthly meals provision
    - `thr_provided_regularly` (boolean) - THR provided regularly
    - `food_provider` (text) - Who provides food at anganwadi
    - `supervisor_participation` (text) - Supervisor participation level
    - `food_distribution_decentralized` (boolean) - Food distribution decentralized
    - `children_food_taste_preference` (text) - Children's food taste preference
    - `prescribed_protein_calories` (boolean) - Prescribed protein and calories
    - `prescribed_weight_food` (boolean) - Prescribed weight food
    - `lab_sample_date` (text) - Lab sample date
    - `regular_weighing` (boolean) - Regular weighing of children
    - `growth_chart_accuracy` (boolean) - Growth chart accuracy
    - `vaccination_health_checkup_regular` (boolean) - Regular vaccination and health checkup
    - `vaccination_schedule_awareness` (boolean) - Vaccination schedule awareness
    - `village_health_nutrition_planning` (text) - Village health nutrition planning
    - `children_attendance_comparison` (text) - Children attendance comparison
    - `preschool_education_registered` (integer) - Preschool education registered count
    - `preschool_education_present` (integer) - Preschool education present count
    - `preschool_programs_conducted` (text) - Preschool programs conducted
    - `community_participation` (text) - Community participation
    - `committee_member_participation` (text) - Committee member participation
    - `home_visits_guidance` (text) - Home visits guidance
    - `public_opinion_improvement` (text) - Public opinion improvement
    - `suggestions` (text) - Suggestions
    - `inspector_name` (text) - Inspector name
    - `inspector_designation` (text) - Inspector designation
    - `visit_date` (text) - Visit date

  2. Data Preservation
    - All existing data will be preserved
    - New columns will have NULL values for existing records
    - Default values set where appropriate
*/

-- Add new fields to fims_anganwadi_forms table
DO $$
BEGIN
  -- Building and facility fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'building_type'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN building_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'independent_kitchen'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN independent_kitchen boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'women_health_checkup_space'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN women_health_checkup_space boolean DEFAULT false;
  END IF;

  -- Weighing scale fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'baby_weighing_scale'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN baby_weighing_scale boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'hammock_weighing_scale'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN hammock_weighing_scale boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'adult_weighing_scale'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN adult_weighing_scale boolean DEFAULT false;
  END IF;

  -- Materials and equipment fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'cooking_utensils'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN cooking_utensils boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'water_storage_containers'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN water_storage_containers boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'medicine_kits'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN medicine_kits boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'pre_school_kit'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN pre_school_kit boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'all_registers'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN all_registers boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'monthly_progress_reports'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN monthly_progress_reports boolean DEFAULT false;
  END IF;

  -- Timetable fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'timetable_available'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN timetable_available boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'timetable_followed'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN timetable_followed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'supervisor_regular_attendance'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN supervisor_regular_attendance boolean DEFAULT false;
  END IF;

  -- Nutrition fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'monthly_25_days_meals'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN monthly_25_days_meals boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'thr_provided_regularly'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN thr_provided_regularly boolean DEFAULT false;
  END IF;

  -- Community participation fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'food_provider'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN food_provider text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'supervisor_participation'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN supervisor_participation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'food_distribution_decentralized'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN food_distribution_decentralized boolean DEFAULT false;
  END IF;

  -- Food quality and health fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'children_food_taste_preference'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN children_food_taste_preference text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'prescribed_protein_calories'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN prescribed_protein_calories boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'prescribed_weight_food'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN prescribed_weight_food boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'lab_sample_date'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN lab_sample_date text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'regular_weighing'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN regular_weighing boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'growth_chart_accuracy'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN growth_chart_accuracy boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'vaccination_health_checkup_regular'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN vaccination_health_checkup_regular boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'vaccination_schedule_awareness'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN vaccination_schedule_awareness boolean DEFAULT false;
  END IF;

  -- Extended information fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'village_health_nutrition_planning'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN village_health_nutrition_planning text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'children_attendance_comparison'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN children_attendance_comparison text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'preschool_education_registered'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN preschool_education_registered integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'preschool_education_present'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN preschool_education_present integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'preschool_programs_conducted'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN preschool_programs_conducted text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'community_participation'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN community_participation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'committee_member_participation'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN committee_member_participation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'home_visits_guidance'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN home_visits_guidance text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'public_opinion_improvement'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN public_opinion_improvement text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'suggestions'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN suggestions text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fims_anganwadi_forms' AND column_name = 'visit_date'
  ) THEN
    ALTER TABLE fims_anganwadi_forms ADD COLUMN visit_date text;
  END IF;
END $$;

-- Add constraints for building_type if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'fims_anganwadi_forms_building_type_check'
  ) THEN
    ALTER TABLE fims_anganwadi_forms 
    ADD CONSTRAINT fims_anganwadi_forms_building_type_check 
    CHECK (building_type IN ('own', 'rented', 'free', 'no_building'));
  END IF;
END $$;