import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  MapPin,
  Camera,
  Save,
  Send,
  FileText
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
  
  // Form states
  const [formData, setFormData] = useState<FormData>({
    q1: '',
    q2: '',
    q3: '',
    officerName: '',
    designation: '',
    principalSignature: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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
      console.log('Loading existing Bhet form data:', editingInspection);
      
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

  // Get Current Location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('fims.geolocationNotSupported') || 'Geolocation not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
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
            console.log('Location fetched successfully:', locationName);
          } else {
            console.log('No address found for coordinates');
          }
        } catch (error) {
          console.error('Error getting location name:', error);
          alert('GPS स्थान मिळवले पण पत्ता मिळवता आला नाही');
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        alert(t('fims.unableToGetLocation') || 'स्थान मिळवता आले नाही. कृपया पुन्हा प्रयत्न करा.');
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 60000 
      }
    );
  };

  // Handle Photo Upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (uploadedPhotos.length + files.length > 5) {
      alert(t('fims.maxPhotosAllowed') || 'कमाल ५ फोटो परवानगी आहे');
      return;
    }

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} ही image file नाही`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`${file.name} ही file खूप मोठी आहे (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setUploadedPhotos(prev => [...prev, ...validFiles]);
      console.log(`Added ${validFiles.length} photos. Total: ${uploadedPhotos.length + validFiles.length}`);
    }
  };

  // Remove Photo
  const removePhoto = (index: number) => {
    const removedPhoto = uploadedPhotos[index];
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    console.log(`Removed photo: ${removedPhoto.name}`);
  };

  // Upload Photos to Supabase
  const uploadPhotosToSupabase = async (inspectionId: string) => {
    if (uploadedPhotos.length === 0) return;

    setIsUploading(true);
    try {
      console.log(`Uploading ${uploadedPhotos.length} photos for inspection ${inspectionId}`);
      
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const file = uploadedPhotos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `bhet_form_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('field-visit-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload error for ${file.name}:`, uploadError);
          throw uploadError;
        }

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
            description: `भेट फॉर्म तपासणी फोटो ${i + 1}`,
            photo_order: i + 1,
            uploaded_at: new Date().toISOString()
          });

        if (dbError) {
          console.error(`Database error for ${file.name}:`, dbError);
          throw dbError;
        }

        console.log(`Photo ${i + 1}/${uploadedPhotos.length} uploaded successfully: ${file.name}`);
      }

      console.log('All photos uploaded successfully');
      alert('सर्व फोटो यशस्वीरीत्या अपलोड झाले');
    } catch (error: any) {
      console.error('Error uploading photos:', error);
      alert('फोटो अपलोड करताना त्रुटी: ' + error.message);
      throw error;
    } finally {
      setIsUploading(false);
      // Clear photos after successful upload
      setUploadedPhotos([]);
    }
  };

  // Generate Inspection Number
  const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `BHET-${year}${month}${day}-${time}`;
  };

  // Handle Form Submission
  const handleSubmit = async (isDraft: boolean = false) => {
    // Basic validation
    if (!formData.officerName.trim()) {
      alert('अधिकारीचे नाव आवश्यक आहे');
      return;
    }
    
    if (!inspectionData.location_name.trim()) {
      alert('स्थानाचे नाव आवश्यक आहे');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Starting form submission...');

      // Sanitize data
      const sanitizedInspectionData = {
        ...inspectionData,
        planned_date: inspectionData.planned_date || null
      };

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
        // Update existing inspection
        console.log('Updating existing inspection:', editingInspection.id);
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
            form_data: formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingInspection.id)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        inspectionResult = updateResult;
        console.log('Inspection updated successfully:', inspectionResult);
      } else {
        // Create new inspection
        console.log('Creating new inspection...');
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
            form_data: formData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Create error:', createError);
          throw createError;
        }
        inspectionResult = createResult;
        console.log('New inspection created:', inspectionResult);
      }

      // Upload photos if any (only for non-draft submissions)
      if (uploadedPhotos.length > 0 && !isDraft) {
        console.log('Uploading photos...');
        await uploadPhotosToSupabase(inspectionResult.id);
      }

      const isUpdate = editingInspection && editingInspection.id;
      const message = isDraft 
        ? (isUpdate ? 'भेट फॉर्म ड्राफ्ट म्हणून अपडेट केला' : 'भेट फॉर्म ड्राफ्ट म्हणून सेव्ह केला')
        : (isUpdate ? 'भेट फॉर्म यशस्वीरीत्या अपडेट केला' : 'भेट फॉर्म यशस्वीरीत्या सबमिट केला');
      
      alert(message);
      
      if (!isDraft) {
        onInspectionCreated();
      }
      onBack();
      
    } catch (error: any) {
      console.error('Submission error:', error);
      alert('फॉर्म सबमिट करताना त्रुटी: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: keyof FormData) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  // ✅ COMPLETE JSX STRUCTURE - All elements properly closed
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
          {isViewMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                {t('fims.viewMode')} - फॉर्म फक्त पहाण्यासाठी
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              disabled={isLoading}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">मागे जा</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center flex-1">
              {isViewMode ? 'भेट फॉर्म पहा' : 
               isEditMode ? 'भेट फॉर्म संपादित करा' : 
               'नवीन भेट फॉर्म'} - भेट देणाऱ्या अधिकाऱ्यांसाठी
            </h1>
            <div className="w-24"></div>
          </div>

          <p className="text-base md:text-lg text-gray-600 text-center font-medium">
            शाळा भेट देणाऱ्या अधिकाऱ्यांसाठी फॉर्म भरा
          </p>
        </div>

        {/* Location Information Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-t-lg -mx-6 -mt-6 mb-6 md:-mx-8 md:-mt-8">
            <h3 className="text-xl font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              स्थान माहिती (Location Information)
            </h3>
          </div>
          
          <div className="space-y-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                स्थानाचे नाव *
              </label>
              <input
                type="text"
                value={inspectionData.location_name}
                onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-base"
                placeholder="स्थानाचे नाव प्रविष्ट करा"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  नियोजित तारीख
                </label>
                <input
                  type="date"
                  value={inspectionData.planned_date}
                  onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={isViewMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPS Location
                </label>
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation || isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{isGettingLocation ? 'स्थान शोधत आहे...' : 'सध्याचे GPS स्थान मिळवा'}</span>
                  </button>
                )}
                {isViewMode && inspectionData.latitude && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      स्थान कॅप्चर केलेले
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      अक्षांश: {inspectionData.latitude.toFixed(6)} | 
                      रेखांश: {inspectionData.longitude?.toFixed(6)} | 
                      अचूकता: {inspectionData.location_accuracy ? `${Math.round(inspectionData.location_accuracy)}m` : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {inspectionData.latitude && inspectionData.longitude && (
              <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  स्थान यशस्वीरीत्या कॅप्चर केले!
                </p>
                <div className="text-xs text-green-600 space-y-1">
                  <p>अक्षांश: {inspectionData.latitude.toFixed(6)}</p>
                  <p>रेखांश: {inspectionData.longitude?.toFixed(6)}</p>
                  <p>अचूकता: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + ' मीटर' : 'N/A'}</p>
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                संपूर्ण पत्ता
              </label>
              <textarea
                value={inspectionData.address}
                onChange={(e) => setInspectionData(prev => ({...prev, address: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                rows={3}
                placeholder="संपूर्ण पत्ता प्रविष्ट करा (GPS द्वारे मिळालेला पत्ता येथे दिसेल)"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 md:p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              भेट देणाऱ्या अधिकाऱ्यांसाठी
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 text-lg">
              शाळा भेट देणाऱ्या अधिकाऱ्यांसाठी मार्गदर्शन फॉर्म
            </p>
          </div>

          {/* Section 1 - Guidance Provided */}
          <section className="mb-8 p-6 rounded-xl shadow-sm border-l-4 border-indigo-600 bg-indigo-50">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg mt-1">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 flex-1">
                १. आजच्या शाळा भेटी दरम्यान आपल्याकडून शाळेला कोणकोणत्या बाबींसंदर्भात मार्गदर्शन / सहकार्य दिले गेले याबाबतचा तपशील द्यावा.
              </h3>
            </div>
            <textarea
              value={formData.q1}
              onChange={(e) => handleInputChange(e, 'q1')}
              placeholder="तपशील येथे लिहा... (उदा. शिकवणी पद्धती, विद्यार्थी सहभाग, सुविधा सुधारणा, शिक्षक प्रशिक्षण इ.)"
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isViewMode}
            />
            {formData.q1 && !isViewMode && (
              <p className="text-sm text-indigo-600 mt-2">
                {formData.q1.length} / 1000 characters
              </p>
            )}
          </section>

          {/* Section 2 - Action Plan */}
          <section className="mb-8 p-6 rounded-xl shadow-sm border-l-4 border-green-600 bg-green-50">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg mt-1">
                <ClipboardList className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 flex-1">
                २. शाळा भेटी दरम्यान जाणवलेल्या शाळा अनुषंगिक अडचणी सोडविण्यासाठी आपण कोणते प्रयत्न कराल. (संक्षिप्त कृती आराखडा.)
              </h3>
            </div>
            <textarea
              value={formData.q2}
              onChange={(e) => handleInputChange(e, 'q2')}
              placeholder="कृती आराखडा येथे लिहा... (उदा. 1. सुविधा सुधारणा - 15 दिवसांत, 2. शिक्षक प्रशिक्षण - महिन्यात 2 सत्रे, 3. विद्यार्थी सहभाग वाढवणे - साप्ताहिक उपक्रम इ.)"
              rows={8}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isViewMode}
            />
            {formData.q2 && !isViewMode && (
              <p className="text-sm text-green-600 mt-2">
                {formData.q2.length} / 1500 characters
              </p>
            )}
          </section>

          {/* Section 3 - Overall Impression */}
          <section className="mb-8 p-6 rounded-xl shadow-sm border-l-4 border-purple-600 bg-purple-50">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg mt-1">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 flex-1">
                ३. शाळेबद्दलचा एकंदरित अभिप्राय.
              </h3>
            </div>
            <textarea
              value={formData.q3}
              onChange={(e) => handleInputChange(e, 'q3')}
              placeholder="एकंदरित अभिप्राय येथे लिहा... (उदा. शाळेची एकूण प्रगती, विद्यार्थ्यांचा उत्साह, शिक्षकांचे सहकार्य, सुधारणेसाठी संभाव्यता इ.)"
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isViewMode}
            />
            {formData.q3 && !isViewMode && (
              <p className="text-sm text-purple-600 mt-2">
                {formData.q3.length} / 1000 characters
              </p>
            )}
          </section>

          {/* Officer Details Section */}
          <section className="mb-8 p-6 rounded-xl shadow-sm border-l-4 border-gray-600 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              <FileText className="h-6 w-6 inline mr-2 text-gray-600" />
              भेट देणाऱ्या अधिकाऱ्याची माहिती
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  शाळा भेट देणाऱ्या अधिकाऱ्याचे नाव *
                </label>
                <input
                  type="text"
                  value={formData.officerName}
                  onChange={(e) => handleInputChange(e, 'officerName')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-100 text-base"
                  placeholder="पूर्ण नाव लिहा"
                  required
                  disabled={isViewMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  पदनाम *
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange(e, 'designation')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-100 text-base"
                  placeholder="पदनाम लिहा (उदा. शिक्षण अधिकारी, तालुका शिक्षण अधिकारी इ.)"
                  required
                  disabled={isViewMode}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                मुख्याध्यापक/प्राचार्य यांचे स्वाक्षरी / अभिप्राय (पर्यायी)
              </label>
              <textarea
                value={formData.principalSignature}
                onChange={(e) => handleInputChange(e, 'principalSignature')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-vertical disabled:bg-gray-100"
                rows={4}
                placeholder="मुख्याध्यापक/प्राचार्य यांचा अभिप्राय किंवा टिप्पणी (पर्यायी)"
                disabled={isViewMode}
              />
            </div>
          </section>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-t-lg -mx-6 -mt-6 mb-6 md:-mx-8 md:-mt-8">
            <h3 className="text-xl font-semibold flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              फोटो दस्तऐवजीकरण (Photo Documentation)
            </h3>
          </div>

          <div className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors duration-200 bg-gray-50">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-medium text-gray-900 mb-2">
                भेट तपासणी फोटो अपलोड करा
              </h4>
              <p className="text-gray-600 mb-4">
                शाळा भेट तपासणीसाठी संबंधित फोटो अपलोड करा (कमाल ५ फोटो)
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
                    disabled={uploadedPhotos.length >= 5}
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`inline-flex items-center px-6 py-3 rounded-lg cursor-pointer transition-colors duration-200 font-medium ${
                      uploadedPhotos.length >= 5
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    <span>
                      {uploadedPhotos.length >= 5 
                        ? 'कमाल मर्यादा पोहोचली' 
                        : `फोटो निवडा (${uploadedPhotos.length}/5)`
                      }
                    </span>
                  </label>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    फक्त JPG, PNG फाइल्स - प्रत्येकी १०MB पेक्षा कमी
                  </p>
                </>
              )}
            </div>

            {/* Uploaded Photos Preview */}
            {uploadedPhotos.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Camera className="h-4 w-4 mr-2 text-indigo-600" />
                  अपलोड केलेले फोटो ({uploadedPhotos.length}/5)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`भेट तपासणी फोटो ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      {!isViewMode && (
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        >
                          <span className="text-xs font-bold">×</span>
                        </button>
                      )}
                      <div className="p-2 bg-gradient-to-t from-black/10 to-transparent">
                        <p className="text-xs text-white truncate font-medium">
                          {photo.name.length > 20 ? `${photo.name.substring(0, 20)}...` : photo.name}
                        </p>
                        <p className="text-xs text-white/90">
                          {(photo.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Photos in View Mode */}
            {isViewMode && editingInspection?.fims_inspection_photos?.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Camera className="h-4 w-4 mr-2 text-green-600" />
                  तपासणी फोटो ({editingInspection.fims_inspection_photos.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
                    <div key={photo.id} className="relative bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                      <img
                        src={photo.photo_url}
                        alt={photo.description || `भेट फोटो ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden p-2 bg-red-50 text-red-600 text-xs">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        फोटो लोड होऊ शकत नाही
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate font-medium">
                          {photo.photo_name || `फोटो ${index + 1}`}
                        </p>
                        {photo.description && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {photo.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(photo.uploaded_at).toLocaleDateString('mr-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isViewMode && (!editingInspection?.fims_inspection_photos || editingInspection.fims_inspection_photos.length === 0) && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">कोणतेही फोटो उपलब्ध नाहीत</p>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="text-center py-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-lg font-medium text-blue-800">फोटो अपलोड होत आहेत...</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <p className="text-sm text-blue-600 mt-2">कृपया थांबा...</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons Section */}
        {!isViewMode && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pb-8">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isLoading || isUploading}
              className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <Save className="w-5 h-5" />
              <span>{isLoading ? 'सेव्ह होत आहे...' : 'ड्राफ्ट म्हणून सेव्ह करा'}</span>
            </button>
            
            <button
              onClick={() => handleSubmit(false)}
              disabled={isLoading || isUploading}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <Send className="w-5 h-5" />
              <span>{isLoading ? 'सबमिट होत आहे...' : isEditMode ? 'फॉर्म अपडेट करा' : 'फॉर्म सबमिट करा'}</span>
            </button>
          </div>
        )}

        {/* View Mode - No Submit Buttons */}
        {isViewMode && (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">फॉर्म पहाणे मोड</h3>
            <p className="text-gray-600">हा फॉर्म फक्त पहाण्यासाठी आहे. संपादनासाठी संपादन मोड वापरा.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BhetDenaryaAdhikaryansathiForm;
