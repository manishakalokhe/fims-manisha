import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, CircleCheck as CheckCircle, Clock, TrendingUp, LogOut } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalInspections: number;
  completedInspections: number;
  pendingInspections: number;
  successRate: number;
}

interface DashboardScreenProps {
  onSignOut?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onSignOut }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalInspections: 0,
    completedInspections: 0,
    pendingInspections: 0,
    successRate: 0,
  });
  const [recentInspections, setRecentInspections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      if (!supabase) return;

      // Fetch inspection statistics
      const { data: inspections, error } = await supabase
        .from('fims_inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = inspections?.length || 0;
      const completed = inspections?.filter(i => i.status === 'approved' || i.status === 'completed').length || 0;
      const pending = inspections?.filter(i => i.status === 'pending' || i.status === 'draft' || i.status === 'submitted').length || 0;
      const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({
        totalInspections: total,
        completedInspections: completed,
        pendingInspections: pending,
        successRate,
      });

      // Set recent inspections (last 5)
      setRecentInspections(inspections?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleSignOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      if (onSignOut) {
        onSignOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return '#10B981';
      case 'submitted':
      case 'under_review':
        return '#F59E0B';
      case 'draft':
      case 'pending':
        return '#6B7280';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>FIMS Dashboard</Text>
          <Text style={styles.headerSubtitle}>Field Inspection Management</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <FileText color="#7C3AED" size={24} />
            <Text style={styles.kpiValue}>{stats.totalInspections}</Text>
            <Text style={styles.kpiLabel}>Total Inspections</Text>
          </View>

          <View style={styles.kpiCard}>
            <CheckCircle color="#10B981" size={24} />
            <Text style={styles.kpiValue}>{stats.completedInspections}</Text>
            <Text style={styles.kpiLabel}>Completed</Text>
          </View>

          <View style={styles.kpiCard}>
            <Clock color="#F59E0B" size={24} />
            <Text style={styles.kpiValue}>{stats.pendingInspections}</Text>
            <Text style={styles.kpiLabel}>Pending</Text>
          </View>

          <View style={styles.kpiCard}>
            <TrendingUp color="#3B82F6" size={24} />
            <Text style={styles.kpiValue}>{stats.successRate}%</Text>
            <Text style={styles.kpiLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Recent Inspections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Inspections</Text>
          {recentInspections.length > 0 ? (
            recentInspections.map((inspection) => (
              <View key={inspection.id} style={styles.inspectionCard}>
                <View style={styles.inspectionHeader}>
                  <Text style={styles.inspectionNumber}>
                    {inspection.inspection_number}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(inspection.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {inspection.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.inspectionLocation}>
                  {inspection.location_name}
                </Text>
                <Text style={styles.inspectionDate}>
                  {formatDate(inspection.created_at)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <FileText color="#9CA3AF" size={48} />
              <Text style={styles.emptyStateText}>No inspections found</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first inspection to get started
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#7C3AED',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  signOutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inspectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inspectionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inspectionLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  inspectionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});