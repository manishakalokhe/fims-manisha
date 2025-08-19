import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, FileText, Plus } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export const NewInspectionScreen: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('fims_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load inspection categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspectionTypeSelect = (type: string) => {
    Alert.alert(
      'Coming Soon',
      `${type} inspection form will be available in the next update.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Inspection</Text>
        <Text style={styles.headerSubtitle}>Select inspection type to begin</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Before You Start</Text>
          <Text style={styles.instructionsText}>
            • Ensure you have a stable internet connection{'\n'}
            • Enable location services for GPS tracking{'\n'}
            • Have your camera ready for photo documentation{'\n'}
            • Prepare any required documents or forms
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Select Inspection Type</Text>

        {/* Anganwadi Inspection */}
        <TouchableOpacity
          style={styles.inspectionTypeCard}
          onPress={() => handleInspectionTypeSelect('Anganwadi Center')}
        >
          <View style={styles.cardIcon}>
            <Building2 color="#7C3AED" size={32} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Anganwadi Center Inspection</Text>
            <Text style={styles.cardDescription}>
              Infrastructure and facilities assessment
            </Text>
            <View style={styles.cardFeatures}>
              <Text style={styles.featureText}>• Equipment and materials verification</Text>
              <Text style={styles.featureText}>• Children information and records</Text>
              <Text style={styles.featureText}>• Nutrition and health services</Text>
            </View>
          </View>
          <Plus color="#7C3AED" size={24} />
        </TouchableOpacity>

        {/* Office Inspection */}
        <TouchableOpacity
          style={styles.inspectionTypeCard}
          onPress={() => handleInspectionTypeSelect('Office')}
        >
          <View style={styles.cardIcon}>
            <FileText color="#3B82F6" size={32} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>दफ्तर निरीक्षण प्रपत्र</Text>
            <Text style={styles.cardDescription}>
              Office Inspection Form
            </Text>
            <View style={styles.cardFeatures}>
              <Text style={styles.featureText}>• Employee information and work assessment</Text>
              <Text style={styles.featureText}>• Letter correspondence details</Text>
              <Text style={styles.featureText}>• Registers and office structure</Text>
            </View>
          </View>
          <Plus color="#3B82F6" size={24} />
        </TouchableOpacity>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>📸 Photo Documentation Required</Text>
          <Text style={styles.requirementsText}>
            Both inspection types require photo documentation. You can upload up to 5 photos per inspection for proper record keeping.
          </Text>
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>📍 GPS Location Capture</Text>
          <Text style={styles.requirementsText}>
            Location coordinates will be automatically captured during the inspection process for accurate record keeping.
          </Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  instructionsCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inspectionTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardIcon: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardFeatures: {
    gap: 2,
  },
  featureText: {
    fontSize: 12,
    color: '#6B7280',
  },
  requirementsCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});