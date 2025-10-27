import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send, FileText, Users, Camera, MapPin, Building2, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import supabase from '../lib/supabase';
import type { User as SupabaseUser } from 'supabase/supabase-js';

interface GrampanchayatInspectionFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface GrampanchayatFormData {
  // Basic Information
  gpName: string;
  psName: string;
  secretaryName: string;
  secretaryTenure: string;
  inspectionDate: string;
  inspectionPlace: string;
  officerName: string;
  officerPost: string;

  // Meeting Information
  monthlyMeetings: boolean;
  agendaUpToDate: boolean;
  receiptUpToDate: boolean;

  // Financial Details
  reassessmentDone: boolean;
  reassessmentAction: boolean;
  resolutionNo: string;
  resolutionDate: string;

  // Work Details - Add more fields as needed based on your requirements
  workDetailsObservation: string;

  // Final Details
  generalObservations: string;
  recommendations: string;
  actionRequired: string;
  suggestions: string;
  visitDate: string;
  inspectorDesignation: string;
  inspectorName: string;
}

export const GrampanchayatInspectionForm: React.FC<GrampanchayatInspectionFormProps> = ({ user, onBack, categories, onInspectionCreated, editingInspection }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(editingInspection?.mode === 'view');
  const [isEditMode, setIsEditMode] = useState(editingInspection?.mode === 'edit');

  // Location states from Anganwadi form - Proper implementation
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const [inspectionData, setInspectionData] = useState({
    categoryid: '',
    locationname: '',
    planneddate: '',
    latitude: null as number | null,
    longitude: null as number | null,
    locationaccuracy: null as number | null,
    locationdetected: '',
    address: ''
  });

  const [grampanchayatFormData, setGrampanchayatFormData] = useState<GrampanchayatFormData>({
    gpName: '',
    psName: '',
    secretaryName: '',
    secretaryTenure: '',
    inspectionDate: '',
    inspectionPlace: '',
    officerName: '',
    officerPost: '',
    monthlyMeetings: false,
    agendaUpToDate: false,
    receiptUpToDate: false,
    reassessmentDone: false,
    reassessmentAction: false,
    resolutionNo: '',
    resolutionDate: '',
    workDetailsObservation: '',
    generalObservations: '',
    recommendations: '',
    actionRequired: '',
    suggestions: '',
    visitDate: '',
    inspectorDesignation: '',
    inspectorName: ''
  });

  // Get grampanchayat inspection category
  const grampanchayatCategory = categories.find(cat => cat.formtype === 'grampanchayat');

  useEffect(() => {
    if (grampanchayatCategory) {
      setInspectionData(prev => ({ ...prev, categoryid: grampanchayatCategory.id }));
    }
  }, [grampanchayatCategory]);

  // Load existing inspection data when editing
  useEffect(() => {
    if (editingInspection) {
      console.log('Loading existing inspection data', editingInspection);
      
      // Load basic inspection data
      setInspectionData({
        categoryid: editingInspection.categoryid,
        locationname: editingInspection.locationname,
        planneddate: editingInspection.planneddate ? editingInspection.planneddate.split('T')[0] : '',
        latitude: editingInspection.latitude,
        longitude: editingInspection.longitude,
        locationaccuracy: editingInspection.locationaccuracy,
        locationdetected: editingInspection.locationdetected,
        address: editingInspection.address || ''
      });

      // Load grampanchayat form data if it exists
      let formDataToLoad = null;
      
      // Try to get data from fimsgrampanchayatforms table first
      if (editingInspection.fimsgrampanchayatforms && editingInspection.fimsgrampanchayatforms.length > 0) {
        formDataToLoad = editingInspection.fimsgrampanchayatforms[0];
        console.log('Loading from fimsgrampanchayatforms', formDataToLoad);
      } else {
        // Fallback to formdata JSON field
        formDataToLoad = editingInspection.formdata;
        console.log('Loading from formdata JSON', formDataToLoad);
      }

      if (formDataToLoad) {
        setGrampanchayatFormData({
          gpName: formDataToLoad.gpName || '',
          psName: formDataToLoad.psName || '',
          secretaryName: formDataToLoad.secretaryName || '',
          secretaryTenure: formDataToLoad.secretaryTenure || '',
          inspectionDate: formDataToLoad.inspectionDate || '',
          inspectionPlace: formDataToLoad.inspectionPlace || '',
          officerName: formDataToLoad.officerName || '',
          officerPost: formDataToLoad.officerPost || '',
          monthlyMeetings: formDataToLoad.monthlyMeetings ?? false,
          agendaUpToDate: formDataToLoad.agendaUpToDate ?? false,
          receiptUpToDate: formDataToLoad.receiptUpToDate ?? false,
          reassessmentDone: formDataToLoad.reassessmentDone ?? false,
          reassessmentAction: formDataToLoad.reassessmentAction ?? false,
          resolutionNo: formDataToLoad.resolutionNo || '',
          resolutionDate: formDataToLoad.resolutionDate || '',
          workDetailsObservation: formDataToLoad.workDetailsObservation || '',
          generalObservations: formDataToLoad.generalObservations || '',
          recommendations: formDataToLoad.recommendations || '',
          actionRequired: formDataToLoad.actionRequired || '',
          suggestions: formDataToLoad.suggestions || '',
          visitDate: formDataToLoad.visitDate || '',
          inspectorDesignation: formDataToLoad.inspectorDesignation || '',
          inspectorName: formDataToLoad.inspectorName || ''
        });
      }
    }
  }, [editingInspection]);

  // Proper location function from Anganwadi form - EXACT implementation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('categories.geolocationNotSupported'));
      return;
    }

    // Clear any cached location data by requesting fresh location
    // This forces the browser to get a new GPS fix instead of using cached data
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // Get location name using reverse geocoding
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            // Update all location data in a single state call
            setInspectionData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              locationaccuracy: accuracy,
              locationdetected: address,
              address: address,
              locationname: prev.locationname || address
            }));
          } else {
            // No geocoding results, just update coordinates
            setInspectionData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              locationaccuracy: accuracy,
              locationdetected: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
              address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
            }));
          }
        } catch (error) {
          console.error('Error getting location name', error);
          // Fallback just update coordinates without address
          setInspectionData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            locationaccuracy: accuracy,
            locationdetected: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
            address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
          }));
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location', error);
        setIsGettingLocation(false);
        alert(t('categories.geolocationError'));
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, // Increased timeout for better GPS fix
        maximumAge: 0 // Force fresh location, don't use cached data
      }
    );
  };

  // Photo upload function from Anganwadi form
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (uploadedPhotos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    setUploadedPhotos(prev => [...prev, ...files]);
    setPhotoFiles(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload photos to Supabase function from Anganwadi form
  const uploadPhotosToSupabase = async (inspectionId: string) => {
    if (photoFiles.length === 0) return;

    setIsUploadingPhotos(true);
    setIsUploading(true);
    try {
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `grampanchayat-${inspectionId}-${Date.now()}-${i}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('field-visit-images')
          .upload(fileName, file, {
            upsert: true,
            cacheControl: '3600',
            contentType: file.type
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('field-visit-images')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('fimsinspectionphotos')
          .insert({
            inspectionid: inspectionId,
            photourl: publicUrlData.publicUrl,
            photoname: file.name,
            description: `Gram Panchayat inspection photo ${i + 1}`,
            photoorder: i + 1,
            uploadedat: new Date().toISOString()
          });

        if (dbError) throw dbError;

        // Update progress
        setUploadProgress(Math.round(((i + 1) / photoFiles.length) * 100));
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading some photos. Please try again.');
      throw error;
    } finally {
      setIsUploadingPhotos(false);
      setIsUploading(false);
      setUploadProgress(0);
      setPhotoFiles([]);
      setUploadedPhotos([]);
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

      // Convert empty date strings to null for database compatibility
      const sanitizedInspectionData = {
        ...inspectionData,
        planneddate: inspectionData.planneddate || null
      };

      const formData = {
        ...grampanchayatFormData,
        monthlyMeetings: grampanchayatFormData.monthlyMeetings,
        agendaUpToDate: grampanchayatFormData.agendaUpToDate,
        receiptUpToDate: grampanchayatFormData.receiptUpToDate,
        reassessmentDone: grampanchayatFormData.reassessmentDone,
        reassessmentAction: grampanchayatFormData.reassessmentAction
      };

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
        // Update existing inspection
        const { data: updateResult, error: updateError } = await supabase
          .from('fimsinspections')
          .update({
            locationname: sanitizedInspectionData.locationname,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            locationaccuracy: sanitizedInspectionData.locationaccuracy,
            locationdetected: sanitizedInspectionData.locationdetected,
            address: sanitizedInspectionData.address,
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

        // Upsert grampanchayat form record
        const { error: formError } = await supabase
          .from('fimsgrampanchayatforms')
          .upsert({
            inspectionid: editingInspection.id,
            ...grampanchayatFormData
          });

        if (formError) throw formError;
      } else {
        // Create new inspection
        const inspectionNumber = generateInspectionNumber();

        const { data: createResult, error: createError } = await supabase
          .from('fimsinspections')
          .insert({
            inspectionnumber: inspectionNumber,
            categoryid: sanitizedInspectionData.categoryid,
            inspectorid: user.id,
            locationname: sanitizedInspectionData.locationname,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            locationaccuracy: sanitizedInspectionData.locationaccuracy,
            locationdetected: sanitizedInspectionData.locationdetected,
            address: sanitizedInspectionData.address,
            planneddate: sanitizedInspectionData.planneddate,
            inspectiondate: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            formdata: formData
          })
          .select()
          .single();

        if (createError) throw createError;
        inspectionResult = createResult;

        // Create grampanchayat form record
        const { error: formError } = await supabase
          .from('fimsgrampanchayatforms')
          .insert({
            inspectionid: inspectionResult.id,
            ...grampanchayatFormData
          });

        if (formError) throw formError;
      }

      // Upload photos if any - Proper Anganwadi implementation
      if (photoFiles.length > 0 && !isUploadingPhotos) {
        await uploadPhotosToSupabase(inspectionResult.id);
      }

      const isUpdate = editingInspection && editingInspection.id;
      const message = isDraft 
        ? isUpdate 
          ? t('fims.inspectionUpdatedAsDraft') 
          : t('fims.inspectionSavedAsDraft')
        : isUpdate 
          ? t('fims.inspectionUpdatedSuccessfully') 
          : t('fims.inspectionSubmittedSuccessfully');

      alert(message);
      onInspectionCreated();
      onBack();
    } catch (error) {
      console.error('Error saving inspection', error);
      alert(`Error saving inspection: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map(step => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-purple-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const YesNoRadio = ({ name, value, onChange, question }: {
    name: string;
    value: string | boolean;
    onChange: (value: string | boolean) => void;
    question: string;
  }) => (
    <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
      <p className="mb-4 text-gray-800 font-medium leading-relaxed text-lg">{question}</p>
      <div className="flex gap-8 pl-4">
        <label className="flex items-center cursor-pointer group">
          <input 
            type="radio" 
            name={name} 
            value="yes" 
            checked={value === true || value === 'yes'} 
            onChange={e => onChange(e.target.value === 'yes')} 
            disabled={isViewMode}
            className="mr-3 w-5 h-5 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2 group-hover:border-green-400 transition-colors"
          />
          <span className="text-green-700 font-semibold group-hover:text-green-800 transition-colors text-lg">होय</span>
        </label>
        <label className="flex items-center cursor-pointer group">
          <input 
            type="radio" 
            name={name} 
            value="no" 
            checked={value === false || value === 'no'} 
            onChange={e => onChange(e.target.value === 'no')} 
            disabled={isViewMode}
            className="mr-3 w-5 h-5 text-red-600 border-2 border-gray-300 focus:ring-red-500 focus:ring-2 group-hover:border-red-400 transition-colors"
          />
          <span className="text-red-700 font-semibold group-hover:text-red-800 transition-colors text-lg">नाही</span>
        </label>
      </div>
    </div>
  );

  const renderBasicDetailsAndLocation = () => (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
          <div className="flex items-center text-white">
            <Building2 className="w-8 h-8 mr-4" />
            <h3 className="text-2xl font-bold">मूलभूत माहिती</h3>
          </div>
        </div>
        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.gpName')}</label>
              <input 
                type="text" 
                value={grampanchayatFormData.gpName} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, gpName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400" 
                placeholder={t('fims.enterGpName')} 
                required 
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.psName')}</label>
              <input 
                type="text" 
                value={grampanchayatFormData.psName} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, psName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400" 
                placeholder={t('fims.enterPsName')} 
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.secretaryName')}</label>
              <input 
                type="text" 
                value={grampanchayatFormData.secretaryName} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, secretaryName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400" 
                placeholder={t('fims.enterSecretaryName')} 
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.secretaryTenure')}</label>
              <input 
                type="text" 
                value={grampanchayatFormData.secretaryTenure} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, secretaryTenure: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400" 
                placeholder={t('fims.enterSecretaryTenure')} 
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.inspectionDate')}</label>
              <input 
                type="date" 
                value={grampanchayatFormData.inspectionDate} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, inspectionDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.inspectionPlace')}</label>
              <input 
                type="text" 
                value={grampanchayatFormData.inspectionPlace} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, inspectionPlace: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400" 
                placeholder={t('fims.enterInspectionPlace')} 
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.officerName')}</label>
              <input 
                type="text" 
                value={grampanchayatFormData.officerName} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, officerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400" 
                placeholder={t('fims.enterOfficerName')} 
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.officerPost')}</label>
              <input 
                type="text" 
                value={grampanchayatFormData.officerPost} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, officerPost: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400" 
                placeholder={t('fims.enterOfficerPost')} 
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Location Information Section - Proper Anganwadi style */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
          <div className="flex items-center text-white">
            <MapPin className="w-8 h-8 mr-4" />
            <h3 className="text-2xl font-bold">स्थान माहिती</h3>
          </div>
        </div>
        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('fims.locationName')}</label>
              <input 
                type="text" 
                value={inspectionData.locationname} 
                onChange={e => setInspectionData(prev => ({ ...prev, locationname: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" 
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
                onChange={e => setInspectionData(prev => ({ ...prev, planneddate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
                  <span>{isGettingLocation ? 'स्थान शोधत आहे...' : 'सध्याचे स्थान मिळवा'}</span>
                </button>
              )}
              {inspectionData.latitude && inspectionData.longitude && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 mb-1">स्थान सफलतेने शोधले!</p>
                      <div className="space-y-1 text-xs text-green-700">
                        <div className="flex justify-between">
                          <span>अक्षांश:</span>
                          <span className="font-mono">{inspectionData.latitude.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>रेखांश:</span>
                          <span className="font-mono">{inspectionData.longitude.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>अचूकता:</span>
                          <span>{inspectionData.locationaccuracy ? Math.round(inspectionData.locationaccuracy) + ' m' : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">स्थान पत्ता</label>
              <input 
                type="text" 
                value={inspectionData.locationdetected} 
                onChange={e => setInspectionData(prev => ({ ...prev, locationdetected: e.target.value, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" 
                placeholder="पत्ता इथे दिसेल..."
                readOnly={isViewMode}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderGrampanchayatInspectionForm = () => (
    <div className="space-y-8">
      {/* Header */}
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-wide">
              ग्रामपंचायत तपासणी अर्ज
            </h1>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-8 py-4 inline-block shadow-lg border border-white/30">
              <p className="text-sm font-medium">
                {inspectionData.locationdetected && (
                  <>
                    <strong>स्थान: </strong>
                    {inspectionData.locationdetected}
                    <br />
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1 - Meeting Information */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-6">
          <div className="flex items-center text-white">
            <Users className="w-8 h-8 mr-4" />
            <h3 className="text-2xl font-bold">सभांची माहिती</h3>
          </div>
        </div>
        <div className="p-10">
          <div className="space-y-6">
            <YesNoRadio
              name="monthlyMeetings"
              value={grampanchayatFormData.monthlyMeetings}
              onChange={value => setGrampanchayatFormData(prev => ({ ...prev, monthlyMeetings: value }))}
              question="मासिक सभा नियमित होतात का?"
            />
            <YesNoRadio
              name="agendaUpToDate"
              value={grampanchayatFormData.agendaUpToDate}
              onChange={value => setGrampanchayatFormData(prev => ({ ...prev, agendaUpToDate: value }))}
              question="सभेच्या यादी अद्ययावत आहेत का?"
            />
            <YesNoRadio
              name="receiptUpToDate"
              value={grampanchayatFormData.receiptUpToDate}
              onChange={value => setGrampanchayatFormData(prev => ({ ...prev, receiptUpToDate: value }))}
              question="सभेचे रेकॉर्ड अद्ययावत आहेत का?"
            />
          </div>
        </div>
      </section>

      {/* Section 2 - Financial Details */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-8 py-6">
          <div className="flex items-center text-white">
            <Calendar className="w-8 h-8 mr-4" />
            <h3 className="text-2xl font-bold">आर्थिक बाबी</h3>
          </div>
        </div>
        <div className="p-10">
          <div className="space-y-6">
            <YesNoRadio
              name="reassessmentDone"
              value={grampanchayatFormData.reassessmentDone}
              onChange={value => setGrampanchayatFormData(prev => ({ ...prev, reassessmentDone: value }))}
              question="पुनरावलोकन केले आहे का?"
            />
            <YesNoRadio
              name="reassessmentAction"
              value={grampanchayatFormData.reassessmentAction}
              onChange={value => setGrampanchayatFormData(prev => ({ ...prev, reassessmentAction: value }))}
              question="पुनरावलोकनावर कारवाई झाली आहे का?"
            />
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-4">ठराव क्रमांक</label>
              <input 
                type="text" 
                value={grampanchayatFormData.resolutionNo} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, resolutionNo: e.target.value }))}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-gray-50 hover:bg-white text-lg shadow-sm" 
                placeholder="ठराव क्रमांक प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-4">ठराव तारीख</label>
              <input 
                type="date" 
                value={grampanchayatFormData.resolutionDate} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, resolutionDate: e.target.value }))}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-gray-50 hover:bg-white text-lg shadow-sm" 
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Work Details */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
          <div className="flex items-center text-white">
            <FileText className="w-8 h-8 mr-4" />
            <h3 className="text-2xl font-bold">कामाची माहिती</h3>
          </div>
        </div>
        <div className="p-10">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-4">कामाबाबत निरीक्षण</label>
              <textarea 
                value={grampanchayatFormData.workDetailsObservation} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, workDetailsObservation: e.target.value }))}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-gray-50 hover:bg-white text-lg shadow-sm" 
                rows={3}
                placeholder="कामाची प्रगती आणि निरीक्षणाबाबत माहिती लिहा"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderPhotosAndSubmit = () => (
    <div className="space-y-8">
      {/* Final Section - Inspector Details */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-8 py-6">
          <div className="flex items-center text-white">
            <FileText className="w-8 h-8 mr-4" />
            <h3 className="text-2xl font-bold">तपासणी अधिकाऱ्याची माहिती</h3>
          </div>
        </div>
        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-4 text-lg font-bold text-gray-700">भेट दत्ति</label>
              <input 
                type="date" 
                value={grampanchayatFormData.visitDate} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, visitDate: e.target.value }))}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 bg-gray-50 hover:bg-white text-lg shadow-sm" 
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block mb-4 text-lg font-bold text-gray-700">तपासणी अधिका-याचे नाव</label>
              <input 
                type="text" 
                value={grampanchayatFormData.inspectorName} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, inspectorName: e.target.value }))}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 bg-gray-50 hover:bg-white text-lg shadow-sm" 
                placeholder="अधिकाऱ्याचे पूर्ण नाव"
                disabled={isViewMode}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-4 text-lg font-bold text-gray-700">पद</label>
              <input 
                type="text" 
                value={grampanchayatFormData.inspectorDesignation} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, inspectorDesignation: e.target.value }))}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 bg-gray-50 hover:bg-white text-lg shadow-sm" 
                placeholder="पद नाव प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-4 text-lg font-bold text-gray-700">सामान्य निरीक्षण</label>
              <textarea 
                value={grampanchayatFormData.generalObservations} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, generalObservations: e.target.value }))}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 bg-gray-50 hover:bg-white text-lg shadow-sm" 
                rows={3}
                placeholder="सामान्य निरीक्षण आणि टिपण्ण्या"
                disabled={isViewMode}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-4 text-lg font-bold text-gray-700">शिफारशी</label>
              <textarea 
                value={grampanchayatFormData.recommendations} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 bg-gray-50 hover:bg-white text-lg shadow-sm" 
                rows={3}
                placeholder="सुधारणांसाठी शिफारशी"
                disabled={isViewMode}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-4 text-lg font-bold text-gray-700">आवश्यक कारवाई</label>
              <textarea 
                value={grampanchayatFormData.actionRequired} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, actionRequired: e.target.value }))}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 bg-gray-50 hover:bg-white text-lg shadow-sm" 
                rows={3}
                placeholder="आवश्यक असलेली कारवाई"
                disabled={isViewMode}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-4 text-lg font-bold text-gray-700">सुचना</label>
              <textarea 
                value={grampanchayatFormData.suggestions} 
                onChange={e => setGrampanchayatFormData(prev => ({ ...prev, suggestions: e.target.value }))}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 bg-gray-50 hover:bg-white text-lg shadow-sm" 
                rows={3}
                placeholder="अतिरिक्त सूचना"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Photo Upload Section - Proper Anganwadi implementation */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
          <div className="flex items-center text-white">
            <Camera className="w-8 h-8 mr-4" />
            <h3 className="text-2xl font-bold">फोटो अपलोड</h3>
          </div>
        </div>
        <div className="p-10">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">फोटो अपलोड क्षेत्र</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors duration-200">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">फोटो निवडा</h4>
              <p className="text-gray-600 mb-4">
                {uploadedPhotos.length === 0 
                  ? 'कोणतेही फोटो निवडलेले नाहीत (कमाल ५ फोटो, १०MB पर्यंत)' 
                  : uploadedPhotos.length === 5 
                  ? '५/५ फोटो निवडलेले आहेत - कमाल मर्यादा भरलेली' 
                  : `${uploadedPhotos.length}/५ फोटो निवडलेले आहेत`
                }
              </p>
              {!isViewMode && !isUploadingPhotos && (
                <>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                    disabled={isViewMode || uploadedPhotos.length >= 5}
                    id="photo-upload" 
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="photo-upload" 
                    className={`inline-flex items-center px-6 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                      isViewMode || uploadedPhotos.length >= 5 
                        ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    <span>{uploadedPhotos.length >= 5 ? 'मर्यादा भरलेली' : 'फोटो निवडा'}</span>
                  </label>
                </>
              )}
              {isUploadingPhotos && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">फोटो अपलोड होत आहेत...</p>
                  <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">{uploadProgress}% पूर्ण</p>
                </div>
              )}
            </div>

            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-purple-600" />
                  {uploadedPhotos.length} निवडलेले फोटो
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedPhotos.map((file, index) => (
                    <div key={index} className="relative bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-200">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-32 object-cover" 
                      />
                      {!isViewMode && (
                        <button 
                          onClick={() => removePhoto(index)} 
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                        >
                          <span className="text-xs font-bold">×</span>
                        </button>
                      )}
                      <div className="p-2 bg-gradient-to-t from-black/10 to-transparent">
                        <p className="text-xs font-medium text-white truncate">{file.name}</p>
                        <p className="text-xs text-white/80">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display existing photos when viewing */}
            {isViewMode && editingInspection?.fimsinspectionphotos && editingInspection.fimsinspectionphotos.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-blue-600" />
                  {editingInspection.fimsinspectionphotos.length} उपलब्ध फोटो
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {editingInspection.fimsinspectionphotos.map((photo: any, index: number) => (
                    <div key={photo.id} className="relative bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                      <img 
                        src={photo.photourl} 
                        alt={`Gram Panchayat photo ${index + 1}`} 
                        className="w-full h-32 object-cover" 
                      />
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-800 truncate mb-1">फोटो {index + 1}</p>
                        <p className="text-xs text-gray-500 truncate">{photo.photoname}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No photos message */}
            {(isViewMode && (!editingInspection?.fimsinspectionphotos || editingInspection.fimsinspectionphotos.length === 0)) && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-medium">कोणतेही फोटो उपलब्ध नाहीत</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Submit Buttons - Proper loading states */}
      {!isViewMode && (
        <div className="flex justify-center space-x-4 pt-6">
          <button 
            type="button" 
            onClick={() => handleSubmit(true)} 
            disabled={isLoading || isUploadingPhotos}
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Save className="h-5 w-5" />
            <span>{isLoading ? 'सेव्ह होत आहे...' : 'ड्राफ्ट सेव्ह करा'}</span>
          </button>
          <button 
            type="button" 
            onClick={() => handleSubmit(false)} 
            disabled={isLoading || isUploadingPhotos}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Send className="h-5 w-5" />
            <span>{isLoading ? 'सबमिट होत आहे...' : 'सबमिट करा'}</span>
          </button>
        </div>
      )}

      {isViewMode && (
        <div className="text-center py-8 bg-blue-50 rounded-xl border border-blue-200">
          <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-blue-800">दृष्य मोड</p>
          <p className="text-sm text-blue-600 mt-2">हा फॉर्म फक्त दृश्यासाठी आहे</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">{t('common.back')}</span>
        </button>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Form Content */}
      {currentStep === 1 && renderBasicDetailsAndLocation()}
      {currentStep === 2 && renderGrampanchayatInspectionForm()}
      {currentStep === 3 && renderPhotosAndSubmit()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} 
          disabled={currentStep === 1}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
        >
          {t('common.previous')}
        </button>
        {currentStep < 3 && (
          <button 
            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))} 
            disabled={isLoading || isUploadingPhotos}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.next')}
          </button>
        )}
      </div>
    </div>
  );
};
