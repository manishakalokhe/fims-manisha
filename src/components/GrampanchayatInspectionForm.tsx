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
              className="flex items-center space-x-2 text-gray-600 hover
