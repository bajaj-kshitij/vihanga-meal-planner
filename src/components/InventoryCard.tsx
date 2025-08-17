import { useState } from "react";
import { Package, AlertTriangle, Plus, Minus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "@/hooks/useInventory";

interface InventoryCardProps {
  item: InventoryItem;
  onUpdateStock: (id: string, newStock: number) => void;
  onAddStock: (id: string, amount: number) => void;
  onRemoveStock: (id: string, amount: number) => void;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
}

export const InventoryCard = ({ 
  item, 
  onUpdateStock, 
  onAddStock, 
  onRemoveStock, 
  onEdit, 
  onDelete 
}: InventoryCardProps) => {
  const [stockInput, setStockInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const isLowStock = item.current_stock <= item.minimum_stock;

  const handleQuickAdd = (amount: number) => {
    onAddStock(item.id, amount);
  };

  const handleQuickRemove = (amount: number) => {
    onRemoveStock(item.id, amount);
  };

  const handleStockUpdate = () => {
    const newStock = parseFloat(stockInput);
    if (!isNaN(newStock) && newStock >= 0) {
      onUpdateStock(item.id, newStock);
      setStockInput("");
      setIsEditing(false);
    }
  };

  const getStockColor = () => {
    if (item.current_stock === 0) return "text-red-600 dark:text-red-400";
    if (isLowStock) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getStockIcon = () => {
    if (item.current_stock === 0 || isLowStock) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    return <Package className="w-4 h-4 text-green-500" />;
  };

  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground mb-1">
              {item.name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {getStockIcon()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Stock Display */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className={`text-2xl font-bold ${getStockColor()}`}>
                {item.current_stock} {item.unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Min Stock</p>
              <p className="text-lg font-medium">
                {item.minimum_stock} {item.unit}
              </p>
            </div>
          </div>

          {/* Stock Status */}
          {isLowStock && (
            <Badge variant="destructive" className="w-full justify-center">
              {item.current_stock === 0 ? "Out of Stock" : "Low Stock"}
            </Badge>
          )}

          {/* Stock Management */}
          <div className="space-y-3">
            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickRemove(1)}
                disabled={item.current_stock === 0}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAdd(1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAdd(5)}
              >
                +5
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAdd(10)}
              >
                +10
              </Button>
            </div>

            {/* Manual Stock Update */}
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="New stock amount"
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleStockUpdate}>
                  Update
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setStockInput("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  setStockInput(item.current_stock.toString());
                }}
                className="w-full"
              >
                Set Stock Amount
              </Button>
            )}
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Notes:</p>
              <p>{item.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="sage"
                size="sm"
                onClick={() => onEdit(item)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};