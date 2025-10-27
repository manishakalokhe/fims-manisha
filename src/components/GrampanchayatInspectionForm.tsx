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
                        <div style={{ fontFamily: 'Arial, sans-serif', direction: 'ltr', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
          />
          पंचायत समिती - 
          <input 
            type="text" 
            value={psName} 
            onChange={(e) => setPsName(e.target.value)} 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
          />
        </li>
        <li>
          (क) सर्वसाधारण तपासणीची तारीख - 
          <input 
            type="date" 
            value={inspectionDate} 
            onChange={(e) => setInspectionDate(e.target.value)} 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
          />
        </li>
        <li>
          (ख) सर्वसाधारण तपासणीचे ठिकाण :- 
          <input 
            type="text" 
            value={inspectionPlace} 
            onChange={(e) => setInspectionPlace(e.target.value)} 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
          />
        </li>
        <li>
          तपासणी अधिकारीाचे नांव व हुद्दा :- 
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
          सचिवाचे नांव व तो सदस्य पंचायतीत केलेला पासून काम करीत आहे :- 
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
          मासिक सभा नियमांनुसार नियमितपणे होतात काय ? 
          <label style={{ marginLeft: '10px' }}>
            <input 
              type="radio" 
              name="monthlyMeetings" 
              value="होय" 
              checked={monthlyMeetings === 'होय'} 
              onChange={(e) => setMonthlyMeetings(e.target.value)} 
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
              /> 
              नाही
            </label>
          </li>
        </ul>
        <br />
        <br />
      </ol>

      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
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
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>2</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>पाणी पुरवठा</td>
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
            <th colSpan="7" style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>(7) रोकड वहीचा तपशील</th>
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
            /> 
            नाही
          </label>
        </p>
        <p>(ख) मागील फेर आकारणी केलेली झाली ? दिनांक 
          <input type="date" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> 
          / / ठराव क्रमांक - 
          <input 
            type="text" 
            value={resolutionNo} 
            onChange={(e) => setResolutionNo(e.target.value)} 
            style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
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
            /> 
            नाही
          </label>
        </p>
      </div>

      <h3 style={{ color: '#333', marginBottom: '10px' }}>(9) तपासणी तारखेस कर वसुलीची प्रगती खालीलप्रमाणे आहे :-</h3>
      <ul style={{ marginLeft: '20px' }}>
        <li>(1) मागील येणे रक्कम :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(2) चालू वर्षात मागणी :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(3) एकुण मागणी :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(4) एकुण वसूली :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(5) शिल्लक वसूली :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(6) टक्केवारी :- गृहकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> पाणीकर- <input type="number" style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(7) शेरा :- <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
      </ul>

      <h3 style={{ color: '#333', marginBottom: '10px' }}>(10) मागास वर्गीयाकरीता राखून ठेवलेल्या 15% निधीच्या खर्चाचा तपशील:-</h3>
      <ul style={{ marginLeft: '20px' }}>
        <li>(1) ग्राम पंचायतीचे एकुण उत्पन्न :- <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(2) 15% रक्कम :- <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(3) मागील अनुशेष <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(4) करावयाचा एकुण खर्च <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(5) तपासणीत्या दिनांक पर्यंत झालेला खर्च: <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
        <li>(6) शिल्लक खर्च <input type="number" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></li>
      </ul>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>(7) सूचना-</h3>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>(11) आर्थिक व्यवहारात निर्देशानुसार आलेल्या नियमबाह्यता -</h3>
        <p>(क) कोणत्याही चालू खरेदी करणाऱ्यापूर्वी अंदाजपत्रकात योग्य तरतूद केली आहे काय ? 
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="budgetProvision" value="होय" /> होय
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="budgetProvision" value="नाही" /> नाही
          </label>
        </p>
        <p>(ख) ग्राम पंचायत खरेदीसाठी मान्यता दिली आहे काय ? ठराव क्र.          
          <input type="text" style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> 
          दि.         
          <input type="date" style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} /> 
          / 
        </p>
        <p>(ग) खरेदी करण्यासाठी नियमप्रमाणे दरपत्रके मागविली होती काय ? 
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="tendersCalled" value="होय" /> होय
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="tendersCalled" value="नाही" /> नाही
          </label>
        </p>
        <p>(घ) खरेदी केलेल्या साहित्याचा नमुना 9,15 व 16 मधील नोंदवहीत नोंदी घेण्यात आल्या आहेत काय ?</p>
        <p>
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="entriesMade" value="होय" /> होय
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input type="radio" name="entriesMade" value="नाही" /> नाही
          </label>
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p>(12) ग्राम पंचायताने स्वतःच्या निधीतून किंवा शासकीय/जिल्हा परिषद योजनेंतर्गत हात घेतलेल्या कामांचा तपशील-</p>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>काम सुरु झाल्याची तारीख</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>काम पूर्ण झाल्याची तारीख</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>प्रगतीवर असलेल्या कामाची सद्य:स्थिती</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>पूर्णत्वाचे प्रमाणपत्र प्राप्त केले किंवा नाही</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>शेरा</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="date" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="date" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <label><input type="radio" name="certificate1" value="होय" /> होय</label>
                <label style={{ marginLeft: '10px' }}><input type="radio" name="certificate1" value="नाही" /> नाही</label>
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            </tr>
            {/* Additional rows */}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p>(13) ग्राम पंचायतांनी इतर योजनामध्ये केलेली प्रगती</p>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            </tr>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>2</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>बॉयोगॅस</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            </tr>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>3</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>निर्धूर चुल</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            </tr>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>4</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>कुंटुंब कल्याण</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            </tr>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>5</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>अल्पवचत</td>
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
            <th colSpan="6" style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>(14) 14 वा वित्त आयोगामधून हाती घेतलेली कामे व त्याची प्रगती .</th>
          </tr>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>अ. क्र.</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>योजनेचे नाव</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>कामाचा प्रकार</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>अंदाजित रक्कम</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>मिळालेले अनुदान</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>झालेला खर्च</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>1</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>14 वा वित्त आयोग</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>एल.ई.डी.लाईट खरेदी</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>2</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>कचरा कुंडी</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>3</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>फर्निचर</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>4</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>टि.व्हि.संच खरेदी</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>5</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>आपले सरकार सेवा केंद्र खर्च</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>6</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>वाटर मिटर</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>7</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>सीसीरोड</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>8</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>आपले सरकार सेवा केंद्र खर्च</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>9</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>फॉगिंग मशीन</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>10</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>ग्रांपभवन</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
          <tr>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>11</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>कंप्युटर</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="text" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><input type="number" style={{ width: '100%', border: 'none' }} /></td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>तपासणी अधिकार्‍याचा अभिप्राय</h1>
        <p>1) नमुना - - - - -  अपूर्ण आहेत. <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></p>
        <p>2) - ----- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></p>
        <br />
        <p>3) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></p>
        <p>4) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></p>
        <p>5) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></p>
        <p>6) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></p>
        <p>7) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></p>
        <p>8) --- . <input type="text" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} /></p>
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
