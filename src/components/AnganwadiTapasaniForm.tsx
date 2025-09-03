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
  Home,
  Utensils,
  Heart,
  FileText,
  Globe,
  ChevronDown,
  Check
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
  anganwadi_name: string;
  anganwadi_number: string;
  supervisor_name: string;
  helper_name: string;
  village_name: string;
  building_condition: string;
  building_type: string;
  room_availability: boolean;
  toilet_facility: boolean;
  drinking_water: boolean;
  electricity: boolean;
  kitchen_garden: boolean;
  independent_kitchen: boolean;
  women_health_checkup_space: boolean;
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
  all_registers: boolean;
  attendance_register: boolean;
  growth_chart_updated: boolean;
  vaccination_records: boolean;
  nutrition_records: boolean;
  monthly_progress_reports: boolean;
  timetable_available: boolean;
  timetable_followed: boolean;
  supervisor_regular_attendance: boolean;
  total_registered_children: number;
  children_present_today: number;
  children_0_3_years: number;
  children_3_6_years: number;
  preschool_education_registered: number;
  preschool_education_present: number;
  hot_meal_served: boolean;
  meal_quality: string;
  monthly_25_days_meals: boolean;
  take_home_ration: boolean;
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
  village_health_nutrition_planning: string;
  children_attendance_comparison: string;
  preschool_programs_conducted: string;
  community_participation: string;
  committee_member_participation: string;
  home_visits_guidance: string;
  public_opinion_improvement: string;
  general_observations: string;
  recommendations: string;
  action_required: string;
  suggestions: string;
  visit_date: string;
  inspector_designation: string;
  inspector_name: string;
}

const languages = [
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'en', name: 'English', nativeName: 'English' }
];

export const AnganwadiTapasaniForm: React.FC<AnganwadiTapasaniFormProps> = ({
  user,
  onBack,
  categories,
  onInspectionCreated,
  editingInspection
}) => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

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
    all_registers: false,
    attendance_register: false,
    growth_chart_updated: false,
    vaccination_records: false,
    nutrition_records: false,
    monthly_progress_reports: false,
    timetable_available: false,
    timetable_followed: false,
    supervisor_regular_attendance: false,
    total_registered_children: 0,
    children_present_today: 0,
    children_0_3_years: 0,
    children_3_6_years: 0,
    preschool_education_registered: 0,
    preschool_education_present: 0,
    hot_meal_served: false,
    meal_quality: '',
    monthly_25_days_meals: false,
    take_home_ration: false,
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
          all_registers: formData.all_registers || false,
          attendance_register: formData.attendance_register || false,
          growth_chart_updated: formData.growth_chart_updated || false,
          vaccination_records: formData.vaccination_records || false,
          nutrition_records: formData.nutrition_records || false,
          monthly_progress_reports: formData.monthly_progress_reports || false,
          timetable_available: formData.timetable_available || false,
          timetable_followed: formData.timetable_followed || false,
          supervisor_regular_attendance: formData.supervisor_regular_attendance || false,
          total_registered_children: formData.total_registered_children || 0,
          children_present_today: formData.children_present_today || 0,
          children_0_3_years: formData.children_0_3_years || 0,
          children_3_6_years: formData.children_3_6_years || 0,
          preschool_education_registered: formData.preschool_education_registered || 0,
          preschool_education_present: formData.preschool_education_present || 0,
          hot_meal_served: formData.hot_meal_served || false,
          meal_quality: formData.meal_quality || '',
          monthly_25_days_meals: formData.monthly_25_days_meals || false,
          take_home_ration: formData.take_home_ration || false,
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

      // Convert empty date strings to null for database compatibility
      const sanitizedInspectionData = {
        ...inspectionData,
        planned_date: inspectionData.planned_date || null
      };

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
        // Update existing inspection
        const { data: updateResult, error: updateError } = await supabase
          .from('fims_inspections')
          .update({
            location_name: sanitizedInspectionData.location_name,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            location_accuracy: sanitizedInspectionData.location_accuracy,
            address: sanitizedInspectionData.address,
            planned_date: sanitizedInspectionData.planned_date,
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
            category_id: sanitizedInspectionData.category_id,
            inspector_id: user.id,
            location_name: sanitizedInspectionData.location_name,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            location_accuracy: sanitizedInspectionData.location_accuracy,
            address: sanitizedInspectionData.address,
            planned_date: sanitizedInspectionData.planned_date,
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
        ? (isUpdate ? t('fims.inspectionUpdatedAsDraft') : t('fims.inspectionSavedAsDraft'))
        : (isUpdate ? t('fims.inspectionUpdatedSuccessfully') : t('fims.inspectionSubmittedSuccessfully'));
      
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

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
    setIsLanguageDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-switcher')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isLanguageDropdownOpen]);

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
        {t('fims.basicInformation')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.anganwadiName')} *
          </label>
          <input
            type="text"
            value={anganwadiFormData.anganwadi_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, anganwadi_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterAnganwadiName')}
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.anganwadiNumber')} *
          </label>
          <input
            type="text"
            value={anganwadiFormData.anganwadi_number}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, anganwadi_number: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterAnganwadiNumber')}
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.supervisorName')} *
          </label>
          <input
            type="text"
            value={anganwadiFormData.supervisor_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, supervisor_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterSupervisorName')}
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.helperName')}
          </label>
          <input
            type="text"
            value={anganwadiFormData.helper_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, helper_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterHelperName')}
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.villageName')} *
          </label>
          <input
            type="text"
            value={anganwadiFormData.village_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, village_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterVillageName')}
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.buildingType')}
          </label>
          <select
            value={anganwadiFormData.building_type}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, building_type: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isViewMode}
          >
            <option value="">{t('fims.selectBuildingType')}</option>
            <option value="own">{t('fims.ownBuilding')}</option>
            <option value="rented">{t('fims.rentedBuilding')}</option>
            <option value="free">{t('fims.freeBuilding')}</option>
            <option value="no_building">{t('fims.noBuilding')}</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.buildingCondition')}
          </label>
          <select
            value={anganwadiFormData.building_condition}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, building_condition: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isViewMode}
          >
            <option value="">{t('fims.selectCondition')}</option>
            <option value="excellent">{t('fims.excellent')}</option>
            <option value="good">{t('fims.good')}</option>
            <option value="average">{t('fims.average')}</option>
            <option value="poor">{t('fims.poor')}</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('fims.locationDetails')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.locationName')} *
          </label>
          <input
            type="text"
            value={inspectionData.location_name}
            onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterLocationName')}
            required
            disabled={isViewMode}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.address')}
          </label>
          <textarea
            value={inspectionData.address}
            onChange={(e) => setInspectionData(prev => ({...prev, address: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder={t('fims.enterFullAddress')}
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.plannedDate')}
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
            {t('fims.gpsLocation')}
          </label>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading || isViewMode}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <MapPin className="h-4 w-4" />
            <span>{isLoading ? t('fims.gettingLocation') : t('fims.getCurrentLocation')}</span>
          </button>
          
          {inspectionData.latitude && inspectionData.longitude && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">{t('fims.locationCaptured')}</p>
              <p className="text-xs text-green-600">
                {t('fims.latitude')}: {inspectionData.latitude.toFixed(6)}<br />
                {t('fims.longitude')}: {inspectionData.longitude.toFixed(6)}<br />
                {t('fims.accuracy')}: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderInspectionChecklist = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('fims.inspectionForm')}
      </h3>

      {/* Section A: Infrastructure and Basic Facilities */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Home className="h-5 w-5 mr-2 text-purple-600" />
          {t('fims.sectionA')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'room_availability', label: t('fims.roomAvailability') },
            { key: 'toilet_facility', label: t('fims.toiletFacility') },
            { key: 'drinking_water', label: t('fims.drinkingWater') },
            { key: 'electricity', label: t('fims.electricity') },
            { key: 'kitchen_garden', label: t('fims.kitchenGarden') },
            { key: 'independent_kitchen', label: 'स्वतंत्र स्वयंपाकघर' }
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
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
          {t('fims.sectionB')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'weighing_machine', label: t('fims.weighingMachine') },
            { key: 'baby_weighing_scale', label: 'बाळ वजन स्केल' },
            { key: 'hammock_weighing_scale', label: 'झुला वजन स्केल' },
            { key: 'adult_weighing_scale', label: 'प्रौढ वजन स्केल' },
            { key: 'height_measuring_scale', label: t('fims.heightMeasuringScale') },
            { key: 'first_aid_kit', label: t('fims.firstAidKit') },
            { key: 'cooking_utensils', label: 'स्वयंपाक भांडी' },
            { key: 'water_storage_containers', label: 'पाणी साठवण्याची भांडी' },
            { key: 'medicine_kits', label: 'औषध किट' },
            { key: 'teaching_materials', label: t('fims.teachingMaterials') },
            { key: 'pre_school_kit', label: 'प्री-स्कूल किट' },
            { key: 'toys_available', label: t('fims.toysAvailable') }
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
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-purple-600" />
          {t('fims.sectionC')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'all_registers', label: 'सर्व नोंदवह्या' },
            { key: 'attendance_register', label: t('fims.attendanceRegister') },
            { key: 'growth_chart_updated', label: t('fims.growthChartUpdated') },
            { key: 'vaccination_records', label: t('fims.vaccinationRecords') },
            { key: 'nutrition_records', label: t('fims.nutritionRecords') },
            { key: 'monthly_progress_reports', label: 'मासिक प्रगती अहवाल' },
            { key: 'timetable_available', label: 'वेळापत्रक उपलब्ध' },
            { key: 'timetable_followed', label: 'वेळापत्रकाचे पालन' },
            { key: 'supervisor_regular_attendance', label: 'पर्यवेक्षकाची नियमित उपस्थिती' }
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
          {t('fims.sectionD')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.totalRegistered')}
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
              {t('fims.presentToday')}
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
              {t('fims.age0to3Years')}
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
              {t('fims.age3to6Years')}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              प्री-स्कूल शिक्षण नोंदणीकृत
            </label>
            <input
              type="number"
              value={anganwadiFormData.preschool_education_registered}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, preschool_education_registered: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              प्री-स्कूल शिक्षण उपस्थित
            </label>
            <input
              type="number"
              value={anganwadiFormData.preschool_education_present}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, preschool_education_present: parseInt(e.target.value) || 0}))}
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
          {t('fims.sectionE')}
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'hot_meal_served', label: t('fims.hotMealServed') },
              { key: 'monthly_25_days_meals', label: 'मासिक 25 दिवस जेवण' },
              { key: 'take_home_ration', label: t('fims.takeHomeRation') },
              { key: 'thr_provided_regularly', label: 'THR नियमित प्रदान' },
              { key: 'food_distribution_decentralized', label: 'अन्न वितरण विकेंद्रीकृत' },
              { key: 'prescribed_protein_calories', label: 'निर्धारित प्रथिने कॅलरी' },
              { key: 'prescribed_weight_food', label: 'निर्धारित वजन अन्न' },
              { key: 'health_checkup_conducted', label: t('fims.healthCheckupConducted') },
              { key: 'regular_weighing', label: 'नियमित वजन' },
              { key: 'growth_chart_accuracy', label: 'वाढ चार्ट अचूकता' },
              { key: 'immunization_updated', label: t('fims.immunizationUpdated') },
              { key: 'vaccination_health_checkup_regular', label: 'लसीकरण आरोग्य तपासणी नियमित' },
              { key: 'vaccination_schedule_awareness', label: 'लसीकरण वेळापत्रक जागरूकता' },
              { key: 'vitamin_a_given', label: t('fims.vitaminAGiven') },
              { key: 'iron_tablets_given', label: t('fims.ironTabletsGiven') }
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fims.mealQuality')}
              </label>
              <select
                value={anganwadiFormData.meal_quality}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, meal_quality: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">{t('fims.selectQuality')}</option>
                <option value="excellent">{t('fims.excellent')}</option>
                <option value="good">{t('fims.good')}</option>
                <option value="average">{t('fims.average')}</option>
                <option value="poor">{t('fims.poor')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                अन्न पुरवठादार
              </label>
              <input
                type="text"
                value={anganwadiFormData.food_provider}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, food_provider: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="अन्न पुरवठादाराचे नाव"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section F: Observations & Recommendations */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-purple-600" />
          {t('fims.sectionF')}
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.generalObservations')}
            </label>
            <textarea
              value={anganwadiFormData.general_observations}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, general_observations: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder={t('fims.enterGeneralObservations')}
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.recommendations')}
            </label>
            <textarea
              value={anganwadiFormData.recommendations}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, recommendations: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder={t('fims.enterRecommendations')}
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.actionRequired')}
            </label>
            <textarea
              value={anganwadiFormData.action_required}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, action_required: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder={t('fims.enterActionRequired')}
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhotoUpload = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('fims.photoDocumentation')}
      </h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          {t('fims.uploadInspectionPhotos')}
        </h4>
        <p className="text-gray-600 mb-4">
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
        {!isViewMode && (
          <label
            htmlFor="photo-upload"
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
          >
            <Camera className="h-4 w-4 mr-2" />
            {t('fims.chooseFiles')}
          </label>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          {t('fims.maxPhotosAllowed')}
        </p>
      </div>

      {uploadedPhotos.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            {t('fims.uploadedPhotos')} ({uploadedPhotos.length}/5)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Anganwadi photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {!isViewMode && (
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                )}
                <p className="text-xs text-gray-600 mt-1 truncate">
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
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Inspection Photos ({editingInspection.fims_inspection_photos.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.photo_url}
                  alt={photo.description || `Anganwadi photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {photo.photo_name || `Photo ${index + 1}`}
                </p>
                {photo.description && (
                  <p className="text-xs text-gray-500 truncate">
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
        <div className="text-center py-8 text-gray-500">
          <Camera className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p>{t('fims.noPhotosFound')}</p>
        </div>
      )}

      {isUploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">{t('fims.uploadingPhotos')}</p>
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
        return renderInspectionChecklist();
      case 4:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return anganwadiFormData.anganwadi_name && anganwadiFormData.anganwadi_number && 
               anganwadiFormData.supervisor_name && anganwadiFormData.village_name;
      case 2:
        return inspectionData.location_name;
      case 3:
        return true; // Checklist is optional, can proceed
      case 4:
        return true; // Photos are optional
      default:
        return false;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-switcher')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isLanguageDropdownOpen]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          {editingInspection?.mode === 'view' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                {t('fims.viewMode')} - {t('fims.formReadOnly')}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('common.back')}</span>
            </button>

            {/* Language Switcher */}
            <div className="relative language-switcher">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 min-w-[100px] justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {languages.find(lang => lang.code === i18n.language)?.nativeName || 'मराठी'}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[70]">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    {i18n.language === 'mr' ? 'भाषा निवडा' : 'Select Language'}
                  </div>
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full text-left px-3 py-3 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                        i18n.language === language.code
                          ? 'text-blue-600 bg-blue-50 font-medium'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{language.nativeName}</div>
                          <div className="text-xs text-gray-500">{language.name}</div>
                        </div>
                      </div>
                      {i18n.language === language.code && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <h1 className="text-lg md:text-2xl font-bold text-gray-900 text-center">
              {editingInspection?.mode === 'view' ? t('fims.viewInspection') : 
               editingInspection?.mode === 'edit' ? t('fims.editInspection') : 
               t('fims.newInspection')} - {t('fims.anganwadiCenterInspection')}
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.basicDetails')}
            </div>
            <div className={`${currentStep === 2 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.locationDetails')}
            </div>
            <div className={`${currentStep === 3 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.inspectionDetails')}
            </div>
            <div className={`${currentStep === 4 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.photosSubmit')}
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
                  <span>{t('fims.saveAsDraft')}</span>
                </button>
                )}
                {!isViewMode && (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading || isUploading}
                  className="px-3 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
                >
                  <Send className="h-4 w-4" />
                  <span>{isEditMode ? t('fims.updateInspection') : t('fims.submitInspection')}</span>
                </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={!canProceedToNext() || isViewMode}
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