import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cuisine_type: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty_level: "easy" | "medium" | "hard";
  instructions?: string[];
  image_url?: string;
  tags?: string[];
  nutritional_info?: any;
  is_favorite: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  nutritional_info?: any;
  created_at: string;
}

export interface MealIngredient {
  id: string;
  meal_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  notes?: string;
  ingredient?: Ingredient;
}

export const useMeals = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMeals((data || []) as Meal[]);
    } catch (error) {
      console.error("Error fetching meals:", error);
      toast.error("Failed to load meals");
    }
  };

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");

      if (error) throw error;
      setIngredients(data || []);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      toast.error("Failed to load ingredients");
    }
  };

  const createMeal = async (mealData: Partial<Meal>) => {
    if (!user) return null;

    try {
      const insertData = {
        name: mealData.name || "",
        description: mealData.description,
        cuisine_type: mealData.cuisine_type || "Indian",
        meal_type: mealData.meal_type || "lunch",
        prep_time_minutes: mealData.prep_time_minutes || 0,
        cook_time_minutes: mealData.cook_time_minutes || 0,
        servings: mealData.servings || 4,
        difficulty_level: mealData.difficulty_level || "medium",
        instructions: mealData.instructions,
        image_url: mealData.image_url,
        tags: mealData.tags,
        nutritional_info: mealData.nutritional_info,
        is_favorite: mealData.is_favorite || false,
        is_public: mealData.is_public || false,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from("meals")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      setMeals(prev => [data as Meal, ...prev]);
      toast.success("Meal created successfully");
      return data;
    } catch (error) {
      console.error("Error creating meal:", error);
      toast.error("Failed to create meal");
      return null;
    }
  };

  const updateMeal = async (id: string, updates: Partial<Meal>) => {
    try {
      const { data, error } = await supabase
        .from("meals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setMeals(prev => prev.map(meal => 
        meal.id === id ? { ...meal, ...data } as Meal : meal
      ));
      toast.success("Meal updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating meal:", error);
      toast.error("Failed to update meal");
      return null;
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("meals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMeals(prev => prev.filter(meal => meal.id !== id));
      toast.success("Meal deleted successfully");
    } catch (error) {
      console.error("Error deleting meal:", error);
      toast.error("Failed to delete meal");
    }
  };

  const getMealIngredients = async (mealId: string): Promise<MealIngredient[]> => {
    try {
      const { data, error } = await supabase
        .from("meal_ingredients")
        .select(`
          *,
          ingredient:ingredients(*)
        `)
        .eq("meal_id", mealId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching meal ingredients:", error);
      return [];
    }
  };

  const addMealIngredient = async (mealId: string, ingredientId: string, quantity: number, unit: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from("meal_ingredients")
        .insert([{
          meal_id: mealId,
          ingredient_id: ingredientId,
          quantity,
          unit,
          notes
        }]);

      if (error) throw error;
      toast.success("Ingredient added to meal");
    } catch (error) {
      console.error("Error adding meal ingredient:", error);
      toast.error("Failed to add ingredient");
    }
  };

  const createIngredient = async (name: string, category: string, unit: string) => {
    try {
      const { data, error } = await supabase
        .from("ingredients")
        .insert([{ name, category, unit }])
        .select()
        .single();

      if (error) throw error;
      
      setIngredients(prev => [...prev, data]);
      toast.success("Ingredient created successfully");
      return data;
    } catch (error) {
      console.error("Error creating ingredient:", error);
      toast.error("Failed to create ingredient");
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMeals(), fetchIngredients()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    meals,
    ingredients,
    loading,
    fetchMeals,
    fetchIngredients,
    createMeal,
    updateMeal,
    deleteMeal,
    getMealIngredients,
    addMealIngredient,
    createIngredient
  };
};