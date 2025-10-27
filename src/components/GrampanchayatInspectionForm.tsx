import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Save,
  Send,
  FileText,
  Users
} from 'lucide-react';

export const GrampanchayatInspectionForm: React.FC = () => {
  const [monthlyMeetings, setMonthlyMeetings] = useState('');
  const [agendaUpToDate, setAgendaUpToDate] = useState('');
  const [receiptUpToDate, setReceiptUpToDate] = useState('');
  const [reassessmentDone, setReassessmentDone] = useState('');
  const [reassessmentAction, setReassessmentAction] = useState('');

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

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!gpName.trim()) {
      alert('ग्राम पंचायतिचे नांव आवश्यक आहे');
      return;
    }

    try {
      setIsLoading(true);
      const message = isDraft ? 'मसुदा सेव्ह झाला' : 'तपासणी सबमिट झाली';
      alert(message);
    } catch (error: any) {
      console.error('Error saving inspection:', error);
      alert('तपासणी सेव्ह करताना त्रुटी: ' + (error.message || 'अज्ञात त्रुटी'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center flex-1">
              ग्राम पंचायत तपासणी
            </h1>
            <div className="w-24"></div>
          </div>

          <p className="text-base md:text-lg text-gray-600 text-center font-medium">
            ग्राम पंचायत निरीक्षण प्रपत्र भरा
          </p>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div style={{ fontFamily: 'Arial, sans-serif', direction: 'ltr' }}>
            <h1 style={{ textAlign: 'center', color: '#1f2937', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>परिशिष्ट-चार</h1>
            <p style={{ textAlign: 'center', fontWeight: 'bold', color: '#374151' }}>(नियम 80 पहा)</p>
            <p style={{ textAlign: 'center', fontWeight: 'bold', color: '#374151', marginBottom: '2rem' }}>(ख)ग्राम पंचायतांची सर्वसाधारण तपासणीचा नमुना</p>

            {/* Basic Information Section */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                मूळ माहिती
              </h2>

              <ol style={{ marginLeft: '20px', lineHeight: '2.5' }}>
                <li className="mb-4">
                  <label className="font-semibold text-gray-700">ग्राम पंचायतिचे नांव:</label>
                  <input
                    type="text"
                    value={gpName}
                    onChange={(e) => setGpName(e.target.value)}
                    className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    placeholder="ग्राम पंचायतिचे नांव"
                  />
                  <label className="ml-4 font-semibold text-gray-700">पंचायत समिती:</label>
                  <input
                    type="text"
                    value={psName}
                    onChange={(e) => setPsName(e.target.value)}
                    className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    placeholder="पंचायत समिती"
                  />
                </li>
                <li className="mb-4">
                  <label className="font-semibold text-gray-700">(क) सर्वसाधारण तपासणीची तारीख:</label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </li>
                <li className="mb-4">
                  <label className="font-semibold text-gray-700">(ख) सर्वसाधारण तपासणीचे ठिकाण:</label>
                  <input
                    type="text"
                    value={inspectionPlace}
                    onChange={(e) => setInspectionPlace(e.target.value)}
                    className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                    placeholder="तपासणीचे ठिकाण"
                  />
                </li>
                <li className="mb-4">
                  <label className="font-semibold text-gray-700">तपासणी अधिकारीाचे नांव व हुद्दा:</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-56"
                    placeholder="अधिकारीाचे नांव"
                  />
                  <span className="mx-2 text-gray-500">/</span>
                  <input
                    type="text"
                    value={officerPost}
                    onChange={(e) => setOfficerPost(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-56"
                    placeholder="हुद्दा"
                  />
                </li>
                <li className="mb-4">
                  <label className="font-semibold text-gray-700">सचिवाचे नांव व तो सदस्य पंचायतीत केलेला पासून काम करीत आहे:</label>
                  <input
                    type="text"
                    value={secretaryName}
                    onChange={(e) => setSecretaryName(e.target.value)}
                    className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-56"
                    placeholder="सचिवाचे नांव"
                  />
                  <span className="mx-2 text-gray-500">/</span>
                  <input
                    type="text"
                    value={secretaryTenure}
                    onChange={(e) => setSecretaryTenure(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-56"
                    placeholder="कार्यकाळ"
                  />
                </li>
              </ol>
            </div>

           {/* Location Section - Added After Basic Information */}
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-green-600" />
                स्थान माहिती
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    स्थानाचे नाव
                  </label>
                  <input
                    type="text"
                    value={inspectionData.location_name || gpName}
                    onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="स्थानाचे नाव"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    तारीख
                  </label>
                  <input
                    type="date"
                    value={inspectionData.planned_date || ''}
                    onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg mb-4"
              >
                <MapPin className="w-6 h-6" />
                {isGettingLocation ? 'स्थान मिळवत आहे...' : 'GPS स्थान मिळवा'}
              </button>

              {inspectionData.latitude && (
                <div className="p-4 bg-white border-2 border-green-300 rounded-lg shadow-sm">
                  <p className="text-sm text-green-800">
                    <strong className="text-lg">स्थान कॅप्चर केले:</strong><br />
                    <span className="inline-block mt-2">
                      <strong>अक्षांश:</strong> {inspectionData.latitude.toFixed(6)}<br />
                      <strong>रेखांश:</strong> {inspectionData.longitude?.toFixed(6)}<br />
                      <strong>अचूकता:</strong> {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Meeting Information */}
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                सभा माहिती
              </h2>

              <ol start={6} style={{ marginLeft: '20px', lineHeight: '2.5' }}>
                <li className="mb-4">
                  <label className="font-semibold text-gray-700">मासिक सभा नियमांनुसार नियमितपणे होतात काय ?</label>
                  <div className="ml-6 mt-2 space-x-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="monthlyMeetings"
                        value="होय"
                        checked={monthlyMeetings === 'होय'}
                        onChange={(e) => setMonthlyMeetings(e.target.value)}
                        className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-gray-800 font-medium">होय</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="monthlyMeetings"
                        value="नाही"
                        checked={monthlyMeetings === 'नाही'}
                        onChange={(e) => setMonthlyMeetings(e.target.value)}
                        className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-gray-800 font-medium">नाही</span>
                    </label>
                  </div>
                </li>
                <ul style={{ marginLeft: '20px' }}>
                  <li className="mb-4">
                    <label className="font-semibold text-gray-700">सभेची कार्यसूची व सभेची नोंदवही ईत्यादी अद्यावत आहे काय ?</label>
                    <div className="ml-6 mt-2 space-x-6">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="agendaUpToDate"
                          value="होय"
                          checked={agendaUpToDate === 'होय'}
                          onChange={(e) => setAgendaUpToDate(e.target.value)}
                          className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-gray-800 font-medium">होय</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="agendaUpToDate"
                          value="नाही"
                          checked={agendaUpToDate === 'नाही'}
                          onChange={(e) => setAgendaUpToDate(e.target.value)}
                          className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-gray-800 font-medium">नाही</span>
                      </label>
                    </div>
                  </li>
                </ul>
              </ol>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-3 text-center border border-blue-500">अ.क्र.</th>
                    <th className="px-4 py-3 text-center border border-blue-500">नोंदवहीचे नाव</th>
                    <th className="px-4 py-3 text-center border border-blue-500">तपासणीच्या तारखेला शिल्लक</th>
                    <th className="px-4 py-3 text-center border border-blue-500">बँकेतिल शिल्लक</th>
                    <th className="px-4 py-3 text-center border border-blue-500">पोस्टातिल शिल्लक</th>
                    <th className="px-4 py-3 text-center border border-blue-500">हाती असलेली शिल्लक</th>
                    <th className="px-4 py-3 text-center border border-blue-500">चेक</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">1</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">ग्रामनिधी</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">2</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">पाणी पुरवठा</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                    <th colSpan={7} className="px-4 py-3 text-center border border-teal-500 text-lg font-bold">(7) रोकड वहीचा तपशील</th>
                  </tr>
                  <tr className="bg-teal-100">
                    <th className="px-4 py-3 text-center border border-gray-300">अ.क्र.</th>
                    <th className="px-4 py-3 text-center border border-gray-300">नोंदवहीचे नाव</th>
                    <th className="px-4 py-3 text-center border border-gray-300">तपासणीच्या तारीखेला शिल्लक</th>
                    <th className="px-4 py-3 text-center border border-gray-300">बँकेतिल शिल्लक</th>
                    <th className="px-4 py-3 text-center border border-gray-300">पोस्टातिल शिल्लक</th>
                    <th className="px-4 py-3 text-center border border-gray-300">हाती असलेली शिल्लक</th>
                    <th className="px-4 py-3 text-center border border-gray-300">चेक</th>
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
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'}>
                      <td className="px-4 py-3 text-center border border-gray-300">{row[0]}</td>
                      <td className="px-4 py-3 border border-gray-300 font-medium">{row[1]}</td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">(8)(क) कर आकारणी नोंदवही(नमुना 8) :- नाही</h3>
              <p className="mb-3 text-gray-700">1.कराच्या मागणीचे नोंदणी पुस्तक (नमुना 9):-</p>
              <p className="mb-4 text-gray-700">
                2.कराची पावती (नमुना 10):-हे अद्यावत आहे काय ?
                <span className="ml-6 space-x-6">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="receiptUpToDate"
                      value="होय"
                      checked={receiptUpToDate === 'होय'}
                      onChange={(e) => setReceiptUpToDate(e.target.value)}
                      className="w-5 h-5 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-gray-800 font-medium">होय</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="receiptUpToDate"
                      value="नाही"
                      checked={receiptUpToDate === 'नाही'}
                      onChange={(e) => setReceiptUpToDate(e.target.value)}
                      className="w-5 h-5 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-gray-800 font-medium">नाही</span>
                  </label>
                </span>
              </p>
              <p className="mb-3 text-gray-700">(ख) मागील फेर आकारणी केलेली झाली ? दिनांक
                <input type="date" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                / / ठराव क्रमांक -
                <input
                  type="text"
                  value={resolutionNo}
                  onChange={(e) => setResolutionNo(e.target.value)}
                  className="ml-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-40"
                />
              </p>
              <p className="mb-3 text-gray-700">नाही</p>
              <p className="mb-3 text-gray-700">(ग) चार वर्षे पूर्ण झालेली असल्यास ,नटल्याने फेर आकारणी करण्यासाठी कार्यवाही चालू आहे किंवा नाही ?</p>
              <div className="ml-6 space-x-6">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="reassessmentAction"
                    value="होय"
                    checked={reassessmentAction === 'होय'}
                    onChange={(e) => setReassessmentAction(e.target.value)}
                    className="w-5 h-5 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-gray-800 font-medium">होय</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="reassessmentAction"
                    value="नाही"
                    checked={reassessmentAction === 'नाही'}
                    onChange={(e) => setReassessmentAction(e.target.value)}
                    className="w-5 h-5 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-gray-800 font-medium">नाही</span>
                </label>
              </div>
            </div>

            <div className="bg-pink-50 border-l-4 border-pink-500 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">(9) तपासणी तारखेस कर वसुलीची प्रगती खालीलप्रमाणे आहे :-</h3>
              <ul style={{ marginLeft: '20px', lineHeight: '2.5' }}>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(1) मागील येणे रक्कम :- </label>
                  गृहकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                  पाणीकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(2) चालू वर्षात मागणी :- </label>
                  गृहकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                  पाणीकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(3) एकुण मागणी :- </label>
                  गृहकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                  पाणीकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(4) एकुण वसूली :- </label>
                  गृहकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                  पाणीकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(5) शिल्लक वसूली :- </label>
                  गृहकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                  पाणीकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(6) टक्केवारी :- </label>
                  गृहकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                  पाणीकर- <input type="number" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-32" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(7) शेरा :- </label>
                  <input type="text" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-96" />
                </li>
              </ul>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">(10) मागास वर्गीयाकरीता राखून ठेवलेल्या 15% निधीच्या खर्चाचा तपशील:-</h3>
              <ul style={{ marginLeft: '20px', lineHeight: '2.5' }}>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(1) ग्राम पंचायतीचे एकुण उत्पन्न :- </label>
                  <input type="number" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(2) 15% रक्कम :- </label>
                  <input type="number" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(3) मागील अनुशेष </label>
                  <input type="number" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(4) करावयाचा एकुण खर्च </label>
                  <input type="number" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(5) तपासणीत्या दिनांक पर्यंत झालेला खर्च: </label>
                  <input type="number" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
                </li>
                <li className="mb-3">
                  <label className="font-semibold text-gray-700">(6) शिल्लक खर्च </label>
                  <input type="number" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
                </li>
              </ul>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">(7) सूचना-</h3>
              <h3 className="text-lg font-bold text-gray-800 mb-4">(11) आर्थिक व्यवहारात निर्देशानुसार आलेल्या नियमबाह्यता -</h3>
              <p className="mb-4 text-gray-700">
                (क) कोणत्याही चालू खरेदी करणाऱ्यापूर्वी अंदाजपत्रकात योग्य तरतूद केली आहे काय ?
                <span className="ml-6 space-x-6">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="budgetProvision" value="होय" className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                    <span className="ml-2 text-gray-800 font-medium">होय</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="budgetProvision" value="नाही" className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                    <span className="ml-2 text-gray-800 font-medium">नाही</span>
                  </label>
                </span>
              </p>
              <p className="mb-4 text-gray-700">(ख) ग्राम पंचायत खरेदीसाठी मान्यता दिली आहे काय ? ठराव क्र.
                <input type="text" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-32" />
                दि.
                <input type="date" className="mx-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                /
              </p>
              <p className="mb-4 text-gray-700">(ग) खरेदी करण्यासाठी नियमप्रमाणे दरपत्रके मागविली होती काय ?
                <span className="ml-6 space-x-6">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="tendersCalled" value="होय" className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                    <span className="ml-2 text-gray-800 font-medium">होय</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="tendersCalled" value="नाही" className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                    <span className="ml-2 text-gray-800 font-medium">नाही</span>
                  </label>
                </span>
              </p>
              <p className="mb-4 text-gray-700">(घ) खरेदी केलेल्या साहित्याचा नमुना 9,15 व 16 मधील नोंदवहीत नोंदी घेण्यात आल्या आहेत काय ?</p>
              <div className="ml-6 space-x-6">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="radio" name="entriesMade" value="होय" className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                  <span className="ml-2 text-gray-800 font-medium">होय</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="radio" name="entriesMade" value="नाही" className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                  <span className="ml-2 text-gray-800 font-medium">नाही</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 border-l-4 border-gray-500 p-6 rounded-lg mb-6">
              <p className="text-gray-700 font-semibold mb-4">(12) ग्राम पंचायताने स्वतःच्या निधीतून किंवा शासकीय/जिल्हा परिषद योजनेंतर्गत हात घेतलेल्या कामांचा तपशील-</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden mb-4">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                      <th className="px-4 py-3 text-center border border-gray-500">अ.क्र.</th>
                      <th className="px-4 py-3 text-center border border-gray-500">योजनेचे नांव</th>
                      <th className="px-4 py-3 text-center border border-gray-500">कामाचा प्रकार</th>
                      <th className="px-4 py-3 text-center border border-gray-500">अंदाजित रक्कम</th>
                      <th className="px-4 py-3 text-center border border-gray-500">मिळालेले अनुदान</th>
                      <th className="px-4 py-3 text-center border border-gray-500">झालेला खर्च</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:outline-none text-center" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:outline-none" /></td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                      <th className="px-4 py-3 text-center border border-gray-500">काम सुरु झाल्याची तारीख</th>
                      <th className="px-4 py-3 text-center border border-gray-500">काम पूर्ण झाल्याची तारीख</th>
                      <th className="px-4 py-3 text-center border border-gray-500">प्रगतीवर असलेल्या कामाची सद्य:स्थिती</th>
                      <th className="px-4 py-3 text-center border border-gray-500">पूर्णत्वाचे प्रमाणपत्र प्राप्त केले किंवा नाही</th>
                      <th className="px-4 py-3 text-center border border-gray-500">शेरा</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300"><input type="date" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="date" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300">
                        <div className="space-x-4">
                          <label className="inline-flex items-center"><input type="radio" name="certificate1" value="होय" className="w-4 h-4 text-gray-600" /> <span className="ml-1">होय</span></label>
                          <label className="inline-flex items-center"><input type="radio" name="certificate1" value="नाही" className="w-4 h-4 text-gray-600" /> <span className="ml-1">नाही</span></label>
                        </div>
                      </td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:outline-none" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-cyan-50 border-l-4 border-cyan-500 p-6 rounded-lg mb-6">
              <p className="text-gray-700 font-semibold mb-4">(13) ग्राम पंचायतांनी इतर योजनामध्ये केलेली प्रगती</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
                      <th className="px-4 py-3 text-center border border-cyan-500">अ.क्र.</th>
                      <th className="px-4 py-3 text-center border border-cyan-500">योजनेचे नाव</th>
                      <th className="px-4 py-3 text-center border border-cyan-500">दिलेली उद्दिष्टे</th>
                      <th className="px-4 py-3 text-center border border-cyan-500">तपासणीच्या दिनांकास</th>
                      <th className="px-4 py-3 text-center border border-cyan-500">शेरा</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center border border-gray-300">1</td>
                      <td className="px-4 py-3 border border-gray-300 font-medium">एगाविका.</td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center border border-gray-300">2</td>
                      <td className="px-4 py-3 border border-gray-300 font-medium">बॉयोगॅस</td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center border border-gray-300">3</td>
                      <td className="px-4 py-3 border border-gray-300 font-medium">निर्धूर चुल</td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center border border-gray-300">4</td>
                      <td className="px-4 py-3 border border-gray-300 font-medium">कुंटुंब कल्याण</td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center border border-gray-300">5</td>
                      <td className="px-4 py-3 border border-gray-300 font-medium">अल्पवचत</td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center border border-gray-300">6</td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center border border-gray-300">7</td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                      <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                    <th colSpan={6} className="px-4 py-3 text-center border border-emerald-500 text-lg font-bold">(14) 14 वा वित्त आयोगामधून हाती घेतलेली कामे व त्याची प्रगती .</th>
                  </tr>
                  <tr className="bg-emerald-100">
                    <th className="px-4 py-3 text-center border border-gray-300">अ. क्र.</th>
                    <th className="px-4 py-3 text-center border border-gray-300">योजनेचे नाव</th>
                    <th className="px-4 py-3 text-center border border-gray-300">कामाचा प्रकार</th>
                    <th className="px-4 py-3 text-center border border-gray-300">अंदाजित रक्कम</th>
                    <th className="px-4 py-3 text-center border border-gray-300">मिळालेले अनुदान</th>
                    <th className="px-4 py-3 text-center border border-gray-300">झालेला खर्च</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">1</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">14 वा वित्त आयोग</td>
                    <td className="px-4 py-3 border border-gray-300">एल.ई.डी.लाईट खरेदी</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">2</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">कचरा कुंडी</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">3</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">फर्निचर</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">4</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">टि.व्हि.संच खरेदी</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">5</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">आपले सरकार सेवा केंद्र खर्च</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">6</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">वाटर मिटर</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">7</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">सीसीरोड</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">8</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">आपले सरकार सेवा केंद्र खर्च</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">9</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">फॉगिंग मशीन</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">10</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">ग्रांपभवन</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">11</td>
                    <td className="px-4 py-3 border border-gray-300 font-medium">कंप्युटर</td>
                    <td className="px-4 py-3 border border-gray-300"><input type="text" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                    <td className="px-4 py-3 border border-gray-300"><input type="number" className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-4 text-center">तपासणी अधिकार्‍याचा अभिप्राय</h1>
              <div className="space-y-3">
                <p className="text-gray-700">1) नमुना - - - - -  अपूर्ण आहेत. <input type="text" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-96" /></p>
                <p className="text-gray-700">2) - ----- . <input type="text" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-96" /></p>
                <br />
                <p className="text-gray-700">3) --- . <input type="text" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-96" /></p>
                <p className="text-gray-700">4) --- . <input type="text" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-96" /></p>
                <p className="text-gray-700">5) --- . <input type="text" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-96" /></p>
                <p className="text-gray-700">6) --- . <input type="text" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-96" /></p>
                <p className="text-gray-700">7) --- . <input type="text" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-96" /></p>
                <p className="text-gray-700">8) --- . <input type="text" className="ml-3 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-96" /></p>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="bg-violet-50 border-l-4 border-violet-500 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Camera className="w-6 h-6 text-violet-600" />
                फोटो अपलोड
              </h3>

              <div>
                <label className="block mb-3">
                  <span className="sr-only">Choose photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-3 file:px-6
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-violet-600 file:text-white
                      hover:file:bg-violet-700
                      file:cursor-pointer cursor-pointer
                      file:transition-colors"
                  />
                </label>

                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {uploadedPhotos.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg shadow-md"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-lg transition-colors"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 truncate mt-2 px-1">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pb-8">
          <button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="px-10 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'सेव्ह करत आहे...' : 'मसुदा सेव्ह करा'}
          </button>

          <button
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {isLoading ? 'सबमिट करत आहे...' : 'तपासणी सबमिट करा'}
          </button>
        </div>
      </div>
    </div>
  );
};
