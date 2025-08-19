import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Search, MapPin, Calendar } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export const InspectionsScreen: React.FC = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInspections = async () => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('fims_inspections')
        .select(`
          *,
          fims_categories(name, name_marathi)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInspections(data || []);
      setFilteredInspections(data || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredInspections(inspections);
    } else {
      const filtered = inspections.filter(
        (inspection) =>
          inspection.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inspection.inspection_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inspection.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredInspections(filtered);
    }
  }, [searchQuery, inspections]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInspections();
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
        <Text style={styles.headerTitle}>Inspections</Text>
        <Text style={styles.headerSubtitle}>Manage your field inspections</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#9CA3AF" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inspections..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredInspections.length > 0 ? (
          filteredInspections.map((inspection) => (
            <TouchableOpacity key={inspection.id} style={styles.inspectionCard}>
              <View style={styles.cardHeader}>
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

              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <MapPin color="#6B7280" size={16} />
                  <Text style={styles.infoText}>{inspection.location_name}</Text>
                </View>

                {inspection.address && (
                  <Text style={styles.addressText} numberOfLines={2}>
                    {inspection.address}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.infoRow}>
                    <Calendar color="#6B7280" size={16} />
                    <Text style={styles.dateText}>
                      {formatDate(inspection.created_at)}
                    </Text>
                  </View>

                  {inspection.fims_categories && (
                    <Text style={styles.categoryText}>
                      {inspection.fims_categories.name}
                    </Text>
                  )}
                </View>

                {inspection.latitude && inspection.longitude && (
                  <Text style={styles.coordinatesText}>
                    📍 {inspection.latitude.toFixed(6)}, {inspection.longitude.toFixed(6)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FileText color="#9CA3AF" size={64} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No inspections found' : 'No inspections yet'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Create your first inspection to get started'}
            </Text>
          </View>
        )}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inspectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inspectionNumber: {
    fontSize: 16,
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
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '500',
  },
  coordinatesText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 18,
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