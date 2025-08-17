import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search } from "lucide-react";
import { useInventory, InventoryItem } from "@/hooks/useInventory";
import { MealInventoryItem } from "@/hooks/useMeals";

interface MealInventorySelectorProps {
  selectedItems: MealInventoryItem[];
  onAddItem: (inventoryItemId: string, quantity: number, unit: string, description?: string) => void;
  onRemoveItem: (id: string) => void;
}

export const MealInventorySelector = ({ selectedItems, onAddItem, onRemoveItem }: MealInventorySelectorProps) => {
  const { items } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInventoryItem, setSelectedInventoryItem] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedInventoryIds = selectedItems.map(item => item.inventory_item_id);

  const handleAddItem = () => {
    if (selectedInventoryItem && quantity > 0) {
      onAddItem(selectedInventoryItem, quantity, unit, description);
      setSelectedInventoryItem("");
      setQuantity(1);
      setUnit("");
      setDescription("");
    }
  };

  const selectedItem = items.find(item => item.id === selectedInventoryItem);

  return (
    <div className="space-y-4">
      <Label>Ingredients from Inventory</Label>
      
      {/* Selected Items Display */}
      <div className="space-y-2">
        {selectedItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="flex-1">
              <div className="font-medium">{item.inventory_item?.name}</div>
              <div className="text-sm text-muted-foreground">
                {item.quantity} {item.unit} {item.description && `- ${item.description}`}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemoveItem(item.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <Input
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Item</Label>
            <Select value={selectedInventoryItem} onValueChange={setSelectedInventoryItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {filteredItems
                  .filter(item => !selectedInventoryIds.includes(item.id))
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{item.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {item.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={selectedItem?.unit || "Unit"}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description (optional)</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., chopped, diced, grated..."
          />
        </div>

        <Button
          type="button"
          onClick={handleAddItem}
          disabled={!selectedInventoryItem || quantity <= 0}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </div>
    </div>
  );
};