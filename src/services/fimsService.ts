import { supabase } from '../lib/supabase';

export interface Inspection {
  id: string;
  inspection_number: string;
  category_id: string;
  inspector_id: string;
  assigned_by?: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  location_accuracy?: number;
  address?: string;
  planned_date?: string;
  inspection_date?: string;
  status: 'planned' | 'in_progress' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'reassigned';
  form_data?: any;
  reviewed_by?: string;
  reviewed_at?: string;
  review_comments?: string;
  approved_by?: string;
  approved_at?: string;
  is_compliant?: boolean;
  non_compliance_reason?: string;
  requires_revisit?: boolean;
  created_at: string;
  updated_at: string;
  fims_categories?: {
    id: string;
    name: string;
    name_marathi: string;
    form_type: string;
  };
  fims_inspection_photos?: Array<{
    id: string;
    photo_url: string;
    photo_name?: string;
    description?: string;
    photo_order?: number;
  }>;
  fims_anganwadi_forms?: any[];
  fims_office_inspection_forms?: any[];
}

export const getInspections = async (userId?: string): Promise<Inspection[]> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    let query = supabase
      .from('fims_inspections')
      .select(`
        *,
        fims_categories (
          id,
          name,
          name_marathi,
          form_type
        ),
        fims_inspection_photos (
          id,
          photo_url,
          photo_name,
          description,
          photo_order
        ),
        fims_anganwadi_forms (*),
        fims_office_inspection_forms (*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('inspector_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching inspections:', error);
    throw error;
  }
};

export const createInspection = async (inspectionData: Partial<Inspection>): Promise<Inspection> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('fims_inspections')
      .insert(inspectionData)
      .select(`
        *,
        fims_categories (
          id,
          name,
          name_marathi,
          form_type
        ),
        fims_inspection_photos (
          id,
          photo_url,
          photo_name,
          description,
          photo_order
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating inspection:', error);
    throw error;
  }
};

export const updateInspection = async (id: string, updates: Partial<Inspection>): Promise<Inspection> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('fims_inspections')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        fims_categories (
          id,
          name,
          name_marathi,
          form_type
        ),
        fims_inspection_photos (
          id,
          photo_url,
          photo_name,
          description,
          photo_order
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating inspection:', error);
    throw error;
  }
};

export const deleteInspection = async (id: string): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { error } = await supabase
      .from('fims_inspections')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting inspection:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('fims_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const reassignInspection = async (id: string, newInspectorId: string): Promise<Inspection> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('fims_inspections')
      .update({
        inspector_id: newInspectorId,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        fims_categories (
          id,
          name,
          name_marathi,
          form_type
        ),
        fims_inspection_photos (
          id,
          photo_url,
          photo_name,
          description,
          photo_order
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error reassigning inspection:', error);
    throw error;
  }
};