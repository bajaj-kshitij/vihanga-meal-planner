import { ParsedIngredient } from "@/utils/ingredientParser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ParsedIngredientsListProps {
  parsedIngredients: ParsedIngredient[];
  className?: string;
}

export function ParsedIngredientsList({ parsedIngredients, className = "" }: ParsedIngredientsListProps) {
  if (!parsedIngredients || parsedIngredients.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Ingredients Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {parsedIngredients.map((ingredient, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
              <span className="text-sm text-muted-foreground min-w-[2rem] mt-1">
                {index + 1}.
              </span>
              
              <div className="flex-1 space-y-2">
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
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}