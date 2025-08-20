import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  Building2,
  MapPin,
  Camera,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Heart,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AnganwadiTapasaniFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface AnganwadiFormData {
  // Basic Information
  anganwadi_name: string;
  anganwadi_number: string;
  supervisor_name: string;
  helper_name: string;
  village_name: string;
  building_condition: string;
  building_type: string;
  
  // Facilities
  room_availability: boolean;
  toilet_facility: boolean;
  drinking_water: boolean;
  electricity: boolean;
  kitchen_garden: boolean;
  independent_kitchen: boolean;
  women_health_checkup_space: boolean;
  
  // Equipment
  weighing_machine: boolean;
  baby_weighing_scale: boolean;
  hammock_weighing_scale: boolean;
  adult_weighing_scale: boolean;
  height_measuring_scale: boolean;
  first_aid_kit: boolean;
  cooking_utensils: boolean;
  water_storage_containers: boolean;
  medicine_kits: boolean;
  teaching_materials: boolean;
  pre_school_kit: boolean;
  toys_available: boolean;
  
  // Records
  attendance_register: boolean;
  all_registers: boolean;
  growth_chart_updated: boolean;
  vaccination_records: boolean;
  nutrition_records: boolean;
  monthly_progress_reports: boolean;
  timetable_available: boolean;
  timetable_followed: boolean;
  
  // Children Information
  total_registered_children: number;
  children_present_today: number;
  children_0_3_years: number;
  children_3_6_years: number;
  preschool_education_registered: number;
  preschool_education_present: number;
  
  // Nutrition & Health
  hot_meal_served: boolean;
  meal_quality: string;
  take_home_ration: boolean;
  supervisor_regular_attendance: boolean;
  monthly_25_days_meals: boolean;
  thr_provided_regularly: boolean;
  food_provider: string;
  supervisor_participation: string;
  food_distribution_decentralized: boolean;
  children_food_taste_preference: string;
  prescribed_protein_calories: boolean;
  prescribed_weight_food: boolean;
  lab_sample_date: string;
  health_checkup_conducted: boolean;
  regular_weighing: boolean;
  growth_chart_accuracy: boolean;
  immunization_updated: boolean;
  vaccination_health_checkup_regular: boolean;
  vaccination_schedule_awareness: boolean;
  vitamin_a_given: boolean;
  iron_tablets_given: boolean;
  
  // Community & Programs
  village_health_nutrition_planning: string;
  children_attendance_comparison: string;
  preschool_programs_conducted: string;
  community_participation: string;
  committee_member_participation: string;
  home_visits_guidance: string;
  public_opinion_improvement: string;
  
  // Final Details
  general_observations: string;
  recommendations: string;
  action_required: string;
  suggestions: string;
  visit_date: string;
  inspector_designation: string;
  inspector_name: string;
}

export const AnganwadiTapasaniForm: React.FC<AnganwadiTapasaniFormProps> = ({
  user,
  onBack,
  categories,
  onInspectionCreated,
  editingInspection
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Check if we're in view mode
  const isViewMode = editingInspection?.mode === 'view';
  const isEditMode = editingInspection?.mode === 'edit';

  // Basic inspection data
  const [inspectionData, setInspectionData] = useState({
    category_id: '',
    location_name: '',
    address: '',
    planned_date: '',
    latitude: null as number | null,
    longitude: null as number | null,
    location_accuracy: null as number | null
  });

  // Anganwadi form data
  const [anganwadiFormData, setAnganwadiFormData] = useState<AnganwadiFormData>({
    anganwadi_name: '',
    anganwadi_number: '',
    supervisor_name: '',
    helper_name: '',
    village_name: '',
    building_condition: '',
    building_type: '',
    room_availability: false,
    toilet_facility: false,
    drinking_water: false,
    electricity: false,
    kitchen_garden: false,
    independent_kitchen: false,
    women_health_checkup_space: false,
    weighing_machine: false,
    baby_weighing_scale: false,
    hammock_weighing_scale: false,
    adult_weighing_scale: false,
    height_measuring_scale: false,
    first_aid_kit: false,
    cooking_utensils: false,
    water_storage_containers: false,
    medicine_kits: false,
    teaching_materials: false,
    pre_school_kit: false,
    toys_available: false,
    attendance_register: false,
    all_registers: false,
    growth_chart_updated: false,
    vaccination_records: false,
    nutrition_records: false,
    monthly_progress_reports: false,
    timetable_available: false,
    timetable_followed: false,
    total_registered_children: 0,
    children_present_today: 0,
    children_0_3_years: 0,
    children_3_6_years: 0,
    preschool_education_registered: 0,
    preschool_education_present: 0,
    hot_meal_served: false,
    meal_quality: '',
    take_home_ration: false,
    supervisor_regular_attendance: false,
    monthly_25_days_meals: false,
    thr_provided_regularly: false,
    food_provider: '',
    supervisor_participation: '',
    food_distribution_decentralized: false,
    children_food_taste_preference: '',
    prescribed_protein_calories: false,
    prescribed_weight_food: false,
    lab_sample_date: '',
    health_checkup_conducted: false,
    regular_weighing: false,
    growth_chart_accuracy: false,
    immunization_updated: false,
    vaccination_health_checkup_regular: false,
    vaccination_schedule_awareness: false,
    vitamin_a_given: false,
    iron_tablets_given: false,
    village_health_nutrition_planning: '',
    children_attendance_comparison: '',
    preschool_programs_conducted: '',
    community_participation: '',
    committee_member_participation: '',
    home_visits_guidance: '',
    public_opinion_improvement: '',
    general_observations: '',
    recommendations: '',
    action_required: '',
    suggestions: '',
    visit_date: '',
    inspector_designation: '',
    inspector_name: ''
  });

  // Get anganwadi inspection category
  const anganwadiCategory = categories.find(cat => cat.form_type === 'anganwadi');

  useEffect(() => {
    if (anganwadiCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: anganwadiCategory.id
      }));
    }
  }, [anganwadiCategory]);

  // Load existing inspection data when editing
  useEffect(() => {
    if (editingInspection && editingInspection.id) {
      console.log('Loading inspection data:', editingInspection);
      
      // Load basic inspection data
      setInspectionData({
        category_id: editingInspection.category_id || '',
        location_name: editingInspection.location_name || '',
        address: editingInspection.address || '',
        planned_date: editingInspection.planned_date ? editingInspection.planned_date.split('T')[0] : '',
        latitude: editingInspection.latitude,
        longitude: editingInspection.longitude,
        location_accuracy: editingInspection.location_accuracy
      });

      // Load anganwadi form data if it exists
      if (editingInspection.fims_anganwadi_forms && editingInspection.fims_anganwadi_forms.length > 0) {
        const formData = editingInspection.fims_anganwadi_forms[0];
        console.log('Loading form data:', formData);
        setAnganwadiFormData({
          anganwadi_name: formData.anganwadi_name || '',
          anganwadi_number: formData.anganwadi_number || '',
          supervisor_name: formData.supervisor_name || '',
          helper_name: formData.helper_name || '',
          village_name: formData.village_name || '',
          building_condition: formData.building_condition || '',
          building_type: formData.building_type || '',
          room_availability: formData.room_availability || false,
          toilet_facility: formData.toilet_facility || false,
          drinking_water: formData.drinking_water || false,
          electricity: formData.electricity || false,
          kitchen_garden: formData.kitchen_garden || false,
          independent_kitchen: formData.independent_kitchen || false,
          women_health_checkup_space: formData.women_health_checkup_space || false,
          weighing_machine: formData.weighing_machine || false,
          baby_weighing_scale: formData.baby_weighing_scale || false,
          hammock_weighing_scale: formData.hammock_weighing_scale || false,
          adult_weighing_scale: formData.adult_weighing_scale || false,
          height_measuring_scale: formData.height_measuring_scale || false,
          first_aid_kit: formData.first_aid_kit || false,
          cooking_utensils: formData.cooking_utensils || false,
          water_storage_containers: formData.water_storage_containers || false,
          medicine_kits: formData.medicine_kits || false,
          teaching_materials: formData.teaching_materials || false,
          pre_school_kit: formData.pre_school_kit || false,
          toys_available: formData.toys_available || false,
          attendance_register: formData.attendance_register || false,
          all_registers: formData.all_registers || false,
          growth_chart_updated: formData.growth_chart_updated || false,
          vaccination_records: formData.vaccination_records || false,
          nutrition_records: formData.nutrition_records || false,
          monthly_progress_reports: formData.monthly_progress_reports || false,
          timetable_available: formData.timetable_available || false,
          timetable_followed: formData.timetable_followed || false,
          total_registered_children: formData.total_registered_children || 0,
          children_present_today: formData.children_present_today || 0,
          children_0_3_years: formData.children_0_3_years || 0,
          children_3_6_years: formData.children_3_6_years || 0,
          preschool_education_registered: formData.preschool_education_registered || 0,
          preschool_education_present: formData.preschool_education_present || 0,
          hot_meal_served: formData.hot_meal_served || false,
          meal_quality: formData.meal_quality || '',
          take_home_ration: formData.take_home_ration || false,
          supervisor_regular_attendance: formData.supervisor_regular_attendance || false,
          monthly_25_days_meals: formData.monthly_25_days_meals || false,
          thr_provided_regularly: formData.thr_provided_regularly || false,
          food_provider: formData.food_provider || '',
          supervisor_participation: formData.supervisor_participation || '',
          food_distribution_decentralized: formData.food_distribution_decentralized || false,
          children_food_taste_preference: formData.children_food_taste_preference || '',
          prescribed_protein_calories: formData.prescribed_protein_calories || false,
          prescribed_weight_food: formData.prescribed_weight_food || false,
          lab_sample_date: formData.lab_sample_date || '',
          health_checkup_conducted: formData.health_checkup_conducted || false,
          regular_weighing: formData.regular_weighing || false,
          growth_chart_accuracy: formData.growth_chart_accuracy || false,
          immunization_updated: formData.immunization_updated || false,
          vaccination_health_checkup_regular: formData.vaccination_health_checkup_regular || false,
          vaccination_schedule_awareness: formData.vaccination_schedule_awareness || false,
          vitamin_a_given: formData.vitamin_a_given || false,
          iron_tablets_given: formData.iron_tablets_given || false,
          village_health_nutrition_planning: formData.village_health_nutrition_planning || '',
          children_attendance_comparison: formData.children_attendance_comparison || '',
          preschool_programs_conducted: formData.preschool_programs_conducted || '',
          community_participation: formData.community_participation || '',
          committee_member_participation: formData.committee_member_participation || '',
          home_visits_guidance: formData.home_visits_guidance || '',
          public_opinion_improvement: formData.public_opinion_improvement || '',
          general_observations: formData.general_observations || '',
          recommendations: formData.recommendations || '',
          action_required: formData.action_required || '',
          suggestions: formData.suggestions || '',
          visit_date: formData.visit_date || '',
          inspector_designation: formData.inspector_designation || '',
          inspector_name: formData.inspector_name || ''
        });
      } else {
        console.log('No anganwadi form data found, checking form_data field');
        // Try to load from form_data field if fims_anganwadi_forms is empty
        if (editingInspection.form_data) {
          const formData = editingInspection.form_data;
          console.log('Loading from form_data:', formData);
          setAnganwadiFormData({
            anganwadi_name: formData.anganwadi_name || '',
            anganwadi_number: formData.anganwadi_number || '',
            supervisor_name: formData.supervisor_name || '',
            helper_name: formData.helper_name || '',
            village_name: formData.village_name || '',
            building_condition: formData.building_condition || '',
            building_type: formData.building_type || '',
            room_availability: formData.room_availability || false,
            toilet_facility: formData.toilet_facility || false,
            drinking_water: formData.drinking_water || false,
            electricity: formData.electricity || false,
            kitchen_garden: formData.kitchen_garden || false,
            independent_kitchen: formData.independent_kitchen || false,
            women_health_checkup_space: formData.women_health_checkup_space || false,
            weighing_machine: formData.weighing_machine || false,
            baby_weighing_scale: formData.baby_weighing_scale || false,
            hammock_weighing_scale: formData.hammock_weighing_scale || false,
            adult_weighing_scale: formData.adult_weighing_scale || false,
            height_measuring_scale: formData.height_measuring_scale || false,
            first_aid_kit: formData.first_aid_kit || false,
            cooking_utensils: formData.cooking_utensils || false,
            water_storage_containers: formData.water_storage_containers || false,
            medicine_kits: formData.medicine_kits || false,
            teaching_materials: formData.teaching_materials || false,
            pre_school_kit: formData.pre_school_kit || false,
            toys_available: formData.toys_available || false,
            attendance_register: formData.attendance_register || false,
            all_registers: formData.all_registers || false,
            growth_chart_updated: formData.growth_chart_updated || false,
            vaccination_records: formData.vaccination_records || false,
            nutrition_records: formData.nutrition_records || false,
            monthly_progress_reports: formData.monthly_progress_reports || false,
            timetable_available: formData.timetable_available || false,
            timetable_followed: formData.timetable_followed || false,
            total_registered_children: formData.total_registered_children || 0,
            children_present_today: formData.children_present_today || 0,
            children_0_3_years: formData.children_0_3_years || 0,
            children_3_6_years: formData.children_3_6_years || 0,
            preschool_education_registered: formData.preschool_education_registered || 0,
            preschool_education_present: formData.preschool_education_present || 0,
            hot_meal_served: formData.hot_meal_served || false,
            meal_quality: formData.meal_quality || '',
            take_home_ration: formData.take_home_ration || false,
            supervisor_regular_attendance: formData.supervisor_regular_attendance || false,
            monthly_25_days_meals: formData.monthly_25_days_meals || false,
            thr_provided_regularly: formData.thr_provided_regularly || false,
            food_provider: formData.food_provider || '',
            supervisor_participation: formData.supervisor_participation || '',
            food_distribution_decentralized: formData.food_distribution_decentralized || false,
            children_food_taste_preference: formData.children_food_taste_preference || '',
            prescribed_protein_calories: formData.prescribed_protein_calories || false,
            prescribed_weight_food: formData.prescribed_weight_food || false,
            lab_sample_date: formData.lab_sample_date || '',
            health_checkup_conducted: formData.health_checkup_conducted || false,
            regular_weighing: formData.regular_weighing || false,
            growth_chart_accuracy: formData.growth_chart_accuracy || false,
            immunization_updated: formData.immunization_updated || false,
            vaccination_health_checkup_regular: formData.vaccination_health_checkup_regular || false,
            vaccination_schedule_awareness: formData.vaccination_schedule_awareness || false,
            vitamin_a_given: formData.vitamin_a_given || false,
            iron_tablets_given: formData.iron_tablets_given || false,
            village_health_nutrition_planning: formData.village_health_nutrition_planning || '',
            children_attendance_comparison: formData.children_attendance_comparison || '',
            preschool_programs_conducted: formData.preschool_programs_conducted || '',
            community_participation: formData.community_participation || '',
            committee_member_participation: formData.committee_member_participation || '',
            home_visits_guidance: formData.home_visits_guidance || '',
            public_opinion_improvement: formData.public_opinion_improvement || '',
            general_observations: formData.general_observations || '',
            recommendations: formData.recommendations || '',
            action_required: formData.action_required || '',
            suggestions: formData.suggestions || '',
            visit_date: formData.visit_date || '',
            inspector_designation: formData.inspector_designation || '',
            inspector_name: formData.inspector_name || ''
          });
        }
      }
    }
  }, [editingInspection]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('fims.geolocationNotSupported'));
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setInspectionData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location_accuracy: position.coords.accuracy
        }));
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(t('fims.unableToGetLocation'));
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (uploadedPhotos.length + files.length > 5) {
      alert(t('fims.maxPhotosAllowed'));
      return;
    }

    setUploadedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotosToSupabase = async (inspectionId: string) => {
    if (uploadedPhotos.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const file = uploadedPhotos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${inspectionId}_${Date.now()}_${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('field-visit-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('field-visit-images')
          .getPublicUrl(fileName);

        // Save photo record to database
        const { error: dbError } = await supabase
          .from('fims_inspection_photos')
          .insert({
            inspection_id: inspectionId,
            photo_url: publicUrl,
            photo_name: file.name,
            description: `Anganwadi inspection photo ${i + 1}`,
            photo_order: i + 1
          });

        if (dbError) throw dbError;
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `AWC-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      setIsLoading(true);

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
        // Update existing inspection
        const { data: updateResult, error: updateError } = await supabase
          .from('fims_inspections')
          .update({
            location_name: inspectionData.location_name,
            latitude: inspectionData.latitude,
            longitude: inspectionData.longitude,
            location_accuracy: inspectionData.location_accuracy,
            address: inspectionData.address,
            planned_date: inspectionData.planned_date,
            inspection_date: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            form_data: anganwadiFormData
          })
          .eq('id', editingInspection.id)
          .select()
          .single();

        if (updateError) throw updateError;
        inspectionResult = updateResult;

        // Upsert anganwadi form record
        const { error: formError } = await supabase
          .from('fims_anganwadi_forms')
          .upsert({
            inspection_id: editingInspection.id,
            ...anganwadiFormData
          });

        if (formError) throw formError;
      } else {
        // Create new inspection
        const inspectionNumber = generateInspectionNumber();

        const { data: createResult, error: createError } = await supabase
          .from('fims_inspections')
          .insert({
            inspection_number: inspectionNumber,
            category_id: inspectionData.category_id,
            inspector_id: user.id,
            location_name: inspectionData.location_name,
            latitude: inspectionData.latitude,
            longitude: inspectionData.longitude,
            location_accuracy: inspectionData.location_accuracy,
            address: inspectionData.address,
            planned_date: inspectionData.planned_date,
            inspection_date: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            form_data: anganwadiFormData
          })
          .select()
          .single();

        if (createError) throw createError;
        inspectionResult = createResult;

        // Create anganwadi form record
        const { error: formError } = await supabase
          .from('fims_anganwadi_forms')
          .insert({
            inspection_id: inspectionResult.id,
            ...anganwadiFormData
          });

        if (formError) throw formError;
      }

      // Upload photos if any
      if (uploadedPhotos.length > 0) {
        await uploadPhotosToSupabase(inspectionResult.id);
      }

      const isUpdate = editingInspection && editingInspection.id;
      const message = isDraft 
        ? (isUpdate ? 'Inspection updated as draft successfully!' : 'Inspection saved as draft successfully!')
        : (isUpdate ? 'Inspection updated successfully!' : 'Inspection submitted successfully!');
      
      alert(message);
      onInspectionCreated();
      onBack();

    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Error saving inspection: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Building2 className="h-5 w-5 mr-2 text-purple-600" />
        {t('categories.basicInformation')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('categories.anganwadiName')} *
          </label>
          <input
            type="text"
            value={anganwadiFormData.anganwadi_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, anganwadi_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('categories.enterAnganwadiName')}
            disabled={isViewMode}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('categories.anganwadiNumber')}
          </label>
          <input
            type="text"
            value={anganwadiFormData.anganwadi_number}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, anganwadi_number: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('categories.enterAnganwadiNumber')}
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('categories.supervisorName')}
          </label>
          <input
            type="text"
            value={anganwadiFormData.supervisor_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, supervisor_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('categories.enterSupervisorName')}
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('categories.helperName')}
          </label>
          <input
            type="text"
            value={anganwadiFormData.helper_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, helper_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('categories.enterHelperName')}
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('categories.villageName')}
          </label>
          <input
            type="text"
            value={anganwadiFormData.village_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, village_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('categories.enterVillageName')}
            disabled={isViewMode}
          />
        </div>

      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('categories.locationInformation')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('categories.locationName')} *
          </label>
          <input
            type="text"
            value={inspectionData.location_name}
            onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('categories.enterLocationName')}
            disabled={isViewMode}
            required
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('categories.plannedDate')}
          </label>
          <input
            type="date"
            value={inspectionData.planned_date}
            onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GPS Location
          </label>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading || isViewMode}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <MapPin className="h-4 w-4" />
            <span>{isLoading ? t('categories.gettingLocation') : t('categories.getCurrentLocation')}</span>
          </button>
          
          {inspectionData.latitude && inspectionData.longitude && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">{t('categories.locationCaptured')}</p>
              <p className="text-xs text-green-600">
                {t('categories.latitude')}: {inspectionData.latitude.toFixed(6)}<br />
                {t('categories.longitude')}: {inspectionData.longitude.toFixed(6)}<br />
                {t('categories.accuracy')}: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderInspectionForm = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('categories.inspectionForm')}
      </h3>

      {/* Section A: Infrastructure and Basic Facilities */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          {t('categories.sectionA')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'room_availability', label: t('categories.roomAvailability') },
            { key: 'toilet_facility', label: t('categories.toiletFacility') },
            { key: 'drinking_water', label: t('categories.drinkingWater') },
            { key: 'electricity', label: t('categories.electricity') },
            { key: 'kitchen_garden', label: t('categories.kitchenGarden') }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                disabled={isViewMode}
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Section B: Equipment and Materials */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          {t('categories.sectionB')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'weighing_machine', label: t('categories.weighingMachine') },
            { key: 'height_measuring_scale', label: t('categories.heightMeasuringScale') },
            { key: 'first_aid_kit', label: t('categories.firstAidKit') },
            { key: 'teaching_materials', label: t('categories.teachingMaterials') },
            { key: 'toys_available', label: t('categories.toysAvailable') }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                disabled={isViewMode}
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Section C: Records and Documentation */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          {t('categories.sectionC')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'attendance_register', label: t('categories.attendanceRegister') },
            { key: 'growth_chart_updated', label: t('categories.growthChartUpdated') },
            { key: 'vaccination_records', label: t('categories.vaccinationRecords') },
            { key: 'nutrition_records', label: t('categories.nutritionRecords') }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                disabled={isViewMode}
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Section D: Children Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-purple-600" />
          {t('categories.sectionD')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('categories.totalRegistered')}
            </label>
            <input
              type="number"
              value={anganwadiFormData.total_registered_children}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, total_registered_children: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('categories.presentToday')}
            </label>
            <input
              type="number"
              value={anganwadiFormData.children_present_today}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, children_present_today: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('categories.age0to3Years')}
            </label>
            <input
              type="number"
              value={anganwadiFormData.children_0_3_years}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, children_0_3_years: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('categories.age3to6Years')}
            </label>
            <input
              type="number"
              value={anganwadiFormData.children_3_6_years}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, children_3_6_years: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Section E: Nutrition & Health Services */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-purple-600" />
          {t('categories.sectionE')}
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'hot_meal_served', label: t('categories.hotMealServed') },
              { key: 'take_home_ration', label: t('categories.takeHomeRation') },
              { key: 'health_checkup_conducted', label: t('categories.healthCheckupConducted') },
              { key: 'immunization_updated', label: t('categories.immunizationUpdated') },
              { key: 'vitamin_a_given', label: t('categories.vitaminAGiven') },
              { key: 'iron_tablets_given', label: t('categories.ironTabletsGiven') }
            ].map((field) => (
              <div key={field.key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={field.key}
                  checked={anganwadiFormData[field.key as keyof AnganwadiFormData] as boolean}
                  onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled={isViewMode}
                />
                <label htmlFor={field.key} className="text-sm text-gray-700">
                  {field.label}
                </label>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('categories.mealQuality')}
            </label>
            <select
              value={anganwadiFormData.meal_quality}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, meal_quality: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">{t('categories.selectQuality')}</option>
              <option value="excellent">{t('categories.excellent')}</option>
              <option value="good">{t('categories.good')}</option>
              <option value="average">{t('categories.average')}</option>
              <option value="poor">{t('categories.poor')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section F: Observations & Recommendations */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
          {t('categories.sectionF')}
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('categories.generalObservations')}
            </label>
            <textarea
              value={anganwadiFormData.general_observations}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, general_observations: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder={t('categories.enterGeneralObservations')}
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('categories.recommendations')}
            </label>
            <textarea
              value={anganwadiFormData.recommendations}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, recommendations: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder={t('categories.enterRecommendations')}
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('categories.actionRequired')}
            </label>
            <textarea
              value={anganwadiFormData.action_required}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, action_required: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder={t('categories.enterActionRequired')}
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhotoUpload = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 px-8 py-6 rounded-2xl">
        <div className="flex items-center text-white">
          <Camera className="w-8 h-8 mr-4" />
          <h3 className="text-2xl font-bold">{t('fims.photoDocumentation')}</h3>
        </div>
      </div>
      
      {!isViewMode && (
        <div className="border-2 border-dashed border-amber-300 rounded-3xl p-10 text-center bg-gradient-to-br from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-all duration-300">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-amber-800 mb-4">
            {t('fims.uploadInspectionPhotos')}
          </h4>
          <p className="text-amber-700 mb-6 text-lg">
            {t('fims.uploadPhotosToDocument')}
          </p>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
            disabled={isViewMode}
          />
          <label
            htmlFor="photo-upload"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-2xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            <Camera className="h-4 w-4 mr-2" />
            {t('fims.chooseFiles')}
          </label>
          
          <p className="text-sm text-amber-600 mt-4 font-medium">
            {t('fims.maxPhotosAllowed')}
          </p>
        </div>
      )}

      {uploadedPhotos.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-amber-800 mb-4">
            {t('fims.uploadedPhotos')} ({uploadedPhotos.length}/5)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Anganwadi photo ${index + 1}`}
                  className="w-full h-40 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                />
                {!isViewMode && (
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <span className="text-sm font-bold">×</span>
                  </button>
                )}
                <p className="text-sm text-amber-700 mt-2 truncate font-medium">
                  {photo.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display existing photos when viewing */}
      {isViewMode && editingInspection?.fims_inspection_photos && editingInspection.fims_inspection_photos.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-amber-800 mb-4">
            Inspection Photos ({editingInspection.fims_inspection_photos.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.photo_url}
                  alt={photo.description || `Anganwadi photo ${index + 1}`}
                  className="w-full h-40 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                />
                <p className="text-sm text-amber-700 mt-2 truncate font-medium">
                  {photo.photo_name || `Photo ${index + 1}`}
                </p>
                {photo.description && (
                  <p className="text-sm text-amber-600 truncate">
                    {photo.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show message when no photos in view mode */}
      {isViewMode && (!editingInspection?.fims_inspection_photos || editingInspection.fims_inspection_photos.length === 0) && (
        <div className="text-center py-12 text-amber-600 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl border-2 border-amber-200">
          <Camera className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p>{t('fims.noPhotosFound')}</p>
        </div>
      )}

      {isUploading && (
        <div className="text-center py-8 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl border-2 border-amber-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700 font-semibold text-lg">{t('fims.uploadingPhotos')}</p>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInformation();
      case 2:
        return renderLocationDetails();
      case 3:
        return renderInspectionForm();
      case 4:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return anganwadiFormData.anganwadi_name;
      case 2:
        return inspectionData.location_name;
      case 3:
        return true; // Form is optional, can proceed
      case 4:
        return true; // Photos are optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6 mb-4 md:mb-6 transform hover:scale-[1.01] transition-transform duration-300">
          {isViewMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                View Mode - This form is read-only
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 text-center">
              {isViewMode ? 'View Inspection' : 
               isEditMode ? 'Edit Inspection' : 
               'New Inspection'} - अंगणवाडी केंद्र तपासणी
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              मूलभूत माहिती
            </div>
            <div className={`${currentStep === 2 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              स्थान तपशील
            </div>
            <div className={`${currentStep === 3 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              तपासणी फॉर्म
            </div>
            <div className={`${currentStep === 4 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              फोटो आणि सबमिट
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl shadow-lg border-2 border-purple-200 p-4 md:p-6 mb-4 md:mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
          >
            {t('common.previous')}
          </button>

          <div className="flex space-x-2 md:space-x-3">
            {currentStep === 4 ? (
              <>
                {!isViewMode && (
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isLoading || isUploading}
                  className="px-3 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
                >
                  <Save className="h-4 w-4" />
                  <span>{t('categories.saveAsDraft')}</span>
                </button>
                )}
                {!isViewMode && (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading || isUploading}
                  className="px-3 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
                >
                  <Send className="h-4 w-4" />
                  <span>{isEditMode ? 'Update Inspection' : t('categories.submitInspection')}</span>
                </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={!canProceedToNext() && !isViewMode}
                className="px-4 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
              >
                {t('common.next')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};