import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  FileText,
  MapPin,
  Camera,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building,
  Users,
  Heart
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

interface AnganwadiTapasaniFormData {
  // Basic Information
  anganwadi_name: string;
  anganwadi_number: string;
  supervisor_name: string;
  helper_name: string;
  village_name: string;
  
  // Section 1: अंगणवाडी केंद्रातील उपलब्ध सुविधा
  building_type: string; // स्वतःची/ भाड्याची/ मोफत/ इमारत नाही
  toilet_facility: boolean; // शौचालय
  independent_kitchen: boolean; // स्वतंत्र बंदिस्त किचन व्यवस्था
  women_health_checkup_space: boolean; // महिलांच्या आरोग्य तपासणीसाठी जागा
  electricity: boolean; // विद्युत पुरवठा
  drinking_water: boolean; // पिण्याचे पाणी
  
  // Section 2: वजनकाटे उपलब्ध
  baby_weighing_scale: boolean; // बेबी वजनकाटे
  hammock_weighing_scale: boolean; // हॅमॉक [झोळीचे] वजनकाटे
  adult_weighing_scale: boolean; // प्रौढांसाठीचे वजनकाटे
  
  // Section 3: अंगणवाडीतील साहित्य उपलब्धता
  cooking_utensils: boolean; // स्वयंपाकाची भांडी
  water_storage_containers: boolean; // पिण्याचे पाणी ठेवण्यासाठी भांडी
  medicine_kits: boolean; // मेडिसिन किट्स
  pre_school_kit: boolean; // पूर्व शाले संच
  all_registers: boolean; // विविध नमुन्यातील रजिस्टर (सर्व)
  monthly_progress_reports: boolean; // छापील मासिक प्रगती अहवाल
  
  // Section 4: अंगणवाडी केंद्राचे वेळापत्रक
  timetable_available: boolean; // अंगणवाडी केंद्राचे वेळापत्रक आहे काय?
  timetable_followed: boolean; // वेळापत्रक पाळले जाते काय?
  supervisor_regular_attendance: boolean; // सेविका नियमितपणे हजर राहते काय?
  
  // Section 5: आहाराविषयी
  monthly_25_days_meals: boolean; // प्रत्येक महिन्याला २५ दिवस सकाळचा नाश्ता व पूरक पोषण आहार
  thr_provided_regularly: boolean; // ०–३ वर्षांची बालके, गर्भवती-स्तनदा माता, व तीव्र कमी वजनाच्या बालकांना THR
  
  // Section 6: स्वयंसहाय्यता बचत गटांच्या/महिला मंडळाबाबत
  food_provider: string; // अंगणवाडीतील आहार कोणाकडून दिला जातो?
  supervisor_participation: string; // यातील अंगणवाडी सेविकेच्या असलेला सहभाग
  food_distribution_decentralized: boolean; // आहार वाटपाचे काम विकेंद्रित केले आहे काय?
  
  // Section 7: मुलांना आहाराची चव व दर्जा आवडतो की कसे?
  children_food_taste_preference: string;
  
  // Section 8: आहार दर्जा
  prescribed_protein_calories: boolean; // निर्धारीत प्रथीणे व उष्मांक असलेला आहार मिळतो काय?
  prescribed_weight_food: boolean; // निर्धारीत वजनाचा आहार मिळतो काय?
  lab_sample_date: string; // आहार नमुने प्रयोगशाळेत पृथ:करणाकरिता केव्हा पाठविले होते?
  
  // Section 9: बालकांचे वजने
  regular_weighing: boolean; // बालकांचे वजने नियमित वजने घेतली जातात किंवा कसे?
  growth_chart_accuracy: boolean; // वय व वजन यांची नोंद तपासून पोषण श्रेणी योग्य प्रमाणे दर्शविलेली आहे काय?
  
  // Section 10: लसीकरण व आरोग्य तपासणी
  vaccination_health_checkup_regular: boolean; // लसीकरण व आरोग्य तपासणी नियमितपणे होते काय?
  vaccination_schedule_awareness: boolean; // लसीकरण दिवसाची माहिती लाभार्थी पालकांना आहे काय?
  
  // Section 11-17: Additional Questions
  village_health_nutrition_planning: string; // ११. ग्राम आरोग्य व पोषण दिवसाचे गावनिहाय सूक्ष्म नियोजन
  children_attendance_comparison: string; // १२. भेटीच्या दिवशी प्रत्यक्ष उपस्थित असलेली बालके
  preschool_education_registered: number; // १३.१ पूर्वशालेय शिक्षणासाठी नोंदवलेली बालके
  preschool_education_present: number; // १३.२ भेटीची वेळी प्रत्यक्ष हजर बालके
  preschool_programs_conducted: string; // १३.३ भेटीचे दिवशी कोणकोणते कार्यक्रम घेतले
  community_participation: string; // १४.१ अंगणवाडी केंद्राला गावातील लोकांचे सहकार्य
  committee_member_participation: string; // १४.२ ग्राम समिती सदस्य/ ग्राम पंचायत सदस्य/ आरोग्य सेविका/ इतर उपस्थिती
  home_visits_guidance: string; // १५. गरोदर महिला, आजारी असलेली बालके यांचे घरी भेट
  public_opinion_improvement: string; // १६. अंगणवाडी क्षेत्रातील लोकांचे मत व सुधारणा
  suggestions: string; // १७. काही सूचना असल्यास
  
  // Signature Information
  inspector_name: string; // नाव
  inspector_designation: string; // पद
  visit_date: string; // भेटीचा दिनांक
  
  // Existing fields that need to be maintained for compatibility
  total_registered_children: number;
  children_present_today: number;
  children_0_3_years: number;
  children_3_6_years: number;
  meal_quality: string;
  general_observations: string;
  recommendations: string;
  action_required: string;
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
  const [detectedLocationName, setDetectedLocationName] = useState('');

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

  // Anganwadi form data with new structure
  const [anganwadiFormData, setAnganwadiFormData] = useState<AnganwadiTapasaniFormData>({
    // Basic Information
    anganwadi_name: '',
    anganwadi_number: '',
    supervisor_name: '',
    helper_name: '',
    village_name: '',
    
    // Section 1: अंगणवाडी केंद्रातील उपलब्ध सुविधा
    building_type: '',
    toilet_facility: false,
    independent_kitchen: false,
    women_health_checkup_space: false,
    electricity: false,
    drinking_water: false,
    
    // Section 2: वजनकाटे उपलब्ध
    baby_weighing_scale: false,
    hammock_weighing_scale: false,
    adult_weighing_scale: false,
    
    // Section 3: अंगणवाडीतील साहित्य उपलब्धता
    cooking_utensils: false,
    water_storage_containers: false,
    medicine_kits: false,
    pre_school_kit: false,
    all_registers: false,
    monthly_progress_reports: false,
    
    // Section 4: अंगणवाडी केंद्राचे वेळापत्रक
    timetable_available: false,
    timetable_followed: false,
    supervisor_regular_attendance: false,
    
    // Section 5: आहाराविषयी
    monthly_25_days_meals: false,
    thr_provided_regularly: false,
    
    // Section 6: स्वयंसहाय्यता बचत गटांच्या/महिला मंडळाबाबत
    food_provider: '',
    supervisor_participation: '',
    food_distribution_decentralized: false,
    
    // Section 7: मुलांना आहाराची चव व दर्जा आवडतो की कसे?
    children_food_taste_preference: '',
    
    // Section 8: आहार दर्जा
    prescribed_protein_calories: false,
    prescribed_weight_food: false,
    lab_sample_date: '',
    
    // Section 9: बालकांचे वजने
    regular_weighing: false,
    growth_chart_accuracy: false,
    
    // Section 10: लसीकरण व आरोग्य तपासणी
    vaccination_health_checkup_regular: false,
    vaccination_schedule_awareness: false,
    
    // Section 11-17: Additional Questions
    village_health_nutrition_planning: '',
    children_attendance_comparison: '',
    preschool_education_registered: 0,
    preschool_education_present: 0,
    preschool_programs_conducted: '',
    community_participation: '',
    committee_member_participation: '',
    home_visits_guidance: '',
    public_opinion_improvement: '',
    suggestions: '',
    
    // Signature Information
    inspector_name: '',
    inspector_designation: '',
    visit_date: '',
    
    // Existing fields for compatibility
    total_registered_children: 0,
    children_present_today: 0,
    children_0_3_years: 0,
    children_3_6_years: 0,
    meal_quality: '',
    general_observations: '',
    recommendations: '',
    action_required: ''
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
        setAnganwadiFormData(prev => ({
          ...prev,
          ...formData
        }));
      }
    }
  }, [editingInspection]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setInspectionData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location_accuracy: position.coords.accuracy
        }));
        
        // Reverse geocoding to get location name
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=59e88d8ab31c4c76a71d6a3ad8759478&language=en&pretty=1`);
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const locationName = result.formatted || 
                               `${result.components?.village || result.components?.town || result.components?.city || ''}, ${result.components?.state || ''}`;
            setDetectedLocationName(locationName);
          }
        } catch (error) {
          console.error('Error getting location name:', error);
          // Fallback: use coordinates as location name
          setDetectedLocationName(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get current location');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (uploadedPhotos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
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
    return `AWD-${year}${month}${day}-${time}`;
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
        ? (isUpdate ? 'Inspection updated as draft' : 'Inspection saved as draft')
        : (isUpdate ? 'Inspection updated successfully' : 'Inspection submitted successfully');
      
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

  const renderBasicDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        मूलभूत तपशील - अंगणवाडी तपासणी
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            अंगणवाडी केंद्राचे नाव *
          </label>
          <input
            type="text"
            value={anganwadiFormData.anganwadi_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, anganwadi_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="अंगणवाडी केंद्राचे नाव प्रविष्ट करा"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            अंगणवाडी क्रमांक
          </label>
          <input
            type="text"
            value={anganwadiFormData.anganwadi_number}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, anganwadi_number: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="अंगणवाडी क्रमांक प्रविष्ट करा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            सेविकेचे नाव
          </label>
          <input
            type="text"
            value={anganwadiFormData.supervisor_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, supervisor_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="सेविकेचे नाव प्रविष्ट करा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            सहाय्यकाचे नाव
          </label>
          <input
            type="text"
            value={anganwadiFormData.helper_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, helper_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="सहाय्यकाचे नाव प्रविष्ट करा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            गावाचे नाव
          </label>
          <input
            type="text"
            value={anganwadiFormData.village_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, village_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="गावाचे नाव प्रविष्ट करा"
          />
        </div>

      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        स्थान तपशील
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            स्थानाचे नाव *
          </label>
          <input
            type="text"
            value={inspectionData.location_name}
            onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="स्थानाचे नाव प्रविष्ट करा"
            required
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            नियोजित दिनांक
          </label>
          <input
            type="date"
            value={inspectionData.planned_date}
            onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GPS स्थान
          </label>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span>{isLoading ? 'स्थान मिळत आहे...' : 'सध्याचे स्थान मिळवा'}</span>
          </button>
          
          {inspectionData.latitude && inspectionData.longitude && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">स्थान कॅप्चर केले</p>
              {detectedLocationName && (
                <p className="text-sm text-green-700 mb-2">
                  स्थान: {detectedLocationName}
                </p>
              )}
              <p className="text-xs text-green-600">
                अक्षांश: {inspectionData.latitude.toFixed(6)}<br />
                रेखांश: {inspectionData.longitude.toFixed(6)}<br />
                अचूकता: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnganwadiTapasaniForm = () => (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-bold text-center mb-4">
        अंगणवाडी केंद्र तपासणी अहवाल (नमुना)
      </h2>
      <p className="text-center mb-6">
        (केंद्र शासनाचे पत्र क्र. F.No.१६-३/२००४-ME (P+) दि. २२ ऑक्टोबर२०१०.)
      </p>

      {/* 1. अंगणवाडी केंद्रातील उपलब्ध सुविधा */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">१. अंगणवाडी केंद्रातील उपलब्ध सुविधा:</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              अंगणवाडी इमारत
            </label>
            <select
              value={anganwadiFormData.building_type}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, building_type: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">निवडा</option>
              <option value="own">स्वतःची</option>
              <option value="rented">भाड्याची</option>
              <option value="free">मोफत</option>
              <option value="no_building">इमारत नाही</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'toilet_facility', label: 'शौचालय' },
              { key: 'independent_kitchen', label: 'स्वतंत्र बंदिस्त किचन व्यवस्था' },
              { key: 'women_health_checkup_space', label: 'महिलांच्या आरोग्य तपासणीसाठी जागा' },
              { key: 'electricity', label: 'विद्युत पुरवठा' },
              { key: 'drinking_water', label: 'पिण्याचे पाणी' }
            ].map((field) => (
              <div key={field.key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={field.key}
                  checked={anganwadiFormData[field.key as keyof AnganwadiTapasaniFormData] as boolean}
                  onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor={field.key} className="text-sm text-gray-700">
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. वजनकाटे उपलब्ध */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">२. वजनकाटे उपलब्ध:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'baby_weighing_scale', label: 'बेबी वजनकाटे' },
            { key: 'hammock_weighing_scale', label: 'हॅमॉक [झोळीचे] वजनकाटे' },
            { key: 'adult_weighing_scale', label: 'प्रौढांसाठीचे वजनकाटे' }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiTapasaniFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* 3. अंगणवाडीतील साहित्य उपलब्धता */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">३. अंगणवाडीतील साहित्य उपलब्धता:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'cooking_utensils', label: 'स्वयंपाकाची भांडी' },
            { key: 'water_storage_containers', label: 'पिण्याचे पाणी ठेवण्यासाठी भांडी' },
            { key: 'medicine_kits', label: 'मेडिसिन किट्स' },
            { key: 'pre_school_kit', label: 'पूर्व शाले संच' },
            { key: 'all_registers', label: 'विविध नमुन्यातील रजिस्टर (सर्व)' },
            { key: 'monthly_progress_reports', label: 'छापील मासिक प्रगती अहवाल' }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiTapasaniFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* 4. अंगणवाडी केंद्राचे वेळापत्रक */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">४. अंगणवाडी केंद्राचे वेळापत्रक:</h3>
        <div className="space-y-4">
          {[
            { key: 'timetable_available', label: '१] अंगणवाडी केंद्राचे वेळापत्रक आहे काय?' },
            { key: 'timetable_followed', label: '२] वेळापत्रक पाळले जाते काय?' },
            { key: 'supervisor_regular_attendance', label: '३] सेविका नियमितपणे हजर राहते काय?' }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiTapasaniFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* 5. आहाराविषयी */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">५. आहाराविषयी:</h3>
        <div className="space-y-4">
          {[
            { key: 'monthly_25_days_meals', label: '१] अंगणवाडी केंद्रात प्रत्येक महिन्याला २५ दिवस सकाळचा नाश्ता व पूरक पोषण आहार पुरविण्यात येतो काय?' },
            { key: 'thr_provided_regularly', label: '२] ०–३ वर्षांची बालके, गर्भवती-स्तनदा माता, व तीव्र कमी वजनाच्या बालकांना THR नियमितपणे दिला जातो काय?' }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiTapasaniFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* 6. स्वयंसहाय्यता बचत गटांच्या/महिला मंडळाबाबत */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">६. स्वयंसहाय्यता बचत गटांच्या/महिला मंडळाबाबत:</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              १] अंगणवाडीतील आहार कोणाकडून दिला जातो?
            </label>
            <textarea
              value={anganwadiFormData.food_provider}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, food_provider: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={2}
              placeholder="उत्तर प्रविष्ट करा"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              २] यातील अंगणवाडी सेविकेच्या असलेला सहभाग
            </label>
            <textarea
              value={anganwadiFormData.supervisor_participation}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, supervisor_participation: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={2}
              placeholder="उत्तर प्रविष्ट करा"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="food_distribution_decentralized"
              checked={anganwadiFormData.food_distribution_decentralized}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, food_distribution_decentralized: e.target.checked}))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="food_distribution_decentralized" className="text-sm text-gray-700">
              ३] आहार वाटपाचे काम विकेंद्रित केले आहे काय?
            </label>
          </div>
        </div>
      </section>

      {/* 7. मुलांना आहाराची चव व दर्जा */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">७. मुलांना आहाराची चव व दर्जा आवडतो की कसे?</h3>
        <textarea
          value={anganwadiFormData.children_food_taste_preference}
          onChange={(e) => setAnganwadiFormData(prev => ({...prev, children_food_taste_preference: e.target.value}))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={2}
          placeholder="उत्तर प्रविष्ट करा"
        />
      </section>

      {/* 8. आहार दर्जा */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">८. आहार दर्जा:</h3>
        <div className="space-y-4">
          {[
            { key: 'prescribed_protein_calories', label: '१] निर्धारीत प्रथीणे व उष्मांक असलेला आहार मिळतो काय?' },
            { key: 'prescribed_weight_food', label: '२] निर्धारीत वजनाचा आहार मिळतो काय?' }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiTapasaniFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ३] आहार नमुने प्रयोगशाळेत पृथ:करणाकरिता केव्हा पाठविले होते?
            </label>
            <input
              type="date"
              value={anganwadiFormData.lab_sample_date}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, lab_sample_date: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ४] आहाराचा दर्जा
            </label>
            <select
              value={anganwadiFormData.meal_quality}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, meal_quality: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">दर्जा निवडा</option>
              <option value="excellent">उत्कृष्ट</option>
              <option value="good">चांगला</option>
              <option value="average">सरासरी</option>
              <option value="poor">खराब</option>
            </select>
          </div>
        </div>
      </section>

      {/* 9. बालकांचे वजने */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">९.</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="regular_weighing"
              checked={anganwadiFormData.regular_weighing}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, regular_weighing: e.target.checked}))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="regular_weighing" className="text-sm text-gray-700">
              १] बालकांचे वजने नियमित वजने घेतली जातात किंवा कसे?
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="growth_chart_accuracy"
              checked={anganwadiFormData.growth_chart_accuracy}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, growth_chart_accuracy: e.target.checked}))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="growth_chart_accuracy" className="text-sm text-gray-700">
              २] (वृद्धिपत्रक तपासून) वय व वजन यांची नोंद तपासून पोषण श्रेणी योग्य प्रमाणे दर्शविलेली आहे काय?
            </label>
          </div>
        </div>
      </section>

      {/* 10. लसीकरण व आरोग्य तपासणी */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">१०.</h3>
        <div className="space-y-4">
          {[
            { key: 'vaccination_health_checkup_regular', label: '१] लसीकरण व आरोग्य तपासणी नियमितपणे होते काय? (मागील दोन महिन्याचे रेकॉर्ड तपासावे.)' },
            { key: 'vaccination_schedule_awareness', label: '२] लसीकरण दिवसाची माहिती लाभार्थी पालकांना आहे काय? (एक-दोन घरी जाऊन तपासावे)' }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiTapasaniFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* 11-17. Additional Questions */}
      <div className="space-y-6">
        <section className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">११. ग्राम आरोग्य व पोषण दिवसाचे गावनिहाय सूक्ष्म नियोजन केले आहे काय?</h3>
          <textarea
            value={anganwadiFormData.village_health_nutrition_planning}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, village_health_nutrition_planning: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={2}
            placeholder="उत्तर प्रविष्ट करा"
          />
        </section>

        <section className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">१२. भेटीच्या दिवशी प्रत्यक्ष उपस्थित असलेली बालके व नोंदविलेल्या बालकांपैकी त्या दिवशी प्रत्यक्ष हजर असलेली बालके. (मागील आठवड्यातील सरासरी आकडेवारीची ही संख्या पडताळून पहावी.):</h3>
          <textarea
            value={anganwadiFormData.children_attendance_comparison}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, children_attendance_comparison: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={2}
            placeholder="उत्तर प्रविष्ट करा"
          />
        </section>

        <section className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">१३. पूर्व शालेय शिक्षण:</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                १] पूर्वशालेय शिक्षणासाठी नोंदवलेली बालके
              </label>
              <input
                type="number"
                min="0"
                value={anganwadiFormData.preschool_education_registered}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, preschool_education_registered: parseInt(e.target.value) || 0}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                २] भेटीची वेळी प्रत्यक्ष हजर बालके
              </label>
              <input
                type="number"
                min="0"
                value={anganwadiFormData.preschool_education_present}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, preschool_education_present: parseInt(e.target.value) || 0}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ३] भेटीचे दिवशी कोणकोणते कार्यक्रम घेतले
              </label>
              <textarea
                value={anganwadiFormData.preschool_programs_conducted}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, preschool_programs_conducted: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
                placeholder="उत्तर प्रविष्ट करा"
              />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">१४. लोकसहभाग:</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                १] अंगणवाडी केंद्राला गावातील लोकांचे सहकार्य मिळते काय? मिळत नसेल तर का?(याबाबत ग्राम समिती अथवा ग्राम पंचायत सदस्य यांचेशी चर्चा करावी.)
              </label>
              <textarea
                value={anganwadiFormData.community_participation}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, community_participation: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="उत्तर प्रविष्ट करा"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                २] यामध्ये ग्राम समिती सदस्य/ ग्राम पंचायत सदस्य/ आरोग्य सेविका/ इतर उपस्थिती कशी होती?
              </label>
              <textarea
                value={anganwadiFormData.committee_member_participation}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, committee_member_participation: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="उत्तर प्रविष्ट करा"
              />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">१५. गरोदर महिला, आजारी असलेली बालके यांचे घरी अंगणवाडी सेविका नियमित भेट देऊन त्यांना मार्गदर्शन व सल्ला देण्याचे काम करते किंवा कसे? (काही घरी भेट देऊन याबाबत पडताळणी करावी.) :</h3>
          <textarea
            value={anganwadiFormData.home_visits_guidance}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, home_visits_guidance: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="उत्तर प्रविष्ट करा"
          />
        </section>

        <section className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">१६. अंगणवाडी क्षेत्रातील लोकांचे अंगणवाडीचे कामकाजाबाबत सर्वसाधारण मत कसे आहे? तसेच मागील २–३ वर्षाचे कालावधीत काही सुधारणा झालेल्या आहेत काय?</h3>
          <textarea
            value={anganwadiFormData.public_opinion_improvement}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, public_opinion_improvement: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="उत्तर प्रविष्ट करा"
          />
        </section>

        <section className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">१७. काही सूचना असल्यास-</h3>
          <textarea
            value={anganwadiFormData.suggestions}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, suggestions: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="सूचना प्रविष्ट करा"
          />
        </section>
      </div>

      {/* Signature Section */}
      <section className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h3 className="font-semibold mb-4 text-blue-800">स्वाक्षरी विभाग</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">नाव:</label>
            <input
              type="text"
              value={anganwadiFormData.inspector_name}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, inspector_name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="तपासकर्त्याचे नाव"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">पद:</label>
            <input
              type="text"
              value={anganwadiFormData.inspector_designation}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, inspector_designation: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="पदनाम"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">भेटीचा दिनांक:</label>
            <input
              type="date"
              value={anganwadiFormData.visit_date}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, visit_date: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <div className="text-right w-full">
              <p className="text-sm font-medium text-gray-700">स्वाक्षरी :</p>
              <div className="mt-2 border-b-2 border-gray-300 w-48 ml-auto"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderPhotoUpload = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        फोटो दस्तऐवजीकरण
      </h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          अंगणवाडी फोटो अपलोड करा
        </h4>
        <p className="text-gray-600 mb-4">
          दस्तऐवजीकरणासाठी अंगणवाडी केंद्राचे फोटो अपलोड करा
        </p>
        
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
        >
          <Camera className="h-4 w-4 mr-2" />
          फाइल निवडा
        </label>
        
        <p className="text-xs text-gray-500 mt-2">
          जास्तीत जास्त ५ फोटो अनुमतीत
        </p>
      </div>

      {uploadedPhotos.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            अपलोड केलेले फोटो ({uploadedPhotos.length}/5)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`अंगणवाडी फोटो ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                >
                  ×
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {photo.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isUploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">फोटो अपलोड होत आहेत...</p>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicDetails();
      case 2:
        return renderLocationDetails();
      case 3:
        return renderAnganwadiTapasaniForm();
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

  const isViewMode = editingInspection?.mode === 'view';
  const isEditMode = editingInspection?.mode === 'edit';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          {editingInspection?.mode === 'view' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                दृश्य मोड - फॉर्म केवळ वाचनीय
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>मागे</span>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 text-center">
              {editingInspection?.mode === 'view' ? 'तपासणी पहा' : 
               editingInspection?.mode === 'edit' ? 'तपासणी संपादित करा' : 
               'नवीन तपासणी'} - अंगणवाडी तपासणी
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              मूलभूत तपशील
            </div>
            <div className={`${currentStep === 2 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              स्थान तपशील
            </div>
            <div className={`${currentStep === 3 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              अंगणवाडी तपासणी
            </div>
            <div className={`${currentStep === 4 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              फोटो व सबमिट
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
            मागील
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
                  <span>मसुदा म्हणून जतन करा</span>
                </button>
                )}
                {!isViewMode && (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading || isUploading}
                  className="px-3 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
                >
                  <Send className="h-4 w-4" />
                  <span>{isEditMode ? 'तपासणी अपडेट करा' : 'तपासणी सबमिट करा'}</span>
                </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={!canProceedToNext() || isViewMode}
                className="px-4 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
              >
                पुढील
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};