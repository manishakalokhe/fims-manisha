import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Save,
  Send,
  FileText,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface GrampanchayatFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

export const GrampanchayatInspectionForm: React.FC<GrampanchayatFormProps> = ({
  user,
  onBack,
  categories,
  onInspectionCreated,
  editingInspection
}) => {
  const { t } = useTranslation();
  
  const isViewMode = editingInspection?.mode === 'view';
  const isEditMode = editingInspection?.mode === 'edit';
  
  // State for yes/no radio buttons and other inputs
  const [monthlyMeetings, setMonthlyMeetings] = useState('');
  const [agendaUpToDate, setAgendaUpToDate] = useState('');
  const [receiptUpToDate, setReceiptUpToDate] = useState('');
  const [reassessmentDone, setReassessmentDone] = useState('');
  const [reassessmentAction, setReassessmentAction] = useState('');

  // States for other form fields
  const [gpName, setGpName] = useState('');
  const [psName, setPsName] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionPlace, setInspectionPlace] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [officerPost, setOfficerPost] = useState('');
  const [secretaryName, setSecretaryName] = useState('');
  const [secretaryTenure, setSecretaryTenure] = useState('');
  const [resolutionNo, setResolutionNo] = useState('');
  const [resolutionDate, setResolutionDate] = useState('');

  // Location and Photo states
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [inspectionData, setInspectionData] = useState({
    category_id: '',
    location_name: '',
    planned_date: '',
    latitude: null as number | null,
    longitude: null as number | null,
    location_accuracy: null as number | null,
    location_detected: ''
  });

  const grampanchayatCategory = categories.find(cat => cat.form_type === 'gram_panchayat');

  useEffect(() => {
    if (grampanchayatCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: grampanchayatCategory.id
      }));
    }
  }, [grampanchayatCategory]);

  useEffect(() => {
    if (editingInspection && editingInspection.id) {
      setInspectionData({
        category_id: editingInspection.category_id || '',
        location_name: editingInspection.location_name || '',
        planned_date: editingInspection.planned_date ? editingInspection.planned_date.split('T')[0] : '',
        latitude: editingInspection.latitude,
        longitude: editingInspection.longitude,
        location_accuracy: editingInspection.location_accuracy,
        location_detected: editingInspection.location_detected || ''
      });

      const formData = editingInspection.form_data;
      if (formData) {
        setMonthlyMeetings(formData.monthlyMeetings || '');
        setAgendaUpToDate(formData.agendaUpToDate || '');
        setReceiptUpToDate(formData.receiptUpToDate || '');
        setReassessmentDone(formData.reassessmentDone || '');
        setReassessmentAction(formData.reassessmentAction || '');
        setGpName(formData.gpName || '');
        setPsName(formData.psName || '');
        setInspectionDate(formData.inspectionDate || '');
        setInspectionPlace(formData.inspectionPlace || '');
        setOfficerName(formData.officerName || '');
        setOfficerPost(formData.officerPost || '');
        setSecretaryName(formData.secretaryName || '');
        setSecretaryTenure(formData.secretaryTenure || '');
        setResolutionNo(formData.resolutionNo || '');
        setResolutionDate(formData.resolutionDate || '');
      }
    }
  }, [editingInspection]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        setInspectionData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location_accuracy: accuracy,
          location_detected: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
        }));
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        alert('Error getting location. Please try again.');
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 0 
      }
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + uploadedPhotos.length > 5) {
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
    if (!gpName.trim()) {
      alert('ग्राम पंचायतिचे नांव आवश्यक आहे');
      return;
    }

    try {
      setIsLoading(true);

      const formData = {
        monthlyMeetings,
        agendaUpToDate,
        receiptUpToDate,
        reassessmentDone,
        reassessmentAction,
        gpName,
        psName,
        inspectionDate,
        inspectionPlace,
        officerName,
        officerPost,
        secretaryName,
        secretaryTenure,
        resolutionNo,
        resolutionDate
      };

      const sanitizedInspectionData = {
        ...inspectionData,
        planned_date: inspectionData.planned_date || new Date().toISOString().split('T')[0]
      };

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
        // Update existing inspection
        const { data: updateResult, error: updateError } = await supabase
          .from('fims_inspections')
          .update({
            location_name: sanitizedInspectionData.location_name || gpName,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            location_accuracy: sanitizedInspectionData.location_accuracy,
            location_detected: sanitizedInspectionData.location_detected,
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
        const categoryId = grampanchayatCategory?.id || categories[0]?.id;

        const { data: createResult, error: createError } = await supabase
          .from('fims_inspections')
          .insert({
            inspection_number: inspectionNumber,
            category_id: categoryId,
            inspector_id: user.id,
            location_name: sanitizedInspectionData.location_name || gpName,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            location_accuracy: sanitizedInspectionData.location_accuracy,
            location_detected: sanitizedInspectionData.location_detected,
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
      if (uploadedPhotos.length > 0 && !isUploading) {
        try {
          for (let i = 0; i < uploadedPhotos.length; i++) {
            const file = uploadedPhotos[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `grampanchayat_${inspectionResult.id}_${Date.now()}_${i}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('field-visit-images')
              .upload(fileName, file);
            
            if (uploadError) {
              console.error('Photo upload error:', uploadError);
              // Continue with other photos
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('field-visit-images')
                .getPublicUrl(fileName);
              
              await supabase
                .from('fims_inspection_photos')
                .insert({
                  inspection_id: inspectionResult.id,
                  photo_url: publicUrl,
                  photo_name: file.name,
                  description: `ग्रामपंचायत तपासणी फोटो ${i + 1}`,
                  photo_order: i + 1,
                });
            }
          }
        } catch (photoError) {
          console.error('Error uploading photos:', photoError);
        }
      }

      const message = isDraft 
        ? (editingInspection?.id ? 'मसुदा अपडेट झाला' : 'मसुदा सेव्ह झाला')
        : (editingInspection?.id ? 'तपासणी अपडेट झाली' : 'तपासणी सबमिट झाली');
      
      alert(message);
      onInspectionCreated();
      onBack();

    } catch (error: any) {
      console.error('Error saving inspection:', error);
      alert('तपासणी सेव्ह करताना त्रुटी: ' + (error.message || 'अज्ञात त्रुटी'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">
              ग्राम पंचायत तपासणी
            </h1>
            <div className="w-20"></div>
          </div>
          
          <p className="text-sm md:text-base text-gray-600 text-center">
            ग्राम पंचायत निरीक्षण प्रपत्र भरा
          </p>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">मूलभूत माहिती</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ग्राम पंचायतिचे नांव *
                  </label>
                  <input 
                    type="text" 
                    value={gpName} 
                    onChange={(e) => setGpName(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ग्राम पंचायतिचे नांव"
                    disabled={isViewMode}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    पंचायत समिती
                  </label>
                  <input 
                    type="text" 
                    value={psName} 
                    onChange={(e) => setPsName(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="पंचायत समिती"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    तपासणीची तारीख
                  </label>
                  <input 
                    type="date" 
                    value={inspectionDate} 
                    onChange={(e) => setInspectionDate(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    तपासणीचे ठिकाण
                  </label>
                  <input 
                    type="text" 
                    value={inspectionPlace} 
                    onChange={(e) => setInspectionPlace(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="तपासणीचे ठिकाण"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    तपासणी अधिकारीाचे नांव
                  </label>
                  <input 
                    type="text" 
                    value={officerName} 
                    onChange={(e) => setOfficerName(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="तपासणी अधिकारीाचे नांव"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    हुद्दा
                  </label>
                  <input 
                    type="text" 
                    value={officerPost} 
                    onChange={(e) => setOfficerPost(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="हुद्दा"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    सचिवाचे नांव
                  </label>
                  <input 
                    type="text" 
                    value={secretaryName} 
                    onChange={(e) => setSecretaryName(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="सचिवाचे नांव"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    सदस्य पंचायतीत काम करीत आहे (पासून)
                  </label>
                  <input 
                    type="date" 
                    value={secretaryTenure} 
                    onChange={(e) => setSecretaryTenure(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ६. मासिक सभा नियमांनुसार नियमितपणे होतात काय?
                </label>
                <div className="flex gap-8">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="monthlyMeetings" 
                      value="होय" 
                      checked={monthlyMeetings === 'होय'} 
                      onChange={(e) => setMonthlyMeetings(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-2"
                    />
                    <span className="text-lg">होय</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="monthlyMeetings" 
                      value="नाही" 
                      checked={monthlyMeetings === 'नाही'} 
                      onChange={(e) => setMonthlyMeetings(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-2"
                    />
                    <span className="text-lg">नाही</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  सभेची कार्यसूची व सभेची नोंदवही अद्यावत आहे काय?
                </label>
                <div className="flex gap-8">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="agendaUpToDate" 
                      value="होय" 
                      checked={agendaUpToDate === 'होय'} 
                      onChange={(e) => setAgendaUpToDate(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-2"
                    />
                    <span className="text-lg">होय</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="agendaUpToDate" 
                      value="नाही" 
                      checked={agendaUpToDate === 'नाही'} 
                      onChange={(e) => setAgendaUpToDate(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-2"
                    />
                    <span className="text-lg">नाही</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  पावती पुस्तिका अद्यावत आहे का?
                </label>
                <div className="flex gap-8">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="receiptUpToDate" 
                      value="होय" 
                      checked={receiptUpToDate === 'होय'} 
                      onChange={(e) => setReceiptUpToDate(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-2"
                    />
                    <span className="text-lg">होय</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="receiptUpToDate" 
                      value="नाही" 
                      checked={receiptUpToDate === 'नाही'} 
                      onChange={(e) => setReceiptUpToDate(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-2"
                    />
                    <span className="text-lg">नाही</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="border-l-4 border-green-500 pl-4 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">स्थान माहिती</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    स्थानाचे नाव
                  </label>
                  <input 
                    type="text" 
                    value={inspectionData.location_name || gpName} 
                    onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="स्थानाचे नाव"
                    disabled={isViewMode}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    तारीख
                  </label>
                  <input 
                    type="date" 
                    value={inspectionData.planned_date || ''} 
                    onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {!isViewMode && (
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <MapPin className="w-5 h-5" />
                  {isGettingLocation ? 'स्थान मिळवत आहे...' : 'GPS स्थान मिळवा'}
                </button>
              )}

              {inspectionData.latitude && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>स्थान कॅप्चर केले:</strong><br />
                    अक्षांश: {inspectionData.latitude.toFixed(6)}<br />
                    रेखांश: {inspectionData.longitude?.toFixed(6)}<br />
                    अचूकता: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}
                  </p>
                </div>
              )}
            </div>

            {/* Photo Upload Section */}
            <div className="border-l-4 border-purple-500 pl-4 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">फोटो अपलोड</h3>
              
              {!isViewMode && (
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="mb-4"
                  />
                  
                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedPhotos.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                          <p className="text-xs text-gray-600 truncate mt-1">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        {!isViewMode && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'सेव्ह करत आहे...' : 'मसुदा सेव्ह करा'}
            </button>
            
            <button
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'सबमिट करत आहे...' : 'तपासणी सबमिट करा'}
            </button>
          </div>
        )}

        {isViewMode && (
          <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
            <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-700">तपासणी दृष्य मोडमध्ये आहे</p>
          </div>
        )}
      </div>
    </div>
  );
};
