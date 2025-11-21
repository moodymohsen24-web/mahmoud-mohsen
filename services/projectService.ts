import { supabase } from '../supabaseClient';
import type { Project, AnalysisResponse } from '../types';

type ProjectUpdatePayload = {
    name?: string;
    original_text?: string;
    analysis_results?: (AnalysisResponse | null)[];
    current_step?: number;
    updated_at?: string;
};


export const projectService = {
  async getProjectsForUser(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error.message);
      if (error.message.includes('violates row-level security policy')) {
        throw new Error("Security policy error: You do not have permission to view projects.");
      }
      throw error;
    }
    return data as Project[];
  },

  async getProjectById(projectId: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error('Error fetching project:', error);
      // It's okay if a single record is not found, so don't throw for 'PGRST116'
      if (error.code === 'PGRST116') return null;
       if (error.message.includes('violates row-level security policy')) {
        throw new Error("Security policy error: You do not have permission to view this project.");
      }
      throw error;
    }
    return data as Project;
  },
  
  async createProject(
      userId: string, 
      name: string, 
      originalText: string,
      analysisResults: (AnalysisResponse | null)[],
      currentStep: number
    ): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                name,
                original_text: originalText,
                analysis_results: analysisResults,
                current_step: currentStep
            } as any)
            .select()
            .single();

        if (error) {
            console.error("Error creating project:", error);
            if (error.message.includes('violates row-level security policy')) {
                throw new Error("Security policy error: Permission denied to create a new document.");
            }
            throw error;
        }
        return data as Project;
    },

  async updateProject(projectId: string, updates: ProjectUpdatePayload): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
       if (error.message.includes('violates row-level security policy')) {
        throw new Error("Security policy error: Permission denied to update this document.");
      }
      throw error;
    }
    return data as Project;
  },

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      if (error.message.includes('violates row-level security policy')) {
        throw new Error("Security policy error: Permission denied to delete this document.");
      }
      throw error;
    }
  }
};