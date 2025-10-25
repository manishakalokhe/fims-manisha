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
}

const GrampanchayatInspectionForm: React.FC<GramPanchayatFormProps> = ({
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
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    category_id: '',
    location_name: '',
    address: '',
    planned_date: '',
    latitude: null,
    longitude: null,
    location_accuracy: null
  });
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
    resolutionDate: ''
  });

  const isViewMode = editingInspection?.mode === 'view';
  const isEditMode = editingInspection?.mode === 'edit';

  // Get grampanchayat category
  const gramPanchayatCategory = categories.find(cat => cat.form_type === 'gram_panchayat');

  useEffect(() => {
    if (gramPanchayatCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: gramPanchayatCategory.id
      }));
    }
  }, [gramPanchayatCategory]);

  // Load existing data when editing
  useEffect(() => {
    if (editingInspection && editingInspection.id) {
      setInspectionData({
        category_id: editingInspection.category_id || '',
        location_name: editingInspection.location_name || '',
        address: editingInspection.address || '',
        planned_date: editingInspection.planned_date ? editingInspection.planned_date.split('T')[0] : '',
        latitude: editingInspection.latitude || null,
        longitude: editingInspection.longitude || null,
        location_accuracy: editingInspection.location_accuracy || null
      });

      if (editingInspection.form_data) {
        setFormData({
          monthlyMeetings: editingInspection.form_data.monthlyMeetings || '',
          agendaUpToDate: editingInspection.form_data.agendaUpToDate || '',
          receiptUpToDate: editingInspection.form_data.receiptUpToDate || '',
          reassessmentDone: editingInspection.form_data.reassessmentDone || '',
          reassessmentAction: editingInspection.form_data.reassessmentAction || '',
          gpName: editingInspection.form_data.gpName || '',
          psName: editingInspection.form_data.psName || '',
          inspectionDate: editingInspection.form_data.inspectionDate || '',
          inspectionPlace: editingInspection.form_data.inspectionPlace || '',
          officerName: editingInspection.form_data.officerName || '',
          officerPost: editingInspection.form_data.officerPost || '',
          secretaryName: editingInspection.form_data.secretaryName || '',
          secretaryTenure: editingInspection.form_data.secretaryTenure || '',
          resolutionNo: editingInspection.form_data.resolutionNo || '',
          resolutionDate: editingInspection.form_data.resolutionDate || ''
        });
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
        
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            setInspectionData(prev => ({
              ...prev,
              address: data.results[0].formatted_address
            }));
          }
        } catch (error) {
          console.error('Error getting location name:', error);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get location');
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

  const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `GP-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      setIsLoading(true);

      const sanitizedInspectionData = {
        ...inspectionData,
        planned_date: inspectionData.planned_date || null
      };

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
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

      if (uploadedPhotos.length > 0) {
        // Upload photos logic here
        console.log('Photos to upload:', uploadedPhotos.length);
      }

      const message = isDraft 
        ? (editingInspection?.id ? 'Inspection updated as draft' : 'Inspection saved as draft')
        : (editingInspection?.id ? 'Inspection updated successfully' : 'Inspection submitted successfully');
      
      alert(message);
      onInspectionCreated();
      onBack();

    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Error saving inspection: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              {isViewMode ? 'View Inspection' : 
               isEditMode ? 'Edit Inspection' : 
               'New Inspection'} - ग्राम पंचायत तपासणी
            </h1>
            <div className="w-20"></div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">स्थान माहिती (Location Information)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">स्थानाचे नाव *</label>
              <input
                type="text"
                value={inspectionData.location_name}
                onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="स्थानाचे नाव प्रविष्ट करा"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">नियोजित तारीख</label>
                <input
                  type="date"
                  value={inspectionData.planned_date}
                  onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isViewMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPS Location</label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLoading || isViewMode}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{isLoading ? 'Loading...' : 'Get Current Location'}</span>
                </button>
              </div>
            </div>

            {inspectionData.latitude && inspectionData.longitude && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Location Captured</p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>Latitude: {inspectionData.latitude.toFixed(6)}</p>
                  <p>Longitude: {inspectionData.longitude.toFixed(6)}</p>
                  <p>Accuracy: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">संपूर्ण पत्ता</label>
              <textarea
                value={inspectionData.address}
                onChange={(e) => setInspectionData(prev => ({...prev, address: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="संपूर्ण पत्ता प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Original Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 style={{ textAlign: 'center', color: '#333', fontSize: '24px', marginBottom: '10px' }}>परिशिष्ट-चार</h1>
          <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '5px' }}>(नियम 80 पहा)</p>
          <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>(ख)ग्राम पंचायतांची सर्वसाधारण तपासणीचा नमुना</p>

          <ol style={{ marginLeft: '20px', fontSize: '16px' }}>
            <li>
              ग्राम पंचायतिचे नांव- 
              <input 
                type="text" 
                value={formData.gpName} 
                onChange={(e) => updateFormData('gpName', e.target.value)} 
                style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', width: '150px' }}
                disabled={isViewMode}
              />
              पंचायत समिती - 
              <input 
                type="text" 
                value={formData.psName} 
                onChange={(e) => updateFormData('psName', e.target.value)} 
                style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', width: '150px' }}
                disabled={isViewMode}
              />
            </li>
            <li>
              (क) सर्वसाधारण तपासणीची तारीख - 
              <input 
                type="date" 
                value={formData.inspectionDate} 
                onChange={(e) => updateFormData('inspectionDate', e.target.value)} 
                style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                disabled={isViewMode}
              />
            </li>
            <li>
              (ख) सर्वसाधारण तपासणीचे ठिकाण :- 
              <input 
                type="text" 
                value={formData.inspectionPlace} 
                onChange={(e) => updateFormData('inspectionPlace', e.target.value)} 
                style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }}
                disabled={isViewMode}
              />
            </li>
            <li>
              तपासणी अधिकारीाचे नांव व हुद्दा :- 
              <input 
                type="text" 
                value={formData.officerName} 
                onChange={(e) => updateFormData('officerName', e.target.value)} 
                style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', width: '150px' }}
                disabled={isViewMode}
              />
              /
              <input 
                type="text" 
                value={formData.officerPost} 
                onChange={(e) => updateFormData('officerPost', e.target.value)} 
                style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', width: '150px' }}
                disabled={isViewMode}
              />
            </li>
            <li>
              सचिवाचे नांव व तो सदस्य पंचायतीत केलेला पासून काम करीत आहे :- 
              <input 
                type="text" 
                value={formData.secretaryName} 
                onChange={(e) => updateFormData('secretaryName', e.target.value)} 
                style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', width: '150px' }}
                disabled={isViewMode}
              />
              /
              <input 
                type="text" 
                value={formData.secretaryTenure} 
                onChange={(e) => updateFormData('secretaryTenure', e.target.value)} 
                style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', width: '100px' }}
                disabled={isViewMode}
              />
            </li>
            <li>
              मासिक सभा नियमांनुसार नियमितपणे होतात काय ? 
              <label style={{ marginLeft: '10px' }}>
                <input 
                  type="radio" 
                  name="monthlyMeetings" 
                  value="होय" 
                  checked={formData.monthlyMeetings === 'होय'} 
                  onChange={(e) => updateFormData('monthlyMeetings', e.target.value)}
                  disabled={isViewMode}
                /> 
                होय
              </label>
              <label style={{ marginLeft: '10px' }}>
                <input 
                  type="radio" 
                  name="monthlyMeetings" 
                  value="नाही" 
                  checked={formData.monthlyMeetings === 'नाही'} 
                  onChange={(e) => updateFormData('monthlyMeetings', e.target.value)}
                  disabled={isViewMode}
                /> 
                नाही
              </label>
            </li>
            <ul style={{ marginLeft: '20px' }}>
              <li>
                सभेची कार्यसूची व सभेची नोंदवही ईत्यादी अद्यावत आहे काय ? 
                <label style={{ marginLeft: '10px' }}>
                  <input 
                    type="radio" 
                    name="agendaUpToDate" 
                    value="होय" 
                    checked={formData.agendaUpToDate === 'होय'} 
                    onChange={(e) => updateFormData('agendaUpToDate', e.target.value)}
                    disabled={isViewMode}
                  /> 
                  होय
                </label>
                <label style={{ marginLeft: '10px' }}>
                  <input 
                    type="radio" 
                    name="agendaUpToDate" 
                    value="नाही" 
                    checked={formData.agendaUpToDate === 'नाही'} 
                    onChange={(e) => updateFormData('agendaUpToDate', e.target.value)}
                    disabled={isViewMode}
                  /> 
                  नाही
                </label>
              </li>
            </ul>
          </ol>

          {/* Add more form fields from your original file */}
          {/* ... Continue with the rest of your form ... */}
        </div>

        {/* Photo Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Documentation</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Gram Panchayat Photos</h4>
            <p className="text-gray-600 mb-4">ग्राम पंचायत तपासणी छायाचित्रे अपलोड करा</p>
            
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
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Choose Files
                </label>
                <p className="text-xs text-gray-500 mt-2">Maximum 5 photos allowed</p>
              </>
            )}
          </div>

          {uploadedPhotos.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Uploaded Photos ({uploadedPhotos.length}/5)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
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
                    <p className="text-xs text-gray-600 mt-1 truncate">{photo.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Uploading photos...</p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        {!isViewMode && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isLoading || isUploading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>Save as Draft</span>
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isLoading || isUploading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>{isEditMode ? 'Update Inspection' : 'Submit Inspection'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrampanchayatInspectionForm;
