import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { XstageProject, XstageProjectMember, ProjectRole, ProjectType } from '../types';
import { toast } from 'sonner';

interface XstageContextType {
  projects: XstageProject[];
  currentProject: XstageProject | null;
  currentMember: XstageProjectMember | null;
  members: XstageProjectMember[];
  loading: boolean;
  setCurrentProject: (project: XstageProject | null) => void;
  createProject: (name: string, type: ProjectType, description?: string) => Promise<XstageProject | null>;
  updateProject: (id: string, updates: Partial<XstageProject>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  inviteMember: (email: string, role: ProjectRole) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  updateMemberRole: (memberId: string, role: ProjectRole) => Promise<boolean>;
  refreshProjects: () => Promise<void>;
  refreshMembers: () => Promise<void>;
}

const XstageContext = createContext<XstageContextType | undefined>(undefined);

export const useXstage = () => {
  const context = useContext(XstageContext);
  if (!context) {
    throw new Error('useXstage must be used within XstageProvider');
  }
  return context;
};

export const XstageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<XstageProject[]>([]);
  const [currentProject, setCurrentProject] = useState<XstageProject | null>(null);
  const [currentMember, setCurrentMember] = useState<XstageProjectMember | null>(null);
  const [members, setMembers] = useState<XstageProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setCurrentProject(null);
      setLoading(false);
      return;
    }

    try {
      // Get projects where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('xstage_project_members')
        .select('project_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setProjects([]);
        setCurrentProject(null);
        setLoading(false);
        return;
      }

      const projectIds = memberData.map(m => m.project_id);

      const { data: projectsData, error: projectsError } = await supabase
        .from('xstage_projects')
        .select('*')
        .in('id', projectIds)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      const typedProjects = (projectsData || []) as XstageProject[];
      setProjects(typedProjects);

      // Set first project as current if none selected
      if (!currentProject && typedProjects.length > 0) {
        setCurrentProject(typedProjects[0]);
      } else if (currentProject) {
        // Refresh current project data
        const updated = typedProjects.find(p => p.id === currentProject.id);
        if (updated) {
          setCurrentProject(updated);
        } else if (typedProjects.length > 0) {
          setCurrentProject(typedProjects[0]);
        } else {
          setCurrentProject(null);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [user, currentProject]);

  const refreshMembers = useCallback(async () => {
    if (!currentProject || !user) {
      setMembers([]);
      setCurrentMember(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('xstage_project_members')
        .select('*')
        .eq('project_id', currentProject.id);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = (data || []).map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const typedMembers = (data || []).map(m => {
        const profile = profileMap.get(m.user_id);
        return {
          ...m,
          role: m.role as ProjectRole,
          profile: profile ? { full_name: profile.full_name, avatar_url: profile.avatar_url } : undefined
        };
      }) as XstageProjectMember[];

      setMembers(typedMembers);

      // Find current user's membership
      const myMembership = typedMembers.find(m => m.user_id === user.id);
      setCurrentMember(myMembership || null);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, [currentProject, user]);

  useEffect(() => {
    refreshProjects();
  }, [user]);

  useEffect(() => {
    refreshMembers();
  }, [currentProject]);

  const createProject = async (name: string, type: ProjectType, description?: string): Promise<XstageProject | null> => {
    if (!user) return null;

    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('xstage_projects')
        .insert({
          name,
          type,
          description: description || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('xstage_project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      // Create default general channel
      await supabase
        .from('xstage_channels')
        .insert({
          project_id: project.id,
          name: 'general',
          description: 'General discussion',
          created_by: user.id,
        });

      const typedProject = project as XstageProject;
      await refreshProjects();
      setCurrentProject(typedProject);
      toast.success('Project created successfully!');
      return typedProject;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<XstageProject>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('xstage_projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await refreshProjects();
      toast.success('Project updated');
      return true;
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project');
      return false;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('xstage_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      await refreshProjects();
      toast.success('Project deleted');
      return true;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
      return false;
    }
  };

  const inviteMember = async (email: string, role: ProjectRole): Promise<boolean> => {
    if (!currentProject || !user) return false;

    try {
      // Check if user exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('email', email)
        .single();

      if (profile) {
        // User exists, add them directly
        const { error } = await supabase
          .from('xstage_project_members')
          .insert({
            project_id: currentProject.id,
            user_id: profile.user_id,
            role,
          });

        if (error) {
          if (error.code === '23505') {
            toast.error('User is already a member');
            return false;
          }
          throw error;
        }

        await refreshMembers();
        toast.success('Member added successfully');
        return true;
      } else {
        // Create invite for non-existing user
        const { error } = await supabase
          .from('xstage_invites')
          .insert({
            project_id: currentProject.id,
            email,
            role,
            invited_by: user.id,
          });

        if (error) throw error;

        toast.success('Invite sent! They will be added when they sign up.');
        return true;
      }
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error(error.message || 'Failed to invite member');
      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('xstage_project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await refreshMembers();
      toast.success('Member removed');
      return true;
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.message || 'Failed to remove member');
      return false;
    }
  };

  const updateMemberRole = async (memberId: string, role: ProjectRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('xstage_project_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      await refreshMembers();
      toast.success('Role updated');
      return true;
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
      return false;
    }
  };

  return (
    <XstageContext.Provider
      value={{
        projects,
        currentProject,
        currentMember,
        members,
        loading,
        setCurrentProject,
        createProject,
        updateProject,
        deleteProject,
        inviteMember,
        removeMember,
        updateMemberRole,
        refreshProjects,
        refreshMembers,
      }}
    >
      {children}
    </XstageContext.Provider>
  );
};
