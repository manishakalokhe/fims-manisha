import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera, MapPin, Save, Send, FileText } from 'lucide-react';
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

  const grampanchayatCategory = categories.find((cat: any) => cat.formtype === 'Grampanchayat Inspection');

  useEffect(() => {
    if (grampanchayatCategory) {
      setInspectionData(prev => ({
        ...prev,
        categoryid: grampanchayatCategory.id,
        ...grampanchayatCategory
      }));
    }
  }, [grampanchayatCategory]);

  useEffect(() => {
    if (editingInspection) {
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
        setGpCode(formData.gpCode);
        setVillageName(formData.villageName);
        setPopulation(formData.population);

        // Set other form section states
        setSection1Amount(formData.section1Amount || '');
        setSection1Date(formData.section1Date || '');
        setSection2Amount(formData.section2Amount || '');
        setSection2Date(formData.section2Date || '');
        setSection3Amount(formData.section3Amount || '');
        setSection3Date(formData.section3Date || '');
        setSection4Amount(formData.section4Amount || '');
        setSection4Date(formData.section4Date || '');
        setSection5Amount(formData.section5Amount || '');
        setSection5Date(formData.section5Date || '');
        setSection6Amount(formData.section6Amount || '');
        setSection6Date(formData.section6Date || '');
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

        setInspectionData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          locationaccuracy: accuracy,
          locationdetected: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
        }));

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
        section3Amount,
        section3Date,
        section4Amount,
        section4Date,
        section5Amount,
        section5Date,
        section6Amount,
        section6Date
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
          setIsUploading(true);
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
        } finally {
          setIsUploading(false);
        }
      }

      const message = isDraft
        ? editingInspection?.id
          ? `Inspection ${editingInspection.inspectionnumber} updated as draft`
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

  // Header with step indicator
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-3 rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">मागे जा</span>
        </button>
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">ग्रामपंचायत तपासणी</h1>
          <p className="text-sm text-gray-600">ग्रामपंचायत व्यवस्थापन तपासणी फॉर्म</p>
        </div>
        <div className="w-20" />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map(step => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              step <= 1 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
            } border-2 border-emerald-300`}>
              {step}
            </div>
            {step < 3 && <div className={`w-20 h-1 mx-3 ${step < 2 ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
    </div>
  );

  // Yes/No Radio Component
  const YesNoRadio = ({ name, value, onChange, question, disabled }: { 
    name: string, 
    value: boolean | null, 
    onChange: (value: boolean) => void, 
    question: string,
    disabled?: boolean
  }) => (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">{question}</h4>
      <div className="flex items-center justify-center space-x-12">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input 
            type="radio" 
            name={name} 
            checked={value === true}
            onChange={() => onChange(true)}
            disabled={disabled || isViewMode}
            className="w-6 h-6 text-emerald-600 bg-white border-2 border-gray-300 focus:ring-emerald-500 focus:ring-2 rounded-full cursor-pointer group-hover:border-emerald-400 transition-all"
          />
          <span className="text-lg font-medium text-emerald-700 group-hover:text-emerald-800">हो</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input 
            type="radio" 
            name={name} 
            checked={value === false}
            onChange={() => onChange(false)}
            disabled={disabled || isViewMode}
            className="w-6 h-6 text-red-600 bg-white border-2 border-gray-300 focus:ring-red-500 focus:ring-2 rounded-full cursor-pointer group-hover:border-red-400 transition-all"
          />
          <span className="text-lg font-medium text-red-700 group-hover:text-red-800">नाही</span>
        </label>
      </div>
    </div>
  );

  // Basic Information Section
  const renderBasicInformation = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <FileText className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">माहिती (मूलभूत माहिती)</h2>
            <p className="text-emerald-100">ग्रामपंचायतची मूलभूत माहिती</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">ग्रामपंचायतचे नाव <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={gpName}
              onChange={(e) => setGpName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              placeholder="ग्रामपंचायतचे नाव"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">पंचायत समितीचे नाव</label>
            <input
              type="text"
              value={psName}
              onChange={(e) => setPsName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              placeholder="पंचायत समितीचे नाव"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">ग्रामपंचायत क्रमांक</label>
            <input
              type="text"
              value={gpCode}
              onChange={(e) => setGpCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              placeholder="ग्रामपंचायत क्रमांक"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">गावाचे नाव</label>
            <input
              type="text"
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              placeholder="गावाचे नाव"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">लोकसंख्या</label>
            <input
              type="number"
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              placeholder="लोकसंख्या"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">तपासणीची तारीख</label>
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              disabled={isViewMode}
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-3 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">तपासणीचे ठिकाण <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={inspectionPlace}
              onChange={(e) => setInspectionPlace(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              placeholder="तपासणीचे ठिकाण"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">अधिकाऱ्याचे नाव</label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              placeholder="अधिकाऱ्याचे नाव"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">पद</label>
            <input
              type="text"
              value={officerPost}
              onChange={(e) => setOfficerPost(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              placeholder="पद"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">सचिवाचे नाव</label>
            <input
              type="text"
              value={secretaryName}
              onChange={(e) => setSecretaryName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              placeholder="सचिवाचे नाव"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">सचिव कालावधी</label>
            <input
              type="text"
              value={secretaryTenure}
              onChange={(e) => setSecretaryTenure(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
              placeholder="सचिव कालावधी"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>
    </section>
  );

  // Location Section
  const renderLocationSection = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <MapPin className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">स्थान माहिती</h2>
            <p className="text-blue-100">GPS स्थान आणि नियोजन माहिती</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">स्थानाचे नाव <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={inspectionData.locationname || gpName}
              onChange={(e) => setInspectionData(prev => ({ ...prev, locationname: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
              placeholder="स्थानाचे नाव"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">नियोजित तारीख</label>
            <input
              type="date"
              value={inspectionData.planneddate}
              onChange={(e) => setInspectionData(prev => ({ ...prev, planneddate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
              disabled={isViewMode}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">GPS स्थान मिळवा</label>
            {!isViewMode && (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MapPin className="w-5 h-5 mr-2" />
                {isGettingLocation ? 'स्थान शोधत आहे...' : 'सध्याचे स्थान मिळवा'}
              </button>
            )}
            {isViewMode && (
              <div className="w-full p-3 bg-gray-100 rounded-xl text-center text-sm text-gray-600">
                दृश्य मोडमध्ये GPS वापरता येत नाही
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {inspectionData.latitude && inspectionData.longitude && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">स्थान नोंदवले गेले ✅</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-green-700">अक्षांश</div>
                    <div>{inspectionData.latitude?.toFixed(6)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-700">रेखांश</div>
                    <div>{inspectionData.longitude?.toFixed(6)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-700">अचूकता</div>
                    <div>{inspectionData.locationaccuracy ? `${Math.round(inspectionData.locationaccuracy)}m` : 'NA'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">GPS निर्देशांक</label>
            <input
              type="text"
              value={inspectionData.locationdetected}
              onChange={(e) => setInspectionData(prev => ({ ...prev, locationdetected: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm transition-all text-sm"
              placeholder="अक्षांश, रेखांश निर्देशांक"
              readOnly={isViewMode}
            />
          </div>
        </div>
      </div>
    </section>
  );

  // Section 2 - Monthly Meetings
  const renderSection2 = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">मासिक सभा (Section 2)</h2>
            <p className="text-orange-100">ग्रामपंचायत सभा व्यवस्थापन</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <YesNoRadio
          name="monthlyMeetings"
          value={monthlyMeetings}
          onChange={setMonthlyMeetings}
          question="मासिक सभा झाल्या का?"
        />
        
        {monthlyMeetings !== null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <YesNoRadio
              name="agendaUpToDate"
              value={agendaUpToDate}
              onChange={setAgendaUpToDate}
              question="दालन सुची अद्ययावत आहे का?"
              disabled={!monthlyMeetings}
            />
            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">बेत अद्ययावत आहे का?</h4>
              <div className="flex items-center justify-center space-x-12">
                <label className="flex items-center space-x-3 cursor-pointer group opacity-50" title="मासिक सभा झालेल्या नसल्यास उपलब्ध नाही">
                  <input 
                    type="radio" 
                    name="minutesUpToDate" 
                    disabled={!monthlyMeetings || isViewMode}
                    className="w-6 h-6 text-gray-400 border-gray-300 rounded-full cursor-not-allowed"
                  />
                  <span className="text-lg text-gray-500">हो</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group opacity-50" title="मासिक सभा झालेल्या नसल्यास उपलब्ध नाही">
                  <input 
                    type="radio" 
                    name="minutesUpToDate" 
                    disabled={!monthlyMeetings || isViewMode}
                    className="w-6 h-6 text-gray-400 border-gray-300 rounded-full cursor-not-allowed"
                  />
                  <span className="text-lg text-gray-500">नाही</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  // Section 3 - Tax Collection
  const renderSection3 = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <Scale className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">कर संकलन (Section 3)</h2>
            <p className="text-purple-100">कर व्यवस्थापन आणि संकलन</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <YesNoRadio
            name="taxLevy"
            value={null}
            onChange={() => {}}
            question="कर आकारणी केली का?"
            disabled={true}
          />
          
          <div className="p-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">संकलन रक्कम</label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm transition-all"
              placeholder="रक्कम (रुपये)"
              disabled={isViewMode}
            />
          </div>
          
          <YesNoRadio
            name="taxRecords"
            value={null}
            onChange={() => {}}
            question="कर नोंदी ठेवल्या का?"
            disabled={true}
          />
          
          <div className="p-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">कर संकलन प्रमाणपत्र</label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm transition-all" disabled={isViewMode}>
              <option>उपलब्ध</option>
              <option>नाही</option>
              <option>प्रलंबित</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );

  // Section 6 - Fund Allocation Table
  const renderSection6 = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <Utensils className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">निधी वाटप (Section 6)</h2>
            <p className="text-green-100">निधी व्यवस्थापन आणि वाटप</p>
          </div>
        </div>
      </div>
      <div className="p-8 overflow-x-auto">
        <table className="w-full min-w-[800px] bg-white rounded-2xl border border-gray-200">
          <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">अ.क्र.</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">निधी प्रकार</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">मान्य रक्कम</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">वाटप रक्कम</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">खर्च</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">तारीख</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200" colSpan={2}>टिप्पणी</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { num: 1, type: 'राज्य वित्त आयोग', amountState: section1Amount, dateState: section1Date },
              { num: 2, type: 'केंद्रीय वित्त आयोग', amountState: section2Amount, dateState: section2Date },
              { num: 3, type: 'विकास निधी', amountState: section3Amount, dateState: section3Date },
              { num: 4, type: 'स्थानिक निधी', amountState: section4Amount, dateState: section4Date },
              { num: 5, type: 'अन्य निधी', amountState: section5Amount, dateState: section5Date },
              { num: 6, type: 'एकूण', amountState: section6Amount, dateState: section6Date }
            ].map(({ num, type, amountState, dateState }) => {
              const setAmount = (value: string) => {
                switch (num) {
                  case 1: setSection1Amount(value); break;
                  case 2: setSection2Amount(value); break;
                  case 3: setSection3Amount(value); break;
                  case 4: setSection4Amount(value); break;
                  case 5: setSection5Amount(value); break;
                  case 6: setSection6Amount(value); break;
                }
              };
              const setDate = (value: string) => {
                switch (num) {
                  case 1: setSection1Date(value); break;
                  case 2: setSection2Date(value); break;
                  case 3: setSection3Date(value); break;
                  case 4: setSection4Date(value); break;
                  case 5: setSection5Date(value); break;
                  case 6: setSection6Date(value); break;
                }
              };
              
              return (
                <tr key={num} className="hover:bg-green-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200">{num}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-700 border-r border-gray-200">{type}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 border-r border-gray-200 font-mono">₹ 0.00</td>
                  <td className="px-4 py-4 border-r border-gray-200">
                    <input
                      type="text"
                      value={amountState}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white shadow-sm transition-all disabled:bg-gray-100"
                      placeholder="रक्कम"
                      disabled={isViewMode}
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 border-r border-gray-200 font-mono">₹ 0.00</td>
                  <td className="px-4 py-4 border-r border-gray-200">
                    <input
                      type="date"
                      value={dateState}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white shadow-sm transition-all disabled:bg-gray-100"
                      disabled={isViewMode}
                    />
                  </td>
                  <td colSpan={2} className="px-4 py-4">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white shadow-sm transition-all disabled:bg-gray-100"
                      placeholder="टिप्पणी"
                      disabled={isViewMode}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-green-800">एकूण निधी:</span>
            <span className="font-bold text-green-700">₹ {([section1Amount, section2Amount, section3Amount, section4Amount, section5Amount, section6Amount].reduce((sum, amt) => sum + (parseFloat(amt) || 0), 0)).toLocaleString('mr-IN')} /-</span>
          </div>
        </div>
      </div>
    </section>
  );

  // Section 8 - Resolution Details
  const renderSection8 = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">ठराव माहिती (Section 8)</h2>
            <p className="text-indigo-100">ग्रामपंचायत ठराव व्यवस्थापन</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <YesNoRadio
              name="receiptUpToDate"
              value={receiptUpToDate}
              onChange={setReceiptUpToDate}
              question="10 - पावती अद्ययावत आहे का?"
            />
            
            <YesNoRadio
              name="reassessmentDone"
              value={reassessmentDone}
              onChange={setReassessmentDone}
              question="आधिपत्य पुनर्मूल्यांकन केले का?"
            />
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">ठराव माहिती</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ठराव क्र.</label>
                  <input
                    type="text"
                    value={resolutionNo}
                    onChange={(e) => setResolutionNo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="ठराव क्र."
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">तारीख</label>
                  <input
                    type="date"
                    value={resolutionDate}
                    onChange={(e) => setResolutionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
            
            <YesNoRadio
              name="reassessmentAction"
              value={reassessmentAction}
              onChange={setReassessmentAction}
              question="पुनर्मूल्यांकनानुसार कारवाई केली का?"
              disabled={!reassessmentDone}
            />
          </div>
        </div>
      </div>
    </section>
  );

  // Section 9 - Staff Information
  const renderSection9 = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">कर्मचारी माहिती (Section 9)</h2>
            <p className="text-teal-100">ग्रामपंचायत कर्मचारी तपशील</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">1. सरपंच</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="नाव"
                  disabled={isViewMode}
                />
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="कालावधी"
                  disabled={isViewMode}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">2. उप सरपंच</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="नाव"
                  disabled={isViewMode}
                />
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="कालावधी"
                  disabled={isViewMode}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">3. सचिव</h4>
              <input
                type="text"
                value={secretaryName}
                onChange={(e) => setSecretaryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="नाव"
                disabled={isViewMode}
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">4. तलाठी</h4>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="नाव"
                disabled={isViewMode}
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">5. ग्रामसेवक</h4>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="संख्या"
                disabled={isViewMode}
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">6. इतर कर्मचारी</h4>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="संख्या"
                disabled={isViewMode}
              />
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-emerald-800">7. एकूण कर्मचारी</h4>
                  <input
                    type="number"
                    className="w-24 px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold bg-white"
                    placeholder="एकूण"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Section 10 - Development Works
  const renderSection10 = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-rose-600 to-red-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">विकास कामे (Section 10)</h2>
            <p className="text-rose-100">विकास प्रकल्प व्यवस्थापन</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'पूर्ण झालेली कामे', placeholder: 'संख्या' },
            { label: 'प्रगतिपथातील कामे (15%)', placeholder: 'संख्या' },
            { label: 'थांबलेली कामे', placeholder: 'संख्या' },
            { label: 'नवीन प्रस्तावित कामे', placeholder: 'संख्या' },
            { label: 'एकूण कामे', placeholder: 'एकूण' },
            { label: 'खर्च झालेली रक्कम', placeholder: 'रक्कम' }
          ].map((item, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">{item.label}</label>
              <input
                type={item.label.includes('रक्कम') ? 'number' : 'number'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white shadow-sm transition-all text-sm"
                placeholder={item.placeholder}
                disabled={isViewMode}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Section 11 - Financial Management
  const renderSection11 = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-yellow-600 to-amber-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <Scale className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">आर्थिक व्यवस्थापन (Section 11)</h2>
            <p className="text-yellow-100">बजेट आणि टेंडर व्यवस्थापन</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="space-y-6">
          <YesNoRadio
            name="budgetProvision"
            value={budgetProvision}
            onChange={setBudgetProvision}
            question="बजेट प्रावधान आहे का?"
          />
          
          {budgetProvision && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-amber-50 rounded-xl border border-amber-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">एकूण बजेट रक्कम</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-sm"
                  placeholder="रक्कम (रुपये)"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">तारीख</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-sm"
                  disabled={isViewMode}
                />
              </div>
              <div className="flex items-end">
                <span className="text-sm text-gray-600 mr-2">रुपये</span>
              </div>
            </div>
          )}
          
          <YesNoRadio
            name="tendersCalled"
            value={tendersCalled}
            onChange={setTendersCalled}
            question="टेंडर मागवले का?"
          />
          
          <YesNoRadio
            name="entriesMade"
            value={entriesMade}
            onChange={setEntriesMade}
            question="9,15,16 कामांसाठी एंट्री केली का?"
          />
        </div>
      </div>
    </section>
  );

  // Section 12 - Work Progress Table
  const renderSection12 = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">कामाची प्रगती (Section 12)</h2>
            <p className="text-cyan-100">विकास कामांची प्रगती अहवाल</p>
          </div>
        </div>
      </div>
      <div className="p-8 overflow-x-auto">
        <table className="w-full min-w-[1000px] bg-white rounded-2xl border border-gray-200">
          <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">अ.क्र.</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">कामाचे नाव</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">अंदाजे रक्कम</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">खर्च झालेली रक्कम</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">प्रगती %</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">एकूण खर्च</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">उर्वरीत रक्कम</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">तारीख</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }, (_, index) => (
              <tr key={index} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-4 text-sm font-semibold text-gray-900 border-r">{index + 1}</td>
                <td className="px-4 py-4 border-r">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm transition-all"
                    placeholder="कामाचे नाव"
                    disabled={isViewMode}
                  />
                </td>
                <td className="px-4 py-4 border-r">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm transition-all"
                    placeholder="अंदाजे रक्कम"
                    disabled={isViewMode}
                  />
                </td>
                <td className="px-4 py-4 border-r">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm transition-all"
                    placeholder="खर्च"
                    disabled={isViewMode}
                  />
                </td>
                <td className="px-4 py-4 border-r">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm transition-all"
                    placeholder="प्रगती %"
                    disabled={isViewMode}
                    min="0"
                    max="100"
                  />
                </td>
                <td className="px-4 py-4 border-r">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm transition-all"
                    placeholder="एकूण खर्च"
                    disabled={isViewMode}
                  />
                </td>
                <td className="px-4 py-4 border-r">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm transition-all"
                    placeholder="उर्वरीत"
                    disabled={isViewMode}
                  />
                </td>
                <td className="px-4 py-4">
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm transition-all"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  // Section 13 - Certificates
  const renderSection13 = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-lime-600 to-green-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">प्रमाणपत्रे (Section 13)</h2>
            <p className="text-lime-100">आवश्यक प्रमाणपत्रे तपासणी</p>
          </div>
        </div>
      </div>
      <div className="p-8 overflow-x-auto">
        <table className="w-full min-w-[800px] bg-white rounded-2xl border border-gray-200">
          <thead className="bg-gradient-to-r from-lime-50 to-green-50">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">अ.क्र.</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">प्रमाणपत्र प्रकार</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">तारीख</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">उपलब्ध</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">विवरण</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">टिप्पणी</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="hover:bg-green-50 transition-colors">
              <td className="px-4 py-4 text-sm font-semibold text-gray-900 border-r">1</td>
              <td className="px-4 py-4 text-sm font-medium text-gray-700 border-r">आर्थिक प्रमाणपत्र</td>
              <td className="px-4 py-4 border-r">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 text-sm bg-white"
                  disabled={isViewMode}
                />
              </td>
              <td className="px-4 py-4 border-r">
                <YesNoRadio
                  name="certificate1"
                  value={certificate1}
                  onChange={setCertificate1}
                  question=""
                  disabled={isViewMode}
                />
              </td>
              <td className="px-4 py-4 border-r">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 text-sm bg-white"
                  placeholder="विवरण"
                  disabled={isViewMode}
                />
              </td>
              <td className="px-4 py-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 text-sm bg-white"
                  placeholder="टिप्पणी"
                  disabled={isViewMode}
                />
              </td>
            </tr>
            
            <tr className="hover:bg-green-50 transition-colors">
              <td className="px-4 py-4 text-sm font-semibold text-gray-900 border-r">2</td>
              <td className="px-4 py-4 text-sm font-medium text-gray-700 border-r">कर संकलन प्रमाणपत्र</td>
              <td className="px-4 py-4 border-r">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 text-sm bg-white"
                  disabled={isViewMode}
                />
              </td>
              <td className="px-4 py-4 border-r">
                <div className="flex justify-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" className="w-5 h-5 text-lime-600" disabled={isViewMode} />
                    <span className="text-sm">हो</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" className="w-5 h-5 text-red-600" disabled={isViewMode} />
                    <span className="text-sm">नाही</span>
                  </label>
                </div>
              </td>
              <td className="px-4 py-4 border-r">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 text-sm bg-white"
                  disabled={isViewMode}
                />
              </td>
              <td className="px-4 py-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 text-sm bg-white"
                  disabled={isViewMode}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );

  // Photo Upload Section
  const renderPhotoUploadSection = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <Camera className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">छायाचित्र अपलोड</h2>
            <p className="text-purple-100">तपासणी प्रमाणपत्रांसाठी फोटो</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="border-2 border-dashed border-purple-300 rounded-2xl p-10 text-center hover:border-purple-400 transition-colors bg-gradient-to-b from-purple-50 to-white">
          <Camera className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">तपासणी छायाचित्र अपलोड करा</h3>
          <p className="text-gray-600 mb-6">
            कमाल 5 छायाचित्रे अपलोड करू शकता (JPG, PNG फॉरमॅट)
          </p>
          
          {!isViewMode && uploadedPhotos.length < 5 && (
            <>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold cursor-pointer shadow-lg transition-all">
                <Camera className="w-4 h-4 mr-2" />
                छायाचित्र निवडा ({uploadedPhotos.length}/5)
              </label>
            </>
          )}
          
          {isViewMode && (
            <div className="text-gray-500 text-sm">
              दृश्य मोडमध्ये छायाचित्र अपलोड करता येत नाही
            </div>
          )}
        </div>
        
        {uploadedPhotos.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">अपलोड केलेली छायाचित्रे ({uploadedPhotos.length}/5)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedPhotos.map((file, index) => (
                <div key={index} className="relative bg-white rounded-xl shadow-md border overflow-hidden group hover:shadow-lg transition-shadow">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  {!isViewMode && (
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  )}
                  <div className="p-3 bg-gray-50">
                    <p className="text-xs text-gray-600 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {isUploading && (
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-800">छायाचित्र अपलोड होत आहे...</span>
              <span className="text-sm text-purple-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        
        {isViewMode && editingInspection?.fims_inspection_photos?.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">उपलब्ध छायाचित्रे ({editingInspection.fims_inspection_photos.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
                <div key={photo.id} className="bg-white rounded-xl shadow-md border overflow-hidden">
                  <img
                    src={photo.photourl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3 bg-gray-50">
                    <p className="text-xs text-gray-600 truncate">{photo.photoname || `छायाचित्र ${index + 1}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );

  // Final Information Section
  const renderFinalInformation = () => (
    <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-8 text-white">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mr-6">
            <FileText className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">अंतिम माहिती</h2>
            <p className="text-gray-300">तपासणी अहवाल पूर्ण करा</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="space-y-6 text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 text-left">तपासणी अधिकाऱ्याचे नाव</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white shadow-sm transition-all text-left"
                disabled={isViewMode}
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 text-left">पद</label>
              <input
                type="text"
                value={officerPost}
                onChange={(e) => setOfficerPost(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white shadow-sm transition-all text-left"
                disabled={isViewMode}
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 text-left">तारीख</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white shadow-sm transition-all text-left"
                disabled={isViewMode}
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 text-left">ठिकाण</label>
              <input
                type="text"
                value={inspectionPlace}
                onChange={(e) => setInspectionPlace(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white shadow-sm transition-all text-left"
                disabled={isViewMode}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 text-left">सुधारणा</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white shadow-sm transition-all resize-none"
                placeholder="सुधारणांसाठी शिफारशी"
                disabled={isViewMode}
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 text-left">पुढील पावले</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white shadow-sm transition-all resize-none"
                placeholder="पुढील कृती योजना"
                disabled={isViewMode}
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 text-left">शिफारशी</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white shadow-sm transition-all resize-none"
                placeholder="महत्त्वाच्या शिफारशी"
                disabled={isViewMode}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 text-left">स्वाक्षरी</label>
            <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <input
                type="text"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white shadow-sm"
                placeholder="नाव आणि स्वाक्षरी"
                disabled={isViewMode}
              />
              <div className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                <span className="text-sm text-gray-500">डिजिटल सही</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Action Buttons
  const renderActionButtons = () => (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      {!isViewMode && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 space-y-3">
          <button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? 'जतन करत आहे...' : 'ड्राफ्ट म्हणून जतन करा'}
          </button>
          
          <button
            onClick={() => handleSubmit(false)}
            disabled={isLoading || !gpName.trim()}
            className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 mr-2" />
            {isLoading ? 'सबमिट करत आहे...' : 'अहवाल सबमिट करा'}
          </button>
        </div>
      )}
      
      {isViewMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">दृश्य मोड सक्रिय</h3>
          <p className="text-blue-700 text-sm">बदल करण्यासाठी संपादन मोड वापरा</p>
        </div>
      )}
    </div>
  );

  if (isViewMode) {
    // View Mode - Show all sections as read-only
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {renderHeader()}
          {renderBasicInformation()}
          {renderLocationSection()}
          {renderSection2()}
          {renderSection3()}
          {renderSection6()}
          {renderSection8()}
          {renderSection9()}
          {renderSection10()}
          {renderSection11()}
          {renderSection12()}
          {renderSection13()}
          {renderPhotoUploadSection()}
          {renderFinalInformation()}
          
          {/* Scroll to top button */}
          <button className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all">
            ↑
          </button>
        </div>
        {renderActionButtons()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {renderHeader()}
        
        {/* Main Form Content */}
        <div className="space-y-8">
          {renderBasicInformation()}
          {renderLocationSection()}
          {renderSection2()}
          {renderSection3()}
          {renderSection6()}
          {renderSection8()}
          {renderSection9()}
          {renderSection10()}
          {renderSection11()}
          {renderSection12()}
          {renderSection13()}
          {renderPhotoUploadSection()}
          {renderFinalInformation()}
        </div>
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-semibold text-gray-900">अहवाल सबमिट करत आहे...</span>
              </div>
              <p className="text-sm text-gray-600">कृपया थांबा, हे काही वेळ घेऊ शकते</p>
            </div>
          </div>
        )}
      </div>
      
      {renderActionButtons()}
    </div>
  );
};
