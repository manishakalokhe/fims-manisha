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

interface GramPanchayatFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface InspectionData {
  category_id: string;
  location_name: string;
  address: string;
  planned_date: string;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
}

interface FormData {
  monthlyMeetings: string;
  agendaUpToDate: string;
  receiptUpToDate: string;
  reassessmentDone: string;
  reassessmentAction: string;
  gpName: string;
  psName: string;
  inspectionDate: string;
  inspectionPlace: string;
  officerName: string;
  officerPost: string;
  secretaryName: string;
  secretaryTenure: string;
  resolutionNo: string;
  resolutionDate: string;
  // Add more fields from your original form
  assessmentYear: string;
  assessmentDate: string;
  assessmentAuthority: string;
  currentOfficials: string;
  meetingFrequency: string;
  decisionImplementation: string;
  publicInformation: string;
  financialManagement: string;
  developmentPlans: string;
  grievanceRedressal: string;
  overallAssessment: string;
}

const GrampanchayatInspectionForm: React.FC<GramPanchayatFormProps> = ({
  user,
  onBack,
  categories,
  onInspectionCreated,
  editingInspection
}) => {
  const { t } = useTranslation();
  
  // Error boundary states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Check if we're in view mode
  const isViewMode = editingInspection?.mode === 'view';
  const isEditMode = editingInspection?.mode === 'edit';

  // Basic inspection data
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    category_id: '',
    location_name: '',
    address: '',
    planned_date: '',
    latitude: null,
    longitude: null,
    location_accuracy: null
  });

  // Complete form data state
  const [formData, setFormData] = useState<FormData>({
    monthlyMeetings: '',
    agendaUpToDate: '',
    receiptUpToDate: '',
    reassessmentDone: '',
    reassessmentAction: '',
    gpName: '',
    psName: '',
    inspectionDate: '',
    inspectionPlace: '',
    officerName: '',
    officerPost: '',
    secretaryName: '',
    secretaryTenure: '',
    resolutionNo: '',
    resolutionDate: '',
    // Additional fields
    assessmentYear: '',
    assessmentDate: '',
    assessmentAuthority: '',
    currentOfficials: '',
    meetingFrequency: '',
    decisionImplementation: '',
    publicInformation: '',
    financialManagement: '',
    developmentPlans: '',
    grievanceRedressal: '',
    overallAssessment: ''
  });

  // Get grampanchayat category
  const gramPanchayatCategory = categories.find(cat => cat.form_type === 'gram_panchayat');

  // Load category on mount
  useEffect(() => {
    if (gramPanchayatCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: gramPanchayatCategory.id
      }));
    }
  }, [gramPanchayatCategory]);

  // Load existing inspection data when editing
  useEffect(() => {
    console.log('Loading editing data:', editingInspection); // Debug log
    
    if (editingInspection && editingInspection.id) {
      try {
        // Load basic inspection data
        setInspectionData({
          category_id: editingInspection.category_id || '',
          location_name: editingInspection.location_name || '',
          address: editingInspection.address || '',
          planned_date: editingInspection.planned_date ? editingInspection.planned_date.split('T')[0] : '',
          latitude: editingInspection.latitude || null,
          longitude: editingInspection.longitude || null,
          location_accuracy: editingInspection.location_accuracy || null
        });

        // Load form data if it exists
        if (editingInspection.form_data) {
          const loadedFormData = {
            ...formData,
            ...editingInspection.form_data
          };
          setFormData(loadedFormData);
          console.log('Form data loaded:', loadedFormData); // Debug log
        }
      } catch (err) {
        console.error('Error loading editing data:', err);
        setError('Failed to load inspection data');
      }
    }
  }, [editingInspection]);

  // Error handling wrapper
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Form</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Location functions
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setInspectionData(prev => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              location_accuracy: position.coords.accuracy
            }));
            
            // Get location name using reverse geocoding
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
            if (apiKey) {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${apiKey}`
              );
              const data = await response.json();
              
              if (data.results && data.results.length > 0) {
                setInspectionData(prev => ({
                  ...prev,
                  address: data.results[0].formatted_address
                }));
              }
            }
          } catch (geoError) {
            console.error('Error getting location details:', geoError);
            setError('Failed to get location details');
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get location');
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 60000 
        }
      );
    } catch (err) {
      console.error('Location error:', err);
      setError('Location access denied');
      setIsLoading(false);
    }
  };

  // Photo upload functions
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(event.target.files || []);
      
      if (uploadedPhotos.length + files.length > 5) {
        alert('Maximum 5 photos allowed');
        return;
      }

      setUploadedPhotos(prev => [...prev, ...files]);
      setError(null);
    } catch (err) {
      console.error('Photo upload error:', err);
      setError('Failed to process photos');
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotosToSupabase = async (inspectionId: string) => {
    if (uploadedPhotos.length === 0) return;

    setIsUploading(true);
    setError(null);
    
    try {
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const file = uploadedPhotos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `gram_panchayat_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

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
            description: `Gram Panchayat inspection photo ${i + 1}`
          });

        if (dbError) throw dbError;
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw new Error('Photo upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Generate inspection number
  const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `GP-${year}${month}${day}-${time}`;
  };

  // Form data updater
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Submit handler
  const handleSubmit = async (isDraft: boolean = false) => {
    if (isViewMode) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validation
      if (!inspectionData.location_name.trim()) {
        alert('Please enter location name');
        return;
      }

      // Prepare data
      const sanitizedInspectionData = {
        ...inspectionData,
        planned_date: inspectionData.planned_date || null
      };

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
        // Update existing
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
        // Create new
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

      const message = isDraft 
        ? (editingInspection?.id ? 'Inspection updated as draft' : 'Inspection saved as draft')
        : (editingInspection?.id ? 'Inspection updated successfully' : 'Inspection submitted successfully');
      
      alert(message);
      onInspectionCreated();
      onBack();

    } catch (error) {
      console.error('Submit error:', error);
      setError(`Failed to save: ${(error as Error).message}`);
      alert('Error saving inspection: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading fallback
  if (isLoading && !inspectionData.location_name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          {isViewMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                View Mode - Form is read-only
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              disabled={isLoading}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 text-center flex-1">
              {isViewMode ? 'View Inspection' : 
               isEditMode ? 'Edit Inspection' : 
               'New Inspection'} - ग्राम पंचायत तपासणी नमुना
            </h1>
            <div className="w-20"></div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-lg -mx-4 -mt-4 mb-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="स्थानाचे नाव प्रविष्ट करा"
                required
                disabled={isViewMode || isLoading}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isViewMode || isLoading}
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
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{isLoading ? 'स्थान मिळवत आहे...' : 'सध्याचे स्थान मिळवा'}</span>
                </button>
              </div>
            </div>

            {inspectionData.latitude && inspectionData.longitude && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">स्थान कॅप्चर केले</p>
                <div className="text-xs text-green-600 space-y-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="संपूर्ण पत्ता प्रविष्ट करा"
                disabled={isViewMode || isLoading}
              />
            </div>
          </div>
        </div>

        {/* Main Form Content - Complete Original Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="text-center mb-6">
            <h1 style={{ textAlign: 'center', color: '#333', fontSize: '24px', marginBottom: '10px' }}>परिशिष्ट-चार</h1>
            <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '5px' }}>(नियम 80 पहा)</p>
            <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>(ख)ग्राम पंचायतांची सर्वसाधारण तपासणीचा नमुना</p>
          </div>

          <div className="space-y-6">
            {/* Section 1: Gram Panchayat Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. ग्राम पंचायतीची मूलभूत माहिती</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ग्राम पंचायतिचे नांव *</label>
                  <input 
                    type="text" 
                    value={formData.gpName} 
                    onChange={(e) => updateFormData('gpName', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">पंचायत समिती *</label>
                  <input 
                    type="text" 
                    value={formData.psName} 
                    onChange={(e) => updateFormData('psName', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">सर्वसाधारण तपासणीची तारीख *</label>
                <input 
                  type="date" 
                  value={formData.inspectionDate} 
                  onChange={(e) => updateFormData('inspectionDate', e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isViewMode || isLoading}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">सर्वसाधारण तपासणीचे ठिकाण *</label>
                  <input 
                    type="text" 
                    value={formData.inspectionPlace} 
                    onChange={(e) => updateFormData('inspectionPlace', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">तपासणी वर्ष</label>
                  <input 
                    type="text" 
                    value={formData.assessmentYear} 
                    onChange={(e) => updateFormData('assessmentYear', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="वर्ष प्रविष्ट करा"
                    disabled={isViewMode || isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Officers Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. अधिकारी माहिती</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">तपासणी अधिकारीाचे नांव *</label>
                  <input 
                    type="text" 
                    value={formData.officerName} 
                    onChange={(e) => updateFormData('officerName', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">हुद्दा *</label>
                  <input 
                    type="text" 
                    value={formData.officerPost} 
                    onChange={(e) => updateFormData('officerPost', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">सचिवाचे नांव *</label>
                  <input 
                    type="text" 
                    value={formData.secretaryName} 
                    onChange={(e) => updateFormData('secretaryName', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">सचिवाचे कार्यकाळ</label>
                  <input 
                    type="text" 
                    value={formData.secretaryTenure} 
                    onChange={(e) => updateFormData('secretaryTenure', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="कार्यकाळ प्रविष्ट करा"
                    disabled={isViewMode || isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Meetings and Records */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">3. सभा आणि नोंदी</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">मासिक सभा नियमांनुसार नियमितपणे होतात काय? *</p>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="monthlyMeetings" 
                        value="होय" 
                        checked={formData.monthlyMeetings === 'होय'} 
                        onChange={(e) => updateFormData('monthlyMeetings', e.target.value)}
                        className="mr-2"
                        disabled={isViewMode || isLoading}
                      /> 
                      <span>होय</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="monthlyMeetings" 
                        value="नाही" 
                        checked={formData.monthlyMeetings === 'नाही'} 
                        onChange={(e) => updateFormData('monthlyMeetings', e.target.value)}
                        className="mr-2"
                        disabled={isViewMode || isLoading}
                      /> 
                      <span>नाही</span>
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">सभेची कार्यसूची व सभेची नोंदवही इत्यादी अद्यावत आहे काय? *</p>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="agendaUpToDate" 
                        value="होय" 
                        checked={formData.agendaUpToDate === 'होय'} 
                        onChange={(e) => updateFormData('agendaUpToDate', e.target.value)}
                        className="mr-2"
                        disabled={isViewMode || isLoading}
                      /> 
                      <span>होय</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="agendaUpToDate" 
                        value="नाही" 
                        checked={formData.agendaUpToDate === 'नाही'} 
                        onChange={(e) => updateFormData('agendaUpToDate', e.target.value)}
                        className="mr-2"
                        disabled={isViewMode || isLoading}
                      /> 
                      <span>नाही</span>
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">सभेच्या ठरावांची अंमलबजावणी *</p>
                  <textarea
                    value={formData.decisionImplementation}
                    onChange={(e) => updateFormData('decisionImplementation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="ठराव अंमलबजावणी तपशील"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Financial and Development */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">4. आर्थिक व्यवस्थापन आणि विकास योजना</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">आर्थिक व्यवस्थापनची सद्यस्थिती</label>
                  <textarea
                    value={formData.financialManagement}
                    onChange={(e) => updateFormData('financialManagement', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="आर्थिक व्यवस्थापन तपशील"
                    disabled={isViewMode || isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">विकास योजना आणि अंमलबजावणी</label>
                  <textarea
                    value={formData.developmentPlans}
                    onChange={(e) => updateFormData('developmentPlans', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="विकास योजना तपशील"
                    disabled={isViewMode || isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">सर्वसाधारण मूल्यमापन</label>
                  <textarea
                    value={formData.overallAssessment}
                    onChange={(e) => updateFormData('overallAssessment', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="एकूण मूल्यमापन प्रविष्ट करा"
                    disabled={isViewMode || isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Resolutions Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">5. ठराव माहिती</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ठराव क्रमांक</label>
                  <input 
                    type="text" 
                    value={formData.resolutionNo} 
                    onChange={(e) => updateFormData('resolutionNo', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="ठराव क्रमांक"
                    disabled={isViewMode || isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ठराव दिनांक</label>
                  <input 
                    type="date" 
                    value={formData.resolutionDate} 
                    onChange={(e) => updateFormData('resolutionDate', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode || isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">छायाचित्र कागदपत्रे (Photo Documentation)</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center">
            <Camera className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">ग्राम पंचायत तपासणी छायाचित्रे अपलोड करा</h4>
            <p className="text-gray-600 mb-4">ग्राम पंचायत तपासणी छायाचित्रे अपलोड करा (कमाल 5 छायाचित्रे)</p>
            
            {!isViewMode && !isLoading && (
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
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  <span>फाइल निवडा</span>
                </label>
                
                <p className="text-xs text-gray-500 mt-2">कमाल 5 छायाचित्रे परवानगी आहे</p>
              </>
            )}
          </div>

          {uploadedPhotos.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                अपलोड केलेली छायाचित्रे ({uploadedPhotos.length}/5)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`ग्राम पंचायत छायाचित्र ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {!isViewMode && !isLoading && (
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    )}
                    <p className="text-xs text-gray-600 mt-1 truncate">{photo.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing photos in view mode */}
          {isViewMode && editingInspection?.fims_inspection_photos && editingInspection.fims_inspection_photos.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                तपासणी छायाचित्रे ({editingInspection.fims_inspection_photos.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.photo_url}
                      alt={photo.description || `ग्राम पंचायत छायाचित्र ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {photo.photo_name || `छायाचित्र ${index + 1}`}
                    </p>
                    {photo.description && (
                      <p className="text-xs text-gray-500 truncate">{photo.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="text-center py-4 mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-gray-600">छायाचित्रे अपलोड होत आहेत...</p>
            </div>
          )}
        </div>

        {/* Submit Section */}
        {!isViewMode && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handleSubmit(true)}
                disabled={isLoading || isUploading || !inspectionData.location_name}
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>ड्राफ्ट म्हणून जतन करा</span>
              </button>
              
              <button
                onClick={() => handleSubmit(false)}
                disabled={isLoading || isUploading || !inspectionData.location_name}
                className="flex-1 sm:flex-none px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>{isEditMode ? 'तपासणी अद्ययावत करा' : 'तपासणी सबमिट करा'}</span>
              </button>
            </div>

            {(!inspectionData.location_name || isLoading) && (
              <div className="mt-4 text-center text-sm text-red-600">
                कृपया स्थान माहिती पूर्ण करा आणि पुन्हा प्रयत्न करा.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrampanchayatInspectionForm;
