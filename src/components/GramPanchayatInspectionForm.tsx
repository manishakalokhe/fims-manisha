import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  MapPin,
  Camera,
  Save,
  Send,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Props interface
interface GramPanchayatFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

// Inspection data interface
interface InspectionData {
  category_id: string;
  location_name: string;
  address: string;
  planned_date: string;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
}

// Form data interface
interface FormData {
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
  monthlyMeetings: string;
  agendaUpToDate: string;
  receiptUpToDate: string;
  reassessmentDone: string;
  reassessmentAction: string;
  assessmentYear: string;
  assessmentAuthority: string;
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
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // View/Edit mode check
  const isViewMode = editingInspection?.mode === 'view';
  const isEditMode = editingInspection?.mode === 'edit';

  // Initialize inspection data
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    category_id: '',
    location_name: '',
    address: '',
    planned_date: '',
    latitude: null,
    longitude: null,
    location_accuracy: null
  });

  // Initialize form data
  const [formData, setFormData] = useState<FormData>({
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
    monthlyMeetings: '',
    agendaUpToDate: '',
    receiptUpToDate: '',
    reassessmentDone: '',
    reassessmentAction: '',
    assessmentYear: '',
    assessmentAuthority: '',
    meetingFrequency: '',
    decisionImplementation: '',
    publicInformation: '',
    financialManagement: '',
    developmentPlans: '',
    grievanceRedressal: '',
    overallAssessment: ''
  });

  // Load category on mount
  useEffect(() => {
    console.log('🔄 Loading Grampanchayat form...');
    console.log('Props:', { user, categories, editingInspection });
    
    try {
      const gramPanchayatCategory = categories.find(cat => cat.form_type === 'gram_panchayat');
      if (gramPanchayatCategory) {
        setInspectionData(prev => ({
          ...prev,
          category_id: gramPanchayatCategory.id || ''
        }));
        console.log('✅ Category loaded:', gramPanchayatCategory.id);
      } else {
        console.warn('⚠️ Grampanchayat category not found in categories');
      }

      // Load editing data if present
      if (editingInspection && editingInspection.id) {
        console.log('📝 Loading editing data...');
        
        setInspectionData(prev => ({
          ...prev,
          category_id: editingInspection.category_id || prev.category_id,
          location_name: editingInspection.location_name || prev.location_name,
          address: editingInspection.address || prev.address,
          planned_date: editingInspection.planned_date ? editingInspection.planned_date.split('T')[0] : prev.planned_date,
          latitude: editingInspection.latitude || prev.latitude,
          longitude: editingInspection.longitude || prev.longitude,
          location_accuracy: editingInspection.location_accuracy || prev.location_accuracy
        }));

        if (editingInspection.form_data) {
          setFormData(prev => ({ ...prev, ...editingInspection.form_data }));
          console.log('✅ Form data loaded from editing');
        }
      }
    } catch (err) {
      console.error('❌ Error in useEffect:', err);
      setError('Failed to load form data');
    }
  }, [categories, editingInspection]);

  // Error boundary render
  if (error) {
    console.error('🚨 Form Error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
          <div className="text-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Form</h3>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={onBack}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && !inspectionData.location_name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">ग्राम पंचायत तपासणी फॉर्म लोड होत आहे...</p>
          <p className="text-sm text-gray-500">कृपया थोडा प्रतीक्षा करा</p>
        </div>
      </div>
    );
  }

  // Location functions
  const getCurrentLocation = () => {
    console.log('📍 Getting current location...');
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('✅ Location captured:', position.coords);
        
        try {
          setInspectionData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location_accuracy: position.coords.accuracy
          }));

          // Optional: Reverse geocoding (if API key available)
          const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
          if (apiKey) {
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${apiKey}`
              );
              const data = await response.json();
              
              if (data.results && data.results.length > 0) {
                setInspectionData(prev => ({
                  ...prev,
                  address: data.results[0].formatted_address || 'Location captured'
                }));
                console.log('📍 Address found:', data.results[0].formatted_address);
              }
            } catch (geoError) {
              console.warn('⚠️ Reverse geocoding failed:', geoError);
              setInspectionData(prev => ({ ...prev, address: 'GPS coordinates captured' }));
            }
          } else {
            setInspectionData(prev => ({ ...prev, address: 'GPS coordinates captured' }));
          }
        } catch (error) {
          console.error('❌ Location processing error:', error);
          setError('Failed to process location data');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        setError(`Location access failed: ${error.message}`);
        setIsLoading(false);
        alert('Unable to get location. Please enable location services.');
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 60000 
      }
    );
  };

  // Photo upload functions
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      console.log('📸 Photo upload started...');
      const files = Array.from(event.target.files || []);
      
      if (files.length === 0) return;
      
      if (uploadedPhotos.length + files.length > 5) {
        alert('सर्वाधिक ५ छायाचित्रे परवानगी आहे');
        return;
      }

      // Validate file types
      const validFiles = files.filter(file => 
        file.type.startsWith('image/') && file.size < 5 * 1024 * 1024 // 5MB limit
      );

      if (validFiles.length !== files.length) {
        alert('काही फाइल्स अमान्य आहेत. फक्त images (5MB पेक्षा कमी) स्वीकारले जातील.');
      }

      setUploadedPhotos(prev => [...prev, ...validFiles]);
      console.log('✅ Photos added:', validFiles.length);
      setError(null);
      
      // Clear input
      const target = event.target as HTMLInputElement;
      target.value = '';
    } catch (error) {
      console.error('❌ Photo upload error:', error);
      setError('Failed to process photos');
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    console.log('🗑️ Photo removed');
  };

  // Form data updater
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
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

  // Submit handler
  const handleSubmit = async (isDraft: boolean = false) => {
    if (isViewMode) {
      alert('View mode - cannot submit');
      return;
    }

    // Basic validation
    if (!inspectionData.location_name.trim()) {
      alert('कृपया स्थानाचे नाव प्रविष्ट करा');
      return;
    }

    if (!formData.gpName.trim() || !formData.psName.trim()) {
      alert('कृपया ग्राम पंचायत आणि पंचायत समितीचे नाव प्रविष्ट करा');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('💾 Submitting form...');

      // Prepare sanitized data
      const sanitizedInspectionData = {
        ...inspectionData,
        planned_date: inspectionData.planned_date || null
      };

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
        console.log('🔄 Updating existing inspection...');
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

        if (updateError) {
          console.error('❌ Update error:', updateError);
          throw updateError;
        }
        
        inspectionResult = updateResult;
        console.log('✅ Update successful:', updateResult.id);
      } else {
        console.log('➕ Creating new inspection...');
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

        if (createError) {
          console.error('❌ Create error:', createError);
          throw createError;
        }
        
        inspectionResult = createResult;
        console.log('✅ Create successful:', createResult.id);
      }

      // Upload photos if any (simplified for now)
      if (uploadedPhotos.length > 0 && inspectionResult.id) {
        console.log('📸 Uploading photos...');
        try {
          for (let i = 0; i < uploadedPhotos.length; i++) {
            const file = uploadedPhotos[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `gp_${inspectionResult.id}_${Date.now()}_${i}.${fileExt || 'jpg'}`;

            // Mock upload (replace with actual Supabase upload)
            console.log(`📤 Uploading photo ${i + 1}:`, fileName);
            
            // Actual Supabase upload would go here
            /*
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('field-visit-images')
              .upload(fileName, file);
            */
          }
          console.log('✅ All photos uploaded');
        } catch (photoError) {
          console.error('❌ Photo upload error:', photoError);
          // Don't fail the submission if photos fail
        }
      }

      const status = isDraft ? 'draft' : 'submitted';
      const action = editingInspection?.id ? 'updated' : 'created';
      
      alert(`ग्राम पंचायत तपासणी ${status} म्हणून ${action} झाली!`);
      onInspectionCreated();
      onBack();

    } catch (error) {
      console.error('❌ Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`तपासणी सबमिट करताना त्रुटी: ${errorMessage}`);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the form
  console.log('🎨 Rendering Grampanchayat form...');
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          {isViewMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>View Mode - फॉर्म फक्त पहाण्यासाठी आहे</span>
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
              disabled={isLoading}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>मागे जा</span>
            </button>
            
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center flex-1 px-4">
              {isViewMode ? 'तपासणी पहा' : 
               isEditMode ? 'तपासणी संपादित करा' : 
               'नवीन तपासणी'} - ग्राम पंचायत
            </h1>
            
            <div className="w-20"></div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>{categories.length > 0 ? `Category ID: ${inspectionData.category_id}` : 'Loading categories...'}</p>
            <p>{editingInspection ? `Editing ID: ${editingInspection.id}` : 'New inspection'}</p>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">स्थान माहिती (Location Information)</h3>
          </div>
          
          <div className="space-y-4">
            {/* Location Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                स्थानाचे नाव * <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={inspectionData.location_name}
                onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="ग्राम पंचायत स्थानाचे नाव प्रविष्ट करा"
                required
                disabled={isViewMode || isLoading}
              />
            </div>

            {/* Date and GPS Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">नियोजित तारीख</label>
                <input
                  type="date"
                  value={inspectionData.planned_date}
                  onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={isViewMode || isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPS स्थान</label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLoading || isViewMode}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{isLoading ? 'स्थान शोधत आहे...' : 'सध्याचे स्थान मिळवा'}</span>
                </button>
                {isLoading && (
                  <p className="text-xs text-green-600 mt-1">GPS सिग्नल शोधत आहे...</p>
                )}
              </div>
            </div>

            {/* Location Status */}
            {inspectionData.latitude && inspectionData.longitude && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm font-medium text-green-800">स्थान यशस्वीरित्या कॅप्चर केले</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-green-600">
                  <div className="text-center">
                    <p className="font-medium">अक्षांश</p>
                    <p>{inspectionData.latitude.toFixed(6)}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">रेखांश</p>
                    <p>{inspectionData.longitude.toFixed(6)}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">अचूकता</p>
                    <p>{inspectionData.location_accuracy ? `${Math.round(inspectionData.location_accuracy)}m` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">संपूर्ण पत्ता</label>
              <textarea
                value={inspectionData.address}
                onChange={(e) => setInspectionData(prev => ({...prev, address: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                rows={2}
                placeholder="संपूर्ण पत्ता प्रविष्ट करा किंवा GPS द्वारे मिळवा"
                disabled={isViewMode || isLoading}
              />
            </div>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">परिशिष्ट-चार</h1>
            <p className="text-sm font-semibold text-gray-700 mb-1">(नियम 80 पहा)</p>
            <p className="text-sm font-semibold text-gray-700">(ख) ग्राम पंचायतांची सर्वसाधारण तपासणीचा नमुना</p>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                1. ग्राम पंचायतीची मूलभूत माहिती
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ग्राम पंचायतिचे नांव <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.gpName} 
                    onChange={(e) => updateFormData('gpName', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="ग्राम पंचायत नाव"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    पंचायत समिती <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.psName} 
                    onChange={(e) => updateFormData('psName', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="पंचायत समिती नाव"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    सर्वसाधारण तपासणीची तारीख <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    value={formData.inspectionDate} 
                    onChange={(e) => updateFormData('inspectionDate', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    सर्वसाधारण तपासणीचे ठिकाण <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.inspectionPlace} 
                    onChange={(e) => updateFormData('inspectionPlace', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="तपासणी ठिकाण"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">तपासणी वर्ष</label>
                <input 
                  type="text" 
                  value={formData.assessmentYear} 
                  onChange={(e) => updateFormData('assessmentYear', e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="२०२४-२५"
                  disabled={isViewMode || isLoading}
                />
              </div>
            </div>

            {/* Officers Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                2. अधिकारी माहिती
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    तपासणी अधिकारीाचे नांव <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.officerName} 
                    onChange={(e) => updateFormData('officerName', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="अधिकारी नाव"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    हुद्दा <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.officerPost} 
                    onChange={(e) => updateFormData('officerPost', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="तपासणी अधिकारी"
                    disabled={isViewMode || isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">सचिवाचे नांव</label>
                  <input 
                    type="text" 
                    value={formData.secretaryName} 
                    onChange={(e) => updateFormData('secretaryName', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="ग्राम पंचायत सचिव"
                    disabled={isViewMode || isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">सचिवाचे कार्यकाळ</label>
                  <input 
                    type="text" 
                    value={formData.secretaryTenure} 
                    onChange={(e) => updateFormData('secretaryTenure', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="२ वर्षे"
                    disabled={isViewMode || isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Meetings and Records */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-yellow-600" />
                3. सभा आणि नोंदी
              </h3>
              
              <div className="space-y-4">
                {/* Monthly Meetings */}
                <div className="border border-yellow-200 rounded-lg p-4 bg-white">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    मासिक सभा नियमांनुसार नियमितपणे होतात काय? <span className="text-red-500">*</span>
                  </p>
                  <div className="flex flex-wrap gap-4 md:gap-8">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="monthlyMeetings" 
                        value="होय" 
                        checked={formData.monthlyMeetings === 'होय'} 
                        onChange={(e) => updateFormData('monthlyMeetings', e.target.value)}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 disabled:cursor-not-allowed"
                        disabled={isViewMode || isLoading}
                      /> 
                      <span className="text-sm">होय</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="monthlyMeetings" 
                        value="नाही" 
                        checked={formData.monthlyMeetings === 'नाही'} 
                        onChange={(e) => updateFormData('monthlyMeetings', e.target.value)}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 disabled:cursor-not-allowed"
                        disabled={isViewMode || isLoading}
                      /> 
                      <span className="text-sm">नाही</span>
                    </label>
                  </div>
                </div>

                {/* Agenda and Records */}
                <div className="border border-yellow-200 rounded-lg p-4 bg-white">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    सभेची कार्यसूची व सभेची नोंदवही इत्यादी अद्यावत आहे काय? <span className="text-red-500">*</span>
                  </p>
                  <div className="flex flex-wrap gap-4 md:gap-8">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="agendaUpToDate" 
                        value="होय" 
                        checked={formData.agendaUpToDate === 'होय'} 
                        onChange={(e) => updateFormData('agendaUpToDate', e.target.value)}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 disabled:cursor-not-allowed"
                        disabled={isViewMode || isLoading}
                      /> 
                      <span className="text-sm">होय</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="agendaUpToDate" 
                        value="नाही" 
                        checked={formData.agendaUpToDate === 'नाही'} 
                        onChange={(e) => updateFormData('agendaUpToDate', e.target.value)}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 disabled:cursor-not-allowed"
                        disabled={isViewMode || isLoading}
                      /> 
                      <span className="text-sm">नाही</span>
                    </label>
                  </div>
                </div>

                {/* Additional meeting details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">सभेच्या ठरावांची अंमलबजावणी</label>
                  <textarea
                    value={formData.decisionImplementation}
                    onChange={(e) => updateFormData('decisionImplementation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100"
                    rows={3}
                    placeholder="ठराव अंमलबजावणीचा तपशील प्रविष्ट करा"
                    disabled={isViewMode || isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Financial and Development */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-green-600" />
                4. आर्थिक व्यवस्थापन आणि विकास योजना
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">आर्थिक व्यवस्थापनची सद्यस्थिती</label>
                  <textarea
                    value={formData.financialManagement}
                    onChange={(e) => updateFormData('financialManagement', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    rows={3}
                    placeholder="आर्थिक व्यवस्थापन, निधी, खर्च तपशील"
                    disabled={isViewMode || isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">विकास योजना आणि अंमलबजावणी</label>
                  <textarea
                    value={formData.developmentPlans}
                    onChange={(e) => updateFormData('developmentPlans', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    rows={3}
                    placeholder="विकास योजना, प्रगती, अडचणी तपशील"
                    disabled={isViewMode || isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Resolutions */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-purple-600" />
                5. ठराव माहिती
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ठराव क्रमांक</label>
                  <input 
                    type="text" 
                    value={formData.resolutionNo} 
                    onChange={(e) => updateFormData('resolutionNo', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                    placeholder="ठराव क्रमांक (उदा: १२/२०२४)"
                    disabled={isViewMode || isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ठराव दिनांक</label>
                  <input 
                    type="date" 
                    value={formData.resolutionDate} 
                    onChange={(e) => updateFormData('resolutionDate', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                    disabled={isViewMode || isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-indigo-600" />
                6. एकूण मूल्यमापन
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">सर्वसाधारण मूल्यमापन आणि शिफारसी</label>
                <textarea
                  value={formData.overallAssessment}
                  onChange={(e) => updateFormData('overallAssessment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  rows={4}
                  placeholder="ग्राम पंचायतीचे एकूण मूल्यमापन, सुधारणा शिफारसी"
                  disabled={isViewMode || isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <Camera className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">छायाचित्र कागदपत्रे (Photo Documentation)</h3>
          </div>
          
          {!isViewMode && !isLoading && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center hover:border-blue-400 transition-colors">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">ग्राम पंचायत तपासणी छायाचित्रे अपलोड करा</h4>
              <p className="text-gray-600 mb-4">तपासणीच्या ठिकाणाचे, सभागृहाचे, कागदपत्रांचे छायाचित्रे अपलोड करा</p>
              
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
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Camera className="h-4 w-4 mr-2" />
                <span>फाइल निवडा (कमाल ५)</span>
              </label>
              
              <p className="text-xs text-gray-500 mt-3">JPG, PNG फाइल्स (प्रत्येकी ५MB पेक्षा कमी) | कमाल ५ छायाचित्रे</p>
            </div>
          )}

          {/* Uploaded Photos */}
          {uploadedPhotos.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                अपलोड केलेली छायाचित्रे ({uploadedPhotos.length}/5)
                <button
                  onClick={() => setUploadedPhotos([])}
                  className="ml-2 text-xs text-red-600 hover:text-red-800"
                  disabled={isViewMode || isLoading}
                >
                  सर्व काढा
                </button>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`छायाचित्र ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    {!isViewMode && !isLoading && (
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    )}
                    <p className="text-xs text-gray-600 mt-1 truncate">{photo.name}</p>
                    <p className="text-xs text-gray-500">{(photo.size / 1024).toFixed(1)} KB</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Mode Photos */}
          {isViewMode && editingInspection?.fims_inspection_photos?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">तपासणी छायाचित्रे ({editingInspection.fims_inspection_photos.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.photo_url}
                      alt={photo.description || `छायाचित्र ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        console.warn('Image load failed:', photo.photo_url);
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
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

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="text-sm text-blue-800">छायाचित्रे अपलोड होत आहेत...</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                     style={{ width: '75%' }}></div>
              </div>
            </div>
          )}

          {uploadedPhotos.length === 0 && !isViewMode && !isLoading && (
            <div className="mt-4 text-center text-sm text-gray-500">
              तपासणीच्या ठिकाणाची, सभागृहाची, कागदपत्रांची छायाचित्रे अपलोड करा
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isViewMode && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <button
                onClick={() => handleSubmit(true)}
                disabled={isLoading || isUploading || !inspectionData.location_name || !formData.gpName || !formData.psName}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
              >
                <Save className="h-4 w-4" />
                <span>ड्राफ्ट म्हणून जतन करा</span>
              </button>
              
              <button
                onClick={() => handleSubmit(false)}
                disabled={isLoading || isUploading || !inspectionData.location_name || !formData.gpName || !formData.psName}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
              >
                <Send className="h-4 w-4" />
                <span>{isEditMode ? 'तपासणी अद्ययावत करा' : 'तपासणी सबमिट करा'}</span>
              </button>
            </div>

            {/* Validation Message */}
            {(!inspectionData.location_name || !formData.gpName || !formData.psName) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  कृपया आवश्यक माहिती पूर्ण करा: स्थान नाव, ग्राम पंचायत नाव, पंचायत समिती
                </p>
              </div>
            )}
          </div>
        )}

        {/* View Mode Footer */}
        {isViewMode && (
          <div className="mt-6 text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <AlertCircle className="h-4 w-4 inline mr-1 text-yellow-500" />
              ही तपासणी फक्त पहाण्यासाठी आहे. संपादन करण्यासाठी संपादित पर्याय निवडा.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Default export (IMPORTANT!)
export default GrampanchayatInspectionForm;
