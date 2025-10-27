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

  const grampanchayatCategory = categories.find((cat: any) => cat.formtype === 'grampanchayat');

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

  // Basic Information Section - Complete with design from screenshot
  const renderBasicInformation = () => (
    <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">माहिती (मूलभूत माहिती)</h3>
        </div>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ग्रामपंचायतचे नाव</label>
              <input
                type="text"
                value={gpName}
                onChange={(e) => setGpName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                placeholder="ग्रामपंचायतचे नाव"
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">पंचायत समितीचे नाव</label>
              <input
                type="text"
                value={psName}
                onChange={(e) => setPsName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                placeholder="पंचायत समितीचे नाव"
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ग्रामपंचायत क्रमांक</label>
              <input
                type="text"
                value={gpCode}
                onChange={(e) => setGpCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                placeholder="ग्रामपंचायत क्रमांक"
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">गावाचे नाव</label>
              <input
                type="text"
                value={villageName}
                onChange={(e) => setVillageName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                placeholder="गावाचे नाव"
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">लोकसंख्या</label>
              <input
                type="number"
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                placeholder="लोकसंख्या"
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">तपासणीची तारीख</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">तपासणीचे ठिकाण</label>
              <input
                type="text"
                value={inspectionPlace}
                onChange={(e) => setInspectionPlace(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                placeholder="तपासणीचे ठिकाण"
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">अधिकाऱ्याचे नाव</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                placeholder="अधिकाऱ्याचे नाव"
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">पद</label>
              <input
                type="text"
                value={officerPost}
                onChange={(e) => setOfficerPost(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                placeholder="पद"
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">सचिवाचे नाव</label>
              <input
                type="text"
                value={secretaryName}
                onChange={(e) => setSecretaryName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                placeholder="सचिवाचे नाव"
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">सचिव कालावधी</label>
              <input
                type="text"
                value={secretaryTenure}
                onChange={(e) => setSecretaryTenure(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                placeholder="सचिव कालावधी"
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Complete Form Content - All Sections */}
          <div className="space-y-8 mt-8">
            {/* Section 2 - Monthly Meetings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">मासिक सभा (Section 2)</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <label className="text-sm font-medium text-gray-700 w-64">मासिक सभा झाल्या का?</label>
                  <div className="flex space-x-8">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="monthlyMeetings"
                        value="yes"
                        checked={monthlyMeetings === true}
                        onChange={(e) => setMonthlyMeetings(e.target.value === 'yes')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">हो</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="monthlyMeetings"
                        value="no"
                        checked={monthlyMeetings === false}
                        onChange={(e) => setMonthlyMeetings(e.target.value === 'no')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">नाही</span>
                    </label>
                  </div>
                </div>

                <div className="ml-16 space-y-3">
                  <div className="flex items-center space-x-6">
                    <label className="text-sm font-medium text-gray-700 w-64">दालन सुची अद्ययावत आहे का?</label>
                    <div className="flex space-x-8">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="agendaUpToDate"
                          value="yes"
                          checked={agendaUpToDate === true}
                          onChange={(e) => setAgendaUpToDate(e.target.value === 'yes')}
                          disabled={isViewMode}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">हो</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="agendaUpToDate"
                          value="no"
                          checked={agendaUpToDate === false}
                          onChange={(e) => setAgendaUpToDate(e.target.value === 'no')}
                          disabled={isViewMode}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">नाही</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="text-sm font-medium text-gray-700 w-64">बेत अद्ययावत आहे का?</label>
                    <div className="flex space-x-8">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="minutesUpToDate"
                          value="yes"
                          disabled={isViewMode}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">हो</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="minutesUpToDate"
                          value="no"
                          disabled={isViewMode}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">नाही</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 - Tax Collection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">कर संकलन (Section 3)</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <label className="text-sm font-medium text-gray-700 w-64">कर आकारणी केली का?</label>
                  <div className="flex space-x-8">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="taxLevy"
                        value="yes"
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">हो</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="taxLevy"
                        value="no"
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">नाही</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <label className="text-sm font-medium text-gray-700 w-64">संकलन रक्कम</label>
                  <input
                    type="number"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isViewMode}
                    placeholder="रक्कम"
                  />
                </div>
              </div>
            </div>

            {/* Section 6 - Fund Allocation */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <h4 className="text-lg font-semibold text-gray-900 p-6 border-b bg-gray-50">निधी वाटप (Section 6)</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">अ.क्र.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">निधी प्रकार</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">मान्य रक्कम</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">वाटप रक्कम</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">खर्च</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">तारीख</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b" colSpan={2}>टिप्पणी</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { num: 1, type: 'राज्य वित्त आयोग', amountState: section1Amount, dateState: section1Date },
                      { num: 2, type: 'केंद्रीय वित्त आयोग', amountState: section2Amount, dateState: section2Date },
                      { num: 3, type: 'विकास निधी', amountState: section3Amount, dateState: section3Date },
                      { num: 4, type: 'स्थानिक निधी', amountState: section4Amount, dateState: section4Date },
                      { num: 5, type: 'अन्य निधी', amountState: section5Amount, dateState: section5Date },
                      { num: 6, type: 'एकूण', amountState: section6Amount, dateState: section6Date }
                    ].map(({ num, type, amountState, dateState }) => (
                      <tr key={num}>
                        <td className="px-4 py-4 text-sm text-gray-900 border-r">{num}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 border-r">{type}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 border-r">0</td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="text"
                            value={amountState}
                            onChange={(e) => {
                              if (num === 1) setSection1Amount(e.target.value);
                              if (num === 2) setSection2Amount(e.target.value);
                              if (num === 3) setSection3Amount(e.target.value);
                              if (num === 4) setSection4Amount(e.target.value);
                              if (num === 5) setSection5Amount(e.target.value);
                              if (num === 6) setSection6Amount(e.target.value);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={true}
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="date"
                            value={dateState}
                            onChange={(e) => {
                              if (num === 1) setSection1Date(e.target.value);
                              if (num === 2) setSection2Date(e.target.value);
                              if (num === 3) setSection3Date(e.target.value);
                              if (num === 4) setSection4Date(e.target.value);
                              if (num === 5) setSection5Date(e.target.value);
                              if (num === 6) setSection6Date(e.target.value);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                          />
                        </td>
                        <td colSpan={2} className="px-4 py-4">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={true}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 8 - Resolution Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">ठराव माहिती (Section 8)</h4>
              <div className="space-y-4">
                <p className="text-sm text-gray-700">1. ठराव क्र. 9 -</p>
                
                <div className="flex items-center space-x-6">
                  <label className="text-sm font-medium text-gray-700 w-64">2. 10 - पावती अद्ययावत आहे का?</label>
                  <div className="flex space-x-8">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="receiptUpToDate"
                        value="yes"
                        checked={receiptUpToDate === true}
                        onChange={(e) => setReceiptUpToDate(e.target.value === 'yes')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">हो</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="receiptUpToDate"
                        value="no"
                        checked={receiptUpToDate === false}
                        onChange={(e) => setReceiptUpToDate(e.target.value === 'no')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">नाही</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">तारीख</label>
                  <input
                    type="date"
                    value={resolutionDate}
                    onChange={(e) => setResolutionDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={isViewMode}
                  />
                  <label className="text-sm font-medium text-gray-700 ml-8">ठराव क्र.</label>
                  <input
                    type="text"
                    value={resolutionNo}
                    onChange={(e) => setResolutionNo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 ml-2"
                    disabled={isViewMode}
                  />
                </div>

                <div className="ml-16">
                  <p className="text-sm text-gray-700 mb-2">आधिपत्य पुनर्मूल्यांकन केले का?</p>
                  <div className="flex space-x-8">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="reassessmentAction"
                        value="yes"
                        checked={reassessmentAction === true}
                        onChange={(e) => setReassessmentAction(e.target.value === 'yes')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">हो</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="reassessmentAction"
                        value="no"
                        checked={reassessmentAction === false}
                        onChange={(e) => setReassessmentAction(e.target.value === 'no')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">नाही</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 9 - Staff Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">कर्मचारी माहिती (Section 9)</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-20">1. सरपंच</span>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="नाव"
                    />
                    <input
                      type="text"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="कालावधी"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-20">2. उप सरपंच</span>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="नाव"
                    />
                    <input
                      type="text"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="कालावधी"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-20">3. सचिव</span>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="नाव"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-20">4. तलाठी</span>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="नाव"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-20">5. ग्रामसेवक</span>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="संख्या"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-20">6. इतर कर्मचारी</span>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="संख्या"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 w-20">7. एकूण कर्मचारी</span>
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={isViewMode}
                    placeholder="एकूण"
                  />
                </div>
              </div>
            </div>

            {/* Section 10 - Development Works */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">विकास कामे (Section 10)</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-48">1. पूर्ण झालेली कामे</span>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="संख्या"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-48">2. प्रगतिपथातील कामे (15%)</span>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="संख्या"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-48">3. थांबलेली कामे</span>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="संख्या"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-48">4. नवीन प्रस्तावित कामे</span>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="संख्या"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-48">5. एकूण कामे</span>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="एकूण"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-48">6. खर्च झालेली रक्कम</span>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="रक्कम"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 11 - Financial Management */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">आर्थिक व्यवस्थापन (Section 7 & 11)</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <label className="text-sm font-medium text-gray-700 w-64">बजेट प्रावधान आहे का?</label>
                  <div className="flex space-x-8">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="budgetProvision"
                        value="yes"
                        checked={budgetProvision === true}
                        onChange={(e) => setBudgetProvision(e.target.value === 'yes')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">हो</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="budgetProvision"
                        value="no"
                        checked={budgetProvision === false}
                        onChange={(e) => setBudgetProvision(e.target.value === 'no')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">नाही</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <span className="text-sm font-medium text-gray-700 w-64">एकूण बजेट रक्कम?</span>
                  <input
                    type="text"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={isViewMode}
                    placeholder="रक्कम"
                  />
                  <span className="text-sm font-medium text-gray-700">तारीख</span>
                  <input
                    type="date"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 ml-2"
                    disabled={isViewMode}
                  />
                </div>

                <div className="flex items-center space-x-6 ml-16">
                  <label className="text-sm font-medium text-gray-700 w-48">टेंडर मागवले का?</label>
                  <div className="flex space-x-8">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="tendersCalled"
                        value="yes"
                        checked={tendersCalled === true}
                        onChange={(e) => setTendersCalled(e.target.value === 'yes')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">हो</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="tendersCalled"
                        value="no"
                        checked={tendersCalled === false}
                        onChange={(e) => setTendersCalled(e.target.value === 'no')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">नाही</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-6 ml-16">
                  <label className="text-sm font-medium text-gray-700 w-48">9,15 16 कामांसाठी एंट्री केली का?</label>
                  <div className="flex space-x-8">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="entriesMade"
                        value="yes"
                        checked={entriesMade === true}
                        onChange={(e) => setEntriesMade(e.target.value === 'yes')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">हो</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="entriesMade"
                        value="no"
                        checked={entriesMade === false}
                        onChange={(e) => setEntriesMade(e.target.value === 'no')}
                        disabled={isViewMode}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">नाही</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 12 - Work Progress Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <h4 className="text-lg font-semibold text-gray-900 p-6 border-b bg-gray-50">कामाची प्रगती (Section 12)</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">अ.क्र.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">कामाचे नाव</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">अंदाजे रक्कम</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">खर्च झालेली रक्कम</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">प्रगती %</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">एकूण खर्च</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">उर्वरीत रक्कम</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">तारीख</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: 5 }, (_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 text-sm text-gray-900 border-r">{index + 1}</td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder="कामाचे नाव"
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder="अंदाजे रक्कम"
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder="खर्च"
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder="प्रगती %"
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder="एकूण खर्च"
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder="उर्वरीत"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="date"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 13 - Certificates */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <h4 className="text-lg font-semibold text-gray-900 p-6 border-b bg-gray-50">प्रमाणपत्रे (Section 13)</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">अ.क्र.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">प्रमाणपत्र प्रकार</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">तारीख</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">उपलब्ध आहे का?</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">विवरण</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">टिप्पणी</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r">1</td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r">आर्थिक प्रमाणपत्र</td>
                      <td className="px-4 py-4 border-r">
                        <input
                          type="date"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                          disabled={isViewMode}
                        />
                      </td>
                      <td className="px-4 py-4 border-r">
                        <div className="flex space-x-8">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="certificate1"
                              value="yes"
                              checked={certificate1 === true}
                              onChange={(e) => setCertificate1(e.target.value === 'yes')}
                              disabled={isViewMode}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">हो</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="certificate1"
                              value="no"
                              checked={certificate1 === false}
                              onChange={(e) => setCertificate1(e.target.value === 'no')}
                              disabled={isViewMode}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">नाही</span>
                          </label>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                          disabled={isViewMode}
                          placeholder="विवरण"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                          disabled={isViewMode}
                          placeholder="टिप्पणी"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r">2</td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r">कर संकलन प्रमाणपत्र</td>
                      <td className="px-4 py-4 border-r">
                        <input
                          type="date"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                          disabled={isViewMode}
                        />
                      </td>
                      <td className="px-4 py-4 border-r">
                        <div className="flex space-x-8">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="certificate2"
                              value="yes"
                              disabled={isViewMode}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">हो</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="certificate2"
                              value="no"
                              disabled={isViewMode}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">नाही</span>
                          </label>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                          disabled={isViewMode}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                          disabled={isViewMode}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 14 - Assets Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <h4 className="text-lg font-semibold text-gray-900 p-6 border-b bg-gray-50">संपत्ती नोंद (Section 14)</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th colSpan={8} className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b bg-white">
                        ग्रामपंचायत संपत्ती नोंद
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">अ.क्र.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">संपत्ती प्रकार</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">स्थान</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">खरेदी वर्ष</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">खरेदी किंमत</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">सध्याची किंमत</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">विवरण</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">टिप्पणी</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: 11 }, (_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 text-sm text-gray-900 border-r">{index + 1}</td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder={`संपत्ती प्रकार ${index + 1}`}
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder={`स्थान ${index + 1}`}
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder={`वर्ष ${index + 1}`}
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder={`खरेदी किंमत ${index + 1}`}
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder={`सध्याची किंमत ${index + 1}`}
                          />
                        </td>
                        <td className="px-4 py-4 border-r">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder={`विवरण ${index + 1}`}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                            disabled={isViewMode}
                            placeholder={`टिप्पणी ${index + 1}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 text-center">अंतिम माहिती</h4>
              <div className="space-y-4 text-center">
                <div className="flex justify-center items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-48">1. तपासणी अधिकाऱ्याचे नाव</span>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={isViewMode}
                  />
                </div>
                
                <div className="flex justify-center items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-48">2. पद</span>
                  <input
                    type="text"
                    value={officerPost}
                    onChange={(e) => setOfficerPost(e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={isViewMode}
                  />
                </div>

                <div className="flex justify-center items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-48">3. तारीख</span>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={isViewMode}
                  />
                </div>

                <div className="flex justify-center items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-48">4. ठिकाण</span>
                  <input
                    type="text"
                    value={inspectionPlace}
                    onChange={(e) => setInspectionPlace(e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex justify-center items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-48">5. सुधारणा</span>
                    <input
                      type="text"
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="सुधारणा"
                    />
                  </div>
                  
                  <div className="flex justify-center items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-48">6. पुढील पावले</span>
                    <input
                      type="text"
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="पुढील पावले"
                    />
                  </div>

                  <div className="flex justify-center items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-48">7. शिफारशी</span>
                    <input
                      type="text"
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="शिफारशी"
                    />
                  </div>

                  <div className="flex justify-center items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-48">8. स्वाक्षरी</span>
                    <input
                      type="text"
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isViewMode}
                      placeholder="स्वाक्षरी"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  // Location Section
  const renderLocationSection = () => (
    <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">स्थान माहिती</h3>
        </div>
      </div>
      <div className="p-6 bg-blue-50">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">स्थानाचे नाव</label>
            <input
              type="text"
              value={inspectionData.locationname || gpName}
              onChange={(e) => setInspectionData(prev => ({ ...prev, locationname: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              placeholder="स्थानाचे नाव"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">नियोजित तारीख</label>
            <input
              type="date"
              value={inspectionData.planneddate}
              onChange={(e) => setInspectionData(prev => ({ ...prev, planneddate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GPS स्थान माहिती</label>
            {!isViewMode && (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <MapPin className="h-5 w-5" />
                <span>{isGettingLocation ? 'स्थान मिळवत आहे...' : 'सध्याचे स्थान मिळवा'}</span>
              </button>
            )}

            {inspectionData.latitude && inspectionData.longitude && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm font-medium text-green-800 mb-2">स्थान नोंदवले गेले</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-700">
                  <div className="text-center">
                    <span className="font-medium block">अक्षांश</span>
                    <span>{inspectionData.latitude?.toFixed(6)}</span>
                  </div>
                  <div className="text-center">
                    <span className="font-medium block">रेखांश</span>
                    <span>{inspectionData.longitude?.toFixed(6)}</span>
                  </div>
                  <div className="text-center">
                    <span className="font-medium block">अचूकता</span>
                    <span>{inspectionData.locationaccuracy ? Math.round(inspectionData.locationaccuracy) + ' m' : 'NA'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">GPS निर्देशांक</label>
            <input
              type="text"
              value={inspectionData.locationdetected}
              onChange={(e) => setInspectionData(prev => ({ ...prev, locationdetected: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              placeholder="अक्षांश, रेखांश"
              readOnly={isViewMode}
            />
          </div>
        </div>
      </div>
    </section>
  );

  // Photo Upload Section
  const renderPhotoUploadSection = () => (
    <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">छायाचित्र अपलोड</h3>
        </div>
      </div>
      <div className="p-6 bg-purple-50">
        <div className="space-y-6">
          <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors bg-white">
            <Camera className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">तपासणी छायाचित्र अपलोड करा</h4>
            <p className="text-gray-600 mb-4">
              {uploadedPhotos.length === 0
                ? 'कोणतेही छायाचित्र निवडलेले नाही'
                : uploadedPhotos.length < 5
                ? `${uploadedPhotos.length}/5 छायाचित्र निवडले`
                : '5/5 छायाचित्रे भरले'
              }
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isViewMode}
              className="hidden"
              id="photo-upload-input"
            />
            {!isViewMode && uploadedPhotos.length < 5 && (
              <label 
                htmlFor="photo-upload-input" 
                className="inline-flex items-center px-6 py-3 rounded-xl cursor-pointer bg-purple-600 hover:bg-purple-700 text-white shadow-sm font-medium transition-colors"
              >
                <Camera className="h-4 w-4 mr-2" />
                छायाचित्र निवडा
              </label>
            )}
            {isViewMode && (
              <p className="text-gray-500 text-sm">दृश्य मोडमध्ये छायाचित्र अपलोड करता येत नाही</p>
            )}
          </div>

          {uploadedPhotos.length > 0 && !isViewMode && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-purple-600" />
                {uploadedPhotos.length} निवडलेली छायाचित्रे
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedPhotos.map((file, index) => (
                  <div key={index} className="relative bg-white rounded-xl shadow-md border overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-600 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isViewMode && editingInspection?.fims_inspection_photos?.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-purple-600" />
                {editingInspection.fims_inspection_photos.length} उपलब्ध छायाचित्रे
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
                  <div key={photo.id} className="bg-white rounded-xl shadow-md border overflow-hidden">
                    <img
                      src={photo.photourl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-600 truncate">{photo.photoname || `छायाचित्र ${index + 1}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">अपलोड होत आहे...</span>
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

          {(!uploadedPhotos.length && !isViewMode) || (isViewMode && (!editingInspection?.fims_inspection_photos || editingInspection.fims_inspection_photos.length === 0)) && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
              <Camera className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">
                {isViewMode ? 'कोणतीही छायाचित्रे उपलब्ध नाहीत' : 'अजून कोणतेही छायाचित्र निवडलेले नाही'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">मागे जा</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-900">ग्रामपंचायत तपासणी फॉर्म</h1>
              <p className="text-sm text-gray-600 mt-1">ग्रामपंचायत मूलभूत माहिती आणि तपासणी</p>
            </div>
            <div className="w-20" />
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-8">
          {renderBasicInformation()}
          {renderLocationSection()}
          {renderPhotoUploadSection()}
        </div>

        {/* Fixed Action Buttons - Not overlapping */}
        {!isViewMode && (
          <div className="mt-12 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? '...' : 'ड्राफ्ट म्हणून जतन करा'}
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? '...' : 'सबमिट करा'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Notice */}
        {isViewMode && (
          <div className="mt-12 text-center p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-blue-900 mb-2">दृश्य मोड</h3>
            <p className="text-blue-700 text-sm">
              ही दृश्य मोड आहे. बदल करण्यासाठी संपादन मोड वापरा.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
