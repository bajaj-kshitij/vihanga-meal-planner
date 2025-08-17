import { useState, useEffect } from 'react';
import { Search, X, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useMeals } from '@/hooks/useMeals';
import type { Meal } from '@/hooks/useMeals';

interface MealSelectorProps {
  selectedMealIds: string[];
  onSelectionChange: (mealIds: string[]) => void;
  maxSelections?: number;
}

export const MealSelector = ({ 
  selectedMealIds, 
  onSelectionChange, 
  maxSelections = 25 
}: MealSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { meals, loading } = useMeals();

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meal.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMeals = meals.filter(meal => selectedMealIds.includes(meal.id));

  const handleMealSelect = (meal: Meal) => {
    if (selectedMealIds.includes(meal.id)) {
      onSelectionChange(selectedMealIds.filter(id => id !== meal.id));
    } else if (selectedMealIds.length < maxSelections) {
      onSelectionChange([...selectedMealIds, meal.id]);
    }
  };

  const removeMeal = (mealId: string) => {
    onSelectionChange(selectedMealIds.filter(id => id !== mealId));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Favorite Meals ({selectedMealIds.length}/{maxSelections})
        </Label>
        
        {selectedMeals.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
            {selectedMeals.map((meal) => (
              <Badge 
                key={meal.id} 
                variant="secondary" 
                className="flex items-center gap-1 px-3 py-1"
              >
                {meal.name}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeMeal(meal.id)}
                />
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="pl-10"
            />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? 'Hide' : 'Browse'}
          </Button>
        </div>
      </div>

      {(showSearch || searchTerm) && (
        <Card className="max-h-64 overflow-y-auto">
          <CardContent className="p-4">
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Loading meals...</p>
            ) : filteredMeals.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {searchTerm ? 'No meals found matching your search.' : 'No meals available.'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredMeals.map((meal) => {
                  const isSelected = selectedMealIds.includes(meal.id);
                  const canSelect = !isSelected && selectedMealIds.length < maxSelections;
                  
                  return (
                    <div
                      key={meal.id}
                      onClick={() => canSelect || isSelected ? handleMealSelect(meal) : null}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : canSelect
                            ? 'hover:bg-muted/50 border-border'
                            : 'opacity-50 cursor-not-allowed border-muted'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{meal.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {meal.cuisine_type} • {meal.meal_type}
                          </p>
                        </div>
                        {isSelected && (
                          <Heart className="w-4 h-4 fill-current" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};