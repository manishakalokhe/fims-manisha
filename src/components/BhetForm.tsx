import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  MapPin,
  Camera,
  Save,
  Send
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface BhetFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface FormData {
  q1: string;
  q2: string;
  q3: string;
  officerName: string;
  designation: string;
  principalSignature: string;
}

const BhetDenaryaAdhikaryansathiForm: React.FC<BhetFormProps> = ({
  user,
  onBack,
  categories,
  onInspectionCreated,
  editingInspection
}) => {
  const { t } = useTranslation();
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

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    q1: '',
    q2: '',
    q3: '',
    officerName: '',
    designation: '',
    principalSignature: ''
  });

  // Get bhet form category
  const bhetCategory = categories.find(cat => cat.form_type === 'bhet_form');

  useEffect(() => {
    if (bhetCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: bhetCategory.id
      }));
    }
  }, [bhetCategory]);

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

      // Load form data if it exists
      if (editingInspection.form_data) {
        setFormData({
          q1: editingInspection.form_data.q1 || '',
          q2: editingInspection.form_data.q2 || '',
          q3: editingInspection.form_data.q3 || '',
          officerName: editingInspection.form_data.officerName || '',
          designation: editingInspection.form_data.designation || '',
          principalSignature: editingInspection.form_data.principalSignature || ''
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
      async (position) => {
        setInspectionData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location_accuracy: position.coords.accuracy
        }));
        
        // Get location name using reverse geocoding
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const locationName = data.results[0].formatted_address;
            setInspectionData(prev => ({
              ...prev,
              address: locationName
            }));
          }
        } catch (error) {
          console.error('Error getting location name:', error);
        }
        
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
        const fileName = `bhet_form_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

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
            description: `Bhet form inspection photo ${i + 1}`
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
    return `BHET-${year}${month}${day}-${time}`;
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
            form_data: formData
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
            form_data: formData
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: keyof FormData) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          {isViewMode && (
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
              {isViewMode ? t('fims.viewInspection') : 
               isEditMode ? t('fims.editInspection') : 
               t('fims.newInspection')} - भेट देणाऱ्या अधिकाऱ्यांसाठी
            </h1>
            <div className="w-20"></div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg -mx-4 -mt-4 mb-4 md:-mx-6 md:-mt-6">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              स्थान माहिती (Location Information)
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                स्थानाचे नाव *
              </label>
              <input
                type="text"
                value={inspectionData.location_name}
                onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="स्थानाचे नाव प्रविष्ट करा"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  नियोजित तारीख
                </label>
                <input
                  type="date"
                  value={inspectionData.planned_date}
                  onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <span>{isLoading ? 'स्थान मिळवत आहे...' : 'सध्याचे स्थान मिळवा'}</span>
                </button>
              </div>
            </div>

            {inspectionData.latitude && inspectionData.longitude && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">स्थान कॅप्चर केले</p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>अक्षांश: {inspectionData.latitude.toFixed(6)}</p>
                  <p>रेखांश: {inspectionData.longitude.toFixed(6)}</p>
                  <p>अचूकता: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                संपूर्ण पत्ता
              </label>
              <textarea
                value={inspectionData.address}
                onChange={(e) => setInspectionData(prev => ({...prev, address: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="संपूर्ण पत्ता प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">भेट देणाऱ्या अधिकाऱ्यांसाठी</h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto rounded"></div>
          </div>

          {/* Section 1 */}
          <section className="bg-white p-6 mb-6 rounded-lg shadow-sm border-l-4 border-indigo-600">
            <p className="mb-4 font-semibold text-gray-900">
              १. आजच्या शाळा भेटी दरम्यान आपल्याकडून शाळेला कोणकोणत्या बाबींसंदर्भात मार्गदर्शन / सहकार्य
              दिले गेले याबाबतचा तपशील द्यावा.
            </p>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[120px] flex items-start">
              <textarea
                value={formData.q1}
                onChange={(e) => handleInputChange(e, 'q1')}
                placeholder="तपशील येथे लिहा..."
                rows={4}
                className="w-full border-none bg-transparent outline-none resize-y font-sans text-base leading-relaxed text-gray-700 p-0"
                disabled={isViewMode}
              />
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 mb-6 rounded-lg shadow-sm border-l-4 border-green-600">
            <p className="mb-4 font-semibold text-gray-900">
              २. शाळा भेटी दरम्यान जाणवलेल्या शाळा अनुषंगिक अडचणी सोडविण्यासाठी आपण कोणते प्रयत्न कराल.
              (संक्षिप्त कृती आराखडा.)
            </p>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[140px] flex items-start">
              <textarea
                value={formData.q2}
                onChange={(e) => handleInputChange(e, 'q2')}
                placeholder="कृती आराखडा येथे लिहा..."
                rows={5}
                className="w-full border-none bg-transparent outline-none resize-y font-sans text-base leading-relaxed text-gray-700 p-0"
                disabled={isViewMode}
              />
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 mb-6 rounded-lg shadow-sm border-l-4 border-purple-600">
            <p className="mb-4 font-semibold text-gray-900">३. शाळेबद्दलचा एकंदरित अभिप्राय.</p>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[120px] flex items-start">
              <textarea
                value={formData.q3}
                onChange={(e) => handleInputChange(e, 'q3')}
                placeholder="अभिप्राय येथे लिहा..."
                rows={5}
                className="w-full border-none bg-transparent outline-none resize-y font-sans text-base leading-relaxed text-gray-700 p-0"
                disabled={isViewMode}
              />
            </div>
          </section>

          {/* Signatures */}
          <section className="bg-white p-6 rounded-lg shadow-sm mt-8 space-y-4">
            <div>
              <p className="font-semibold text-gray-700 mb-2">शाळा भेट देणाऱ्या अधिकाऱ्याचे नाव :</p>
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                <input
                  type="text"
                  value={formData.officerName}
                  onChange={(e) => handleInputChange(e, 'officerName')}
                  className="w-full border-none bg-transparent outline-none text-gray-700"
                  placeholder="नाव लिहा"
                  disabled={isViewMode}
                />
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">पदनाम :</p>
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange(e, 'designation')}
                  className="w-full border-none bg-transparent outline-none text-gray-700"
                  placeholder="पदनाम लिहा"
                  disabled={isViewMode}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('fims.photoDocumentation')}
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Upload Inspection Photos
            </h4>
            <p className="text-gray-600 mb-4">
              तपासणी छायाचित्रे अपलोड करा
            </p>
            
            {!isViewMode && (
              <>
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
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {t('fims.chooseFiles')}
                </label>
                
                <p className="text-xs text-gray-500 mt-2">
                  Maximum 5 photos allowed
                </p>
              </>
            )}
          </div>

          {uploadedPhotos.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                {t('fims.uploadedPhotos')} ({uploadedPhotos.length}/5)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Bhet photo ${index + 1}`}
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
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Inspection Photos ({editingInspection.fims_inspection_photos.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.photo_url}
                      alt={photo.description || `Bhet photo ${index + 1}`}
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

          {isUploading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">{t('fims.uploadingPhotos')}</p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        {!isViewMode && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isLoading || isUploading}
              className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
            >
              <Save className="h-4 w-4" />
              <span>{t('fims.saveAsDraft')}</span>
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isLoading || isUploading}
              className="px-4 md:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
            >
              <Send className="h-4 w-4" />
              <span>{isEditMode ? t('fims.updateInspection') : t('fims.submitInspection')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BhetDenaryaAdhikaryansathiForm;
