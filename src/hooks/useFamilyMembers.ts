import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  role?: string;
  dietary_restrictions?: string[];
  preferences?: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const useFamilyMembers = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFamilyMembers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast({
        title: "Error",
        description: "Failed to load family members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFamilyMember = async (memberData: Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert({
          ...memberData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setFamilyMembers(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Family member added successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating family member:', error);
      toast({
        title: "Error",
        description: "Failed to add family member",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateFamilyMember = async (id: string, updates: Partial<FamilyMember>) => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setFamilyMembers(prev => 
        prev.map(member => member.id === id ? data : member)
      );
      toast({
        title: "Success",
        description: "Family member updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating family member:', error);
      toast({
        title: "Error",
        description: "Failed to update family member",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteFamilyMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFamilyMembers(prev => prev.filter(member => member.id !== id));
      toast({
        title: "Success",
        description: "Family member removed successfully",
      });
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast({
        title: "Error",
        description: "Failed to remove family member",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, [user]);

  return {
    familyMembers,
    loading,
    createFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    refetch: fetchFamilyMembers,
  };
};