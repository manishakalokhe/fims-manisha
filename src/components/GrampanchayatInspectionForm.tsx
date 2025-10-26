import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Save,
  Send,
  FileText
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

const InspectionForm: React.FC<GrampanchayatFormProps> = ({
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

  // States for other form fields (blanks)
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
  const grampanchayatCategory = categories.find(cat => cat.form_type === 'grampanchayat');

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
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            
            setInspectionData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              location_accuracy: accuracy,
              location_detected: address,
              location_name: prev.location_name || address
            }));
          } else {
            setInspectionData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              location_accuracy: accuracy,
              location_detected: 'Location detected but address not found'
            }));
          }
        } catch (error) {
          console.error('Error getting location name:', error);
          setInspectionData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            location_accuracy: accuracy,
            location_detected: 'Unable to get address'
          }));
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        alert('Error getting your location. Please enable GPS and try again.');
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
        const fileName = `grampanchayat_${inspectionId}_${Date.now()}_${i}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('field-visit-images')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('field-visit-images')
          .getPublicUrl(fileName);
        
        const { error: dbError } = await supabase
          .from('fims_inspection_photos')
          .insert({
            inspection_id: inspectionId,
            photo_url: publicUrl,
            photo_name: file.name,
            description: `Grampanchayat inspection photo ${i + 1}`,
            photo_order: i + 1,
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
    return `GP-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          
          {isViewMode && (
            <span className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
              View Mode
            </span>
          )}
        </div>

        {/* Title Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 mb-10 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 px-8 py-16 text-white relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            <div className="relative z-10 text-center">
              <div className="flex justify-center mb-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 shadow-lg">
                  <FileText className="w-16 h-16 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-wide">परिशिष्ट-चार</h1>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-8 py-4 inline-block shadow-lg border border-white/30">
                <p className="text-lg font-medium">(नियम 80 पहा)</p>
                <p className="text-lg font-medium">(ख)ग्राम पंचायतांची सर्वसाधारण तपासणीचा नमुना</p>
              </div>
            </div>
          </div>
        </div>

        {/* मूळ माहिती (Basic Information) Section - FIRST */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
            <div className="flex items-center text-white">
              <FileText className="w-8 h-8 mr-4" />
              <h3 className="text-2xl font-bold">मूळ माहिती (Basic Information)</h3>
            </div>
          </div>
          <div className="p-10">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">१. ग्राम पंचायतिचे नांव *</label>
                  <input 
                    type="text" 
                    value={gpName} 
                    onChange={(e) => setGpName(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    placeholder="ग्राम पंचायतिचे नांव प्रविष्ट करा"
                    disabled={isViewMode}
                    required
                  />
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">पंचायत समिती</label>
                  <input 
                    type="text" 
                    value={psName} 
                    onChange={(e) => setPsName(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    placeholder="पंचायत समिती प्रविष्ट करा"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl">
                <label className="block mb-2 text-sm font-semibold text-gray-700">२. (क) सर्वसाधारण तपासणीची तारीख</label>
                <input 
                  type="date" 
                  value={inspectionDate} 
                  onChange={(e) => setInspectionDate(e.target.value)} 
                  className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  disabled={isViewMode}
                />
              </div>

              <div className="p-6 bg-gray-50 rounded-xl">
                <label className="block mb-2 text-sm font-semibold text-gray-700">३. (ख) सर्वसाधारण तपासणीचे ठिकाण</label>
                <input 
                  type="text" 
                  value={inspectionPlace} 
                  onChange={(e) => setInspectionPlace(e.target.value)} 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  placeholder="सर्वसाधारण तपासणीचे ठिकाण प्रविष्ट करा"
                  disabled={isViewMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">४. तपासणी अधिकारीाचे नांव</label>
                  <input 
                    type="text" 
                    value={officerName} 
                    onChange={(e) => setOfficerName(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    placeholder="तपासणी अधिकारीाचे नांव प्रविष्ट करा"
                    disabled={isViewMode}
                  />
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">हुद्दा</label>
                  <input 
                    type="text" 
                    value={officerPost} 
                    onChange={(e) => setOfficerPost(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    placeholder="हुद्दा प्रविष्ट करा"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">५. सचिवाचे नांव</label>
                  <input 
                    type="text" 
                    value={secretaryName} 
                    onChange={(e) => setSecretaryName(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    placeholder="सचिवाचे नांव प्रविष्ट करा"
                    disabled={isViewMode}
                  />
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">सदस्य पंचायतीत काम करीत आहे (पासून)</label>
                  <input 
                    type="text" 
                    value={secretaryTenure} 
                    onChange={(e) => setSecretaryTenure(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    placeholder="कार्यकाळ प्रविष्ट करा"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <p className="mb-4 text-gray-800 font-medium text-lg">६. मासिक सभा नियमांनुसार नियमितपणे होतात काय ?</p>
                <div className="flex gap-8 pl-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="monthlyMeetings" 
                      value="होय" 
                      checked={monthlyMeetings === 'होय'} 
                      onChange={(e) => setMonthlyMeetings(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-3 w-5 h-5 text-green-600"
                    /> 
                    <span className="text-green-700 font-semibold text-lg">होय</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="monthlyMeetings" 
                      value="नाही" 
                      checked={monthlyMeetings === 'नाही'} 
                      onChange={(e) => setMonthlyMeetings(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-3 w-5 h-5 text-red-600"
                    /> 
                    <span className="text-red-700 font-semibold text-lg">नाही</span>
                  </label>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 ml-8">
                <p className="mb-4 text-gray-800 font-medium text-lg">सभेची कार्यसूची व सभेची नोंदवही ईत्यादी अद्यावत आहे काय ?</p>
                <div className="flex gap-8 pl-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="agendaUpToDate" 
                      value="होय" 
                      checked={agendaUpToDate === 'होय'} 
                      onChange={(e) => setAgendaUpToDate(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-3 w-5 h-5 text-green-600"
                    /> 
                    <span className="text-green-700 font-semibold text-lg">होय</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="agendaUpToDate" 
                      value="नाही" 
                      checked={agendaUpToDate === 'नाही'} 
                      onChange={(e) => setAgendaUpToDate(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-3 w-5 h-5 text-red-600"
                    /> 
                    <span className="text-red-700 font-semibold text-lg">नाही</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section - SECOND (After Basic Information) */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <div className="flex items-center text-white">
              <MapPin className="w-8 h-8 mr-4" />
              <h3 className="text-2xl font-bold">स्थान माहिती (Location Information)</h3>
            </div>
          </div>
          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">स्थानाचे नाव *</label>
                <input
                  type="text"
                  value={inspectionData.location_name}
                  onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  placeholder="स्थानाचे नाव भरा"
                  required
                  disabled={isViewMode}
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">नियोजित तारीख</label>
                <input
                  type="date"
                  value={inspectionData.planned_date}
                  onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  disabled={isViewMode}
                />
              </div>
            </div>

            {!isViewMode && (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-3 mb-6 shadow-lg hover:shadow-xl font-medium"
              >
                <MapPin size={20} />
                <span>{isGettingLocation ? 'Getting Location...' : 'Get Current GPS Location'}</span>
              </button>
            )}

            {inspectionData.latitude && inspectionData.longitude && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl mb-6">
                <p className="font-bold text-green-800 mb-2">Location Captured</p>
                <p className="text-sm text-green-700">
                  Latitude: {inspectionData.latitude.toFixed(6)}<br />
                  Longitude: {inspectionData.longitude.toFixed(6)}<br />
                  Accuracy: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}
                </p>
              </div>
            )}

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">शोधलेले स्थान</label>
              <input
                type="text"
                value={inspectionData.location_detected}
                onChange={(e) => setInspectionData(prev => ({...prev, location_detected: e.target.value}))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                placeholder="GPS द्वारे शोधलेले स्थान येथे दिसेल"
                readOnly={isViewMode}
              />
            </div>
          </div>
        </section>

        {/* Rest of all sections remain the same - continuing with section 7 onwards... */}
        {/* Financial Records Table Section */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-6">
            <div className="flex items-center text-white">
              <FileText className="w-8 h-8 mr-4" />
              <h3 className="text-2xl font-bold">७. रोकड वहीचा तपशील (Cash Book Details)</h3>
            </div>
          </div>
          <div className="p-10">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">अ.क्र.</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">नोंदवहीचे नाव</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">तपासणीच्या तारखेला शिल्लक</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">बँकेतिल शिल्लक</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">पोस्टातिल शिल्लक</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">हाती असलेली शिल्लक</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">चेक</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1", "ग्रामनिधी"],
                    ["2", "पाणी पुरवठा"],
                    ["3", "14 वा वित्त आयोग"],
                    ["4", "इं.गा.यो."],
                    ["5", "अ.जा.विकास"],
                    ["6", "मजगारोहयो"],
                    ["7", "ठक्कर बाप्पा"],
                    ["8", "ग्रामकोष पैसा"],
                    ["9", "नागरी सुविधा"],
                    ["10", "दलित वस्ती विकास"],
                    ["11", "तंटा मुक्त योजना"],
                    ["12", "जनसुविधा"],
                    ["13", "पायका"],
                    ["14", "प.सं.योजना"],
                    ["15", "SBM"],
                    ["16", "तीर्थक्षेत्र विकास निधी"],
                    ["17", "अल्पसंख्यांक विकास निधी"]
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-2 border-gray-300 px-4 py-3 text-center">{row[0]}</td>
                      <td className="border-2 border-gray-300 px-4 py-3">{row[1]}</td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Tax Assessment Section */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6">
            <div className="flex items-center text-white">
              <FileText className="w-8 h-8 mr-4" />
              <h3 className="text-2xl font-bold">८. कर आकारणी माहिती (Tax Assessment Information)</h3>
            </div>
          </div>
          <div className="p-10">
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-4">(क) कर आकारणी नोंदवही (नमुना 8) :- नाही</h4>
                <p className="mb-2">१. कराच्या मागणीचे नोंदणी पुस्तक (नमुना 9) :-</p>
              </div>

              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <p className="mb-4 text-gray-800 font-medium text-lg">२. कराची पावती (नमुना 10) :- हे अद्यावत आहे काय ?</p>
                <div className="flex gap-8 pl-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="receiptUpToDate" 
                      value="होय" 
                      checked={receiptUpToDate === 'होय'} 
                      onChange={(e) => setReceiptUpToDate(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-3 w-5 h-5 text-green-600"
                    /> 
                    <span className="text-green-700 font-semibold text-lg">होय</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="receiptUpToDate" 
                      value="नाही" 
                      checked={receiptUpToDate === 'नाही'} 
                      onChange={(e) => setReceiptUpToDate(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-3 w-5 h-5 text-red-600"
                    /> 
                    <span className="text-red-700 font-semibold text-lg">नाही</span>
                  </label>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl">
                <p className="mb-4 text-gray-800 font-medium">(ख) मागील फेर आकारणी केलेली झाली ? दिनांक <input type="date" className="mx-2 px-2 py-1 border rounded" disabled={isViewMode} /> / / ठराव क्रमांक - 
                  <input 
                    type="text" 
                    value={resolutionNo} 
                    onChange={(e) => setResolutionNo(e.target.value)} 
                    className="ml-2 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500" 
                    disabled={isViewMode}
                  />
                </p>
                <p className="mt-2">नाही</p>
              </div>

              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <p className="mb-4 text-gray-800 font-medium text-lg">(ग) चार वर्षे पूर्ण झालेली असल्यास ,नटल्याने फेर आकारणी करण्यासाठी कार्यवाही चालू आहे किंवा नाही ?</p>
                <div className="flex gap-8 pl-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="reassessmentAction" 
                      value="होय" 
                      checked={reassessmentAction === 'होय'} 
                      onChange={(e) => setReassessmentAction(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-3 w-5 h-5 text-green-600"
                    /> 
                    <span className="text-green-700 font-semibold text-lg">होय</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="reassessmentAction" 
                      value="नाही" 
                      checked={reassessmentAction === 'नाही'} 
                      onChange={(e) => setReassessmentAction(e.target.value)} 
                      disabled={isViewMode}
                      className="mr-3 w-5 h-5 text-red-600"
                    /> 
                    <span className="text-red-700 font-semibold text-lg">नाही</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tax Collection Progress Section */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-6">
            <div className="flex items-center text-white">
              <FileText className="w-8 h-8 mr-4" />
              <h3 className="text-2xl font-bold">९. तपासणी तारखेस कर वसुलीची प्रगती खालीलप्रमाणे आहे :-</h3>
            </div>
          </div>
          <div className="p-10">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(1) मागील येणे रक्कम :- गृहकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /> पाणीकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(2) चालू वर्षात मागणी :- गृहकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /> पाणीकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(3) एकुण मागणी :- गृहकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /> पाणीकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(4) एकुण वसूली :- गृहकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /> पाणीकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(5) शिल्लक वसूली :- गृहकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /> पाणीकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(6) टक्केवारी :- गृहकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /> पाणीकर- <input type="number" className="ml-2 px-2 py-1 border rounded" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(7) शेरा :- <input type="text" className="ml-2 px-3 py-2 border-2 border-gray-200 rounded-lg w-full max-w-md" disabled={isViewMode} /></p>
              </div>
            </div>
          </div>
        </section>

        {/* 15% Fund Expenditure Section */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 px-8 py-6">
            <div className="flex items-center text-white">
              <FileText className="w-8 h-8 mr-4" />
              <h3 className="text-2xl font-bold">१०. मागास वर्गीयाकरीता राखून ठेवलेल्या 15% निधीच्या खर्चाचा तपशील:-</h3>
            </div>
          </div>
          <div className="p-10">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(1) ग्राम पंचायतीचे एकुण उत्पन्न :- <input type="number" className="ml-2 px-3 py-2 border-2 border-gray-200 rounded-lg" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(2) 15% रक्कम :- <input type="number" className="ml-2 px-3 py-2 border-2 border-gray-200 rounded-lg" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(3) मागील अनुशेष <input type="number" className="ml-2 px-3 py-2 border-2 border-gray-200 rounded-lg" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(4) करावयाचा एकुण खर्च <input type="number" className="ml-2 px-3 py-2 border-2 border-gray-200 rounded-lg" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(5) तपासणीत्या दिनांक पर्यंत झालेला खर्च: <input type="number" className="ml-2 px-3 py-2 border-2 border-gray-200 rounded-lg" disabled={isViewMode} /></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>(6) शिल्लक खर्च <input type="number" className="ml-2 px-3 py-2 border-2 border-gray-200 rounded-lg" disabled={isViewMode} /></p>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Irregularities Section */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <div className="flex items-center text-white">
              <FileText className="w-8 h-8 mr-4" />
              <h3 className="text-2xl font-bold">७. सूचना- (11) आर्थिक व्यवहारात निर्देशानुसार आलेल्या नियमबाह्यता -</h3>
            </div>
          </div>
          <div className="p-10">
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <p className="mb-4 text-gray-800 font-medium">(क) कोणत्याही चालू खरेदी करणाऱ्यापूर्वी अंदाजपत्रकात योग्य तरतूद केली आहे काय ? </p>
                <div className="flex gap-8 pl-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="budgetProvision" value="होय" disabled={isViewMode} className="mr-3 w-5 h-5" /> 
                    <span className="font-semibold">होय</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="budgetProvision" value="नाही" disabled={isViewMode} className="mr-3 w-5 h-5" /> 
                    <span className="font-semibold">नाही</span>
                  </label>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl">
                <p className="text-gray-800 font-medium">(ख) ग्राम पंचायत खरेदीसाठी मान्यता दिली आहे काय ? ठराव क्र.          
                  <input type="text" className="mx-2 px-2 py-1 border rounded" disabled={isViewMode} /> 
                  दि.         
                  <input type="date" className="mx-2 px-2 py-1 border rounded" disabled={isViewMode} /> 
                  / 
                </p>
              </div>

              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <p className="mb-4 text-gray-800 font-medium">(ग) खरेदी करण्यासाठी नियमप्रमाणे दरपत्रके मागविली होती काय ? </p>
                <div className="flex gap-8 pl-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="tendersCalled" value="होय" disabled={isViewMode} className="mr-3 w-5 h-5" /> 
                    <span className="font-semibold">होय</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="tendersCalled" value="नाही" disabled={isViewMode} className="mr-3 w-5 h-5" /> 
                    <span className="font-semibold">नाही</span>
                  </label>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <p className="mb-4 text-gray-800 font-medium">(घ) खरेदी केलेल्या साहित्याचा नमुना 9,15 व 16 मधील नोंदवहीत नोंदी घेण्यात आल्या आहेत काय ?</p>
                <div className="flex gap-8 pl-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="entriesMade" value="होय" disabled={isViewMode} className="mr-3 w-5 h-5" /> 
                    <span className="font-semibold">होय</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="entriesMade" value="नाही" disabled={isViewMode} className="mr-3 w-5 h-5" /> 
                    <span className="font-semibold">नाही</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Undertaken Table */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-8 py-6">
            <div className="flex items-center text-white">
              <FileText className="w-8 h-8 mr-4" />
              <h3 className="text-2xl font-bold">(12) ग्राम पंचायताने स्वतःच्या निधीतून किंवा शासकीय/जिल्हा परिषद योजनेंतर्गत हात घेतलेल्या कामांचा तपशील-</h3>
            </div>
          </div>
          <div className="p-10">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-300 rounded-lg overflow-hidden mb-6">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">अ.क्र.</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">योजनेचे नांव</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">कामाचा प्रकार</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">अंदाजित रक्कम</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">मिळालेले अनुदान</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">झालेला खर्च</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((row) => (
                    <tr key={row} className="hover:bg-gray-50">
                      <td className="border-2 border-gray-300 px-2 py-2 text-center">
                        <input type="text" className="w-full px-2 py-1 border rounded text-center" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="number" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="number" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="number" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className="w-full border-collapse border-2 border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">काम सुरु झाल्याची तारीख</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">काम पूर्ण झाल्याची तारीख</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">प्रगतीवर असलेल्या कामाची सद्य:स्थिती</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">पूर्णत्वाचे प्रमाणपत्र प्राप्त केले किंवा नाही</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">शेरा</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((row) => (
                    <tr key={row} className="hover:bg-gray-50">
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="date" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="date" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2 text-center">
                        <label className="mr-2"><input type="radio" name={`certificate${row}`} value="होय" disabled={isViewMode} /> होय</label>
                        <label><input type="radio" name={`certificate${row}`} value="नाही" disabled={isViewMode} /> नाही</label>
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Scheme Progress Table */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-8 py-6">
            <div className="flex items-center text-white">
              <FileText className="w-8 h-8 mr-4" />
              <h3 className="text-2xl font-bold">(13) ग्राम पंचायतांनी इतर योजनामध्ये केलेली प्रगती</h3>
            </div>
          </div>
          <div className="p-10">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">अ.क्र.</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">योजनेचे नाव</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">दिलेली उद्दिष्टे</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">तपासणीच्या दिनांकास</th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">शेरा</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1", "एगाविका."],
                    ["2", "बॉयोगॅस"],
                    ["3", "निर्धूर चुल"],
                    ["4", "कुंटुंब कल्याण"],
                    ["5", "अल्पवचत"],
                    ["6", ""],
                    ["7", ""]
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-2 border-gray-300 px-4 py-3 text-center">{row[0]}</td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        {row[1] ? row[1] : <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />}
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input type="text" className="w-full px-2 py-1 border rounded" disabled={isViewMode} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

                {/* Photo Upload Section */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-6">
            <div className="flex items-center text-white">
              <Camera className="w-8 h-8 mr-4" />
              <h3 className="text-2xl font-bold">फोटो अपलोड करा (Photo Upload)</h3>
            </div>
          </div>
          <div className="p-10">
            {!isViewMode && (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center mb-6 hover:border-purple-400 transition-colors">
                <Camera size={48} className="text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-700 mb-2">ग्रामपंचायत फोटो अपलोड करा</h4>
                <p className="text-gray-600 mb-4">
                  {uploadedPhotos.length > 0
                    ? `${uploadedPhotos.length}/5 फोटो निवडले आहेत`
                    : 'फोटो निवडा (जास्तीत जास्त 5)'}
                </p>
                
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadedPhotos.length >= 5}
                  id="photo-upload"
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold cursor-pointer transition-all duration-200 ${
                    uploadedPhotos.length >= 5 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Camera size={20} />
                  {uploadedPhotos.length >= 5 ? 'जास्तीत जास्त फोटो पोहोचले' : 'फोटो निवडा'}
                </label>
              </div>
            )}

            {uploadedPhotos.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Camera size={20} className="text-purple-600" />
                  निवडलेले फोटो ({uploadedPhotos.length}/5)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uploadedPhotos.map((file, index) => (
                    <div
                      key={index}
                      className="relative bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      {!isViewMode && (
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg transition-colors"
                        >
                          ×
                        </button>
                      )}
                      <div className="p-4">
                        <p className="font-semibold text-gray-800 text-sm truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isUploading && (
              <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-800">फोटो अपलोड करत आहे...</span>
                  <span className="text-sm text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {isViewMode && editingInspection?.fims_inspection_photos && editingInspection.fims_inspection_photos.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-4">
                  तपासणी फोटो ({editingInspection.fims_inspection_photos.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
                    <div
                      key={photo.id}
                      className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden"
                    >
                      <img
                        src={photo.photo_url}
                        alt={photo.description || `Grampanchayat photo ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {photo.photo_name || `Photo ${index + 1}`}
                        </p>
                        {photo.description && (
                          <p className="text-xs text-gray-500 truncate">{photo.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isViewMode && (!editingInspection?.fims_inspection_photos || editingInspection.fims_inspection_photos.length === 0) && (
              <div className="text-center py-12">
                <Camera size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">कोणतेही फोटो सापडले नाहीत</p>
              </div>
            )}
          </div>
        </section>

        {/* Submit Buttons */}
        {!isViewMode && (
          <div className="flex justify-center gap-6 mt-8 mb-12">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isLoading || isUploading}
              className="flex items-center gap-3 px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>{isLoading ? 'सेव्ह करत आहे...' : 'मसुदा म्हणून जतन करा'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isLoading || isUploading}
              className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              <span>{isLoading ? 'सबमिट करत आहे...' : 'तपासणी सबमिट करा'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrampanchayatInspectionForm;
