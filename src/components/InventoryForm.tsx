import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryItem } from "@/hooks/useInventory";

interface InventoryFormProps {
  item?: InventoryItem;
  onSubmit: (itemData: Partial<InventoryItem>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const categories = [
  "Grains & Cereals",
  "Pulses & Lentils",
  "Spices & Seasonings",
  "Cooking Essentials",
  "Dairy & Proteins",
  "Vegetables",
  "Dry Fruits & Nuts",
  "Condiments & Pickles",
  "Tea & Beverages",
  "Household Items",
  "Other"
];

const units = [
  "kg", "grams", "liters", "ml", "pieces", "packets", "bottles", "jars", 
  "bunches", "dozen", "rolls", "bags", "cans", "boxes"
];

export const InventoryForm = ({ item, onSubmit, onCancel, loading }: InventoryFormProps) => {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    category: item?.category || "",
    current_stock: item?.current_stock || 0,
    unit: item?.unit || "kg",
    minimum_stock: item?.minimum_stock || 0,
    notes: item?.notes || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {item ? "Edit Inventory Item" : "Add New Inventory Item"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Basmati Rice"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Current Stock</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                step="0.1"
                value={formData.current_stock}
                onChange={(e) => handleInputChange("current_stock", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => handleInputChange("unit", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Minimum Stock */}
          <div className="space-y-2">
            <Label htmlFor="minimum_stock">Minimum Stock Level</Label>
            <Input
              id="minimum_stock"
              type="number"
              min="0"
              step="0.1"
              value={formData.minimum_stock}
              onChange={(e) => handleInputChange("minimum_stock", parseFloat(e.target.value) || 0)}
              placeholder="Alert when stock falls below this level"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional notes about this item..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1"
            >
              {loading ? "Saving..." : item ? "Update Item" : "Add Item"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};