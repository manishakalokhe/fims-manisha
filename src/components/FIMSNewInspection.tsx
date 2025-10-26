import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Camera, 
  MapPin, 
  Building2, 
  School, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Building, 
  UserCheck, 
  ClipboardList, 
  Award, 
  Target, 
  SquareCheck as CheckSquare, 
  FileCheck, 
  UserPlus, 
  Settings, 
  Activity 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AnganwadiTapasaniForm } from './AnganwadiTapasaniForm';
import { FIMSOfficeInspection } from './FIMSOfficeInspection';
import { RajyaShaishanikPrashikshanForm } from './RajyaShaishanikPrashikshanForm';
import { BandhkamVibhag1Form } from './BandhkamVibhag1Form';
import { BandhkamVibhag2Form } from './BandhkamVibhag2Form';
import { ZPDarMahinyalaSadarKaryachePrapatraForm } from './ZPDarMahinyalaSadarKaryachePrapatraForm';
import { RajyaGunwattaNirikshakTapasaniForm } from './RajyaGunwattaNirikshakTapasaniForm';
import { MahatmaGandhiRojgarHamiForm } from './MahatmaGandhiRojgarHamiForm';
import { MumbaiNyayalayTapasaniForm } from './MumbaiNyayalayTapasaniForm';
// Fix: Remove .tsx extensions
import { PahuvaidhakiyaTapasaniForm } from './PahuvaidhakiyaTapasaniForm';
import { GrampanchayatInspectionForm } from './GrampanchayatInspectionForm';

import type { User as SupabaseUser } from '@supabase/supabase-js';

interface FIMSNewInspectionProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

export const FIMSNewInspection: React.FC<FIMSNewInspectionProps> = ({
  user,
  onBack,
  categories,
  onInspectionCreated,
  editingInspection
}) => {
  const { t } = useTranslation();
  const [selectedInspectionType, setSelectedInspectionType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Single useEffect for editing inspection - Fix: Removed duplicate
  useEffect(() => {
    if (editingInspection && editingInspection.id && categories.length > 0) {
      const category = categories.find((cat: any) => cat.id === editingInspection.category_id);
      if (category && category.form_type) {
        setSelectedInspectionType(category.form_type);
      }
    }
  }, [editingInspection, categories]);

  // Handle inspection type selection
  const handleInspectionTypeSelect = (type: string) => {
    setSelectedInspectionType(type);
  };

  // Handle back navigation
  const handleBackToSelection = () => {
    if (editingInspection && editingInspection.id) {
      onBack();
      return;
    }
    setSelectedInspectionType(null);
  };

  // Render the appropriate inspection form based on selection
  const renderInspectionForm = () => {
    if (selectedInspectionType === 'anganwadi') {
      return (
        <AnganwadiTapasaniForm
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'office') {
      return (
        <FIMSOfficeInspection
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'bandhkam_vibhag1') {
      return (
        <BandhkamVibhag1Form
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'bandhkam_vibhag2') {
      return (
        <BandhkamVibhag2Form
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'rajya_shaishanik') {
      return (
        <RajyaShaishanikPrashikshanForm
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }
    
    if (selectedInspectionType === 'zp_dar_mahinyala') {
      return (
        <ZPDarMahinyalaSadarKaryachePrapatraForm
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'rajya_gunwatta_nirikshak') {
      return (
        <RajyaGunwattaNirikshakTapasaniForm
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'mahatma_gandhi_rojgar_hami') {
      return (
        <MahatmaGandhiRojgarHamiForm
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'mumbai_nyayalay') {
      return (
        <MumbaiNyayalayTapasaniForm
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'pashutapasani') {
      return (
        <PahuvaidhakiyaTapasaniForm
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'gram_panchayat') {
      return (
        <GrampanchayatInspectionForm
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    return null;
  };

  // If an inspection type is selected, render the form
  if (selectedInspectionType) {
    return renderInspectionForm();
  }

  // Error handling: If categories empty, show loading or error
  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Categories Loading...</h2>
          <p className="text-gray-600">कृपया थोडा वाट पहा. डेटा लोड होत आहे.</p>
          {isLoading && <p className="text-sm text-blue-600 mt-2">Loading categories from database...</p>}
        </div>
      </div>
    );
  }

  // Default view - inspection type selection
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">
              {t('fims.newInspection')}
            </h1>
            <div className="w-20"></div>
          </div>
          
          <p className="text-sm md:text-base text-gray-600 text-center">
            {t('fims.selectCategory')}
          </p>
        </div>

        {/* Inspection Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Anganwadi Inspection */}
          <div 
            onClick={() => handleInspectionTypeSelect('anganwadi')}
            className="bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 rounded-lg shadow-lg border-2 border-purple-200 p-4 md:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer hover:border-purple-400 touch-manipulation hover:from-purple-200 hover:via-purple-100 hover:to-pink-100"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Building2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  अंगणवाडी केंद्र तपासणी
                </h3>
                <p className="text-sm md:text-base text-purple-700 font-medium">
                  अंगणवाडी केंद्र तपासणी
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-purple-800">
              <p>• पायाभूत सुविधा आणि सुविधांचे मूल्यांकन</p>
              <p>• उपकरणे आणि साहित्य सत्यापन</p>
              <p>• मुलांची माहिती आणि नोंदी</p>
              <p>• पोषण आणि आरोग्य सेवा</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-purple-700 bg-white/50 px-3 py-1 rounded-full">
                तपासणी सुरू करण्यासाठी निवडा
              </span>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-full shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {/* Office Inspection */}
          <div 
            onClick={() => handleInspectionTypeSelect('office')}
            className="bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 rounded-lg shadow-lg border-2 border-blue-200 p-4 md:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer hover:border-blue-400 touch-manipulation hover:from-blue-200 hover:via-blue-100 hover:to-cyan-100"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  दफ्तर निरीक्षण प्रपत्र
                </h3>
                <p className="text-sm md:text-base text-blue-700 font-medium">
                  दफ्तर निरीक्षण
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-blue-800">
              <p>• कर्मचारी माहिती आणि कामाचे स्वरूप</p>
              <p>• पत्र व्यवहार तपशील तपासणी</p>
              <p>• नोंदवह्या आणि दप्तरची रचना</p>
              <p>• कामाचा दर्जा मूल्यांकन</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-blue-700 bg-white/50 px-3 py-1 rounded-full">
                तपासणी सुरू करण्यासाठी निवडा
              </span>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-full shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {/* Rajya Shaishanik Prashikshan Form */}
          <div 
            onClick={() => handleInspectionTypeSelect('rajya_shaishanik')}
            className="bg-gradient-to-br from-green-100 via-green-50 to-emerald-50 rounded-lg shadow-lg border-2 border-green-200 p-4 md:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer hover:border-green-400 touch-manipulation hover:from-green-200 hover:via-green-100 hover:to-emerald-100"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <School className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  आदर्श शाळा भेट प्रपत्र
                </h3>
                <p className="text-sm md:text-base text-green-700 font-medium">
                  राज्य शैक्षणिक संशोधन व प्रशिक्षण
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-green-800">
              <p>• शाळेची माहिती आणि पटसंख्या</p>
              <p>• Khan Academy पोर्टल वापर</p>
              <p>• SQDP आणि निपुण भारत लक्ष्य</p>
              <p>• शैक्षणिक गुणवत्ता मूल्यांकन</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-green-700 bg-white/50 px-3 py-1 rounded-full">
                तपासणी सुरू करण्यासाठी निवडा
              </span>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-full shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>  
          
          {/* Other form cards - same as your original, but with Plus icon now available */}
          {[
            { key: 'bandhkam_vibhag1', title: 'बांधकाम विभाग प्रपत्र-1', subtitle: 'Construction Department Form-1', color: 'orange', active: true },
            { key: 'bandhkam_vibhag2', title: 'बांधकाम विभाग प्रपत्र-2', subtitle: 'Construction Department Form-2', color: 'teal', active: true },
            { key: 'zp_dar_mahinyala', title: 'दर महिन्याला सादर करावयाचे प्रपत्र', subtitle: 'ZP Monthly Report Form', color: 'indigo', active: true },
            { key: 'rajya_gunwatta_nirikshak', title: 'राज्य गुणवत्ता निरीक्षक तपासणी', subtitle: 'State Quality Inspector Inspection', color: 'emerald', active: true },
            { key: 'mahatma_gandhi_rojgar_hami', title: 'महात्मा गांधी रोजगार हमी योजना', subtitle: 'MGNREGA Work Inspection Form', color: 'green', active: true },
            { key: 'mumbai_nyayalay', title: 'मुंबई न्यायालय तपासणी प्रपत्र', subtitle: 'Mumbai High Court School Inspection Form', color: 'red', active: true },
            { key: 'pashutapasani', title: 'पशुवैद्यकीय संस्थांचे तांत्रिक निरीक्षण', subtitle: 'Veterinary Institution Technical Inspection Form', color: 'red', active: true },
            { key: 'gram_panchayat', title: 'ग्राम पंचायतांची तपासणीचा नमुना', subtitle: 'Grampanchayat Inspection Form', color: 'purple', active: true },
          ].map((form) => (
            <div 
              key={form.key}
              onClick={() => form.active ? handleInspectionTypeSelect(form.key) : alert(`${form.title} - Coming Soon!`)}
              className={`bg-gradient-to-br from-${form.color}-100 via-${form.color}-50 to-${form.color}-50 rounded-lg shadow-lg border-2 border-${form.color}-200 p-4 md:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer hover:border-${form.color}-400 touch-manipulation ${!form.active ? 'opacity-75' : ''}`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`bg-gradient-to-br from-${form.color}-500 to-${form.color}-600 p-3 rounded-xl shadow-lg`}>
                  <FileCheck className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    {form.title}
                  </h3>
                  <p className={`text-sm md:text-base text-${form.color}-700 font-medium`}>
                    {form.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                {/* Your existing descriptions for each form */}
                {form.key === 'bandhkam_vibhag1' ? (
                  <>
                    <p>• प्रशासकीय व तांत्रिक मान्यता तपशील</p>
                    <p>• कारनामा व ठेकेदार माहिती</p>
                    <p>• कामाची सद्यस्थिती व प्रगती</p>
                    <p>• देयक व मोजमाप तपशील</p>
                  </>
                ) : form.key === 'gram_panchayat' ? (
                  <>
                    <p>• पंचायत समिती</p>
                    <p>• तपासणी अधिकारीाचे नांव</p>
                    <p>• सभेची कार्यसूची व सभेची नोंदवही</p>
                    <p>• मासिक सभा</p>
                    <p>• सर्वसाधारण तपासणीचे ठिकाण</p>
                  </>
                ) : (
                  <p>• तपासणी सुविधा उपलब्ध</p>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-sm font-bold text-${form.color}-700 bg-white/50 px-3 py-1 rounded-full`}>
                  {form.active ? 'तपासणी सुरू करण्यासाठी निवडा' : 'Coming Soon'}
                </span>
                <div className={`bg-gradient-to-r from-${form.color}-500 to-${form.color}-600 p-2 rounded-full shadow-lg`}>
                  <Plus className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information - same as original */}
        <div className="mt-6 md:mt-8 bg-gradient-to-r from-blue-100 via-cyan-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg shadow-md">
              <Camera className="h-5 w-5 text-white flex-shrink-0" />
            </div>
            <div>
              <h4 className="text-base font-bold text-blue-900 mb-2">
                {t('fims.photoDocumentationRequired')}
              </h4>
              <p className="text-sm text-blue-800 font-medium">
                {t('fims.photoDocumentationRequiredDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 md:mt-4 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-lg shadow-md">
              <MapPin className="h-5 w-5 text-white flex-shrink-0" />
            </div>
            <div>
              <h4 className="text-base font-bold text-amber-900 mb-2">
                {t('fims.gpsLocationCaptureRequired')}
              </h4>
              <p className="text-sm text-amber-800 font-medium">
                {t('fims.gpsLocationCaptureDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
