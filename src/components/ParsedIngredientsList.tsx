import { ParsedIngredient } from "@/utils/ingredientParser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { useState } from "react";

interface ParsedIngredientsListProps {
  parsedIngredients: ParsedIngredient[];
  className?: string;
  editable?: boolean;
  onUpdate?: (updatedIngredients: ParsedIngredient[]) => void;
}

export function ParsedIngredientsList({ parsedIngredients, className = "", editable = false, onUpdate }: ParsedIngredientsListProps) {
  const [editingIngredients, setEditingIngredients] = useState<ParsedIngredient[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  if (!parsedIngredients || parsedIngredients.length === 0) {
    return null;
  }

  const startEditing = () => {
    setEditingIngredients([...parsedIngredients]);
    setIsEditing(true);
  };

  const saveChanges = () => {
    if (onUpdate) {
      onUpdate(editingIngredients);
    }
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditingIngredients([]);
    setIsEditing(false);
  };

  const updateIngredient = (index: number, field: keyof ParsedIngredient, value: string) => {
    const updated = [...editingIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setEditingIngredients(updated);
  };

  const ingredientsToShow = isEditing ? editingIngredients : parsedIngredients;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Ingredients Breakdown</CardTitle>
          {editable && !isEditing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              Edit
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={saveChanges}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelEditing}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ingredientsToShow.map((ingredient, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
              <span className="text-sm text-muted-foreground min-w-[2rem] mt-1">
                {index + 1}.
              </span>
              
              <div className="flex-1 space-y-2">
                {isEditing ? (
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}