import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  Plus,
  FileText,
  Camera,
  MapPin,
  Building2,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building,
  Users,
  BookOpen,
  FolderOpen,
  Search,
  Home,
  Heart,
  Scale,
  Utensils,
  Clock,
  Baby,
  Stethoscope,
  UserCheck,
  Phone,
  Lightbulb,
  MessageSquare
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
  
  // Building and Facilities
  building_type: string;
  building_condition: string;
  room_availability: boolean;
  toilet_facility: boolean;
  drinking_water: boolean;
  electricity: boolean;
  kitchen_garden: boolean;
  independent_kitchen: boolean;
  women_health_checkup_space: boolean;
  
  // Equipment and Materials
  weighing_machine: boolean;
  baby_weighing_scale: boolean;
  hammock_weighing_scale: boolean;
  adult_weighing_scale: boolean;
  height_measuring_scale: boolean;
  first_aid_kit: boolean;
  teaching_materials: boolean;
  toys_available: boolean;
  cooking_utensils: boolean;
  water_storage_containers: boolean;
  medicine_kits: boolean;
  pre_school_kit: boolean;
  
  // Records and Documentation
  attendance_register: boolean;
  growth_chart_updated: boolean;
  vaccination_records: boolean;
  nutrition_records: boolean;
  all_registers: boolean;
  monthly_progress_reports: boolean;
  
  // Schedule and Operations
  timetable_available: boolean;
  timetable_followed: boolean;
  supervisor_regular_attendance: boolean;
  
  // Children Information
  total_registered_children: number;
  children_present_today: number;
  children_0_3_years: number;
  children_3_6_years: number;
  preschool_education_registered: number;
  preschool_education_present: number;
  
  // Nutrition and Health Services
  hot_meal_served: boolean;
  meal_quality: string;
  take_home_ration: boolean;
  monthly_25_days_meals: boolean;
  thr_provided_regularly: boolean;
  food_provider: string;
  supervisor_participation: string;
  food_distribution_decentralized: boolean;
  children_food_taste_preference: string;
  prescribed_protein_calories: boolean;
  prescribed_weight_food: boolean;
  lab_sample_date: string;
  
  // Health Services
  health_checkup_conducted: boolean;
  immunization_updated: boolean;
  vitamin_a_given: boolean;
  iron_tablets_given: boolean;
  regular_weighing: boolean;
  growth_chart_accuracy: boolean;
  vaccination_health_checkup_regular: boolean;
  vaccination_schedule_awareness: boolean;
  
  // Community Participation
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
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [detectedLocationName, setDetectedLocationName] = useState<string>('');

  // Check if we're in view mode
  const isViewMode = editingInspection?.mode === 'view';
  const isEditMode = editingInspection?.mode === 'edit';

  // Basic inspection data
  const [inspectionData, setInspectionData] = useState({
    category_id: '',
    location_name: '',
    planned_date: '',
    latitude: null as number | null,
    longitude: null as number | null,
    location_accuracy: null as number | null,
    location_detected: ''
  });

  // Anganwadi form data
  const [anganwadiFormData, setAnganwadiFormData] = useState<AnganwadiFormData>({
    anganwadi_name: '',
    anganwadi_number: '',
    supervisor_name: '',
    helper_name: '',
    village_name: '',
    building_type: '',
    building_condition: '',
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
    teaching_materials: false,
    toys_available: false,
    cooking_utensils: false,
    water_storage_containers: false,
    medicine_kits: false,
    pre_school_kit: false,
    attendance_register: false,
    growth_chart_updated: false,
    vaccination_records: false,
    nutrition_records: false,
    all_registers: false,
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
    take_home_ration: false,
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
    immunization_updated: false,
    vitamin_a_given: false,
    iron_tablets_given: false,
    regular_weighing: false,
    growth_chart_accuracy: false,
    vaccination_health_checkup_regular: false,
    vaccination_schedule_awareness: false,
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
      console.log('Loading existing inspection data:', editingInspection);
      
      // Load basic inspection data
      setInspectionData({
        category_id: editingInspection.category_id || '',
        location_name: editingInspection.location_name || '',
        planned_date: editingInspection.planned_date ? editingInspection.planned_date.split('T')[0] : '',
        latitude: editingInspection.latitude,
        longitude: editingInspection.longitude,
        location_accuracy: editingInspection.location_accuracy,
        location_detected: editingInspection.location_detected || ''
      });

      // Load anganwadi form data if it exists
      let formDataToLoad = null;
      
      // Try to get data from fims_anganwadi_forms table first
      if (editingInspection.fims_anganwadi_forms && editingInspection.fims_anganwadi_forms.length > 0) {
        formDataToLoad = editingInspection.fims_anganwadi_forms[0];
        console.log('Loading from fims_anganwadi_forms:', formDataToLoad);
      } else {
        // Fallback to form_data JSON field
        formDataToLoad = editingInspection.form_data;
        console.log('Loading from form_data JSON:', formDataToLoad);
      }

      if (formDataToLoad) {
        setAnganwadiFormData({
          anganwadi_name: formDataToLoad.anganwadi_name || '',
          anganwadi_number: formDataToLoad.anganwadi_number || '',
          supervisor_name: formDataToLoad.supervisor_name || '',
          helper_name: formDataToLoad.helper_name || '',
          village_name: formDataToLoad.village_name || '',
          building_type: formDataToLoad.building_type || '',
          building_condition: formDataToLoad.building_condition || '',
          room_availability: formDataToLoad.room_availability || false,
          toilet_facility: formDataToLoad.toilet_facility || false,
          drinking_water: formDataToLoad.drinking_water || false,
          electricity: formDataToLoad.electricity || false,
          kitchen_garden: formDataToLoad.kitchen_garden || false,
          independent_kitchen: formDataToLoad.independent_kitchen || false,
          women_health_checkup_space: formDataToLoad.women_health_checkup_space || false,
          weighing_machine: formDataToLoad.weighing_machine || false,
          baby_weighing_scale: formDataToLoad.baby_weighing_scale || false,
          hammock_weighing_scale: formDataToLoad.hammock_weighing_scale || false,
          adult_weighing_scale: formDataToLoad.adult_weighing_scale || false,
          height_measuring_scale: formDataToLoad.height_measuring_scale || false,
          first_aid_kit: formDataToLoad.first_aid_kit || false,
          teaching_materials: formDataToLoad.teaching_materials || false,
          toys_available: formDataToLoad.toys_available || false,
          cooking_utensils: formDataToLoad.cooking_utensils || false,
          water_storage_containers: formDataToLoad.water_storage_containers || false,
          medicine_kits: formDataToLoad.medicine_kits || false,
          pre_school_kit: formDataToLoad.pre_school_kit || false,
          attendance_register: formDataToLoad.attendance_register || false,
          growth_chart_updated: formDataToLoad.growth_chart_updated || false,
          vaccination_records: formDataToLoad.vaccination_records || false,
          nutrition_records: formDataToLoad.nutrition_records || false,
          all_registers: formDataToLoad.all_registers || false,
          monthly_progress_reports: formDataToLoad.monthly_progress_reports || false,
          timetable_available: formDataToLoad.timetable_available || false,
          timetable_followed: formDataToLoad.timetable_followed || false,
          supervisor_regular_attendance: formDataToLoad.supervisor_regular_attendance || false,
          total_registered_children: formDataToLoad.total_registered_children || 0,
          children_present_today: formDataToLoad.children_present_today || 0,
          children_0_3_years: formDataToLoad.children_0_3_years || 0,
          children_3_6_years: formDataToLoad.children_3_6_years || 0,
          preschool_education_registered: formDataToLoad.preschool_education_registered || 0,
          preschool_education_present: formDataToLoad.preschool_education_present || 0,
          hot_meal_served: formDataToLoad.hot_meal_served || false,
          meal_quality: formDataToLoad.meal_quality || '',
          take_home_ration: formDataToLoad.take_home_ration || false,
          monthly_25_days_meals: formDataToLoad.monthly_25_days_meals || false,
          thr_provided_regularly: formDataToLoad.thr_provided_regularly || false,
          food_provider: formDataToLoad.food_provider || '',
          supervisor_participation: formDataToLoad.supervisor_participation || '',
          food_distribution_decentralized: formDataToLoad.food_distribution_decentralized || false,
          children_food_taste_preference: formDataToLoad.children_food_taste_preference || '',
          prescribed_protein_calories: formDataToLoad.prescribed_protein_calories || false,
          prescribed_weight_food: formDataToLoad.prescribed_weight_food || false,
          lab_sample_date: formDataToLoad.lab_sample_date || '',
          health_checkup_conducted: formDataToLoad.health_checkup_conducted || false,
          immunization_updated: formDataToLoad.immunization_updated || false,
          vitamin_a_given: formDataToLoad.vitamin_a_given || false,
          iron_tablets_given: formDataToLoad.iron_tablets_given || false,
          regular_weighing: formDataToLoad.regular_weighing || false,
          growth_chart_accuracy: formDataToLoad.growth_chart_accuracy || false,
          vaccination_health_checkup_regular: formDataToLoad.vaccination_health_checkup_regular || false,
          vaccination_schedule_awareness: formDataToLoad.vaccination_schedule_awareness || false,
          village_health_nutrition_planning: formDataToLoad.village_health_nutrition_planning || '',
          children_attendance_comparison: formDataToLoad.children_attendance_comparison || '',
          preschool_programs_conducted: formDataToLoad.preschool_programs_conducted || '',
          community_participation: formDataToLoad.community_participation || '',
          committee_member_participation: formDataToLoad.committee_member_participation || '',
          home_visits_guidance: formDataToLoad.home_visits_guidance || '',
          public_opinion_improvement: formDataToLoad.public_opinion_improvement || '',
          general_observations: formDataToLoad.general_observations || '',
          recommendations: formDataToLoad.recommendations || '',
          action_required: formDataToLoad.action_required || '',
          suggestions: formDataToLoad.suggestions || '',
          visit_date: formDataToLoad.visit_date || '',
          inspector_designation: formDataToLoad.inspector_designation || '',
          inspector_name: formDataToLoad.inspector_name || ''
        });
      }
    }
  }, [editingInspection]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('categories.geolocationNotSupported'));
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        setInspectionData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location_accuracy: accuracy,
          location_detected: ''
        }));
        
        // Get location name using Google Maps Geocoding API
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDzOjsiqs6rRjSJWVdXfUBl4ckXayL8AbE&language=mr`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            setInspectionData(prev => ({
              ...prev,
              location_detected: address
            }));
            
            // Auto-fill location name if empty
            if (!prev.location_name) {
              setInspectionData(prevData => ({
                ...prevData,
                location_name: address
              }));
            }
          }
        } catch (error) {
          console.error('Error getting location name:', error);
        }
        
        setIsGettingLocation(false);
        // Get location name using Google Maps API
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${import.meta.env.VITE_GOOGLE_API_KEY}&language=mr`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const detectedLocation = data.results[0].formatted_address;
            
            // Update the location_detected field
            setInspectionData(prev => ({
              ...prev,
              location_detected: detectedLocation
            }));
            
            // Auto-fill location name if empty
            if (!prev.location_name) {
              setInspectionData(prev => ({
                ...prev,
                location_name: detectedLocation
              }));
            }
          }
        } catch (error) {
          console.error('Error getting location name:', error);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(t('fims.unableToGetLocation'));
        setIsGettingLocation(false);
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
            location_detected: inspectionData.location_detected,
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
            location_detected: inspectionData.location_detected,
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step