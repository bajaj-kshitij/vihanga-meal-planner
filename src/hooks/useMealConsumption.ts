import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MealConsumption {
  id: string;
  user_id: string;
  meal_id: string;
  consumed_date: string;
  meal_type: string;
  was_planned: boolean;
  meal_plan_meal_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  meal?: {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    servings?: number;
  };
}

export const useMealConsumption = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consumption, setConsumption] = useState<MealConsumption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConsumption = async (startDate?: Date, endDate?: Date) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('meal_consumption')
        .select(`
          *,
          meal:meals (
            id,
            name,
            description,
            image_url,
            prep_time_minutes,
            cook_time_minutes,
            servings
          )
        `)
        .eq('user_id', user.id)
        .order('consumed_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('consumed_date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        query = query.lte('consumed_date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      setConsumption((data as any) || []);
    } catch (error) {
      console.error('Error fetching meal consumption:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch meal consumption data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addConsumption = async (
    mealId: string,
    consumedDate: Date,
    mealType: string,
    wasPlanned: boolean = false,
    mealPlanMealId?: string,
    notes?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('meal_consumption')
        .insert({
          user_id: user.id,
          meal_id: mealId,
          consumed_date: consumedDate.toISOString().split('T')[0],
          meal_type: mealType,
          was_planned: wasPlanned,
          meal_plan_meal_id: mealPlanMealId,
          notes
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal consumption recorded.",
      });

      // Refresh data
      await fetchConsumption();
      return true;
    } catch (error) {
      console.error('Error adding meal consumption:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record meal consumption.",
      });
      return false;
    }
  };

  const removeConsumption = async (consumptionId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('meal_consumption')
        .delete()
        .eq('id', consumptionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal consumption removed.",
      });

      // Refresh data
      await fetchConsumption();
      return true;
    } catch (error) {
      console.error('Error removing meal consumption:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove meal consumption.",
      });
      return false;
    }
  };

  const getConsumptionForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return consumption.filter(c => c.consumed_date === dateStr);
  };

  const getConsumptionHistory = (days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return consumption.filter(c => new Date(c.consumed_date) >= startDate);
  };

  useEffect(() => {
    if (user) {
      fetchConsumption();
    }
  }, [user]);

  return {
    consumption,
    loading,
    fetchConsumption,
    addConsumption,
    removeConsumption,
    getConsumptionForDate,
    getConsumptionHistory
  };
};