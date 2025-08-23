import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MealPlan {
  id: string;
  user_id: string;
  name: string;
  plan_type: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealPlanMeal {
  id: string;
  meal_plan_id: string;
  meal_id: string;
  planned_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cook_method: 'cook' | 'self';
  notes?: string;
  created_at: string;
  meal?: {
    id: string;
    name: string;
    prep_time_minutes: number;
    servings: number;
    requires_overnight_soaking?: string;
  };
}

export interface DayPlan {
  date: string;
  day: string;
  meals: Array<{
    id: string;
    name: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    prepTime: number;
    servings: number;
    cookMethod: 'cook' | 'self';
    requiresOvernightSoaking?: string;
  }>;
}

export const useMealPlans = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [planMeals, setPlanMeals] = useState<MealPlanMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMealPlans = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMealPlans(data as MealPlan[] || []);
      
      // Set active plan
      const active = data?.find(plan => plan.is_active) || data?.[0];
      setActivePlan(active as MealPlan || null);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch meal plans",
        variant: "destructive",
      });
    }
  };

  const fetchPlanMeals = async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from('meal_plan_meals')
        .select(`
          *,
          meal:meals(id, name, prep_time_minutes, servings, requires_overnight_soaking)
        `)
        .eq('meal_plan_id', planId)
        .order('planned_date', { ascending: true });

      if (error) throw error;
      setPlanMeals(data as MealPlanMeal[] || []);
    } catch (error) {
      console.error('Error fetching plan meals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch planned meals",
        variant: "destructive",
      });
    }
  };

  const createMealPlan = async (planData: Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({ ...planData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setMealPlans(prev => [data as MealPlan, ...prev]);
      toast({
        title: "Success",
        description: "Meal plan created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to create meal plan",
        variant: "destructive",
      });
      return null;
    }
  };

  const addMealToPlan = async (planId: string, mealId: string, plannedDate: string, mealType: string, cookMethod: string = 'cook') => {
    try {
      const { data, error } = await supabase
        .from('meal_plan_meals')
        .insert([{
          meal_plan_id: planId,
          meal_id: mealId,
          planned_date: plannedDate,
          meal_type: mealType,
          cook_method: cookMethod
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (activePlan) {
        await fetchPlanMeals(activePlan.id);
      }
      
      toast({
        title: "Success",
        description: "Meal added to plan",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding meal to plan:', error);
      toast({
        title: "Error",
        description: "Failed to add meal to plan",
        variant: "destructive",
      });
      return null;
    }
  };

  const removeMealFromPlan = async (mealPlanMealId: string) => {
    try {
      const { error } = await supabase
        .from('meal_plan_meals')
        .delete()
        .eq('id', mealPlanMealId);

      if (error) throw error;
      
      if (activePlan) {
        await fetchPlanMeals(activePlan.id);
      }
      
      toast({
        title: "Success",
        description: "Meal removed from plan",
      });
    } catch (error) {
      console.error('Error removing meal from plan:', error);
      toast({
        title: "Error",
        description: "Failed to remove meal from plan",
        variant: "destructive",
      });
    }
  };

  const getMealsForDate = (date: Date): DayPlan => {
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const mealOrder = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
    
    const dayMeals = planMeals
      .filter(pm => pm.planned_date === dateStr)
      .map(pm => ({
        id: pm.id,
        name: pm.meal?.name || 'Unknown Meal',
        type: pm.meal_type,
        prepTime: pm.meal?.prep_time_minutes || 0,
        servings: pm.meal?.servings || 1,
        cookMethod: pm.cook_method,
        requiresOvernightSoaking: pm.meal?.requires_overnight_soaking
      }))
      .sort((a, b) => mealOrder[a.type] - mealOrder[b.type]);

    return {
      date: date.toDateString(),
      day: dayName,
      meals: dayMeals
    };
  };

  const getTodaysMeals = (): DayPlan => {
    const today = new Date();
    return getMealsForDate(today);
  };

  const getTomorrowsMeals = (): DayPlan => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getMealsForDate(tomorrow);
  };

  const getWeekPlan = (): DayPlan[] => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weekPlan: DayPlan[] = [];
    const mealOrder = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      const dayMeals = planMeals
        .filter(pm => pm.planned_date === dateStr)
        .map(pm => ({
          id: pm.id,
          name: pm.meal?.name || 'Unknown Meal',
          type: pm.meal_type,
          prepTime: pm.meal?.prep_time_minutes || 0,
          servings: pm.meal?.servings || 1,
          cookMethod: pm.cook_method,
          requiresOvernightSoaking: pm.meal?.requires_overnight_soaking
        }))
        .sort((a, b) => mealOrder[a.type] - mealOrder[b.type]);

      weekPlan.push({
        date: date.toDateString(),
        day: dayName,
        meals: dayMeals
      });
    }
    
    return weekPlan;
  };

  useEffect(() => {
    if (user?.id) {
      fetchMealPlans();
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (activePlan) {
      fetchPlanMeals(activePlan.id);
    }
  }, [activePlan]);

  const getNext7DaysPlans = (): DayPlan[] => {
    const today = new Date();
    const weekPlan: DayPlan[] = [];
    const mealOrder = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      const dayMeals = planMeals
        .filter(pm => pm.planned_date === dateStr)
        .map(pm => ({
          id: pm.id,
          name: pm.meal?.name || 'Unknown Meal',
          type: pm.meal_type,
          prepTime: pm.meal?.prep_time_minutes || 0,
          servings: pm.meal?.servings || 1,
          cookMethod: pm.cook_method,
          requiresOvernightSoaking: pm.meal?.requires_overnight_soaking
        }))
        .sort((a, b) => mealOrder[a.type] - mealOrder[b.type]);

      weekPlan.push({
        date: date.toDateString(),
        day: dayName,
        meals: dayMeals
      });
    }
    
    return weekPlan;
  };

  return {
    mealPlans,
    activePlan,
    planMeals,
    loading,
    createMealPlan,
    addMealToPlan,
    removeMealFromPlan,
    getTodaysMeals,
    getTomorrowsMeals,
    getWeekPlan,
    getNext7DaysPlans,
    setActivePlan
  };
};