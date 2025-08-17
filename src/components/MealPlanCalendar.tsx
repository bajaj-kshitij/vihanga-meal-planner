import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, ChefHat, Plus, X } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { useMealPlans } from "@/hooks/useMealPlans";
import { useMeals } from "@/hooks/useMeals";
import { MealSelector } from "./MealSelector";

interface MealPlanCalendarProps {
  selectedDate?: Date;
}

export const MealPlanCalendar = ({ selectedDate = new Date() }: MealPlanCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(selectedDate));
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([]);
  const [showMealSelector, setShowMealSelector] = useState(false);

  const { activePlan, planMeals, addMealToPlan, removeMealFromPlan } = useMealPlans();
  const { meals } = useMeals();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const getMealsForDay = (date: Date, mealType: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return planMeals.filter(pm => 
      pm.planned_date === dateStr && pm.meal_type === mealType
    );
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case "breakfast": return "bg-primary/10 text-primary";
      case "lunch": return "bg-accent/10 text-accent-foreground";
      case "dinner": return "bg-secondary/20 text-secondary-foreground";
      case "snack": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleAddMeal = (date: Date, mealType: string) => {
    setSelectedDay(date.toISOString().split('T')[0]);
    setSelectedMealType(mealType);
    setSelectedMealIds([]);
    setShowMealSelector(true);
  };

  const handleSaveMeals = async () => {
    if (!activePlan || !selectedDay || !selectedMealType || selectedMealIds.length === 0) return;

    for (const mealId of selectedMealIds) {
      await addMealToPlan(activePlan.id, mealId, selectedDay, selectedMealType);
    }

    setShowMealSelector(false);
    setSelectedMealIds([]);
  };

  const handleRemoveMeal = async (planMealId: string) => {
    await removeMealFromPlan(planMealId);
  };

  if (!activePlan) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No active meal plan. Create one to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meal Plan Calendar</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
          >
            Previous Week
          </Button>
          <span className="text-sm text-muted-foreground">
            {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 6), "MMM d, yyyy")}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
          >
            Next Week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <Card key={day.toISOString()} className="min-h-[400px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {format(day, "EEE")}
                <br />
                {format(day, "MMM d")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
                <div key={mealType} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getMealTypeColor(mealType)}>
                      {mealType}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddMeal(day, mealType)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {getMealsForDay(day, mealType).map((planMeal) => {
                      const meal = meals.find(m => m.id === planMeal.meal_id);
                      return (
                        <div
                          key={planMeal.id}
                          className="bg-card border border-border rounded p-2 text-xs group hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{meal?.name || 'Unknown Meal'}</p>
                              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                <span>{meal?.prep_time_minutes || 0}m</span>
                                <Users className="h-3 w-3 ml-1" />
                                <span>{meal?.servings || 1}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                              onClick={() => handleRemoveMeal(planMeal.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showMealSelector} onOpenChange={setShowMealSelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Add {selectedMealType} for {selectedDay ? format(new Date(selectedDay), "EEEE, MMM d") : ""}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <MealSelector
              selectedMealIds={selectedMealIds}
              onSelectionChange={setSelectedMealIds}
              maxSelections={3}
            />
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMealSelector(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveMeals}
                disabled={selectedMealIds.length === 0}
              >
                Add {selectedMealIds.length} Meal{selectedMealIds.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};