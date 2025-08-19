import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Activity,
  PieChart,
  Search,
  Globe,
  ChevronDown,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface FIMSAnalyticsProps {
  user: SupabaseUser;
  onBack: () => void;
}

interface UserAnalytics {
  user_id: string;
  user_name: string;
  total_inspections: number;
  completed_inspections: number;
  pending_inspections: number;
  completion_rate: number;
  avg_completion_time: number;
  role: string;
}

interface FormAnalytics {
  form_type: string;
  form_name: string;
  total_forms: number;
  completed_forms: number;
  avg_completion_time: number;
  completion_rate: number;
  most_recent: string;
}

interface KPIData {
  overall_completion_rate: number;
  avg_inspection_time: number;
  total_active_users: number;
  monthly_target: number;
  monthly_completed: number;
  productivity_score: number;
}

const languages = [
  { code: 'mr', name: 'मराठी', nativeName: 'मराठी' },
  { code: 'en', name: 'English', nativeName: 'English' }
];

const translations = {
  mr: {
    // Header
    title: 'FIMS विश्लेषण डॅशबोर्ड',
    subtitle: 'क्षेत्रीय तपासणी व्यवस्थापनासाठी व्यापक विश्लेषण आणि अंतर्दृष्टी',
    back: 'मागे',
    refresh: 'रिफ्रेश',
    export: 'निर्यात',
    
    // Tabs
    personAnalytics: 'व्यक्तिनिहाय विश्लेषण',
    formAnalytics: 'फॉर्मनिहाय विश्लेषण',
    kpiDashboard: 'KPI डॅशबोर्ड',
    
    // Filters
    searchUsers: 'वापरकर्ते शोधा',
    selectPerson: 'व्यक्ती निवडा',
    allUsers: 'सर्व वापरकर्ते',
    dateRange: 'तारीख श्रेणी',
    
    // Table Headers
    userName: 'वापरकर्ता नाव',
    role: 'भूमिका',
    totalInspections: 'एकूण तपासणी',
    completed: 'पूर्ण',
    pending: 'प्रलंबित',
    completionRate: 'पूर्णता दर',
    avgTime: 'सरासरी वेळ (मिनिटे)',
    
    // KPI Cards
    overallCompletionRate: 'एकूण पूर्णता दर',
    systemWidePerformance: 'प्रणाली-व्यापी पूर्णता कामगिरी',
    avgInspectionTime: 'सरासरी तपासणी वेळ',
    averageTimePerInspection: 'प्रति तपासणी सरासरी वेळ',
    activeUsers: 'सक्रिय वापरकर्ते',
    currentlyActiveInspectors: 'सध्या सक्रिय तपासणीकर्ते',
    productivityScore: 'उत्पादकता स्कोअर',
    basedOnMonthlyTargets: 'मासिक लक्ष्यांवर आधारित',
    
    // Progress Tracking
    monthlyProgressTracking: 'मासिक प्रगती ट्रॅकिंग',
    monthlyTarget: 'मासिक लक्ष्य',
    performanceRating: 'कामगिरी रेटिंग',
    
    // Performance Insights
    performanceInsights: 'कामगिरी अंतर्दृष्टी',
    highPerformers: 'उच्च कामगिरी',
    users: 'वापरकर्ते',
    needsAttention: 'लक्ष आवश्यक',
    averagePerformance: 'सरासरी कामगिरी',
    completion: 'पूर्णता',
    
    // Form Analytics
    formPerformanceComparison: 'फॉर्म कामगिरी तुलना',
    totalForms: 'एकूण फॉर्म',
    avgTimeMin: 'सरासरी वेळ',
    
    // Loading and Empty States
    loadingAnalyticsData: 'विश्लेषण डेटा लोड करत आहे...',
    noDataAvailable: 'कोणताही डेटा उपलब्ध नाही',
    
    // Language
    selectLanguage: 'भाषा निवडा'
  },
  en: {
    // Header
    title: 'FIMS Analytics Dashboard',
    subtitle: 'Comprehensive analytics and insights for field inspection management',
    back: 'Back',
    refresh: 'Refresh',
    export: 'Export',
    
    // Tabs
    personAnalytics: 'Person-wise Analytics',
    formAnalytics: 'Form-wise Analytics',
    kpiDashboard: 'KPI Dashboard',
    
    // Filters
    searchUsers: 'Search Users',
    selectPerson: 'Select Person',
    allUsers: 'All Users',
    dateRange: 'Date Range',
    
    // Table Headers
    userName: 'User Name',
    role: 'Role',
    totalInspections: 'Total Inspections',
    completed: 'Completed',
    pending: 'Pending',
    completionRate: 'Completion Rate',
    avgTime: 'Avg Time (min)',
    
    // KPI Cards
    overallCompletionRate: 'Overall Completion Rate',
    systemWidePerformance: 'System-wide completion performance',
    avgInspectionTime: 'Avg Inspection Time',
    averageTimePerInspection: 'Average time per inspection',
    activeUsers: 'Active Users',
    currentlyActiveInspectors: 'Currently active inspectors',
    productivityScore: 'Productivity Score',
    basedOnMonthlyTargets: 'Based on monthly targets',
    
    // Progress Tracking
    monthlyProgressTracking: 'Monthly Progress Tracking',
    monthlyTarget: 'Monthly Target',
    performanceRating: 'Performance Rating',
    
    // Performance Insights
    performanceInsights: 'Performance Insights',
    highPerformers: 'High Performers',
    users: 'users',
    needsAttention: 'Needs Attention',
    averagePerformance: 'Average Performance',
    completion: 'completion',
    
    // Form Analytics
    formPerformanceComparison: 'Form Performance Comparison',
    totalForms: 'Total Forms',
    avgTimeMin: 'Avg Time',
    
    // Loading and Empty States
    loadingAnalyticsData: 'Loading analytics data...',
    noDataAvailable: 'No data available',
    
    // Language
    selectLanguage: 'Select Language'
  }
};

export const FIMSAnalytics: React.FC<FIMSAnalyticsProps> = ({ user, onBack }) => {
  const [currentLanguage, setCurrentLanguage] = useState('mr');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('person');
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const t = translations[currentLanguage as keyof typeof translations];

  // Analytics Data
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([]);
  const [formAnalytics, setFormAnalytics] = useState<FormAnalytics[]>([]);
  const [kpiData, setKpiData] = useState<KPIData>({
    overall_completion_rate: 0,
    avg_inspection_time: 0,
    total_active_users: 0,
    monthly_target: 100,
    monthly_completed: 0,
    productivity_score: 0
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, selectedPerson]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUserAnalytics(),
        fetchFormAnalytics(),
        fetchKPIData()
      ]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserAnalytics = async () => {
    if (!supabase) return;

    try {
      // Fetch inspections data
      let inspectionsQuery = supabase
        .from('fims_inspections')
        .select(`
          inspector_id,
          status,
          created_at,
          inspection_date
        `);

      if (dateRange.start && dateRange.end) {
        inspectionsQuery = inspectionsQuery.gte('created_at', dateRange.start).lte('created_at', dateRange.end);
      }

      const { data: inspections, error: inspectionsError } = await inspectionsQuery;
      if (inspectionsError) throw inspectionsError;

      // Fetch user roles data with auth user details
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          name,
          phone_number,
          roles(
            id,
            name,
            description
          )
        `);
      
      if (userRolesError) throw userRolesError;

      // Process user analytics
      const userStats: { [key: string]: UserAnalytics } = {};

      inspections?.forEach(inspection => {
        const userId = inspection.inspector_id;
        
        // Find user details from user_roles
        const userRole = userRoles?.find(ur => ur.user_id === userId);
        const userName = userRole?.name || 'Unknown User';
        const roleName = userRole?.roles?.name || 'Unknown Role';

        if (!userStats[userId]) {
          userStats[userId] = {
            user_id: userId,
            user_name: userName,
            phone_number: userRole?.phone_number || null,
            total_inspections: 0,
            completed_inspections: 0,
            pending_inspections: 0,
            completion_rate: 0,
            avg_completion_time: 0,
            role: roleName
          };
        }

        userStats[userId].total_inspections++;

        if (inspection.status === 'approved' || inspection.status === 'completed') {
          userStats[userId].completed_inspections++;
        } else {
          userStats[userId].pending_inspections++;
        }
      });

      // Calculate completion rates
      Object.values(userStats).forEach(user => {
        user.completion_rate = user.total_inspections > 0 
          ? Math.round((user.completed_inspections / user.total_inspections) * 100)
          : 0;
        user.avg_completion_time = Math.floor(Math.random() * 120) + 30; // Mock data for demo
      });

      setUserAnalytics(Object.values(userStats));
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    }
  };

  const fetchFormAnalytics = async () => {
    if (!supabase) return;

    try {
      // Fetch form analytics
      let query = supabase
        .from('fims_inspections')
        .select(`
          category_id,
          status,
          created_at,
          fims_categories(name, name_marathi, form_type)
        `);

      if (dateRange.start && dateRange.end) {
        query = query.gte('created_at', dateRange.start).lte('created_at', dateRange.end);
      }

      const { data: inspections, error } = await query;

      if (error) throw error;

      // Process form analytics
      const formStats: { [key: string]: FormAnalytics } = {};

      inspections?.forEach(inspection => {
        const formType = inspection.fims_categories?.form_type || 'unknown';
        const formName = inspection.fims_categories?.name || 'Unknown Form';

        if (!formStats[formType]) {
          formStats[formType] = {
            form_type: formType,
            form_name: formName,
            total_forms: 0,
            completed_forms: 0,
            avg_completion_time: 0,
            completion_rate: 0,
            most_recent: inspection.created_at
          };
        }

        formStats[formType].total_forms++;

        if (inspection.status === 'approved' || inspection.status === 'completed') {
          formStats[formType].completed_forms++;
        }

        // Update most recent
        if (new Date(inspection.created_at) > new Date(formStats[formType].most_recent)) {
          formStats[formType].most_recent = inspection.created_at;
        }
      });

      // Calculate completion rates and mock completion times
      Object.values(formStats).forEach(form => {
        form.completion_rate = form.total_forms > 0 
          ? Math.round((form.completed_forms / form.total_forms) * 100)
          : 0;
        form.avg_completion_time = Math.floor(Math.random() * 90) + 45; // Mock data
      });

      setFormAnalytics(Object.values(formStats));
    } catch (error) {
      console.error('Error fetching form analytics:', error);
    }
  };

  const fetchKPIData = async () => {
    if (!supabase) return;

    try {
      const { data: inspections, error } = await supabase
        .from('fims_inspections')
        .select('status, created_at, inspector_id');

      if (error) throw error;

      const total = inspections?.length || 0;
      const completed = inspections?.filter(i => 
        i.status === 'approved' || i.status === 'completed'
      ).length || 0;

      const uniqueUsers = new Set(inspections?.map(i => i.inspector_id)).size;
      
      // Calculate monthly completed (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyCompleted = inspections?.filter(i => {
        const date = new Date(i.created_at);
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               (i.status === 'approved' || i.status === 'completed');
      }).length || 0;

      const overallCompletionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const productivityScore = Math.min(100, Math.round((monthlyCompleted / 100) * 100));

      setKpiData({
        overall_completion_rate: overallCompletionRate,
        avg_inspection_time: 75, // Mock data
        total_active_users: uniqueUsers,
        monthly_target: 100,
        monthly_completed: monthlyCompleted,
        productivity_score: productivityScore
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    setIsLanguageDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-switcher')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isLanguageDropdownOpen]);

  const filteredUserAnalytics = userAnalytics.filter(user => {
    if (selectedPerson !== 'all' && user.user_id !== selectedPerson) return false;
    if (searchTerm && !user.user_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const renderPersonAnalytics = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              {t.searchUsers}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={currentLanguage === 'mr' ? 'नावाने शोधा...' : 'Search by name...'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              {t.selectPerson}
            </label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.allUsers}</option>
              {userAnalytics.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.user_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              {t.dateRange}
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* User Analytics Table */}
      <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-xl shadow-lg border-2 border-blue-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-200 via-blue-100 to-cyan-100 px-6 py-4 border-b border-blue-200">
          <h3 className="text-lg font-bold text-blue-800 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {t.personAnalytics}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-200 via-blue-100 to-cyan-100">
              <tr className="divide-x divide-blue-200">
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-800">{t.userName}</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-800">{t.role}</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-blue-800">{t.totalInspections}</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-blue-800">{t.completed}</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-blue-800">{t.pending}</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-blue-800">{t.completionRate}</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-blue-800">{t.avgTime}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {filteredUserAnalytics.map((user, index) => (
                <tr 
                  key={user.user_id}
                  className={`${
                    index % 2 === 0 
                      ? 'bg-gradient-to-r from-blue-25 to-cyan-25' 
                      : 'bg-gradient-to-r from-cyan-25 to-blue-25'
                  } hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 hover:scale-[1.01] transition-all duration-200 cursor-pointer group hover:shadow-md`}
                >
                  <td className="px-6 py-4 text-blue-900 font-medium group-hover:text-blue-700">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      {user.user_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-blue-700">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-blue-900 font-semibold">
                    {user.total_inspections}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {user.completed_inspections}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      {user.pending_inspections}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${user.completion_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-blue-900">{user.completion_rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-blue-700 font-medium">
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1 text-blue-500" />
                      {user.avg_completion_time}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFormAnalytics = () => (
    <div className="space-y-6">
      {/* Form Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formAnalytics.map((form, index) => (
          <div 
            key={form.form_type}
            className={`${
              index % 3 === 0 ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200' :
              index % 3 === 1 ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200' :
              'bg-gradient-to-br from-green-100 to-emerald-100 border-green-200'
            } p-6 rounded-xl shadow-lg border-2 hover:shadow-xl hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className={`h-8 w-8 ${
                index % 3 === 0 ? 'text-purple-600' :
                index % 3 === 1 ? 'text-blue-600' :
                'text-green-600'
              }`} />
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                index % 3 === 0 ? 'bg-purple-200 text-purple-800' :
                index % 3 === 1 ? 'bg-blue-200 text-blue-800' :
                'bg-green-200 text-green-800'
              }`}>
                {form.form_type}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-3">{form.form_name}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Forms:</span>
                <span className="font-semibold text-gray-800">{form.total_forms}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed:</span>
                <span className="font-semibold text-green-600">{form.completed_forms}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate:</span>
                <span className="font-semibold text-blue-600">{form.completion_rate}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Time:</span>
                <span className="font-semibold text-purple-600">{form.avg_completion_time}min</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index % 3 === 0 ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
                    index % 3 === 1 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                    'bg-gradient-to-r from-green-400 to-emerald-500'
                  }`}
                  style={{ width: `${form.completion_rate}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Comparison Chart */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          {t.formPerformanceComparison}
        </h3>
        
        <div className="space-y-4">
          {formAnalytics.map((form, index) => (
            <div key={form.form_type} className="flex items-center space-x-4">
              <div className="w-32 text-sm font-medium text-gray-700 truncate">
                {form.form_name}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                <div 
                  className={`h-4 rounded-full transition-all duration-700 ${
                    index % 2 === 0 
                      ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
                      : 'bg-gradient-to-r from-green-400 to-green-600'
                  }`}
                  style={{ width: `${form.completion_rate}%` }}
                ></div>
                <span className="absolute right-2 top-0 text-xs font-medium text-white leading-4">
                  {form.completion_rate}%
                </span>
              </div>
              <div className="w-20 text-sm text-gray-600 text-right">
                {form.completed_forms}/{form.total_forms}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderKPIDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8 text-blue-100" />
            <span className="text-2xl font-bold">{kpiData.overall_completion_rate}%</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{t.overallCompletionRate}</h3>
          <p className="text-blue-100 text-sm">{t.systemWidePerformance}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-green-100" />
            <span className="text-2xl font-bold">{kpiData.avg_inspection_time}{currentLanguage === 'mr' ? 'मिनिटे' : 'min'}</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{t.avgInspectionTime}</h3>
          <p className="text-green-100 text-sm">{t.averageTimePerInspection}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-purple-100" />
            <span className="text-2xl font-bold">{kpiData.total_active_users}</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{t.activeUsers}</h3>
          <p className="text-purple-100 text-sm">{t.currentlyActiveInspectors}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-orange-100" />
            <span className="text-2xl font-bold">{kpiData.productivity_score}</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{t.productivityScore}</h3>
          <p className="text-orange-100 text-sm">{t.basedOnMonthlyTargets}</p>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          {t.monthlyProgressTracking}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">{t.monthlyTarget}</span>
              <span className="text-sm font-bold text-gray-800">{kpiData.monthly_target}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (kpiData.monthly_completed / kpiData.monthly_target) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{currentLanguage === 'mr' ? 'पूर्ण' : 'Completed'}: {kpiData.monthly_completed}</span>
              <span className="text-xs text-gray-500">
                {Math.round((kpiData.monthly_completed / kpiData.monthly_target) * 100)}%
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">{t.productivityScore}</span>
              <span className="text-sm font-bold text-gray-800">{kpiData.productivity_score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-700"
                style={{ width: `${kpiData.productivity_score}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{t.performanceRating}</span>
              <span className="text-xs text-gray-500">{kpiData.productivity_score}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-purple-600" />
          {t.performanceInsights}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800">{t.highPerformers}</h4>
            <p className="text-sm text-gray-600">
              {userAnalytics.filter(u => u.completion_rate >= 80).length} {t.users}
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800">{t.needsAttention}</h4>
            <p className="text-sm text-gray-600">
              {userAnalytics.filter(u => u.completion_rate < 60).length} {t.users}
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800">{t.averagePerformance}</h4>
            <p className="text-sm text-gray-600">
              {Math.round(userAnalytics.reduce((acc, u) => acc + u.completion_rate, 0) / userAnalytics.length || 0)}% {t.completion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{t.back}</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAnalyticsData}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{t.refresh}</span>
              </button>
              
              <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                <Download className="h-4 w-4" />
                <span>{t.export}</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <div className="relative language-switcher">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors duration-200 min-w-[100px] justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {languages.find(lang => lang.code === currentLanguage)?.nativeName}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[70]">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    {t.selectLanguage}
                  </div>
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full text-left px-3 py-3 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                        currentLanguage === language.code
                          ? 'text-blue-600 bg-blue-50 font-medium'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{language.nativeName}</div>
                          <div className="text-xs text-gray-500">{language.name}</div>
                        </div>
                      </div>
                      {currentLanguage === language.code && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t.title}
          </h1>
          <p className="text-blue-100">
            {t.subtitle}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('person')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'person'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              {t.personAnalytics}
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'form'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              {t.formAnalytics}
            </button>
            <button
              onClick={() => setActiveTab('kpi')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'kpi'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              {t.kpiDashboard}
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">{t.loadingAnalyticsData}</span>
          </div>
        ) : (
          <div>
            {activeTab === 'person' && renderPersonAnalytics()}
            {activeTab === 'form' && renderFormAnalytics()}
            {activeTab === 'kpi' && renderKPIDashboard()}
          </div>
        )}
      </div>
    </div>
  );
};