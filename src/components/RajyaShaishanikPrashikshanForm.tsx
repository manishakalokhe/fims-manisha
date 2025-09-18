import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  School,
  MapPin,
  Camera,
  Save,
  Send,
  Calendar,
  Users,
  BookOpen,
  Target,
  Award
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface RajyaShaishanikPrashikshanFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface SchoolFormData {
  // Basic school information
  visit_date: string;
  school_name: string;
  school_address: string;
  principal_name: string;
  principal_mobile: string;
  udise_number: string;
  center: string;
  taluka: string;
  district: string;
  management_type: string;
  school_achievement_self: string;
  school_achievement_external: string;
  
  // Teacher information
  sanctioned_posts: number;
  working_posts: number;
  present_teachers: number;
  
  // Khan Academy information
  math_teachers_count: number;
  khan_registered_teachers: number;
  khan_registered_students: number;
  khan_active_students: number;
  
  // Text responses
  khan_usage_method: string;
  sqdp_prepared: string;
  sqdp_objectives_achieved: string;
  nipun_bharat_verification: string;
  learning_outcomes_assessment: string;
  
  // Officer feedback
  officer_feedback: string;
  innovative_initiatives: string;
  suggested_changes: string;
  srujanrang_articles: string;
  future_articles: string;
  ngo_involvement: string;
  
  // Inspector information
  inspector_name: string;
  inspector_designation: string;
  visit_date_inspector: string;
}

export const RajyaShaishanikPrashikshanForm: React.FC<RajyaShaishanikPrashikshanFormProps> = ({
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

  // School form data
  const [schoolFormData, setSchoolFormData] = useState<SchoolFormData>({
    visit_date: '',
    school_name: '',
    school_address: '',
    principal_name: '',
    principal_mobile: '',
    udise_number: '',
    center: '',
    taluka: '',
    district: '',
    management_type: '',
    school_achievement_self: '',
    school_achievement_external: '',
    sanctioned_posts: 0,
    working_posts: 0,
    present_teachers: 0,
    math_teachers_count: 0,
    khan_registered_teachers: 0,
    khan_registered_students: 0,
    khan_active_students: 0,
    khan_usage_method: '',
    sqdp_prepared: '',
    sqdp_objectives_achieved: '',
    nipun_bharat_verification: '',
    learning_outcomes_assessment: '',
    officer_feedback: '',
    innovative_initiatives: '',
    suggested_changes: '',
    srujanrang_articles: '',
    future_articles: '',
    ngo_involvement: '',
    inspector_name: '',
    inspector_designation: '',
    visit_date_inspector: ''
  });

  // Get school inspection category
  const schoolCategory = categories.find(cat => cat.form_type === 'rajya_shaishanik');

  useEffect(() => {
    if (schoolCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: schoolCategory.id
      }));
    }
  }, [schoolCategory]);

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

  const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `SCH-${year}${month}${day}-${time}`;
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
            form_data: schoolFormData
          })
          .eq('id', editingInspection.id)
          .select()
          .single();

        if (updateError) throw updateError;
        inspectionResult = updateResult;
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
            form_data: schoolFormData
          })
          .select()
          .single();

        if (createError) throw createError;
        inspectionResult = createResult;
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
            description: `School inspection photo ${i + 1}`,
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderSchoolBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <School className="h-5 w-5 mr-2 text-green-600" />
        शाळेची मूलभूत माहिती (Basic School Information)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            भेटीचा दिनांक *
          </label>
          <input
            type="date"
            value={schoolFormData.visit_date}
            onChange={(e) => setSchoolFormData(prev => ({...prev, visit_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शाळेचे नाव *
          </label>
          <input
            type="text"
            value={schoolFormData.school_name}
            onChange={(e) => setSchoolFormData(prev => ({...prev, school_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="शाळेचे नाव प्रविष्ट करा"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शाळेचा पत्ता
          </label>
          <textarea
            value={schoolFormData.school_address}
            onChange={(e) => setSchoolFormData(prev => ({...prev, school_address: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={2}
            placeholder="शाळेचा संपूर्ण पत्ता प्रविष्ट करा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            मुख्याध्यापकाचे नाव
          </label>
          <input
            type="text"
            value={schoolFormData.principal_name}
            onChange={(e) => setSchoolFormData(prev => ({...prev, principal_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="मुख्याध्यापकाचे नाव प्रविष्ट करा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            मोबाईल क्रमांक
          </label>
          <input
            type="tel"
            value={schoolFormData.principal_mobile}
            onChange={(e) => setSchoolFormData(prev => ({...prev, principal_mobile: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="मोबाईल क्रमांक प्रविष्ट करा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शाळेचा युडायस क्रमांक
          </label>
          <input
            type="text"
            value={schoolFormData.udise_number}
            onChange={(e) => setSchoolFormData(prev => ({...prev, udise_number: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="UDISE क्रमांक प्रविष्ट करा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            केंद्र
          </label>
          <input
            type="text"
            value={schoolFormData.center}
            onChange={(e) => setSchoolFormData(prev => ({...prev, center: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="केंद्र प्रविष्ट करा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            तालुका
          </label>
          <input
            type="text"
            value={schoolFormData.taluka}
            onChange={(e) => setSchoolFormData(prev => ({...prev, taluka: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="तालुका प्रविष्ट करा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            जिल्हा
          </label>
          <input
            type="text"
            value={schoolFormData.district}
            onChange={(e) => setSchoolFormData(prev => ({...prev, district: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="जिल्हा प्रविष्ट करा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शाळा व्यवस्थापन प्रकार
          </label>
          <select
            value={schoolFormData.management_type}
            onChange={(e) => setSchoolFormData(prev => ({...prev, management_type: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">व्यवस्थापन प्रकार निवडा</option>
            <option value="government">सरकारी</option>
            <option value="aided">अनुदानित</option>
            <option value="private">खाजगी</option>
            <option value="other">इतर</option>
          </select>
        </div>
      </div>

      {/* Teacher Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-green-600" />
          शिक्षक माहिती (Teacher Information)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मंजूर पदे
            </label>
            <input
              type="number"
              value={schoolFormData.sanctioned_posts}
              onChange={(e) => setSchoolFormData(prev => ({...prev, sanctioned_posts: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              कार्यरत पदे
            </label>
            <input
              type="number"
              value={schoolFormData.working_posts}
              onChange={(e) => setSchoolFormData(prev => ({...prev, working_posts: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              आज उपस्थित शिक्षक संख्या
            </label>
            <input
              type="number"
              value={schoolFormData.present_teachers}
              onChange={(e) => setSchoolFormData(prev => ({...prev, present_teachers: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />
          </div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder={t('fims.enterLocationName')}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.address')}
          </label>
          <textarea
            value={inspectionData.address}
            onChange={(e) => setInspectionData(prev => ({...prev, address: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder={t('fims.enterFullAddress')}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GPS Location
          </label>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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

  const renderSchoolAssessmentForm = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        शैक्षणिक मूल्यांकन प्रपत्र (Educational Assessment Form)
      </h3>

      {/* Khan Academy Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-green-600" />
          Khan Academy पोर्टल माहिती
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              गणित विषय शिकविणाऱ्या शिक्षकांची संख्या (इयत्ता १ ते १०)
            </label>
            <input
              type="number"
              value={schoolFormData.math_teachers_count}
              onChange={(e) => setSchoolFormData(prev => ({...prev, math_teachers_count: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khan Academy पोर्टलवर नोंदणी झालेल्या शिक्षकांची संख्या
            </label>
            <input
              type="number"
              value={schoolFormData.khan_registered_teachers}
              onChange={(e) => setSchoolFormData(prev => ({...prev, khan_registered_teachers: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khan Academy पोर्टलवर नोंदणी झालेल्या विद्यार्थ्यांची संख्या
            </label>
            <input
              type="number"
              value={schoolFormData.khan_registered_students}
              onChange={(e) => setSchoolFormData(prev => ({...prev, khan_registered_students: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khan Academy पोर्टलवर स्वाध्याय सोडवित असलेल्या विद्यार्थ्यांची संख्या
            </label>
            <input
              type="number"
              value={schoolFormData.khan_active_students}
              onChange={(e) => setSchoolFormData(prev => ({...prev, khan_active_students: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            १. SCERTM, पुणे मार्फत Khan Academy च्या पोर्टलवर उपलब्ध करून दिलेल्या ई साहित्याचा वापर शाळेत कशाप्रकारे केला जातो?
          </label>
          <textarea
            value={schoolFormData.khan_usage_method}
            onChange={(e) => setSchoolFormData(prev => ({...prev, khan_usage_method: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            placeholder="Khan Academy ई साहित्याचा वापर पद्धती वर्णन करा"
          />
        </div>
      </div>

      {/* SQDP and Assessment Questions */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            २. शैक्षणिक वर्ष २०२२-२३ मधील SQDP च्या आधारे सन २०२३-२४ साठी सुधारित SQDP तयार केला आहे का?
          </label>
          <textarea
            value={schoolFormData.sqdp_prepared}
            onChange={(e) => setSchoolFormData(prev => ({...prev, sqdp_prepared: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="SQDP तयारी बाबत तपशील द्यावा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ३. २०२२-२३ मधील शाळा गुणवत्ता विकास आराखड्यानुसार (SQDP) ठरविलेली उद्दिष्टे पूर्ण झाली आहेत काय? नसल्यास कारणे द्यावी.
          </label>
          <textarea
            value={schoolFormData.sqdp_objectives_achieved}
            onChange={(e) => setSchoolFormData(prev => ({...prev, sqdp_objectives_achieved: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            placeholder="SQDP उद्दिष्टे पूर्णता बाबत तपशील द्यावा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ४. शाळेमध्ये निपुण भारत लक्ष्य पडताळणी प्रपत्र (भाषा व गणित) नुसार पडताळणी झाली का?
          </label>
          <textarea
            value={schoolFormData.nipun_bharat_verification}
            onChange={(e) => setSchoolFormData(prev => ({...prev, nipun_bharat_verification: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="निपुण भारत पडताळणी बाबत तपशील द्यावा"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ५. सध्या शिकवत असलेल्या इयत्तावार व विषयवार घटकानुसार किती विद्यार्थ्यामध्ये अध्ययन निष्पती दिसून येते
          </label>
          <textarea
            value={schoolFormData.learning_outcomes_assessment}
            onChange={(e) => setSchoolFormData(prev => ({...prev, learning_outcomes_assessment: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            placeholder="अध्ययन निष्पती मूल्यांकन तपशील द्यावा"
          />
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
          Upload School Photos
        </h4>
        <p className="text-gray-600 mb-4">
          Upload photos of the school for documentation and record keeping
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
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
        >
          <Camera className="h-4 w-4 mr-2" />
          {t('fims.chooseFiles')}
        </label>
        
        <p className="text-xs text-gray-500 mt-2">
          Maximum 5 photos allowed
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
                  alt={`School photo ${index + 1}`}
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

      {isUploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">{t('fims.uploadingPhotos')}</p>
        </div>
      )}

      {/* Inspector Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-green-600" />
          निरीक्षण अधिकारी माहिती (Inspector Information)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              निरीक्षण अधिकाऱ्याचे नाव
            </label>
            <input
              type="text"
              value={schoolFormData.inspector_name}
              onChange={(e) => setSchoolFormData(prev => ({...prev, inspector_name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="अधिकाऱ्याचे नाव प्रविष्ट करा"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              पदनाम
            </label>
            <input
              type="text"
              value={schoolFormData.inspector_designation}
              onChange={(e) => setSchoolFormData(prev => ({...prev, inspector_designation: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="पदनाम प्रविष्ट करा"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderSchoolBasicInfo();
      case 2:
        return renderLocationDetails();
      case 3:
        return renderSchoolAssessmentForm();
      case 4:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return schoolFormData.visit_date && schoolFormData.school_name;
      case 2:
        return inspectionData.location_name;
      case 3:
        return true; // Assessment form is optional, can proceed
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
              <span>Back</span>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 text-center">
              आदर्श शाळा भेट प्रपत्र
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              शाळेची माहिती
            </div>
            <div className={`${currentStep === 2 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.locationDetails')}
            </div>
            <div className={`${currentStep === 3 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              शैक्षणिक मूल्यांकन
            </div>
            <div className={`${currentStep === 4 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.photosSubmit')}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-xl shadow-lg border-2 border-green-200 p-4 md:p-6 mb-4 md:mb-6">
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
                  className="px-3 md:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
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
                className="px-4 md:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
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