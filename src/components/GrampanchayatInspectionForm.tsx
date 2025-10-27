import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera, MapPin, Save, Send, FileText, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from 'supabase/supabase-js';

interface GrampanchayatFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

export const GrampanchayatInspectionForm: React.FC<GrampanchayatFormProps> = ({ 
  user, onBack, categories, onInspectionCreated, editingInspection 
}) => {
  const { t } = useTranslation();
  const isViewMode = editingInspection?.mode === 'view';
  const isEditMode = editingInspection?.mode === 'edit';

  // State for yes/no radio buttons and other inputs
  const [monthlyMeetings, setMonthlyMeetings] = useState<boolean | null>(null);
  const [agendaUpToDate, setAgendaUpToDate] = useState<boolean | null>(null);
  const [receiptUpToDate, setReceiptUpToDate] = useState<boolean | null>(null);
  const [reassessmentDone, setReassessmentDone] = useState<boolean | null>(null);
  const [reassessmentAction, setReassessmentAction] = useState<boolean | null>(null);
  const [budgetProvision, setBudgetProvision] = useState<boolean | null>(null);
  const [tendersCalled, setTendersCalled] = useState<boolean | null>(null);
  const [entriesMade, setEntriesMade] = useState<boolean | null>(null);
  const [certificate1, setCertificate1] = useState<boolean | null>(null);

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
  const [gpCode, setGpCode] = useState('');
  const [villageName, setVillageName] = useState('');
  const [population, setPopulation] = useState('');

  // Additional states for form sections
  const [section1Amount, setSection1Amount] = useState('');
  const [section1Date, setSection1Date] = useState('');
  const [section2Amount, setSection2Amount] = useState('');
  const [section2Date, setSection2Date] = useState('');
  const [section3Amount, setSection3Amount] = useState('');
  const [section3Date, setSection3Date] = useState('');
  const [section4Amount, setSection4Amount] = useState('');
  const [section4Date, setSection4Date] = useState('');
  const [section5Amount, setSection5Amount] = useState('');
  const [section5Date, setSection5Date] = useState('');
  const [section6Amount, setSection6Amount] = useState('');
  const [section6Date, setSection6Date] = useState('');

  // Location and Photo states
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [inspectionData, setInspectionData] = useState({
    categoryid: '',
    locationname: '',
    planneddate: '',
    latitude: null as number | null,
    longitude: null as number | null,
    locationaccuracy: null as number | null,
    locationdetected: ''
  });

  const grampanchayatCategory = categories.find((cat: any) => cat.formtype === 'grampanchayat');

  useEffect(() => {
    if (grampanchayatCategory) {
      setInspectionData(prev => ({ ...prev, categoryid: grampanchayatCategory.id, grampanchayatCategory }));
    }
  }, [grampanchayatCategory]);

  useEffect(() => {
    if (editingInspection) {
      editingInspection.id;
      setInspectionData({
        categoryid: editingInspection.categoryid,
        locationname: editingInspection.locationname,
        planneddate: editingInspection.planneddate ? editingInspection.planneddate.split('T')[0] : '',
        latitude: editingInspection.latitude,
        longitude: editingInspection.longitude,
        locationaccuracy: editingInspection.locationaccuracy,
        locationdetected: editingInspection.locationdetected
      });
      const formData = editingInspection.formdata;
      if (formData) {
        setMonthlyMeetings(formData.monthlyMeetings);
        setAgendaUpToDate(formData.agendaUpToDate);
        setReceiptUpToDate(formData.receiptUpToDate);
        setReassessmentDone(formData.reassessmentDone);
        setReassessmentAction(formData.reassessmentAction);
        setBudgetProvision(formData.budgetProvision);
        setTendersCalled(formData.tendersCalled);
        setEntriesMade(formData.entriesMade);
        setCertificate1(formData.certificate1);
        setGpName(formData.gpName);
        setPsName(formData.psName);
        setInspectionDate(formData.inspectionDate);
        setInspectionPlace(formData.inspectionPlace);
        setOfficerName(formData.officerName);
        setOfficerPost(formData.officerPost);
        setSecretaryName(formData.secretaryName);
        setSecretaryTenure(formData.secretaryTenure);
        setResolutionNo(formData.resolutionNo);
        setResolutionDate(formData.resolutionDate);
        setGpCode(formData.gpCode || '');
        setVillageName(formData.villageName || '');
        setPopulation(formData.population || '');
        // Set other form section states
        setSection1Amount(formData.section1Amount || '');
        setSection1Date(formData.section1Date || '');
        // ... continue for all sections
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

        setInspectionData(prev => ({ ...prev, latitude: lat, longitude: lng, locationaccuracy: accuracy, locationdetected: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}` }));
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        alert('Error getting location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
    if (!gpName.trim()) {
      alert('Please enter Gram Panchayat name');
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
        budgetProvision,
        tendersCalled,
        entriesMade,
        certificate1,
        gpName,
        psName,
        inspectionDate,
        inspectionPlace,
        officerName,
        officerPost,
        secretaryName,
        secretaryTenure,
        resolutionNo,
        resolutionDate,
        gpCode,
        villageName,
        population,
        section1Amount,
        section1Date,
        section2Amount,
        section2Date,
        // ... include all section states
      };

      const sanitizedInspectionData = {
        ...inspectionData,
        planneddate: inspectionData.planneddate ? new Date(inspectionData.planneddate).toISOString().split('T')[0] : null
      };

      let inspectionResult;
      if (editingInspection && editingInspection.id) {
        // Update existing inspection
        const { data: updateResult, error: updateError } = await supabase
          .from('fims_inspections')
          .update({
            locationname: sanitizedInspectionData.locationname || gpName,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            locationaccuracy: sanitizedInspectionData.locationaccuracy,
            locationdetected: sanitizedInspectionData.locationdetected,
            planneddate: sanitizedInspectionData.planneddate,
            inspectiondate: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            formdata: formData
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
            inspectionnumber: inspectionNumber,
            categoryid: categoryId,
            inspectorid: user.id,
            locationname: sanitizedInspectionData.locationname || gpName,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            locationaccuracy: sanitizedInspectionData.locationaccuracy,
            locationdetected: sanitizedInspectionData.locationdetected,
            planneddate: sanitizedInspectionData.planneddate,
            inspectiondate: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            formdata: formData
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
            const fileName = `grampanchayat-${inspectionResult.id}-${Date.now()}-${i}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
              .from('field-visit-images')
              .upload(fileName, file);

            if (uploadError) {
              console.error('Photo upload error:', uploadError);
              // Continue with other photos
            } else {
              const { data } = supabase.storage
                .from('field-visit-images')
                .getPublicUrl(fileName);

              const { error: dbError } = await supabase
                .from('fims_inspection_photos')
                .insert({
                  inspectionid: inspectionResult.id,
                  photourl: data.publicUrl,
                  photoname: file.name,
                  description: `Gram Panchayat inspection photo ${i + 1}`,
                  photoorder: i + 1
                });

              if (dbError) throw dbError;
            }
          }
        } catch (photoError) {
          console.error('Error uploading photos:', photoError);
        }
      }

      const message = isDraft
        ? editingInspection?.id
          ? `Inspection ${editingInspection.id} updated as draft`
          : 'Inspection saved as draft'
        : editingInspection?.id
        ? 'Inspection updated successfully'
        : 'Inspection submitted successfully';

      alert(message);
      onInspectionCreated();
      onBack();
    } catch (error: any) {
      console.error('Error saving inspection:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic Information Section (complete with all form content)
  const renderBasicInformation = () => (
    <div style={{ fontFamily: 'Arial, sans-serif', direction: 'ltr', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>ग्रामपंचायतीसाठी मूलभूत माहिती</h1>
      <p style={{ textAlign: 'center', fontWeight: 'bold' }}>ग्रामपंचायतीची नाव आणि इतर माहिती</p>
      
      {/* Section 1 - Basic Details */}
      <ol style={{ marginLeft: '20px' }}>
        <li>
          - ग्रामपंचायतीचे नाव{' '}
          <input
            type="text"
            value={gpName}
            onChange={(e) => setGpName(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </li>
        <li>
          - पंचायत समिती{' '}
          <input
            type="text"
            value={psName}
            onChange={(e) => setPsName(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </li>
        <li>
          - ग्रामपंचायत कोड{' '}
          <input
            type="text"
            value={gpCode}
            onChange={(e) => setGpCode(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </li>
        <li>
          - गावाचे नाव{' '}
          <input
            type="text"
            value={villageName}
            onChange={(e) => setVillageName(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </li>
        <li>
          - लोकसंख्या{' '}
          <input
            type="number"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </li>
        <li>
          - तपासणीची तारीख{' '}
          <input
            type="date"
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </li>
        <li>
          - तपासणीचे ठिकाण{' '}
          <input
            type="text"
            value={inspectionPlace}
            onChange={(e) => setInspectionPlace(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </li>
        <li>
          - अधिकाऱ्याचे नाव{' '}
          <input
            type="text"
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />{' '}
          पद{' '}
          <input
            type="text"
            value={officerPost}
            onChange={(e) => setOfficerPost(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </li>
        <li>
          - सचिवाचे नाव{' '}
          <input
            type="text"
            value={secretaryName}
            onChange={(e) => setSecretaryName(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />{' '}
          कालावधी{' '}
          <input
            type="text"
            value={secretaryTenure}
            onChange={(e) => setSecretaryTenure(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </li>
      </ol>

      <br />
      <br />

      {/* Section: Monthly Meetings */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>मासिक सभा / Monthly Meetings</h3>
        <p style={{ textAlign: 'center', fontWeight: 'bold' }}>सभांची माहिती</p>
        <ol style={{ marginLeft: '20px' }}>
          <li>
            ? मासिक सभा होतात का?{' '}
            <label style={{ marginLeft: '10px' }}>
              <input
                type="radio"
                name="monthlyMeetings"
                value="yes"
                checked={monthlyMeetings === true}
                onChange={(e) => setMonthlyMeetings(e.target.value === 'yes')}
                disabled={isViewMode}
              />{' '}
              हो
            </label>{' '}
            <label style={{ marginLeft: '10px' }}>
              <input
                type="radio"
                name="monthlyMeetings"
                value="no"
                checked={monthlyMeetings === false}
                onChange={(e) => setMonthlyMeetings(e.target.value === 'no')}
                disabled={isViewMode}
              />{' '}
              नाही
            </label>
          </li>
          <ul style={{ marginLeft: '20px' }}>
            <li>
              ? परिपत्रक वेळेवर{' '}
              <label style={{ marginLeft: '10px' }}>
                <input
                  type="radio"
                  name="agendaUpToDate"
                  value="yes"
                  checked={agendaUpToDate === true}
                  onChange={(e) => setAgendaUpToDate(e.target.value === 'yes')}
                  disabled={isViewMode}
                />{' '}
                हो
              </label>{' '}
              <label style={{ marginLeft: '10px' }}>
                <input
                  type="radio"
                  name="agendaUpToDate"
                  value="no"
                  checked={agendaUpToDate === false}
                  onChange={(e) => setAgendaUpToDate(e.target.value === 'no')}
                  disabled={isViewMode}
                />{' '}
                नाही
              </label>
            </li>
            <li>
              ? सभेची नोंद वेळेवर{' '}
              <label style={{ marginLeft: '10px' }}>
                <input
                  type="radio"
                  name="minutesUpToDate"
                  value="yes"
                  onChange={(e) => {}}
                  disabled={isViewMode}
                />{' '}
                हो
              </label>{' '}
              <label style={{ marginLeft: '10px' }}>
                <input
                  type="radio"
                  name="minutesUpToDate"
                  value="no"
                  onChange={(e) => {}}
                  disabled={isViewMode}
                />{' '}
                नाही
              </label>
            </li>
          </ul>
        </ol>
      </div>

      {/* Table 1 - Section 6 */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>विभाग ६ - निधी वाटप / Section 6 - Fund Allocation</h3>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>क्रमांक / Sr. No.</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>निधी प्रकार / Fund Type</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>मंजूर रक्कम / Approved Amount</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>वाटप केलेली रक्कम / Allocated Amount</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>खर्च / Expenditure</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>तारीख / Date</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }} colSpan={2}>टिप्पणी / Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>1</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>ग्रामपंचायत निधी</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input 
                  type="text" 
                  style={{ width: '100%', border: 'none' }} 
                  value={section1Amount}
                  onChange={(e) => setSection1Amount(e.target.value)}
                  disabled={isViewMode}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input 
                  type="text" 
                  style={{ width: '100%', border: 'none' }} 
                  disabled={isViewMode}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input 
                  type="number" 
                  style={{ width: '100%', border: 'none' }} 
                  disabled={isViewMode}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input 
                  type="date" 
                  style={{ width: '100%', border: 'none' }} 
                  value={section1Date}
                  onChange={(e) => setSection1Date(e.target.value)}
                  disabled={isViewMode}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }} colSpan={2}>
                <input 
                  type="text" 
                  style={{ width: '100%', border: 'none' }} 
                  disabled={isViewMode}
                />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>2</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>विकास निधी</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input 
                  type="text" 
                  style={{ width: '100%', border: 'none' }} 
                  disabled={isViewMode}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input 
                  type="text" 
                  style={{ width: '100%', border: 'none' }} 
                  disabled={isViewMode}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input 
                  type="number" 
                  style={{ width: '100%', border: 'none' }} 
                  disabled={isViewMode}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input 
                  type="date" 
                  style={{ width: '100%', border: 'none' }} 
                  disabled={isViewMode}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }} colSpan={2}>
                <input 
                  type="text" 
                  style={{ width: '100%', border: 'none' }} 
                  disabled={isViewMode}
                />
              </td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>

      {/* Section 8 - Resolution Details */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>विभाग ८ - ठराव माहिती / Section 8 - Resolution Information</h3>
        <p>1. 9-</p>
        <p>
          2. 10- ?{' '}
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="receiptUpToDate"
              value="yes"
              checked={receiptUpToDate === true}
              onChange={(e) => setReceiptUpToDate(e.target.value === 'yes')}
              disabled={isViewMode}
            />{' '}
            हो
          </label>{' '}
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="receiptUpToDate"
              value="no"
              checked={receiptUpToDate === false}
              onChange={(e) => setReceiptUpToDate(e.target.value === 'no')}
              disabled={isViewMode}
            />{' '}
            नाही
          </label>
        </p>
        <p>
          <input
            type="date"
            value={resolutionDate}
            onChange={(e) => setResolutionDate(e.target.value)}
            style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={isViewMode}
          />{' '}
          <input
            type="text"
            value={resolutionNo}
            onChange={(e) => setResolutionNo(e.target.value)}
            placeholder="ठराव क्रमांक"
            style={{ marginLeft: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={isViewMode}
          />
        </p>
        <p>
          <p>, ?</p>
          <p>
            <label style={{ marginLeft: '10px' }}>
              <input
                type="radio"
                name="reassessmentAction"
                value="yes"
                checked={reassessmentAction === true}
                onChange={(e) => setReassessmentAction(e.target.value === 'yes')}
                disabled={isViewMode}
              />
              हो
            </label>{' '}
            <label style={{ marginLeft: '10px' }}>
              <input
                type="radio"
                name="reassessmentAction"
                value="no"
                checked={reassessmentAction === false}
                onChange={(e) => setReassessmentAction(e.target.value === 'no')}
                disabled={isViewMode}
              />
              नाही
            </label>
          </p>
        </p>
      </div>

      {/* Section 9 - Staff Information */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>विभाग ९ - कर्मचारी माहिती / Section 9 - Staff Information</h3>
        <ul style={{ marginLeft: '20px' }}>
          <li>1 - कर्मचारी संख्या{' '}
            <input 
              type="number" 
              style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />{' '}
            रिक्त पदे{' '}
            <input 
              type="number" 
              style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          <li>2 - तांत्रिक कर्मचारी संख्या{' '}
            <input 
              type="number" 
              style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />{' '}
            रिक्त{' '}
            <input 
              type="number" 
              style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          <li>3 - प्रशिक्षण घेतलेले कर्मचारी{' '}
            <input 
              type="number" 
              style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          {/* Continue with sections 4-7 */}
          <li>4 - संगणक प्रशिक्षण{' '}
            <input 
              type="text" 
              style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          <li>5 - वार्षिक आरोग्य तपासणी{' '}
            <input 
              type="number" 
              style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          <li>6 - विमा कव्हरेज{' '}
            <input 
              type="number" 
              style={{ margin: '0 5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          <li>7 - हजेरी नोंद{' '}
            <input 
              type="text" 
              style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
        </ul>
      </div>

      {/* Section 10 - Development Works */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>विभाग १० - विकासकामे / Section 10 - Development Works</h3>
        <ul style={{ marginLeft: '20px' }}>
          <li>1 - पूर्ण झालेले कामे{' '}
            <input 
              type="number" 
              style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          <li>2 - 15% पूर्ण{' '}
            <input 
              type="number" 
              style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          <li>3 - प्रगतपथावर{' '}
            <input 
              type="number" 
              style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          <li>4 - मागील वर्षातील अपूर्ण{' '}
            <input 
              type="number" 
              style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          <li>5 - विलंबित कामे{' '}
            <input 
              type="number" 
              style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
          <li>6 - दर्जा प्रमाणपत्र{' '}
            <input 
              type="number" 
              style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
              disabled={isViewMode}
            />
          </li>
        </ul>
      </div>

      {/* Section 11 - Financial Management */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>विभाग ७ - आर्थिक व्यवस्थापन / Section 7 - Financial Management</h3>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>विभाग ११ - बजेट माहिती / Section 11 - Budget Information</h3>
        <p>? बजेट प्रावधान आहे का?{' '}
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="budgetProvision"
              value="yes"
              checked={budgetProvision === true}
              onChange={(e) => setBudgetProvision(e.target.value === 'yes')}
              disabled={isViewMode}
            />
            हो
          </label>{' '}
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="budgetProvision"
              value="no"
              checked={budgetProvision === false}
              onChange={(e) => setBudgetProvision(e.target.value === 'no')}
              disabled={isViewMode}
            />
            नाही
          </label>
        </p>
        <p>? बजेट मंजूर झाले?{' '}
          <input 
            type="text" 
            style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />{' '}
          <input 
            type="date" 
            style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </p>
        <p>? टेंडर बोलावले?{' '}
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="tendersCalled"
              value="yes"
              checked={tendersCalled === true}
              onChange={(e) => setTendersCalled(e.target.value === 'yes')}
              disabled={isViewMode}
            />
            हो
          </label>{' '}
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="tendersCalled"
              value="no"
              checked={tendersCalled === false}
              onChange={(e) => setTendersCalled(e.target.value === 'no')}
              disabled={isViewMode}
            />
            नाही
          </label>
        </p>
        <p>9,15 16 ?{' '}
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="entriesMade"
              value="yes"
              checked={entriesMade === true}
              onChange={(e) => setEntriesMade(e.target.value === 'yes')}
              disabled={isViewMode}
            />
            हो
          </label>{' '}
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="entriesMade"
              value="no"
              checked={entriesMade === false}
              onChange={(e) => setEntriesMade(e.target.value === 'no')}
              disabled={isViewMode}
            />
            नाही
          </label>
        </p>
      </div>

      {/* Table 2 - Section 12 - Work Progress */}
      <div style={{ marginBottom: '20px' }}>
        <p>विभाग १२ - कामाची प्रगती / Section 12 - Work Progress</p>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>क्रमांक</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>कामाचे नाव</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>अंदाजे खर्च</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>मंजूर रक्कम</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>खर्च झालेली रक्कम</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>प्रगती %</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>तारीख</th>
            </tr>
          </thead>
          <tbody>
            {/* Add dynamic rows as needed */}
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                <input type="text" style={{ width: '100%', border: 'none', textAlign: 'center' }} disabled={isViewMode} />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input type="number" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input type="number" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input type="number" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input type="date" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
              </td>
            </tr>
            {/* More rows can be added */}
          </tbody>
        </table>
      </div>

      {/* Table 3 - Section 13 - Certificates */}
      <div style={{ marginBottom: '20px' }}>
        <p>विभाग १३ - प्रमाणपत्रे / Section 13 - Certificates</p>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>क्रमांक</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>प्रमाणपत्र प्रकार</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>तारीख</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>स्थिती</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>टिप्पणी</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>1</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>वित्तीय ऑडिट</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input type="date" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <label>
                  <input type="radio" name="certificate1" value="yes" checked={certificate1 === true} onChange={(e) => setCertificate1(e.target.value === 'yes')} disabled={isViewMode} />
                  हो
                </label>{' '}
                <label style={{ marginLeft: '10px' }}>
                  <input type="radio" name="certificate1" value="no" checked={certificate1 === false} onChange={(e) => setCertificate1(e.target.value === 'no')} disabled={isViewMode} />
                  नाही
                </label>
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
              </td>
            </tr>
            {/* Add more certificate rows */}
          </tbody>
        </table>
      </div>

      {/* Section 14 - Assets Table */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>विभाग १४ - मालमत्ता नोंद / Section 14 - Asset Register</h3>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th colSpan={6} style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>१४ १४ .</th>
            </tr>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>क्रमांक</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>मालमत्ता वर्णन</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>खरेदी वर्ष</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>खरेदी किंमत</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>सध्याची किंमत</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>स्थिती</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((row, index) => (
              <tr key={index}>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{row}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {row === 1 ? 'भूमी' : row === 2 ? 'इमारत' : row === 3 ? 'वाहन' : row === 4 ? 'संगणक' : row === 5 ? 'फर्निचर' : row === 6 ? 'ऑफिस उपकरणे' : row === 7 ? 'वाहतूक उपकरणे' : row === 8 ? 'कृषी उपकरणे' : row === 9 ? 'पाणीपुरवठा उपकरणे' : row === 10 ? 'स्वच्छता उपकरणे' : 'इतर'}
                  <input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <input type="number" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <input type="number" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <input type="number" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <input type="text" style={{ width: '100%', border: 'none' }} disabled={isViewMode} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Final Sections */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>अंतिम माहिती / Final Information</h1>
        <p>1 - - - - -{' '}
          <input 
            type="text" 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </p>
        <p>2 - -----{' '}
          <input 
            type="text" 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </p>
        <br />
        <p>3 ---{' '}
          <input 
            type="text" 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </p>
        <p>4 ---{' '}
          <input 
            type="text" 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </p>
        <p>5 ---{' '}
          <input 
            type="text" 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </p>
        <p>6 ---{' '}
          <input 
            type="text" 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </p>
        <p>7 ---{' '}
          <input 
            type="text" 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </p>
        <p>8 ---{' '}
          <input 
            type="text" 
            style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
            disabled={isViewMode}
          />
        </p>
      </div>
    </div>
  );

  // Location Information Section (from Anganwadi design)
  const renderLocationSection = () => (
    <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
        <div className="flex items-center text-white">
          <MapPin className="w-8 h-8 mr-4" />
          <h3 className="text-2xl font-bold">स्थानिक माहिती / Location Information</h3>
        </div>
      </div>
      <div className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.locationName')}</label>
            <input
              type="text"
              value={inspectionData.locationname || gpName}
              onChange={(e) => setInspectionData(prev => ({ ...prev, locationname: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 disabled:opacity-50"
              placeholder={t('fims.enterLocationName')}
              required
              disabled={isViewMode}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.plannedDate')}</label>
            <input
              type="date"
              value={inspectionData.planneddate}
              onChange={(e) => setInspectionData(prev => ({ ...prev, planneddate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              disabled={isViewMode}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">GPS स्थान</label>
            {!isViewMode && (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>{isGettingLocation ? t('fims.gettingLocation') : t('fims.getCurrentLocation')}</span>
              </button>
            )}
            {inspectionData.latitude && inspectionData.longitude && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">{t('fims.locationCaptured')}</p>
                <p className="text-xs text-green-600">
                  {t('fims.latitude')}: {inspectionData.latitude?.toFixed(6)}<br />
                  {t('fims.longitude')}: {inspectionData.longitude?.toFixed(6)}<br />
                  {t('fims.accuracy')}: {inspectionData.locationaccuracy ? Math.round(inspectionData.locationaccuracy) + ' m' : 'NA'}
                </p>
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">स्थान ओळखले गेले</label>
            <input
              type="text"
              value={inspectionData.locationdetected}
              onChange={(e) => setInspectionData(prev => ({ ...prev, locationdetected: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs placeholder-gray-500"
              placeholder="GPS"
              readOnly={isViewMode}
            />
          </div>
        </div>
      </div>
    </section>
  );

  // Photo Upload Section (from Anganwadi design)
  const renderPhotoUploadSection = () => (
    <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
        <div className="flex items-center text-white">
          <Camera className="w-8 h-8 mr-4" />
          <h3 className="text-2xl font-bold">छायाचित्र अपलोड / Photo Upload</h3>
        </div>
      </div>
      <div className="p-10">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">फोटो अपलोड क्षेत्र</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors duration-200">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">छायाचित्रे निवडा</h4>
            <p className="text-gray-600 mb-4">
              {uploadedPhotos.length === 0 ? 'अपलोड करण्यासाठी फोटो निवडा' : uploadedPhotos.length < 5 ? `${uploadedPhotos.length}/5` : '5/5'}
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isViewMode}
              className="mb-4"
            />
            {!isViewMode && uploadedPhotos.length < 5 && (
              <label
                htmlFor="photo-upload"
                className="inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                फोटो निवडा / Select Photos
              </label>
            )}
            <input id="photo-upload" type="file" multiple accept="image/*" onChange={handlePhotoUpload} disabled={isViewMode} style={{ display: 'none' }} />
          </div>

          {/* Photo Previews */}
          {uploadedPhotos.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-purple-600" />
                {uploadedPhotos.length} फोटो निवडले गेले / Selected Photos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedPhotos.map((file, index) => (
                  <div key={index} className="relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    {!isViewMode && (
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-colors duration-200"
                      >
                        <span className="text-sm font-bold">×</span>
                      </button>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-800 truncate mb-1">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">अपलोड होत आहे / Uploading...</span>
                <span className="text-sm text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Display existing photos when viewing */}
          {isViewMode && editingInspection?.fims_inspection_photos && editingInspection.fims_inspection_photos.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                {editingInspection.fims_inspection_photos.length} फोटो उपलब्ध / Available Photos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
                  <div key={photo.id} className="relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <img
                      src={photo.photourl}
                      alt={`${photo.description} Gram Panchayat photo ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-800 truncate mb-1">
                        Photo {index + 1}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{photo.photoname}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No photos message for view mode */}
          {isViewMode && (!editingInspection?.fims_inspection_photos || editingInspection.fims_inspection_photos.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Camera className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p>कोणतेही फोटो उपलब्ध नाहीत / No photos available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );

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
              <span>मागे / Back</span>
            </button>
          </div>
          <div className="w-20"></div>
          <div>
            <p className="text-sm md:text-base text-gray-600 text-center">
              ग्रामपंचायत तपासणी फॉर्म / Grampanchayat Inspection Form
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-8">
          {/* Basic Information - Complete */}
          {renderBasicInformation()}
          
          {/* Location Section - Added after Basic Information */}
          {renderLocationSection()}

          {/* Photo Upload Section */}
          {renderPhotoUploadSection()}

          {/* Submit Buttons */}
          {!isViewMode && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'साठवत आहे...' : 'ड्राफ्ट म्हणून साठवा / Save as Draft'}
                <Save className="h-5 w-5 inline ml-2" />
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'सबमिट करत आहे...' : 'सबमिट करा / Submit'}
                <Send className="h-5 w-5 inline ml-2" />
              </button>
            </div>
          )}

          {isViewMode && (
            <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
              <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-700">हा दृश्य मोड आहे. संपादन करण्यासाठी संपादन मोड वापरा / This is view mode. Use edit mode to make changes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
