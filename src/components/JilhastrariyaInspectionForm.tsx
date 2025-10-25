import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  MapPin,
  Camera,
  Save,
  Send,
  Building,
  FileText,
  Calendar,
  User,
  Users,
  ClipboardList,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface JilhastrariyaInspectionFormProps {
  user?: SupabaseUser;
  onBack?: () => void;
  editingInspection?: any;
}

const JilhastrariyaInspectionForm: React.FC<JilhastrariyaInspectionFormProps> = ({
  user,
  onBack,
  editingInspection
}) => {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [programsData, setProgramsData] = useState([
    { program: 'राष्ट्रीय कुटुंब कल्याण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'पुरुष नसबंदी शस्त्रक्रिया', target: '', achieved: '', percentage: '' },
    { program: 'स्त्री नसबंदी शस्त्रक्रिया', target: '', achieved: '', percentage: '' },
    { program: 'एकुण शस्त्रक्रिया', target: '', achieved: '', percentage: '' },
    { program: 'IUCD', target: '', achieved: '', percentage: '' },
    { program: 'PPIUCD', target: '', achieved: '', percentage: '' },
    { program: '2) राष्ट्रीय माताबाल संगोपन कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'एकुण गरोदर माता नोंदणी', target: '', achieved: '', percentage: '' },
    { program: '१२ आठवडयाच्या आत नोंदणी', target: '', achieved: '', percentage: '' },
    { program: 'गरोदर माता १८० लोहगोळया', target: '', achieved: '', percentage: '' },
    { program: 'गरोदर माता ३६० कॅल्शियम गोळया', target: '', achieved: '', percentage: '' },
    { program: 'गरोदर माता ४ वेळा तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'एकुण अतिजोखमीच्या माता नोंद', target: '', achieved: '', percentage: '' },
    { program: 'गर्भपात', target: '', achieved: '', percentage: '' },
    { program: 'वैद्यकिय गर्भपात', target: '', achieved: '', percentage: '' },
    { program: 'एकुण प्रसूती', target: '', achieved: '', percentage: '' },
    { program: 'संस्थात्मक प्रसूती', target: '', achieved: '', percentage: '' },
    { program: 'घरी झालेली प्रसूती', target: '', achieved: '', percentage: '' },
    { program: 'एकुण जिवंत जन्म', target: '', achieved: '', percentage: '' },
    { program: '२.५ किलोग्रामपेक्षा कमी वजनाचे बालक', target: '', achieved: '', percentage: '' },
    { program: '3) आर आय', target: '', achieved: '', percentage: '' },
    { program: 'लसीकरण विभाग', target: '', achieved: '', percentage: '' },
    { program: 'बिसीजी', target: '', achieved: '', percentage: '' },
    { program: 'विटॅमीन के', target: '', achieved: '', percentage: '' },
    { program: 'पेंन्टॅवॅलंट १', target: '', achieved: '', percentage: '' },
    { program: 'ओपीव्ही १', target: '', achieved: '', percentage: '' },
    { program: 'पेंन्टॅवॅलंट ३', target: '', achieved: '', percentage: '' },
    { program: 'ओपीव्ही ३', target: '', achieved: '', percentage: '' },
    { program: 'आयपीव्ही १', target: '', achieved: '', percentage: '' },
    { program: 'आयपीव्ही २', target: '', achieved: '', percentage: '' },
    { program: 'रोटाव्हायरस ३', target: '', achieved: '', percentage: '' },
    { program: 'पिसीव्ही १', target: '', achieved: '', percentage: '' },
    { program: 'पिसीव्ही २', target: '', achieved: '', percentage: '' },
    { program: 'संपुर्ण लसीकरण (एम आर १)', target: '', achieved: '', percentage: '' },
    { program: 'एम आर २', target: '', achieved: '', percentage: '' },
    { program: 'डिपीटी बुस्टर', target: '', achieved: '', percentage: '' },
    { program: 'पोलिओ बुस्टर', target: '', achieved: '', percentage: '' },
    { program: 'टीडी १० वर्ष', target: '', achieved: '', percentage: '' },
    { program: 'टीडी १६ वर्ष', target: '', achieved: '', percentage: '' },
    { program: 'वि.पी.डी', target: '', achieved: '', percentage: '' },
    { program: 'ए.ई.एफ.आय', target: '', achieved: '', percentage: '' },
    { program: 'एएनसी टीडी', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आरोग्य सेवा सत्रांची संख्या', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आयोजित सत्रे', target: '', achieved: '', percentage: '' },
    { program: 'एकुण सॅम बालके', target: '', achieved: '', percentage: '' },
    { program: 'एकुण मॅम बालके', target: '', achieved: '', percentage: '' },
    { program: '4) चाईल्ड हेल्थ', target: '', achieved: '', percentage: '' },
    { program: '० ते १ वर्षातील बालमृत्यू', target: '', achieved: '', percentage: '' },
    { program: '१ ते ५ वर्षातील बालमृत्यू', target: '', achieved: '', percentage: '' },
    { program: 'व्हिसीबल बर्थ डिफेक्ट', target: '', achieved: '', percentage: '' },
    { program: '5) मॅटर्नल हेल्थ', target: '', achieved: '', percentage: '' },
    { program: 'मॅटर्नल डेथ', target: '', achieved: '', percentage: '' },
    { program: 'प्रसूती कक्ष', target: '', achieved: '', percentage: '' },
    { program: 'ए.एम.बी कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'भरती प्रक्रिया/डिस्चार्ज कार्ड', target: '', achieved: '', percentage: '' },
    { program: 'JSSK कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'JSY कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: '6) RISE APP', target: '', achieved: '', percentage: '' },
    { program: '7) RCH Portal', target: '', achieved: '', percentage: '' },
    { program: '8) सुधारित राष्ट्रीय क्षयरोग नियंत्रण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'एकुण संशयित क्षयरोग नोंदणी', target: '', achieved: '', percentage: '' },
    { program: 'संशयित क्षयरुग्णाची थुकी नमूना तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'एक्स रे तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आढळलेले क्षयरुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'निक्क्षय पोर्टलवर क्षयरुग्णांची नोंदणी', target: '', achieved: '', percentage: '' },
    { program: 'लाभार्थ्याला DBT लाभ देण्यात आला आहे काय', target: '', achieved: '', percentage: '' },
    { program: 'उपचार सुरु केलेले क्षयरुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण मृत्यू झालेले क्षयरुग्ण', target: '', achieved: '', percentage: '' },
    { program: '9) राष्ट्रीय कुष्ठरोग दूरिकरण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'संशयित कुष्ठरुग्ण नोंदणी', target: '', achieved: '', percentage: '' },
    { program: 'एकुण क्रियाशिल रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'पीबी', target: '', achieved: '', percentage: '' },
    { program: 'एमबी', target: '', achieved: '', percentage: '' },
    { program: 'उपचार सुरु केलेले कुष्ठरुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'आरएफटी झालेले कुष्ठरुग्ण', target: '', achieved: '', percentage: '' },
    { program: '10) राष्ट्रीय किटकजन्य आजार नियंत्रण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'बाहयरुग्ण विभागात एकुण नवीन नोंदणी झालेल रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण रक्त नमूना गोळा केलेले रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'हिवताप आढळलेले रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'पीव्हि', target: '', achieved: '', percentage: '' },
    { program: 'पीएफ', target: '', achieved: '', percentage: '' },
    { program: 'एकुण उपचार केलेले रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण मृत्यू झालेले हिवताप रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'प्रा.आ.केंद्रामार्फत अंडवृध्दि शिबीराचे आयोजन', target: '', achieved: '', percentage: '' },
    { program: 'हत्तीरोग क्लिनिक व पायधूनी कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'पायधूनी किट वाटप', target: '', achieved: '', percentage: '' },
    { program: 'एकुण संशयित रुग्णाची डेंग्यू नमूना तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'एकुण डेंग्यूचे रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण डेंग्यू रुग्णाचा मृत्यू', target: '', achieved: '', percentage: '' },
    { program: '11) एकात्मिक साथरोग सर्व्हेक्षण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'एकुण उपकेंद्राची संख्या', target: '', achieved: '', percentage: '' },
    { program: 'एकुण भरलेले एस फार्म', target: '', achieved: '', percentage: '' },
    { program: 'एकुण भरलेले पी फार्म', target: '', achieved: '', percentage: '' },
    { program: 'एकुण भरलेले एल फार्म', target: '', achieved: '', percentage: '' },
    { program: 'एकुण पाणी नमूने तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'दूषीत आढळलेले पाणी नमूने', target: '', achieved: '', percentage: '' },
    { program: 'एकुण ब्लिचिंग पावडर नमूने तपासणी', target: '', achieved: '', percentage: '' },
    { program: 'दूषीत आढळलेले ब्लिचिंग पावडर नमूने', target: '', achieved: '', percentage: '' },
    { program: 'हिरवे कार्ड देण्यात आलेल्या ग्रामपचांयतीची संख्या', target: '', achieved: '', percentage: '' },
    { program: 'पिवळे कार्ड देण्यात आलेल्या ग्रामपचांयतीची संख्या', target: '', achieved: '', percentage: '' },
    { program: 'लाल कार्ड देण्यात आलेल्या ग्रामपचांयतीची संख्या', target: '', achieved: '', percentage: '' },
    { program: '12) राष्ट्रीय असांसर्गिक रोग नियंत्रण कार्यक्रम', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आढळलेले रक्तदाबाचे रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आढळलेले मधुमेह रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण आढळलेले रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण तोंडाच्या कर्करोगाचे रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण स्तनाच्या कर्करोगाचे रुग्ण', target: '', achieved: '', percentage: '' },
    { program: 'एकुण गर्भाशयाच्या कर्करोगाचे रुग्ण', target: '', achieved: '', percentage: '' }
  ]);
  
  const [formData, setFormData] = useState({
    health_center_name: '',
    location_name: '',
    planned_date: '',
    latitude: null,
    longitude: null,
    location_accuracy: null,
    location_detected: '',
    inspector_name: '',
    inspector_designation: '',
    general_observations: ''
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const isViewMode = editingInspection?.mode === 'view';
  const isEditMode = editingInspection?.mode === 'edit';

  useEffect(() => {
    if (editingInspection && editingInspection.id) {
      setFormData({
        health_center_name: editingInspection.health_center_name || '',
        location_name: editingInspection.location_name || '',
        planned_date: editingInspection.planned_date ? editingInspection.planned_date.split('T')[0] : '',
        latitude: editingInspection.latitude || null,
        longitude: editingInspection.longitude || null,
        location_accuracy: editingInspection.location_accuracy || null,
        location_detected: editingInspection.location_detected || '',
        inspector_name: editingInspection.inspector_name || '',
        inspector_designation: editingInspection.inspector_designation || '',
        general_observations: editingInspection.general_observations || ''
      });

      if (editingInspection.form_data) {
        setAnswers(editingInspection.form_data.answers || {});
        setProgramsData(editingInspection.form_data.programs || programsData);
      }
    }
  }, [editingInspection, programsData]);

  const handleRadioChange = (questionNum: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionNum]: value }));
  };

  const handleProgramsChange = (index: number, field: 'target' | 'achieved' | 'percentage', value: string) => {
    setProgramsData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
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
          let address = 'Location detected';
          if (data.results && data.results.length > 0) {
            address = data.results[0].formatted_address;
          }
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            location_accuracy: accuracy,
            location_detected: address,
            location_name: prev.location_name || address
          }));
        } catch (error) {
          console.error('Error getting address:', error);
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            location_accuracy: accuracy,
            location_detected: 'Address not found'
          }));
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        alert('Error getting location');
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
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024 && file.type.startsWith('image/'));
    setUploadedPhotos(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const preview = URL.createObjectURL(file);
      setPhotoPreviews(prev => [...prev, preview]);
    });
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhotosToSupabase = async (inspectionId: string) => {
    if (uploadedPhotos.length === 0) return;
    setIsUploading(true);
    try {
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const file = uploadedPhotos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `jilhastariya_${inspectionId}_${Date.now()}_${i}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
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
            description: `Jilhastariya inspection photo ${i + 1}`,
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
    return `JILHA-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!user) {
      alert('User not authenticated');
      return;
    }
    try {
      setIsLoading(true);
      const fullData = {
        ...formData,
        answers,
        programs: programsData,
        status: isDraft ? 'draft' : 'submitted',
        inspection_date: new Date().toISOString()
      };
      let inspectionResult;
      if (editingInspection && editingInspection.id) {
        const { data, error } = await supabase
          .from('fims_inspections')
          .update(fullData)
          .eq('id', editingInspection.id)
          .select()
          .single();
        if (error) throw error;
        inspectionResult = data;
      } else {
        const inspectionNumber = generateInspectionNumber();
        const { data, error } = await supabase
          .from('fims_inspections')
          .insert({
            inspection_number: inspectionNumber,
            category_id: 'jilhastariya_inspection_form',
            inspector_id: user.id,
            ...fullData
          })
          .select()
          .single();
        if (error) throw error;
        inspectionResult = data;
      }
      if (uploadedPhotos.length > 0) {
        await uploadPhotosToSupabase(inspectionResult.id);
      }
      alert(isDraft ? 'Saved as draft' : 'Submitted successfully');
      if (onBack) onBack();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const questions = [
    { num: 1, text: 'ओपीडी मध्ये आवश्यक उपकरणे व साधनसामुग्री उपलब्ध आहे काय ?' },
    { num: 2, text: 'नोंदणी प्रक्रियेदरम्यान रुग्णांना नोंदणी क्रमांक तसेच संपुर्ण तपशिल लिहीला जातो काय ?' },
    { num: 3, text: 'ओपीडी स्लिपमध्ये रुग्णांचा इतिहास, तक्रारी, तात्पुरते निदान नोंदविले जातात काय ?' },
    { num: 4, text: 'गरोदर मातेसाठी औषधीची सुविधा उपलब्ध आहे काय ?' },
    { num: 5, text: 'दररोज लागणारे उपकरणे व अत्यावश्यक औषधांची यादी आहे काय ?' },
    { num: 6, text: 'PIH (Pregnancy induced Hypertension) ची लक्षणे व त्यादरम्यान करण्याच्या उपायाबाबत माहीती आहे काय व त्याबाबत किट उपलब्ध आहे काय ?' },
    { num: 7, text: 'लसीकरण बाबत संपुर्ण माहीती आहे काय ? आयएलआर चे तापमान नोदींचे रजिस्टर उपलब्ध आहे काय ?' },
    { num: 8, text: 'Emergency Drug tray मधील औषधाच्या Expiry date चा चार्ट अद्यावत करण्यात येतो काय ?' },
    { num: 9, text: 'आरोग्य सेविकेचे एनएसएसके, आयुसीडी, एसबीए (Skill Birth Attendant) प्रशिक्षण घेऊन याबाबत कौशल्य प्राप्त केले आहे ?' },
    { num: 10, text: 'कुटुंब कल्याण कार्यक्रमामधील पाळणा लांबविण्याकरिता अंतरा, छाया संस्थेमध्ये उपलब्ध आहे काय, तसेच आयुसिडी व पीपीआययुसीडी बसविल्या जातात काय ?' },
    { num: 11, text: 'PMMVY, JSY, MVM, MAY ई योजने अंतर्गत प्रा.आ.केंद्र स्तरावर लाभार्थ्यांची नोंदणी व रजिस्टर अद्यावत ठेवण्यात आलेले आहे काय ? लाभार्थ्यांना विहित वेळेत आर्थीक लाभ देण्यात आला आहे काय ?' },
    { num: 12, text: 'दर महिन्याचे २८ ते ३० तारखेला उपकेंद्र स्तरावर, १ तारखेला प्रा.आ.केंद्र स्तरावर HMIS Data Validation Meeting नियमित घेतली जाते काय ?' },
    { num: 14, text: 'BMW/IMEP चे वर्गीकरणाबाबत माहीती अवगत आहे काय असल्यास त्यानुसार पिवळी व लाल बकेट तसेच निळा व पांढरा बॉक्समध्ये वर्गीकरण करता येते काय ? Biomedical waste साठी संस्था रजिस्टर्ड आहे काय ?' },
    { num: 15, text: 'Emergency Drug tray मध्ये ठेवण्यात येणाऱ्या औषधीबाबत वापर करण्याबाबतची माहीती आहे काय ?' },
    { num: 15, text: 'संस्थेतील प्रसाधन गृहे स्वच्छ आहे काय. स्वच्छतेची चेकलिस्ट लावण्यात आलेली आहे काय ?' },
    { num: 16, text: 'वयोवृध्द रुणांकरिता रुग्णालयात प्रवेश करतांना हातधरण्याकरिता रॅम्प (Ramp) व हॅडंल (Handle) उपलब्धआहे काय ?' },
    { num: 17, text: 'कार्यक्रमाबाबत देण्यात येणाऱ्या सुविधेबाबत माहीती त्यामध्ये विषयाबाबत समुपदेशन करणे व त्याबाबतची माहीती ठळकपणे प्रदर्शित करण्यात आली आहे काय ?' },
    { num: 18, text: 'प्रा.आ.केंद्र स्तरावर CRS Software मध्ये Online जन्म म≡त्युच्या नोंदी करुन लाभार्थ्यांना प्रमाणपत्र दिल्या जाते काय ?' },
    { num: 19, text: 'प्रा.आ. केद्रस्तरावर Biomedical Waste, Fire extinguisher वापराबाबत कर्मचाऱ्यांचे प्रशिक्षण झाले आहे ?' },
    { num: 20, text: 'संस्थेतील विविध विभागाचे मुल्यमापन चॅकलिस्ट नुसार करण्याचा कृती आराखडा उपलब्ध आहे काय व त्यानुसार कार्यवाही करण्यात येते काय ?' },
    { num: 21, text: 'विविध राष्ट्रीय कार्यक्रमाचे रेकॉर्ड अद्यावत आहे काय ?' },
    { num: 22, text: 'आरोग्य केंद्रातील तपासणी करिता लागणारे उपकरणे व साधनसामुग्री वापरण्याबाबत व त्याची काळजी घेण्याबाबत माहीती आहे काय ?' },
    { num: 23, text: 'आरोग्य केंद्रातील संस्थेत संदर्भ सेवा देणे आवश्यक असल्यास त्याबाबत ज्या संस्थेत रुग्ण संदर्भित होणार आहे त्या संस्थेला आधिच कळविणे गरजेचे आहे त्याबाबत आरोग्य सेविकेला माहीती आहे काय ?' },
    { num: 24, text: 'रेफर आऊट आणि रेफर इन रजिस्टर अद्यावत ठेवणे (Refferal Audit) याबाबत कर्मचाऱ्यांना माहिती आहे काय ?)' },
    { num: 25, text: '५ आर विषयी आरोग्य सेविकेला माहीती आहे काय ? ज्यामध्ये Right Patient, Right Drug, Right Route, Right time, Right documentation' },
    { num: 26, text: 'एनसीडी कार्यक्रमानुसार Hypertension, Blood Sugar Cervical cancer इत्यादी आजाराबाबत तपासणी केली जाते काय व त्याबाबत गोषवारा संस्थेत उपलब्ध आहे काय ?' },
    { num: 27, text: 'प्रा.आ.केंद्रात गप्पीमासे पैदास केंद्रे कार्यरत आहे काय ?' }
  ];

  const YesNoRadio = ({ name, value, onChange }: { name: string; value: string; onChange: (value: string) => void; }) => (
    <div className="flex items-center justify-center gap-6">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name={name}
          value="होय"
          checked={value === 'होय'}
          onChange={(e) => onChange(e.target.value)}
          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
          disabled={isViewMode}
        />
        <span className="text-gray-700 font-medium">होय</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name={name}
          value="नाही"
          checked={value === 'नाही'}
          onChange={(e) => onChange(e.target.value)}
          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
          disabled={isViewMode}
        />
        <span className="text-gray-700 font-medium">नाही</span>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {onBack && (
          <button onClick={onBack} className="mb-4 flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-2" size={20} />
            Back
          </button>
        )}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-8">
            <h1 className="text-3xl font-bold text-center">Zilhastariya-Adhikari-Tapasani-Suchi-Forms</h1>
          </div>

          <div className="p-8">
            {/* Basic Details Section - Added */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Health Center Name"
                  value={formData.health_center_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, health_center_name: e.target.value }))}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isViewMode}
                />
                <input
                  type="text"
                  placeholder="Location Name"
                  value={formData.location_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isViewMode}
                />
                <input
                  type="date"
                  value={formData.planned_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, planned_date: e.target.value }))}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isViewMode}
                />
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation || isViewMode}
                  className="p-2 bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
                >
                  <MapPin className="mr-2" size={16} />
                  {isGettingLocation ? 'Getting Location...' : 'Get GPS Location'}
                </button>
              </div>
              {formData.latitude && (
                <div className="p-4 bg-green-100 rounded-lg border border-green-200">
                  Location: Lat {formData.latitude.toFixed(6)}, Lng {formData.longitude.toFixed(6)}, Accuracy: {formData.location_accuracy}m
                  <br />
                  Detected: {formData.location_detected}
                </div>
              )}
            </section>

            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
                आवश्यक बाबींची प्रश्नावली
              </h2>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">अ. क्र.</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">आवश्यक बाबींची प्रश्नावली</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">होय/नाही</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 text-center font-medium">१</td>
                      <td className="border border-gray-300 px-4 py-3 font-medium">२</td>
                      <td className="border border-gray-300 px-4 py-3 text-center"></td>
                    </tr>
                    {questions.map((q, index) => (
                      <tr key={q.num} className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'}>
                        <td className="border border-gray-300 px-4 py-3 text-center font-medium">{q.num}</td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{q.text}</td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <YesNoRadio
                            name={`question-${q.num}`}
                            value={answers[q.num] || ''}
                            onChange={(value) => handleRadioChange(q.num, value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
                राष्ट्रीय कार्यक्रम
              </h2>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">राष्ट्रीय कार्यक्रम</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">उद्दिष्ट</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">साध्य</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">टक्केवारी</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programsData.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'}>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {row.program}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={row.target}
                            onChange={(e) => handleProgramsChange(index, 'target', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                            disabled={isViewMode}
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={row.achieved}
                            onChange={(e) => handleProgramsChange(index, 'achieved', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                            disabled={isViewMode}
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={row.percentage}
                            onChange={(e) => handleProgramsChange(index, 'percentage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                            disabled={isViewMode}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Photo Upload Section - Added */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Photo Upload</h2>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isViewMode || uploadedPhotos.length >= 5}
                style={{ display: 'none' }}
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className={`p-4 border-2 rounded cursor-pointer block text-center ${uploadedPhotos.length >= 5 ? 'border-gray-300 bg-gray-100' : 'border-dashed border-blue-300 hover:border-blue-500'}`}>
                <Camera size={24} className="mx-auto mb-2" />
                {uploadedPhotos.length >= 5 ? 'Max Photos Reached (5)' : 'Select Photos (Max 5, 10MB each)'}
              </label>
              {uploadedPhotos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedPhotos.map((file, index) => (
                    <div key={index} className="relative">
                      <img src={photoPreviews[index]} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded border" />
                      {!isViewMode && (
                        <button 
                          onClick={() => removePhoto(index)} 
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Additional Fields - Added */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <input
                type="text"
                placeholder="Inspector Name"
                value={formData.inspector_name}
                onChange={(e) => setFormData(prev => ({ ...prev, inspector_name: e.target.value }))}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isViewMode}
              />
              <input
                type="text"
                placeholder="Designation"
                value={formData.inspector_designation}
                onChange={(e) => setFormData(prev => ({ ...prev, inspector_designation: e.target.value }))}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isViewMode}
              />
              <textarea
                placeholder="General Observations"
                value={formData.general_observations}
                onChange={(e) => setFormData(prev => ({ ...prev, general_observations: e.target.value }))}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                rows={3}
                disabled={isViewMode}
              />
            </div>

            <div className="mt-8 flex justify-center gap-4">
              {!isViewMode ? (
                <>
                  <button 
                    onClick={() => handleSubmit(true)}
                    disabled={isLoading || isUploading}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <Save className="inline mr-2" size={20} />
                    Save as Draft
                  </button>
                  <button 
                    onClick={() => handleSubmit(false)}
                    disabled={isLoading || isUploading}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <Send className="inline mr-2" size={20} />
                    Submit
                  </button>
                  <button 
                    onClick={() => {
                      setAnswers({});
                      setProgramsData(programsData.map(p => ({ ...p, target: '', achieved: '', percentage: '' })));
                      setFormData({
                        health_center_name: '',
                        location_name: '',
                        planned_date: '',
                        latitude: null,
                        longitude: null,
                        location_accuracy: null,
                        location_detected: '',
                        inspector_name: '',
                        inspector_designation: '',
                        general_observations: ''
                      });
                      setUploadedPhotos([]);
                      setPhotoPreviews([]);
                    }}
                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all shadow-md"
                  >
                    Reset
                  </button>
                </>
              ) : (
                <button onClick={onBack} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold">
                  Back
                </button>
              )}
              {isLoading && <p className="text-center text-blue-600">Loading...</p>}
              {isUploading && <p className="text-center text-green-600">Uploading photos...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JilhastrariyaInspectionForm;
