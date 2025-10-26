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
      alert('à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤à¤¿à¤šà¥‡ à¤¨à¤¾à¤‚à¤µ à¤†à¤µà¤¶à¥à¤¯à¤• à¤†à¤¹à¥‡');
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
                  description: `à¤—à¥à¤°à¤¾à¤®à¤ªà¤‚à¤šà¤¾à¤¯à¤¤ à¤¤à¤ªà¤¾à¤¸à¤£à¥€ à¤«à¥‹à¤Ÿà¥‹ ${i + 1}`,
                  photo_order: i + 1,
                });
            }
          }
        } catch (photoError) {
          console.error('Error uploading photos:', photoError);
        }
      }

      const message = isDraft 
        ? (editingInspection?.id ? 'à¤®à¤¸à¥à¤¦à¤¾ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤à¤¾à¤²à¤¾' : 'à¤®à¤¸à¥à¤¦à¤¾ à¤¸à¥‡à¤µà¥à¤¹ à¤à¤¾à¤²à¤¾')
        : (editingInspection?.id ? 'à¤¤à¤ªà¤¾à¤¸à¤£à¥€ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤à¤¾à¤²à¥€' : 'à¤¤à¤ªà¤¾à¤¸à¤£à¥€ à¤¸à¤¬à¤®à¤¿à¤Ÿ à¤à¤¾à¤²à¥€');
      
      alert(message);
      onInspectionCreated();
      onBack();

    } catch (error: any) {
      console.error('Error saving inspection:', error);
      alert('à¤¤à¤ªà¤¾à¤¸à¤£à¥€ à¤¸à¥‡à¤µà¥à¤¹ à¤•à¤°à¤¤à¤¾à¤¨à¤¾ à¤¤à¥à¤°à¥à¤Ÿà¥€: ' + (error.message || 'à¤…à¤œà¥à¤žà¤¾à¤¤ à¤¤à¥à¤°à¥à¤Ÿà¥€'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
                à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤ à¤¤à¤ªà¤¾à¤¸à¤£à¥€
              </h1>
              <div className="w-20"></div>
            </div>
            
            <p className="text-sm md:text-base text-gray-600 text-center">
              à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤ à¤¨à¤¿à¤°à¥€à¤•à¥à¤·à¤£ à¤ªà¥à¤°à¤ªà¤¤à¥à¤° à¤­à¤°à¤¾
            </p>
          </div>

          {/* Form Content */}
          <div style={{ fontFamily: 'Arial, sans-serif', direction: 'ltr', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>à¤ªà¤°à¤¿à¤¶à¤¿à¤·à¥à¤Ÿ-à¤šà¤¾à¤°</h1>
            <p style={{ textAlign: 'center', fontWeight: 'bold' }}>(à¤¨à¤¿à¤¯à¤® 80 à¤ªà¤¹à¤¾)</p>
            <p style={{ textAlign: 'center', fontWeight: 'bold' }}>(à¤–)à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤à¤¾à¤‚à¤šà¥€ à¤¸à¤°à¥à¤µà¤¸à¤¾à¤§à¤¾à¤°à¤£ à¤¤à¤ªà¤¾à¤¸à¤£à¥€à¤šà¤¾ à¤¨à¤®à¥à¤¨à¤¾</p>

            <ol style={{ marginLeft: '20px' }}>
              <li>
                à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤à¤¿à¤šà¥‡ à¤¨à¤¾à¤‚à¤µ- 
                <input 
                  type="text" 
                  value={gpName} 
                  onChange={(e) => setGpName(e.target.value)} 
                  style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
                à¤ªà¤‚à¤šà¤¾à¤¯à¤¤ à¤¸à¤®à¤¿à¤¤à¥€ - 
                <input 
                  type="text" 
                  value={psName} 
                  onChange={(e) => setPsName(e.target.value)} 
                  style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
              </li>
              <li>
                (à¤•) à¤¸à¤°à¥à¤µà¤¸à¤¾à¤§à¤¾à¤°à¤£ à¤¤à¤ªà¤¾à¤¸à¤£à¥€à¤šà¥€ à¤¤à¤¾à¤°à¥€à¤– - 
                <input 
                  type="date" 
                  value={inspectionDate} 
                  onChange={(e) => setInspectionDate(e.target.value)} 
                  style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
              </li>
              <li>
                (à¤–) à¤¸à¤°à¥à¤µà¤¸à¤¾à¤§à¤¾à¤°à¤£ à¤¤à¤ªà¤¾à¤¸à¤£à¥€à¤šà¥‡ à¤ à¤¿à¤•à¤¾à¤£ :- 
                <input 
                  type="text" 
                  value={inspectionPlace} 
                  onChange={(e) => setInspectionPlace(e.target.value)} 
                  style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
              </li>
              <li>
                à¤¤à¤ªà¤¾à¤¸à¤£à¥€ à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€à¤¾à¤šà¥‡ à¤¨à¤¾à¤‚à¤µ à¤µ à¤¹à¥à¤¦à¥à¤¦à¤¾ :- 
                <input 
                  type="text" 
                  value={officerName} 
                  onChange={(e) => setOfficerName(e.target.value)} 
                  style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
                /
                <input 
                  type="text" 
                  value={officerPost} 
                  onChange={(e) => setOfficerPost(e.target.value)} 
                  style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
              </li>
              <li>
                à¤¸à¤šà¤¿à¤µà¤¾à¤šà¥‡ à¤¨à¤¾à¤‚à¤µ à¤µ à¤¤à¥‹ à¤¸à¤¦à¤¸à¥à¤¯ à¤ªà¤‚à¤šà¤¾à¤¯à¤¤à¥€à¤¤ à¤•à¥‡à¤²à¥‡à¤²à¤¾ à¤ªà¤¾à¤¸à¥‚à¤¨ à¤•à¤¾à¤® à¤•à¤°à¥€à¤¤ à¤†à¤¹à¥‡ :- 
                <input 
                  type="text" 
                  value={secretaryName} 
                  onChange={(e) => setSecretaryName(e.target.value)} 
                  style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
                /
                <input 
                  type="text" 
                  value={secretaryTenure} 
                  onChange={(e) => setSecretaryTenure(e.target.value)} 
                  style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
              </li>
              <li>
                à¤®à¤¾à¤¸à¤¿à¤• à¤¸à¤­à¤¾ à¤¨à¤¿à¤¯à¤®à¤¾à¤‚à¤¨à¥à¤¸à¤¾à¤° à¤¨à¤¿à¤¯à¤®à¤¿à¤¤à¤ªà¤£à¥‡ à¤¹à¥‹à¤¤à¤¾à¤¤ à¤•à¤¾à¤¯ ? 
                <label style={{ marginLeft: '10px' }}>
                  <input 
                    type="radio" 
                    name="monthlyMeetings" 
                    value="à¤¹à¥‹à¤¯" 
                    checked={monthlyMeetings === 'à¤¹à¥‹à¤¯'} 
                    onChange={(e) => setMonthlyMeetings(e.target.value)} 
                  /> 
                  à¤¹à¥‹à¤¯
                </label>
                <label style={{ marginLeft: '10px' }}>
                  <input 
                    type="radio" 
                    name="monthlyMeetings" 
                    value="à¤¨à¤¾à¤¹à¥€" 
                    checked={monthlyMeetings === 'à¤¨à¤¾à¤¹à¥€'} 
                    onChange={(e) => setMonthlyMeetings(e.target.value)} 
                  /> 
                  à¤¨à¤¾à¤¹à¥€
                </label>
              </li>
              <ul style={{ marginLeft: '20px' }}>
                <li>
                  à¤¸à¤­à¥‡à¤šà¥€ à¤•à¤¾à¤°à¥à¤¯à¤¸à¥‚à¤šà¥€ à¤µ à¤¸à¤­à¥‡à¤šà¥€ à¤¨à¥‹à¤‚à¤¦à¤µà¤¹à¥€ à¤ˆà¤¤à¥à¤¯à¤¾à¤¦à¥€ à¤…à¤¦à¥à¤¯à¤¾à¤µà¤¤ à¤†à¤¹à¥‡ à¤•à¤¾à¤¯ ? 
                  <label style={{ marginLeft: '10px' }}>
                    <input 
                      type="radio" 
                      name="agendaUpToDate" 
                      value="à¤¹à¥‹à¤¯" 
                      checked={agendaUpToDate === 'à¤¹à¥‹à¤¯'} 
                      onChange={(e) => setAgendaUpToDate(e.target.value)} 
                    /> 
                    à¤¹à¥‹à¤¯
                  </label>
                  <label style={{ marginLeft: '10px' }}>
                    <input 
                      type="radio" 
                      name="agendaUpToDate" 
                      value="à¤¨à¤¾à¤¹à¥€" 
                      checked={agendaUpToDate === 'à¤¨à¤¾à¤¹à¥€'} 
                      onChange={(e) => setAgendaUpToDate(e.target.value)} 
                    /> 
                    à¤¨à¤¾à¤¹à¥€
                  </label>
                </li>
              </ul>
              <br />
              <br />
            </ol>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤….à¤•à¥à¤°.</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¨à¥‹à¤‚à¤¦à¤µà¤¹à¥€à¤šà¥‡ à¤¨à¤¾à¤µ</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¤à¤ªà¤¾à¤¸à¤£à¥€à¤šà¥à¤¯à¤¾ à¤¤à¤¾à¤°à¤–à¥‡à¤²à¤¾ à¤¶à¤¿à¤²à¥à¤²à¤•</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¬à¤à¤•à¥‡à¤¤à¤¿à¤² à¤¶à¤¿à¤²à¥à¤²à¤•</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤ªà¥‹à¤¸à¥à¤Ÿà¤¾à¤¤à¤¿à¤² à¤¶à¤¿à¤²à¥à¤²à¤•</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¹à¤¾à¤¤à¥€ à¤…à¤¸à¤²à¥‡à¤²à¥€ à¤¶à¤¿à¤²à¥à¤²à¤•</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤šà¥‡à¤•</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>1</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤—à¥à¤°à¤¾à¤®à¤¨à¤¿à¤§à¥€</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>2</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤ªà¤¾à¤£à¥€ à¤ªà¥à¤°à¤µà¤ à¤¾</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                </tr>
              </tbody>
            </table>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th colSpan="7" style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>(7) à¤°à¥‹à¤•à¤¡ à¤µà¤¹à¥€à¤šà¤¾ à¤¤à¤ªà¤¶à¥€à¤²</th>
                </tr>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤….à¤•à¥à¤°.</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¨à¥‹à¤‚à¤¦à¤µà¤¹à¥€à¤šà¥‡ à¤¨à¤¾à¤µ</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¤à¤ªà¤¾à¤¸à¤£à¥€à¤šà¥à¤¯à¤¾ à¤¤à¤¾à¤°à¥€à¤–à¥‡à¤²à¤¾ à¤¶à¤¿à¤²à¥à¤²à¤•</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¬à¤à¤•à¥‡à¤¤à¤¿à¤² à¤¶à¤¿à¤²à¥à¤²à¤•</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤ªà¥‹à¤¸à¥à¤Ÿà¤¾à¤¤à¤¿à¤² à¤¶à¤¿à¤²à¥à¤²à¤•</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¹à¤¾à¤¤à¥€ à¤…à¤¸à¤²à¥‡à¤²à¥€ à¤¶à¤¿à¤²à¥à¤²à¤•</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤šà¥‡à¤•</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1", "à¤—à¥à¤°à¤¾à¤®à¤¨à¤¿à¤§à¥€"],
                  ["2", "à¤ªà¤¾à¤£à¥€ à¤ªà¥à¤°à¤µà¤ à¤¾"],
                  ["3", "14 à¤µà¤¾ à¤µà¤¿à¤¤à¥à¤¤ à¤†à¤¯à¥‹à¤—"],
                  ["4", "à¤‡à¤‚.à¤—à¤¾.à¤¯à¥‹."],
                  ["5", "à¤….à¤œà¤¾.à¤µà¤¿à¤•à¤¾à¤¸"],
                  ["6", "à¤®à¤œà¤—à¤¾à¤°à¥‹à¤¹à¤¯à¥‹"],
                  ["7", "à¤ à¤•à¥à¤•à¤° à¤¬à¤¾à¤ªà¥à¤ªà¤¾"],
                  ["8", "à¤—à¥à¤°à¤¾à¤®à¤•à¥‹à¤· à¤ªà¥ˆà¤¸à¤¾"],
                  ["9", "à¤¨à¤¾à¤—à¤°à¥€ à¤¸à¥à¤µà¤¿à¤§à¤¾"],
                  ["10", "à¤¦à¤²à¤¿à¤¤ à¤µà¤¸à¥à¤¤à¥€ à¤µà¤¿à¤•à¤¾à¤¸"],
                  ["11", "à¤¤à¤‚à¤Ÿà¤¾ à¤®à¥à¤•à¥à¤¤ à¤¯à¥‹à¤œà¤¨à¤¾"],
                  ["12", "à¤œà¤¨à¤¸à¥à¤µà¤¿à¤§à¤¾"],
                  ["13", "à¤ªà¤¾à¤¯à¤•à¤¾"],
                  ["14", "à¤ª.à¤¸à¤‚.à¤¯à¥‹à¤œà¤¨à¤¾"],
                  ["15", "SBM"],
                  ["16", "à¤¤à¥€à¤°à¥à¤¥à¤•à¥à¤·à¥‡à¤¤à¥à¤° à¤µà¤¿à¤•à¤¾à¤¸ à¤¨à¤¿à¤§à¥€"],
                  ["17", "à¤…à¤²à¥à¤ªà¤¸à¤‚à¤–à¥à¤¯à¤¾à¤‚à¤• à¤µà¤¿à¤•à¤¾à¤¸ à¤¨à¤¿à¤§à¥€"]
                ].map((row, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{row[0]}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row[1]}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>(8)(à¤•) à¤•à¤° à¤†à¤•à¤¾à¤°à¤£à¥€ à¤¨à¥‹à¤‚à¤¦à¤µà¤¹à¥€(à¤¨à¤®à¥à¤¨à¤¾ 8) :- à¤¨à¤¾à¤¹à¥€</h3>
              <p>1.à¤•à¤°à¤¾à¤šà¥à¤¯à¤¾ à¤®à¤¾à¤—à¤£à¥€à¤šà¥‡ à¤¨à¥‹à¤‚à¤¦à¤£à¥€ à¤ªà¥à¤¸à¥à¤¤à¤• (à¤¨à¤®à¥à¤¨à¤¾ 9):-</p>
              <p>
                2.à¤•à¤°à¤¾à¤šà¥€ à¤ªà¤¾à¤µà¤¤à¥€ (à¤¨à¤®à¥à¤¨à¤¾ 10):-à¤¹à¥‡ à¤…à¤¦à¥à¤¯à¤¾à¤µà¤¤ à¤†à¤¹à¥‡ à¤•à¤¾à¤¯ ? 
                <label style={{ marginLeft: '10px' }}>
                  <input 
                    type="radio" 
                    name="receiptUpToDate" 
                    value="à¤¹à¥‹à¤¯" 
                    checked={receiptUpToDate === 'à¤¹à¥‹à¤¯'} 
                    onChange={(e) => setReceiptUpToDate(e.target.value)} 
                  /> 
                  à¤¹à¥‹à¤¯
                </label>
                <label style={{ marginLeft: '10px' }}>
                  <input 
                    type="radio" 
                    name="receiptUpToDate" 
                    value="à¤¨à¤¾à¤¹à¥€" 
                    checked={receiptUpToDate === 'à¤¨à¤¾à¤¹à¥€'} 
                    onChange={(e) => setReceiptUpToDate(e.target.value)} 
                  /> 
                  à¤¨à¤¾à¤¹à¥€
                </label>
              </p>
              <p>(à¤–) à¤®à¤¾à¤—à¥€à¤² à¤«à¥‡à¤° à¤†à¤•à¤¾à¤°à¤£à¥€ à¤•à¥‡à¤²à¥‡à¤²à¥€ à¤à¤¾à¤²à¥€ ? à¤¦à¤¿à¤¨à¤¾à¤‚à¤• 
                <input type="date" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> 
                / / à¤ à¤°à¤¾à¤µ à¤•à¥à¤°à¤®à¤¾à¤‚à¤• - 
                <input 
                  type="text" 
                  value={resolutionNo} 
                  onChange={(e) => setResolutionNo(e.target.value)} 
                  style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
              </p>
              <p>à¤¨à¤¾à¤¹à¥€</p>
              <p>(à¤—) à¤šà¤¾à¤° à¤µà¤°à¥à¤·à¥‡ à¤ªà¥‚à¤°à¥à¤£ à¤à¤¾à¤²à¥‡à¤²à¥€ à¤…à¤¸à¤²à¥à¤¯à¤¾à¤¸ ,à¤¨à¤Ÿà¤²à¥à¤¯à¤¾à¤¨à¥‡ à¤«à¥‡à¤° à¤†à¤•à¤¾à¤°à¤£à¥€ à¤•à¤°à¤£à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤•à¤¾à¤°à¥à¤¯à¤µà¤¾à¤¹à¥€ à¤šà¤¾à¤²à¥‚ à¤†à¤¹à¥‡ à¤•à¤¿à¤‚à¤µà¤¾ à¤¨à¤¾à¤¹à¥€ ?</p>
              <p>
                <label style={{ marginLeft: '10px' }}>
                  <input 
                    type="radio" 
                    name="reassessmentAction" 
                    value="à¤¹à¥‹à¤¯" 
                    checked={reassessmentAction === 'à¤¹à¥‹à¤¯'} 
                    onChange={(e) => setReassessmentAction(e.target.value)} 
                  /> 
                  à¤¹à¥‹à¤¯
                </label>
                <label style={{ marginLeft: '10px' }}>
                  <input 
                    type="radio" 
                    name="reassessmentAction" 
                    value="à¤¨à¤¾à¤¹à¥€" 
                    checked={reassessmentAction === 'à¤¨à¤¾à¤¹à¥€'} 
                    onChange={(e) => setReassessmentAction(e.target.value)} 
                  /> 
                  à¤¨à¤¾à¤¹à¥€
                </label>
              </p>
            </div>

            <h3 style={{ color: '#333', marginBottom: '10px' }}>(9) à¤¤à¤ªà¤¾à¤¸à¤£à¥€ à¤¤à¤¾à¤°à¤–à¥‡à¤¸ à¤•à¤° à¤µà¤¸à¥à¤²à¥€à¤šà¥€ à¤ªà¥à¤°à¤—à¤¤à¥€ à¤–à¤¾à¤²à¥€à¤²à¤ªà¥à¤°à¤®à¤¾à¤£à¥‡ à¤†à¤¹à¥‡ :-</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>(1) à¤®à¤¾à¤—à¥€à¤² à¤¯à¥‡à¤£à¥‡ à¤°à¤•à¥à¤•à¤® :- à¤—à¥ƒà¤¹à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> à¤ªà¤¾à¤£à¥€à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(2) à¤šà¤¾à¤²à¥‚ à¤µà¤°à¥à¤·à¤¾à¤¤ à¤®à¤¾à¤—à¤£à¥€ :- à¤—à¥ƒà¤¹à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> à¤ªà¤¾à¤£à¥€à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(3) à¤à¤•à¥à¤£ à¤®à¤¾à¤—à¤£à¥€ :- à¤—à¥ƒà¤¹à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> à¤ªà¤¾à¤£à¥€à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(4) à¤à¤•à¥à¤£ à¤µà¤¸à¥‚à¤²à¥€ :- à¤—à¥ƒà¤¹à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> à¤ªà¤¾à¤£à¥€à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(5) à¤¶à¤¿à¤²à¥à¤²à¤• à¤µà¤¸à¥‚à¤²à¥€ :- à¤—à¥ƒà¤¹à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> à¤ªà¤¾à¤£à¥€à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(6) à¤Ÿà¤•à¥à¤•à¥‡à¤µà¤¾à¤°à¥€ :- à¤—à¥ƒà¤¹à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> à¤ªà¤¾à¤£à¥€à¤•à¤°- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(7) à¤¶à¥‡à¤°à¤¾ :- <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
            </ul>

            <h3 style={{ color: '#333', marginBottom: '10px' }}>(10) à¤®à¤¾à¤—à¤¾à¤¸ à¤µà¤°à¥à¤—à¥€à¤¯à¤¾à¤•à¤°à¥€à¤¤à¤¾ à¤°à¤¾à¤–à¥‚à¤¨ à¤ à¥‡à¤µà¤²à¥‡à¤²à¥à¤¯à¤¾ 15% à¤¨à¤¿à¤§à¥€à¤šà¥à¤¯à¤¾ à¤–à¤°à¥à¤šà¤¾à¤šà¤¾ à¤¤à¤ªà¤¶à¥€à¤²:-</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>(1) à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤à¥€à¤šà¥‡ à¤à¤•à¥à¤£ à¤‰à¤¤à¥à¤ªà¤¨à¥à¤¨ :- <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(2) 15% à¤°à¤•à¥à¤•à¤® :- <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(3) à¤®à¤¾à¤—à¥€à¤² à¤…à¤¨à¥à¤¶à¥‡à¤· <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(4) à¤•à¤°à¤¾à¤µà¤¯à¤¾à¤šà¤¾ à¤à¤•à¥à¤£ à¤–à¤°à¥à¤š <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(5) à¤¤à¤ªà¤¾à¤¸à¤£à¥€à¤¤à¥à¤¯à¤¾ à¤¦à¤¿à¤¨à¤¾à¤‚à¤• à¤ªà¤°à¥à¤¯à¤‚à¤¤ à¤à¤¾à¤²à¥‡à¤²à¤¾ à¤–à¤°à¥à¤š: <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
              <li>(6) à¤¶à¤¿à¤²à¥à¤²à¤• à¤–à¤°à¥à¤š <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
            </ul>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>(7) à¤¸à¥‚à¤šà¤¨à¤¾-</h3>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>(11) à¤†à¤°à¥à¤¥à¤¿à¤• à¤µà¥à¤¯à¤µà¤¹à¤¾à¤°à¤¾à¤¤ à¤¨à¤¿à¤°à¥à¤¦à¥‡à¤¶à¤¾à¤¨à¥à¤¸à¤¾à¤° à¤†à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤¨à¤¿à¤¯à¤®à¤¬à¤¾à¤¹à¥à¤¯à¤¤à¤¾ -</h3>
              <p>(à¤•) à¤•à¥‹à¤£à¤¤à¥à¤¯à¤¾à¤¹à¥€ à¤šà¤¾à¤²à¥‚ à¤–à¤°à¥‡à¤¦à¥€ à¤•à¤°à¤£à¤¾à¤±à¥à¤¯à¤¾à¤ªà¥‚à¤°à¥à¤µà¥€ à¤…à¤‚à¤¦à¤¾à¤œà¤ªà¤¤à¥à¤°à¤•à¤¾à¤¤ à¤¯à¥‹à¤—à¥à¤¯ à¤¤à¤°à¤¤à¥‚à¤¦ à¤•à¥‡à¤²à¥€ à¤†à¤¹à¥‡ à¤•à¤¾à¤¯ ? 
                <label style={{ marginLeft: '10px' }}>
                  <input type="radio" name="budgetProvision" value="à¤¹à¥‹à¤¯" /> à¤¹à¥‹à¤¯
                </label>
                <label style={{ marginLeft: '10px' }}>
                  <input type="radio" name="budgetProvision" value="à¤¨à¤¾à¤¹à¥€" /> à¤¨à¤¾à¤¹à¥€
                </label>
              </p>
              <p>(à¤–) à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤ à¤–à¤°à¥‡à¤¦à¥€à¤¸à¤¾à¤ à¥€ à¤®à¤¾à¤¨à¥à¤¯à¤¤à¤¾ à¤¦à¤¿à¤²à¥€ à¤†à¤¹à¥‡ à¤•à¤¾à¤¯ ? à¤ à¤°à¤¾à¤µ à¤•à¥à¤°.          
                <input type="text" style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> 
                à¤¦à¤¿.         
                <input type="date" style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> 
                / 
              </p>
              <p>(à¤—) à¤–à¤°à¥‡à¤¦à¥€ à¤•à¤°à¤£à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤¨à¤¿à¤¯à¤®à¤ªà¥à¤°à¤®à¤¾à¤£à¥‡ à¤¦à¤°à¤ªà¤¤à¥à¤°à¤•à¥‡ à¤®à¤¾à¤—à¤µà¤¿à¤²à¥€ à¤¹à¥‹à¤¤à¥€ à¤•à¤¾à¤¯ ? 
                <label style={{ marginLeft: '10px' }}>
                  <input type="radio" name="tendersCalled" value="à¤¹à¥‹à¤¯" /> à¤¹à¥‹à¤¯
                </label>
                <label style={{ marginLeft: '10px' }}>
                  <input type="radio" name="tendersCalled" value="à¤¨à¤¾à¤¹à¥€" /> à¤¨à¤¾à¤¹à¥€
                </label>
              </p>
              <p>(à¤˜) à¤–à¤°à¥‡à¤¦à¥€ à¤•à¥‡à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤¸à¤¾à¤¹à¤¿à¤¤à¥à¤¯à¤¾à¤šà¤¾ à¤¨à¤®à¥à¤¨à¤¾ 9,15 à¤µ 16 à¤®à¤§à¥€à¤² à¤¨à¥‹à¤‚à¤¦à¤µà¤¹à¥€à¤¤ à¤¨à¥‹à¤‚à¤¦à¥€ à¤˜à¥‡à¤£à¥à¤¯à¤¾à¤¤ à¤†à¤²à¥à¤¯à¤¾ à¤†à¤¹à¥‡à¤¤ à¤•à¤¾à¤¯ ?</p>
              <p>
                <label style={{ marginLeft: '10px' }}>
                  <input type="radio" name="entriesMade" value="à¤¹à¥‹à¤¯" /> à¤¹à¥‹à¤¯
                </label>
                <label style={{ marginLeft: '10px' }}>
                  <input type="radio" name="entriesMade" value="à¤¨à¤¾à¤¹à¥€" /> à¤¨à¤¾à¤¹à¥€
                </label>
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p>(12) à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤à¤¾à¤¨à¥‡ à¤¸à¥à¤µà¤¤à¤ƒà¤šà¥à¤¯à¤¾ à¤¨à¤¿à¤§à¥€à¤¤à¥‚à¤¨ à¤•à¤¿à¤‚à¤µà¤¾ à¤¶à¤¾à¤¸à¤•à¥€à¤¯/à¤œà¤¿à¤²à¥à¤¹à¤¾ à¤ªà¤°à¤¿à¤·à¤¦ à¤¯à¥‹à¤œà¤¨à¥‡à¤‚à¤¤à¤°à¥à¤—à¤¤ à¤¹à¤¾à¤¤ à¤˜à¥‡à¤¤à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤•à¤¾à¤®à¤¾à¤‚à¤šà¤¾ à¤¤à¤ªà¤¶à¥€à¤²-</p>
              <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤….à¤•à¥à¤°.</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¯à¥‹à¤œà¤¨à¥‡à¤šà¥‡ à¤¨à¤¾à¤‚à¤µ</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤•à¤¾à¤®à¤¾à¤šà¤¾ à¤ªà¥à¤°à¤•à¤¾à¤°</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤…à¤‚à¤¦à¤¾à¤œà¤¿à¤¤ à¤°à¤•à¥à¤•à¤®</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤®à¤¿à¤³à¤¾à¤²à¥‡à¤²à¥‡ à¤…à¤¨à¥à¤¦à¤¾à¤¨</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤à¤¾à¤²à¥‡à¤²à¤¾ à¤–à¤°à¥à¤š</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add rows as needed with inputs */}
                  <tr>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none', textAlign: 'center' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  </tr>
                  {/* Repeat for additional rows */}
                </tbody>
              </table>

              <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤•à¤¾à¤® à¤¸à¥à¤°à¥ à¤à¤¾à¤²à¥à¤¯à¤¾à¤šà¥€ à¤¤à¤¾à¤°à¥€à¤–</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤•à¤¾à¤® à¤ªà¥‚à¤°à¥à¤£ à¤à¤¾à¤²à¥à¤¯à¤¾à¤šà¥€ à¤¤à¤¾à¤°à¥€à¤–</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤ªà¥à¤°à¤—à¤¤à¥€à¤µà¤° à¤…à¤¸à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤•à¤¾à¤®à¤¾à¤šà¥€ à¤¸à¤¦à¥à¤¯:à¤¸à¥à¤¥à¤¿à¤¤à¥€</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤ªà¥‚à¤°à¥à¤£à¤¤à¥à¤µà¤¾à¤šà¥‡ à¤ªà¥à¤°à¤®à¤¾à¤£à¤ªà¤¤à¥à¤° à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤ à¤•à¥‡à¤²à¥‡ à¤•à¤¿à¤‚à¤µà¤¾ à¤¨à¤¾à¤¹à¥€</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¶à¥‡à¤°à¤¾</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="date" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="date" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      <label><input type="radio" name="certificate1" value="à¤¹à¥‹à¤¯" /> à¤¹à¥‹à¤¯</label>
                      <label style={{ marginLeft: '10px' }}><input type="radio" name="certificate1" value="à¤¨à¤¾à¤¹à¥€" /> à¤¨à¤¾à¤¹à¥€</label>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  </tr>
                  {/* Additional rows */}
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p>(13) à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤à¤¾à¤‚à¤¨à¥€ à¤‡à¤¤à¤° à¤¯à¥‹à¤œà¤¨à¤¾à¤®à¤§à¥à¤¯à¥‡ à¤•à¥‡à¤²à¥‡à¤²à¥€ à¤ªà¥à¤°à¤—à¤¤à¥€</p>
              <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤….à¤•à¥à¤°.</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¯à¥‹à¤œà¤¨à¥‡à¤šà¥‡ à¤¨à¤¾à¤µ</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¦à¤¿à¤²à¥‡à¤²à¥€ à¤‰à¤¦à¥à¤¦à¤¿à¤·à¥à¤Ÿà¥‡</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¤à¤ªà¤¾à¤¸à¤£à¥€à¤šà¥à¤¯à¤¾ à¤¦à¤¿à¤¨à¤¾à¤‚à¤•à¤¾à¤¸</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¶à¥‡à¤°à¤¾</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>1</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤à¤—à¤¾à¤µà¤¿à¤•à¤¾.</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>2</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤¬à¥‰à¤¯à¥‹à¤—à¥…à¤¸</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>3</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤¨à¤¿à¤°à¥à¤§à¥‚à¤° à¤šà¥à¤²</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>4</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤•à¥à¤‚à¤Ÿà¥à¤‚à¤¬ à¤•à¤²à¥à¤¯à¤¾à¤£</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>5</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤…à¤²à¥à¤ªà¤µà¤šà¤¤</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  </tr>
                  {/* Add rows 6 and 7 as empty */}
                  <tr>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>6</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>7</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th colSpan="6" style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>(14) 14 à¤µà¤¾ à¤µà¤¿à¤¤à¥à¤¤ à¤†à¤¯à¥‹à¤—à¤¾à¤®à¤§à¥‚à¤¨ à¤¹à¤¾à¤¤à¥€ à¤˜à¥‡à¤¤à¤²à¥‡à¤²à¥€ à¤•à¤¾à¤®à¥‡ à¤µ à¤¤à¥à¤¯à¤¾à¤šà¥€ à¤ªà¥à¤°à¤—à¤¤à¥€ .</th>
                </tr>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤…. à¤•à¥à¤°.</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤¯à¥‹à¤œà¤¨à¥‡à¤šà¥‡ à¤¨à¤¾à¤µ</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤•à¤¾à¤®à¤¾à¤šà¤¾ à¤ªà¥à¤°à¤•à¤¾à¤°</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤…à¤‚à¤¦à¤¾à¤œà¤¿à¤¤ à¤°à¤•à¥à¤•à¤®</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤®à¤¿à¤³à¤¾à¤²à¥‡à¤²à¥‡ à¤…à¤¨à¥à¤¦à¤¾à¤¨</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>à¤à¤¾à¤²à¥‡à¤²à¤¾ à¤–à¤°à¥à¤š</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>1</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>14 à¤µà¤¾ à¤µà¤¿à¤¤à¥à¤¤ à¤†à¤¯à¥‹à¤—</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤à¤².à¤ˆ.à¤¡à¥€.à¤²à¤¾à¤ˆà¤Ÿ à¤–à¤°à¥‡à¤¦à¥€</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>2</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤•à¤šà¤°à¤¾ à¤•à¥à¤‚à¤¡à¥€</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>3</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤«à¤°à¥à¤¨à¤¿à¤šà¤°</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>4</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤Ÿà¤¿.à¤µà¥à¤¹à¤¿.à¤¸à¤‚à¤š à¤–à¤°à¥‡à¤¦à¥€</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>5</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤†à¤ªà¤²à¥‡ à¤¸à¤°à¤•à¤¾à¤° à¤¸à¥‡à¤µà¤¾ à¤•à¥‡à¤‚à¤¦à¥à¤° à¤–à¤°à¥à¤š</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>6</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>à¤µà¤¾à¤Ÿà¤° à¤®à¤¿à¤Ÿà¤°</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', borde