import { supabase } from '../lib/supabase';

export interface InspectionStats {
  totalInspections: number;
  completedInspections: number;
  pendingInspections: number;
  successRate: number;
}

export interface InspectionData {
  id: string;
  inspection_number: string;
  location_name: string;
  address?: string;
  status: string;
  created_at: string;
  inspection_date?: string;
  latitude?: number;
  longitude?: number;
  location_accuracy?: number;
  fims_categories?: {
    name: string;
    name_marathi: string;
  };
  fims_inspection_photos?: Array<{
    id: string;
    photo_url: string;
    photo_name?: string;
    description?: string;
  }>;
  fims_anganwadi_forms?: Array<any>;
  fims_office_inspection_forms?: Array<any>;
}

export interface CategoryData {
  id: string;
  name: string;
  name_marathi: string;
  description?: string;
  form_type: string;
  is_active: boolean;
}

export interface InspectorData {
  id: string;
  name: string;
  email?: string;
}

// Fetch inspection statistics
export const fetchInspectionStats = async (): Promise<InspectionStats> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: inspections, error } = await supabase
    .from('fims_inspections')
    .select('status');

  if (error) {
    throw new Error(`Failed to fetch inspection stats: ${error.message}`);
  }

  const total = inspections?.length || 0;
  const completed = inspections?.filter(i => 
    i.status === 'approved' || i.status === 'completed'
  ).length || 0;
  const pending = inspections?.filter(i => 
    i.status === 'pending' || i.status === 'draft' || i.status === 'submitted' || i.status === 'under_review'
  ).length || 0;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    totalInspections: total,
    completedInspections: completed,
    pendingInspections: pending,
    successRate
  };
};

// Fetch inspections with optional filters
export const fetchInspections = async (filters?: {
  search?: string;
  category?: string;
  status?: string;
  limit?: number;
}): Promise<InspectionData[]> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  let query = supabase
    .from('fims_inspections')
    .select(`
      *,
      fims_categories(name, name_marathi),
      fims_inspection_photos(id, photo_url, photo_name, description),
      fims_anganwadi_forms(*),
      fims_office_inspection_forms(*)
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category_id', filters.category);
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch inspections: ${error.message}`);
  }

  let inspections = data || [];

  // Apply search filter on client side for complex text search
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    inspections = inspections.filter(inspection =>
      inspection.location_name?.toLowerCase().includes(searchTerm) ||
      inspection.inspection_number?.toLowerCase().includes(searchTerm) ||
      inspection.address?.toLowerCase().includes(searchTerm)
    );
  }

  return inspections;
};

// Fetch categories
export const fetchCategories = async (): Promise<CategoryData[]> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('fims_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data || [];
};

// Fetch inspectors (users with inspector role)
export const fetchInspectors = async (): Promise<InspectorData[]> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  const { data: userRolesData, error: userRolesError } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      name,
      roles!inner(name)
    `)
    .in('roles.name', ['inspector', 'officer', 'admin'])
    .not('name', 'is', null);

  if (userRolesError) {
    throw new Error(`Failed to fetch user roles: ${userRolesError.message}`);
  }

  if (!userRolesData || userRolesData.length === 0) {
    return [];
  }

  // Return user roles data without email (admin API not accessible from client)
  const inspectors = userRolesData.map(userRole => {
    return {
      id: userRole.user_id,
      name: userRole.name || 'Unknown',
      email: undefined // Email not available from client-side
    };
  });

  return inspectors;
};

// Delete inspection
export const deleteInspection = async (inspectionId: string): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase
    .from('fims_inspections')
    .delete()
    .eq('id', inspectionId);

  if (error) {
    throw new Error(`Failed to delete inspection: ${error.message}`);
  }
};

// Reassign inspection
export const reassignInspection = async (
  inspectionId: string, 
  newInspectorId: string
): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase
    .from('fims_inspections')
    .update({
      inspector_id: newInspectorId,
      status: 'in_progress'
    })
    .eq('id', inspectionId);

  if (error) {
    throw new Error(`Failed to reassign inspection: ${error.message}`);
  }
};

// Update inspection status
export const updateInspectionStatus = async (
  inspectionId: string, 
  status: string
): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase
    .from('fims_inspections')
    .update({ status })
    .eq('id', inspectionId);

  if (error) {
    throw new Error(`Failed to update inspection status: ${error.message}`);
  }
};