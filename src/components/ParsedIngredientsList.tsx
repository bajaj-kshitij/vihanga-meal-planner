import { ParsedIngredient } from "@/utils/ingredientParser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X, Edit2 } from "lucide-react";
import { useState } from "react";

interface ParsedIngredientsListProps {
  parsedIngredients: ParsedIngredient[];
  className?: string;
  editable?: boolean;
  onUpdate?: (updatedIngredients: ParsedIngredient[]) => void;
}

export function ParsedIngredientsList({ parsedIngredients, className = "", editable = false, onUpdate }: ParsedIngredientsListProps) {
  const [editingIndices, setEditingIndices] = useState<Set<number>>(new Set());
  const [editingIngredients, setEditingIngredients] = useState<ParsedIngredient[]>([...parsedIngredients]);

  if (!parsedIngredients || parsedIngredients.length === 0) {
    return null;
  }

  const startEditingRow = (index: number) => {
    setEditingIndices(prev => new Set([...prev, index]));
  };

  const saveRow = (index: number) => {
    const newEditingIndices = new Set(editingIndices);
    newEditingIndices.delete(index);
    setEditingIndices(newEditingIndices);
    
    if (onUpdate) {
      onUpdate(editingIngredients);
    }
  };

  const cancelEditingRow = (index: number) => {
    const newEditingIndices = new Set(editingIndices);
    newEditingIndices.delete(index);
    setEditingIndices(newEditingIndices);
    
    // Reset to original value
    const updated = [...editingIngredients];
    updated[index] = parsedIngredients[index];
    setEditingIngredients(updated);
  };

  const updateIngredient = (index: number, field: keyof ParsedIngredient, value: string) => {
    const updated = [...editingIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setEditingIngredients(updated);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Ingredients Breakdown</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {editingIngredients.map((ingredient, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
              <span className="text-sm text-muted-foreground min-w-[2rem] mt-1">
                {index + 1}.
              </span>
              
              <div className="flex-1 space-y-2">
                {editingIndices.has(index) ? (
                  <div className="space-y-2">
                    <Input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      className="font-medium text-sm"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={ingredient.quantity || ''}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                        placeholder="Quantity"
                        className="text-xs"
                      />
                      <Input
                        value={ingredient.unit || ''}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        placeholder="Unit"
                        className="text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-medium text-sm">
                      {ingredient.name}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {ingredient.quantity && (
                        <Badge variant="secondary" className="text-xs">
                          Qty: {ingredient.quantity}
                        </Badge>
                      )}
                      {ingredient.unit && (
                        <Badge variant="outline" className="text-xs">
                          Unit: {ingredient.unit}
                        </Badge>
                      )}
                    </div>
                    
                    {ingredient.original && ingredient.original !== ingredient.name && (
                      <div className="text-xs text-muted-foreground">
                        Original: {ingredient.original}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {editable && (
                <div className="flex gap-1">
                  {editingIndices.has(index) ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => saveRow(index)}>
                        <Save className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => cancelEditingRow(index)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => startEditingRow(index)}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}