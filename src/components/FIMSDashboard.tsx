import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  LogOut, 
  User, 
  BarChart3, 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Search, 
  RefreshCw,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
  Users,
  Globe,
  ChevronDown,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LanguageSwitcher } from './LanguageSwitcher';
import { FIMSNewInspection } from './FIMSNewInspection';
import { FIMSAnalytics } from './FIMSAnalytics';
import { PermissionGuard } from './PermissionGuard';
import { usePermissions } from '../hooks/usePermissions';
import { getInspections, deleteInspection, fetchCategories, reassignInspection, fetchInspectors } from '../services/fimsService';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Inspection } from '../services/fimsService';

interface FIMSDashboardProps {
  user: SupabaseUser;
  onSignOut: () => void;
}

const languages = [
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'en', name: 'English', nativeName: 'English' }
];

export const FIMSDashboard: React.FC<FIMSDashboardProps> = ({ user, onSignOut }) => {
  const { t, i18n } = useTranslation();
  const { hasAccess, userProfile, isLoading: permissionsLoading } = usePermissions(user);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingInspection, setEditingInspection] = useState<any>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [inspectionsData, categoriesData, inspectorsData] = await Promise.all([
        getInspections(),
        fetchCategories(),
        fetchInspectors()
      ]);
      
      setInspections(inspectionsData);
      setCategories(categoriesData);
      setInspectors(inspectorsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNewInspection = () => {
    setEditingInspection(null);
    setActiveTab('new-inspection');
  };

  const handleEditInspection = (inspection: Inspection) => {
    setEditingInspection({ ...inspection, mode: 'edit' });
    setActiveTab('new-inspection');
  };

  const handleViewInspection = (inspection: Inspection) => {
    setEditingInspection({ ...inspection, mode: 'view' });
    setActiveTab('new-inspection');
  };

  const handleDeleteInspection = async (id: string) => {
    if (window.confirm(t('fims.confirmDeleteInspection'))) {
      try {
        await deleteInspection(id);
        await loadData();
        alert(t('fims.inspectionDeletedSuccessfully'));
      } catch (error) {
        console.error('Error deleting inspection:', error);
        alert(t('fims.errorDeletingInspection'));
      }
    }
  };

  const handleReassignInspection = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setSelectedInspector('');
    setShowReassignModal(true);
  };

  const confirmReassignment = async () => {
    if (!selectedInspection || !selectedInspector) return;

    try {
      await reassignInspection(selectedInspection.id, selectedInspector);
      setShowReassignModal(false);
      setSelectedInspection(null);
      setSelectedInspector('');
      await loadData();
      alert('Inspection reassigned successfully');
    } catch (error) {
      console.error('Error reassigning inspection:', error);
      alert('Error reassigning inspection');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600" />;
      case 'submitted':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'under_review':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'reassigned':
        return <RotateCcw className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-purple-100 text-purple-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reassigned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspection_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || inspection.category_id === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: inspections.length,
    completed: inspections.filter(i => i.status === 'approved' || i.status === 'completed').length,
    pending: inspections.filter(i => i.status === 'pending' || i.status === 'in_progress' || i.status === 'draft').length,
    successRate: inspections.length > 0 ? Math.round((inspections.filter(i => i.status === 'approved' || i.status === 'completed').length / inspections.length) * 100) : 0
  };

  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">{t('fims.totalInspections')}</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">{t('fims.completed')}</p>
              <p className="text-3xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">{t('fims.pending')}</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">{t('fims.successRate')}</p>
              <p className="text-3xl font-bold">{stats.successRate}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('fims.quickActions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleNewInspection}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-md"
          >
            <Plus className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-blue-900">{t('fims.createNewInspection')}</p>
              <p className="text-sm text-blue-600">{t('fims.createNewInspection')}</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('inspections')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg border border-green-200 transition-all duration-200 hover:shadow-md"
          >
            <FileText className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-900">{t('fims.viewAndManageInspections')}</p>
              <p className="text-sm text-green-600">{t('fims.viewAndManageInspections')}</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border border-purple-200 transition-all duration-200 hover:shadow-md"
          >
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">{t('fims.viewAnalyticsAndReports')}</p>
              <p className="text-sm text-purple-600">{t('fims.viewAnalyticsAndReports')}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('fims.recentInspections')}</h3>
          <button
            onClick={() => setActiveTab('inspections')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        {inspections.slice(0, 5).length > 0 ? (
          <div className="space-y-3">
            {inspections.slice(0, 5).map((inspection) => (
              <div key={inspection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(inspection.status)}
                  <div>
                    <p className="font-medium text-gray-900">{inspection.location_name}</p>
                    <p className="text-sm text-gray-600">{inspection.inspection_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                    {t(`statuses.${inspection.status}`)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(inspection.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p>{t('fims.noInspectionsFound')}</p>
            <p className="text-sm">{t('fims.createFirstInspection')}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderInspections = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              {t('fims.searchInspections')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('fims.searchInspections')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              {t('fims.status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('fims.allStatuses')}</option>
              <option value="planned">{t('statuses.planned')}</option>
              <option value="in_progress">{t('statuses.in_progress')}</option>
              <option value="draft">{t('statuses.draft')}</option>
              <option value="submitted">{t('statuses.submitted')}</option>
              <option value="under_review">{t('statuses.under_review')}</option>
              <option value="approved">{t('statuses.approved')}</option>
              <option value="rejected">{t('statuses.rejected')}</option>
              <option value="reassigned">{t('statuses.reassigned')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              {t('fims.category')}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('fims.allCategories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t('fims.refresh')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inspections List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{t('fims.inspectionsList')}</h3>
            <button
              onClick={handleNewInspection}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{t('fims.newInspection')}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredInspections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fims.inspectionNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fims.location')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fims.category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fims.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fims.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fims.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {inspection.inspection_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inspection.location_name}</div>
                      {inspection.latitude && inspection.longitude && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {inspection.latitude.toFixed(4)}, {inspection.longitude.toFixed(4)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {inspection.fims_categories?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                        {getStatusIcon(inspection.status)}
                        <span className="ml-1">{t(`statuses.${inspection.status}`)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(inspection.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(inspection.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewInspection(inspection)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {(inspection.status === 'draft' || inspection.status === 'rejected') && (
                          <button
                            onClick={() => handleEditInspection(inspection)}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        
                        {hasAccess('fims', 'admin') && (
                          <>
                            <button
                              onClick={() => handleReassignInspection(inspection)}
                              className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                              title="Reassign"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteInspection(inspection.id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('fims.noInspectionsFound')}</p>
            <button
              onClick={handleNewInspection}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>{t('fims.newInspection')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'inspections':
        return renderInspections();
      case 'new-inspection':
        return (
          <FIMSNewInspection
            user={user}
            onBack={() => setActiveTab('inspections')}
            categories={categories}
            onInspectionCreated={() => {
              loadData();
              setActiveTab('inspections');
            }}
            editingInspection={editingInspection}
          />
        );
      case 'analytics':
        return (
          <FIMSAnalytics
            user={user}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <PermissionGuard user={user} application="fims" permission="read">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-2 rounded-lg shadow-lg">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">FIMS</h1>
                  <p className="text-sm text-gray-600">{t('systems.fims.fullName')}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {t('fims.dashboard')}
                </button>
                <button
                  onClick={() => setActiveTab('inspections')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'inspections'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {t('fims.inspections')}
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'analytics'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {t('fims.analytics')}
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {/* Language Switcher */}
                <div className="relative language-switcher">
                  <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 min-w-[100px] justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {currentLanguage.nativeName}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLanguageDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[70]">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        {i18n.language === 'mr' ? 'भाषा निवडा' : 'Select Language'}
                      </div>
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => handleLanguageChange(language.code)}
                          className={`w-full text-left px-3 py-3 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                            i18n.language === language.code
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
                          {i18n.language === language.code && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{userProfile?.name || user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('auth.signOut')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>

        {/* Reassign Modal */}
        {showReassignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('fims.assignForRevisit')}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fims.selectInspector')}
                </label>
                <select
                  value={selectedInspector}
                  onChange={(e) => setSelectedInspector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('fims.chooseInspector')}</option>
                  {inspectors.map((inspector) => (
                    <option key={inspector.user_id} value={inspector.user_id}>
                      {inspector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  {t('fims.revisitNote')}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReassignModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={confirmReassignment}
                  disabled={!selectedInspector}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};