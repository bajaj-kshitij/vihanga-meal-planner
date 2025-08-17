import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  minimum_stock: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DefaultInventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  minimum_stock: number;
  created_at: string;
}

export const useInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [defaultItems, setDefaultItems] = useState<DefaultInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventoryItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("user_id", user.id)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setItems((data || []) as InventoryItem[]);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      toast.error("Failed to load inventory items");
    }
  };

  const fetchDefaultItems = async () => {
    try {
      const { data, error } = await supabase
        .from("default_inventory_items")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setDefaultItems(data || []);
    } catch (error) {
      console.error("Error fetching default items:", error);
      toast.error("Failed to load default items");
    }
  };

  const initializeUserInventory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('initialize_user_inventory', {
        user_id_param: user.id
      });

      if (error) throw error;
      
      toast.success("Inventory initialized with default items");
      await fetchInventoryItems();
    } catch (error) {
      console.error("Error initializing inventory:", error);
      toast.error("Failed to initialize inventory");
    }
  };

  const createItem = async (itemData: Partial<InventoryItem>) => {
    if (!user) return null;

    try {
      const insertData = {
        name: itemData.name || "",
        category: itemData.category || "Other",
        current_stock: itemData.current_stock || 0,
        unit: itemData.unit || "piece",
        minimum_stock: itemData.minimum_stock || 0,
        notes: itemData.notes,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from("inventory_items")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      setItems(prev => [...prev, data as InventoryItem]);
      toast.success("Item added to inventory");
      return data;
    } catch (error) {
      console.error("Error creating inventory item:", error);
      toast.error("Failed to add item");
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...data } as InventoryItem : item
      ));
      toast.success("Item updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating inventory item:", error);
      toast.error("Failed to update item");
      return null;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast.error("Failed to delete item");
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    await updateItem(id, { current_stock: newStock });
  };

  const addStock = async (id: string, amount: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      await updateStock(id, item.current_stock + amount);
    }
  };

  const removeStock = async (id: string, amount: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newStock = Math.max(0, item.current_stock - amount);
      await updateStock(id, newStock);
    }
  };

  const getLowStockItems = () => {
    return items.filter(item => item.current_stock <= item.minimum_stock);
  };

  const getItemsByCategory = () => {
    const categorized: Record<string, InventoryItem[]> = {};
    items.forEach(item => {
      if (!categorized[item.category]) {
        categorized[item.category] = [];
      }
      categorized[item.category].push(item);
    });
    return categorized;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchInventoryItems(), fetchDefaultItems()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    items,
    defaultItems,
    loading,
    fetchInventoryItems,
    initializeUserInventory,
    createItem,
    updateItem,
    deleteItem,
    updateStock,
    addStock,
    removeStock,
    getLowStockItems,
    getItemsByCategory
  };
};