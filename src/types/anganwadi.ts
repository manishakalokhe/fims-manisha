export interface AnganwadiTapasaniFormData {
  // Basic Information
  anganwadi_name: string;
  anganwadi_number: string;
  supervisor_name: string;
  helper_name: string;
  village_name: string;
  
  // Section 1: अंगणवाडी केंद्रातील उपलब्ध सुविधा
  building_type: 'own' | 'rented' | 'free' | 'no_building' | ''; // स्वतःची/ भाड्याची/ मोफत/ इमारत नाही
  toilet_facility: boolean; // शौचालय
  independent_kitchen: boolean; // स्वतंत्र बंदिस्त किचन व्यवस्था
  women_health_checkup_space: boolean; // महिलांच्या आरोग्य तपासणीसाठी जागा
  electricity: boolean; // विद्युत पुरवठा
  drinking_water: boolean; // पिण्याचे पाणी
  
  // Section 2: वजनकाटे उपलब्ध
  baby_weighing_scale: boolean; // बेबी वजनकाटे
  hammock_weighing_scale: boolean; // हॅमॉक [झोळीचे] वजनकाटे
  adult_weighing_scale: boolean; // प्रौढांसाठीचे वजनकाटे
  
  // Section 3: अंगणवाडीतील साहित्य उपलब्धता
  cooking_utensils: boolean; // स्वयंपाकाची भांडी
  water_storage_containers: boolean; // पिण्याचे पाणी ठेवण्यासाठी भांडी
  medicine_kits: boolean; // मेडिसिन किट्स
  pre_school_kit: boolean; // पूर्व शाले संच
  all_registers: boolean; // विविध नमुन्यातील रजिस्टर (सर्व)
  monthly_progress_reports: boolean; // छापील मासिक प्रगती अहवाल
  
  // Section 4: अंगणवाडी केंद्राचे वेळापत्रक
  timetable_available: boolean; // अंगणवाडी केंद्राचे वेळापत्रक आहे काय?
  timetable_followed: boolean; // वेळापत्रक पाळले जाते काय?
  supervisor_regular_attendance: boolean; // सेविका नियमितपणे हजर राहते काय?
  
  // Section 5: आहाराविषयी
  monthly_25_days_meals: boolean; // प्रत्येक महिन्याला २५ दिवस सकाळचा नाश्ता व पूरक पोषण आहार
  thr_provided_regularly: boolean; // ०–३ वर्षांची बालके, गर्भवती-स्तनदा माता, व तीव्र कमी वजनाच्या बालकांना THR
  
  // Section 6: स्वयंसहाय्यता बचत गटांच्या/महिला मंडळाबाबत
  food_provider: string; // अंगणवाडीतील आहार कोणाकडून दिला जातो?
  supervisor_participation: string; // यातील अंगणवाडी सेविकेच्या असलेला सहभाग
  food_distribution_decentralized: boolean; // आहार वाटपाचे काम विकेंद्रित केले आहे काय?
  
  // Section 7: मुलांना आहाराची चव व दर्जा आवडतो की कसे?
  children_food_taste_preference: string;
  
  // Section 8: आहार दर्जा
  prescribed_protein_calories: boolean; // निर्धारीत प्रथीणे व उष्मांक असलेला आहार मिळतो काय?
  prescribed_weight_food: boolean; // निर्धारीत वजनाचा आहार मिळतो काय?
  lab_sample_date: string; // आहार नमुने प्रयोगशाळेत पृथ:करणाकरिता केव्हा पाठविले होते?
  
  // Section 9: बालकांचे वजने
  regular_weighing: boolean; // बालकांचे वजने नियमित वजने घेतली जातात किंवा कसे?
  growth_chart_accuracy: boolean; // वय व वजन यांची नोंद तपासून पोषण श्रेणी योग्य प्रमाणे दर्शविलेली आहे काय?
  
  // Section 10: लसीकरण व आरोग्य तपासणी
  vaccination_health_checkup_regular: boolean; // लसीकरण व आरोग्य तपासणी नियमितपणे होते काय?
  vaccination_schedule_awareness: boolean; // लसीकरण दिवसाची माहिती लाभार्थी पालकांना आहे काय?
  
  // Section 11-17: Additional Questions
  village_health_nutrition_planning: string; // ११. ग्राम आरोग्य व पोषण दिवसाचे गावनिहाय सूक्ष्म नियोजन
  children_attendance_comparison: string; // १२. भेटीच्या दिवशी प्रत्यक्ष उपस्थित असलेली बालके
  preschool_education_registered: number; // १३.१ पूर्वशालेय शिक्षणासाठी नोंदवलेली बालके
  preschool_education_present: number; // १३.२ भेटीची वेळी प्रत्यक्ष हजर बालके
  preschool_programs_conducted: string; // १३.३ भेटीचे दिवशी कोणकोणते कार्यक्रम घेतले
  community_participation: string; // १४.१ अंगणवाडी केंद्राला गावातील लोकांचे सहकार्य
  committee_member_participation: string; // १४.२ ग्राम समिती सदस्य/ ग्राम पंचायत सदस्य/ आरोग्य सेविका/ इतर उपस्थिती
  home_visits_guidance: string; // १५. गरोदर महिला, आजारी असलेली बालके यांचे घरी भेट
  public_opinion_improvement: string; // १६. अंगणवाडी क्षेत्रातील लोकांचे मत व सुधारणा
  suggestions: string; // १७. काही सूचना असल्यास
  
  // Signature Information
  inspector_name: string; // नाव
  inspector_designation: string; // पद
  visit_date: string; // भेटीचा दिनांक
  
  // Existing fields that need to be maintained for compatibility
  total_registered_children: number;
  children_present_today: number;
  children_0_3_years: number;
  children_3_6_years: number;
  meal_quality: 'excellent' | 'good' | 'average' | 'poor' | '';
  general_observations: string;
  recommendations: string;
  action_required: string;
}

export interface AnganwadiInspectionData {
  category_id: string;
  location_name: string;
  address: string;
  planned_date: string;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
}