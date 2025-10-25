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
  
  // Check if we're in view mode
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
  
  // Location and Photo states (added from Angavadi form)
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Basic inspection data
  const [inspectionData, setInspectionData] = useState({
    category_id: '',
    location_name: '',
    planned_date: '',
    latitude: null as number | null,
    longitude: null as number | null,
    location_accuracy: null as number | null,
    location_detected: ''
  });

  // Get grampanchayat inspection category
  const grampanchayatCategory = categories.find(cat => cat.form_type === 'grampanchayat');

  useEffect(() => {
    if (grampanchayatCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: grampanchayatCategory.id
      }));
    }
  }, [grampanchayatCategory]);

  // Load existing inspection data when editing
  useEffect(() => {
    if (editingInspection && editingInspection.id) {
      console.log('Loading existing inspection data:', editingInspection);
      
      // Load basic inspection data
      setInspectionData({
        category_id: editingInspection.category_id || '',
        location_name: editingInspection.location_name || '',
        planned_date: editingInspection.planned_date ? editingInspection.planned_date.split('T')[0] : '',
        latitude: editingInspection.latitude,
        longitude: editingInspection.longitude,
        location_accuracy: editingInspection.location_accuracy,
        location_detected: editingInspection.location_detected || ''
      });

      // Load form data
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

  // Get current GPS location
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
        
        // Get location name using reverse geocoding
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

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (uploadedPhotos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    setUploadedPhotos(prev => [...prev, ...files]);
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Upload photos to Supabase
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

  // Generate inspection number
  const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `GP-${year}${month}${day}-${time}`;
  };

  // Handle form submission
  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      setIsLoading(true);

      // Collect all form data
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
        // Update existing inspection
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
    <div style={{ fontFamily: 'Arial, sans-serif', direction: 'ltr', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        
        {isViewMode && (
          <span style={{ 
            padding: '8px 16px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>
            View Mode
          </span>
        )}
      </div>

      {/* Location Section */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          color: '#1f2937', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MapPin size={24} />
          स्थान माहिती (Location Information)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              स्थानाचे नाव *
            </label>
            <input
              type="text"
              value={inspectionData.location_name}
              onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px' 
              }}
              placeholder="स्थानाचे नाव भरा"
              required
              disabled={isViewMode}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              नियोजित तारीख
            </label>
            <input
              type="date"
              value={inspectionData.planned_date}
              onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px' 
              }}
              disabled={isViewMode}
            />
          </div>
        </div>

        {!isViewMode && (
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            <MapPin size={20} />
            <span>{isGettingLocation ? 'Getting Location...' : 'Get Current GPS Location'}</span>
          </button>
        )}

        {inspectionData.latitude && inspectionData.longitude && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#d1fae5', 
            border: '1px solid #6ee7b7', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#065f46' }}>Location Captured</p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#047857' }}>
              Latitude: {inspectionData.latitude.toFixed(6)}<br />
              Longitude: {inspectionData.longitude.toFixed(6)}<br />
              Accuracy: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}
            </p>
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            शोधलेले स्थान (Location Detected)
          </label>
          <input
            type="text"
            value={inspectionData.location_detected}
            onChange={(e) => setInspectionData(prev => ({...prev, location_detected: e.target.value}))}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px' 
            }}
            placeholder="GPS द्वारे शोधलेले स्थान येथे दिसेल"
            readOnly={isViewMode}
          />
        </div>
      </div>

      {/* Original Form Content */}
      <h1 style={{ textAlign: 'center', color: '#333' }}>परिशिष्ट-चार</h1>
      <p style={{ textAlign: 'center', fontWeight: 'bold' }}>(नियम 80 पहा)</p>
      <p style={{ textAlign: 'center', fontWeight: 'bold' }}>(ख)ग्राम पंचायतांची सर्वसाधारण तपासणीचा नमुना</p>

      <ol style={{ marginLeft: '20px' }}>
        <li>
          ग्राम पंचायतिचे नांव- 
          <input 
            type="text" 
            value={gpName} 
            onChange={(e) => setGpName(e.target.value)} 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
          पंचायत समिती - 
          <input 
            type="text" 
            value={psName} 
            onChange={(e) => setPsName(e.target.value)} 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </li>
        <li>
          (क) सर्वसाधारण तपासणीची तारीख - 
          <input 
            type="date" 
            value={inspectionDate} 
            onChange={(e) => setInspectionDate(e.target.value)} 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </li>
        <li>
          (ख) सर्वसाधारण तपासणीचे ठिकाण :- 
          <input 
            type="text" 
            value={inspectionPlace} 
            onChange={(e) => setInspectionPlace(e.target.value)} 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </li>
        <li>
          तपासणी अधिकारीाचे नांव व हुद्दा :- 
          <input 
            type="text" 
            value={officerName} 
            onChange={(e) => setOfficerName(e.target.value)} 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
          /
          <input 
            type="text" 
            value={officerPost} 
            onChange={(e) => setOfficerPost(e.target.value)} 
            style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </li>
        <li>
          सचिवाचे नांव व तो सदस्य पंचायतीत केलेला पासून काम करीत आहे :- 
          <input 
            type="text" 
            value={secretaryName} 
            onChange={(e) => setSecretaryName(e.target.value)} 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
          /
          <input 
            type="text" 
            value={secretaryTenure} 
            onChange={(e) => setSecretaryTenure(e.target.value)} 
            style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
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
              checked={monthlyMeetings === 'होय'} 
              onChange={(e) => setMonthlyMeetings(e.target.value)} 
              disabled={isViewMode}
            /> 
            होय
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input 
              type="radio" 
              name="monthlyMeetings" 
              value="नाही" 
              checked={monthlyMeetings === 'नाही'} 
              onChange={(e) => setMonthlyMeetings(e.target.value)} 
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
                checked={agendaUpToDate === 'होय'} 
                onChange={(e) => setAgendaUpToDate(e.target.value)} 
                disabled={isViewMode}
              /> 
              होय
            </label>
            <label style={{ marginLeft: '10px' }}>
              <input 
                type="radio" 
                name="agendaUpToDate" 
                value="नाही" 
                checked={agendaUpToDate === 'नाही'} 
                onChange={(e) => setAgendaUpToDate(e.target.value)} 
                disabled={isViewMode}
              /> 
              नाही
            </label>
          </li>
        </ul>
        <br />
        <br />
      </ol>

      <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>अ.क्र.</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>नोंदवहीचे नाव</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>तपासणीच्या तारखेला शिल्लक</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>बँकेतिल शिल्लक</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>पोस्टातिल शिल्लक</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>हाती असलेली शिल्लक</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>चेक</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>1</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>ग्रामनिधी</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>2</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>पाणी पुरवठा</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
          </tr>
        </tbody>
      </table>

      <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th colSpan={7} style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>(7) रोकड वहीचा तपशील</th>
          </tr>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>अ.क्र.</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>नोंदवहीचे नाव</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>तपासणीच्या तारीखेला शिल्लक</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>बँकेतिल शिल्लक</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>पोस्टातिल शिल्लक</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>हाती असलेली शिल्लक</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>चेक</th>
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
            <tr key={index}>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{row[0]}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row[1]}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>(8)(क) कर आकारणी नोंदवही(नमुना 8) :- नाही</h3>
        <p>1.कराच्या मागणीचे नोंदणी पुस्तक (नमुना 9):-</p>
        <p>
          2.कराची पावती (नमुना 10):-हे अद्यावत आहे काय ? 
          <label style={{ marginLeft: '10px' }}>
            <input 
              type="radio" 
              name="receiptUpToDate" 
              value="होय" 
              checked={receiptUpToDate === 'होय'} 
              onChange={(e) => setReceiptUpToDate(e.target.value)} 
              disabled={isViewMode}
            /> 
            होय
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input 
              type="radio" 
              name="receiptUpToDate" 
              value="नाही" 
              checked={receiptUpToDate === 'नाही'} 
              onChange={(e) => setReceiptUpToDate(e.target.value)} 
              disabled={isViewMode}
            /> 
            नाही
          </label>
        </p>
        <p>(ख) मागील फेर आकारणी केलेली झाली ? दिनांक 
          <input type="date" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /> 
          / / ठराव क्रमांक - 
          <input 
            type="text" 
            value={resolutionNo} 
            onChange={(e) => setResolutionNo(e.target.value)} 
            style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </p>
        <p>नाही</p>
        <p>(ग) चार वर्षे पूर्ण झालेली असल्यास ,नटल्याने फेर आकारणी करण्यासाठी कार्यवाही चालू आहे किंवा नाही ?</p>
        <p>
          <label style={{ marginLeft: '10px' }}>
            <input 
              type="radio" 
              name="reassessmentAction" 
              value="होय" 
              checked={reassessmentAction === 'होय'} 
              onChange={(e) => setReassessmentAction(e.target.value)} 
              disabled={isViewMode}
            /> 
            होय
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input 
              type="radio" 
              name="reassessmentAction" 
              value="नाही" 
              checked={reassessmentAction === 'नाही'} 
              onChange={(e) => setReassessmentAction(e.target.value)} 
              disabled={isViewMode}
            /> 
            नाही
          </label>
        </p>
      </div>

      <h3 style={{ color: '#333', marginBottom: '10px' }}>(9) तपासणी तारखेस कर वसुलीची प्रगती खालीलप्रमाणे आहे :-</h3>
      <ul style={{ marginLeft: '20px' }}>
        <li>(1) मागील येणे रक्कम :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(2) चालू वर्षात मागणी :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(3) एकुण मागणी :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(4) एकुण वसूली :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(5) शिल्लक वसूली :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(6) टक्केवारी :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(7) शेरा :- <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
      </ul>

      <h3 style={{ color: '#333', marginBottom: '10px' }}>(10) मागास वर्गीयाकरीता राखून ठेवलेल्या 15% निधीच्या खर्चाचा तपशील:-</h3>
      <ul style={{ marginLeft: '20px' }}>
        <li>(1) ग्राम पंचायतीचे एकुण उत्पन्न :- <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(2) 15% रक्कम :- <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(3) मागील अनुशेष <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(4) करावयाचा एकुण खर्च <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(5) तपासणीत्या दिनांक पर्यंत झालेला खर्च: <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
        <li>(6) शिल्लक खर्च <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></li>
      </ul>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>(7) सूचना-</h3>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>(11) आर्थिक व्यवहारात निर्देशानुसार आलेल्या नियमबाह्यता -</h3>
        <p>(क) कोणत्याही चालू खरेदी करणाऱ्यापूर्वी अंदाजपत्रकात योग्य तरतूद केली आहे काय ? 
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="budgetProvision" value="होय" disabled={isViewMode} /> होय
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="budgetProvision" value="नाही" disabled={isViewMode} /> नाही
          </label>
        </p>
        <p>(ख) ग्राम पंचायत खरेदीसाठी मान्यता दिली आहे काय ? ठराव क्र.          
          <input type="text" style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /> 
          दि.         
          <input type="date" style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /> 
          / 
        </p>
        <p>(ग) खरेदी करण्यासाठी नियमप्रमाणे दरपत्रके मागविली होती काय ? 
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="tendersCalled" value="होय" disabled={isViewMode} /> होय
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="tendersCalled" value="नाही" disabled={isViewMode} /> नाही
          </label>
        </p>
        <p>(घ) खरेदी केलेल्या साहित्याचा नमुना 9,15 व 16 मधील नोंदवहीत नोंदी घेण्यात आल्या आहेत काय ?</p>
        <p>
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="entriesMade" value="होय" disabled={isViewMode} /> होय
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="entriesMade" value="नाही" disabled={isViewMode} /> नाही
          </label>
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p>(12) ग्राम पंचायताने स्वतःच्या निधीतून किंवा शासकीय/जिल्हा परिषद योजनेंतर्गत हात घेतलेल्या कामांचा तपशील-</p>
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>अ.क्र.</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>योजनेचे नांव</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>कामाचा प्रकार</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>अंदाजित रक्कम</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>मिळालेले अनुदान</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>झालेला खर्च</th>
            </tr>
          </thead>
          <tbody>
            {/* Add rows as needed with inputs */}
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none', textAlign: 'center' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            </tr>
            {/* Repeat for additional rows */}
          </tbody>
        </table>

        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>काम सुरु झाल्याची तारीख</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>काम पूर्ण झाल्याची तारीख</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>प्रगतीवर असलेल्या कामाची सद्य:स्थिती</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>पूर्णत्वाचे प्रमाणपत्र प्राप्त केले किंवा नाही</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>शेरा</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="date" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="date" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <label><input type="radio" name="certificate1" value="होय" disabled={isViewMode} /> होय</label>
                <label style={{ marginLeft: '10px' }}><input type="radio" name="certificate1" value="नाही" disabled={isViewMode} /> नाही</label>
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            </tr>
            {/* Additional rows */}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p>(13) ग्राम पंचायतांनी इतर योजनामध्ये केलेली प्रगती</p>
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>अ.क्र.</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>योजनेचे नाव</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>दिलेली उद्दिष्टे</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>तपासणीच्या दिनांकास</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>शेरा</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>1</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>एगाविका.</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            </tr>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>2</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>बॉयोगॅस</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            </tr>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>3</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>निर्धूर चुल</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            </tr>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>4</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>कुंटुंब कल्याण</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            </tr>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>5</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>अल्पवचत</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            </tr>
            {/* Add rows 6 and 7 as empty */}
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>6</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            </tr>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>7</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>तपासणी अधिकार्‍याचा अभिप्राय</h1>
        <p>1) नमुना - - - - -  अपूर्ण आहेत. <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></p>
        <p>2) - ----- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></p>
        <br />
        <p>3) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></p>
        <p>4) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></p>
        <p>5) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></p>
        <p>6) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></p>
        <p>7) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></p>
        <p>8) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} disabled={isViewMode} /></p>
      </div>

      {/* Photo Upload Section */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          color: '#1f2937', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Camera size={24} />
          फोटो अपलोड करा (Photo Upload)
        </h3>

        {!isViewMode && (
          <div style={{ 
            border: '2px dashed #d1d5db', 
            borderRadius: '8px', 
            padding: '24px', 
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <Camera size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
              ग्रामपंचायत फोटो अपलोड करा
            </h4>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
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
              style={{ display: 'none' }}
            />
            <label
              htmlFor="photo-upload"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: uploadedPhotos.length >= 5 ? '#9ca3af' : '#6366f1',
                color: 'white',
                borderRadius: '8px',
                cursor: uploadedPhotos.length >= 5 ? 'not-allowed' : 'pointer',
                border: 'none',
                fontSize: '16px'
              }}
            >
              <Camera size={20} />
              {uploadedPhotos.length >= 5 ? 'जास्तीत जास्त फोटो पोहोचले' : 'फोटो निवडा'}
            </label>
          </div>
        )}

        {/* Photo Previews */}
        {uploadedPhotos.length > 0 && (
          <div>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#1f2937', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Camera size={20} style={{ color: '#6366f1' }} />
              निवडलेले फोटो ({uploadedPhotos.length}/5)
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              {uploadedPhotos.map((file, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />
                  {!isViewMode && (
                    <button
                      onClick={() => removePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  )}
                  <div style={{ padding: '12px' }}>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#1f2937', 
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div style={{ 
            marginTop: '16px', 
            padding: '16px', 
            backgroundColor: '#dbeafe', 
            border: '1px solid #93c5fd', 
            borderRadius: '8px' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px' 
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e40af' }}>
                फोटो अपलोड करत आहे...
              </span>
              <span style={{ fontSize: '14px', color: '#2563eb' }}>{uploadProgress}%</span>
            </div>
            <div style={{ 
              width: '100%', 
              backgroundColor: '#bfdbfe', 
              borderRadius: '4px', 
              height: '8px' 
            }}>
              <div
                style={{
                  backgroundColor: '#2563eb',
                  height: '8px',
                  borderRadius: '4px',
                  width: `${uploadProgress}%`,
                  transition: 'width 0.3s'
                }}
              />
            </div>
          </div>
        )}

        {/* Display existing photos when viewing */}
        {isViewMode && editingInspection?.fims_inspection_photos && editingInspection.fims_inspection_photos.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: '500', 
              marginBottom: '12px' 
            }}>
              तपासणी फोटो ({editingInspection.fims_inspection_photos.length})
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
                <div
                  key={photo.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.description || `Grampanchayat photo ${index + 1}`}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px' }}>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#1f2937', 
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {photo.photo_name || `Photo ${index + 1}`}
                    </p>
                    {photo.description && (
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {photo.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No photos message for view mode */}
        {isViewMode && (!editingInspection?.fims_inspection_photos || editingInspection.fims_inspection_photos.length === 0) && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
            <Camera size={48} style={{ color: '#d1d5db', margin: '0 auto 8px' }} />
            <p>कोणतेही फोटो सापडले नाहीत</p>
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      {!isViewMode && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isLoading || isUploading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading || isUploading ? 'not-allowed' : 'pointer',
              opacity: isLoading || isUploading ? 0.5 : 1,
              fontSize: '16px'
            }}
          >
            <Save size={20} />
            <span>{isLoading ? 'सेव्ह करत आहे...' : 'मसुदा म्हणून जतन करा'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isLoading || isUploading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading || isUploading ? 'not-allowed' : 'pointer',
              opacity: isLoading || isUploading ? 0.5 : 1,
              fontSize: '16px'
            }}
          >
            <Send size={20} />
            <span>{isLoading ? 'सबमिट करत आहे...' : 'तपासणी सबमिट करा'}</span>
          </button>
        </div>
      )}

      <div>
        <p>प्रतिलिपी:-</p>
        <p>1) मा.मुख्य कार्यकारी अधिकारी जिल्हा परिषद,चंद्रपूर यांना माहितीस सविनय सादर.</p>
        <p>2) गट विकास अधिकारी,पंचायत समिती---------------------यांना माहितीस सादर.</p>
        <p>3) सचिव ग्रामपंचायत---------------------यांना माहितीस व उचित कार्यवाहीस अवगत.</p>
      </div>
    </div>
  );
};

export default InspectionForm;
