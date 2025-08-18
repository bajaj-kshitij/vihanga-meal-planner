import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, ChefHat, Plus, X } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { useMealPlans } from "@/hooks/useMealPlans";
import { useMeals } from "@/hooks/useMeals";
import { MealSelector } from "./MealSelector";
import { MealCard } from "./MealCard";

interface MealPlanCalendarProps {
  selectedDate?: Date;
}

export const MealPlanCalendar = ({ selectedDate = new Date() }: MealPlanCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(selectedDate));
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([]);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [mealTypeFilter, setMealTypeFilter] = useState("all");

  const { activePlan, planMeals, addMealToPlan, removeMealFromPlan } = useMealPlans();
  const { meals } = useMeals();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const getMealsForDay = (date: Date, mealType?: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return planMeals.filter(pm => {
      const dateMatch = pm.planned_date === dateStr;
      const typeMatch = !mealType || pm.meal_type === mealType;
      const filterMatch = mealTypeFilter === "all" || pm.meal_type === mealTypeFilter;
      return dateMatch && typeMatch && filterMatch;
    });
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

  const handleMealClick = (meal: any) => {
    setSelectedMeal(meal);
    setShowMealDetails(true);
  };

  const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Meal Plan Calendar</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
          >
            Previous Week
          </Button>
          <span className="text-sm text-muted-foreground text-center">
            {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 6), "MMM d, yyyy")}
          </span>
          <Button
            variant="outline" 
            size="sm"
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
          >
            Next Week
          </Button>
        </div>
      </div>

      {/* Meal Type Filter */}
      <Tabs value={mealTypeFilter} onValueChange={setMealTypeFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="dinner">Dinner</TabsTrigger>
          <TabsTrigger value="snack">Snacks</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Vertical Day Layout */}
      <div className="space-y-4">
        {weekDays.map((day) => {
          const dayMeals = getMealsForDay(day);
          
          return (
            <Card key={day.toISOString()}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {format(day, "EEEE, MMMM d")}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const defaultMealType = mealTypeFilter === "all" ? "breakfast" : mealTypeFilter;
                      handleAddMeal(day, defaultMealType);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Meal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {mealTypeFilter === "all" ? (
                  <div className="space-y-6">
                    {mealTypeOrder.map((mealType) => {
                      const mealsForType = getMealsForDay(day, mealType);
                      
                      return (
                        <div key={mealType}>
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline" className={`${getMealTypeColor(mealType)} capitalize`}>
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
                          
                          {mealsForType.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {mealsForType.map((planMeal) => {
                                const meal = meals.find(m => m.id === planMeal.meal_id);
                                return (
                                  <div
                                    key={planMeal.id}
                                    className="bg-card border border-border rounded-lg p-3 group hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => handleMealClick(meal)}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{meal?.name || 'Unknown Meal'}</p>
                                        {meal?.description && (
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {meal.description}
                                          </p>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 ml-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveMeal(planMeal.id);
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div 
                              className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/40 transition-colors"
                              onClick={() => handleAddMeal(day, mealType)}
                            >
                              <ChefHat className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                              <p className="text-sm text-muted-foreground mb-1">No {mealType} planned</p>
                              <p className="text-xs text-muted-foreground/60">Click to add a meal</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Show overall empty state if no meals planned for the entire day */}
                    {dayMeals.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                        <p className="text-muted-foreground mb-2">No meals planned for this day</p>
                        <p className="text-sm text-muted-foreground/60">Start planning by adding your first meal</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {dayMeals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dayMeals.map((planMeal) => {
                          const meal = meals.find(m => m.id === planMeal.meal_id);
                          return (
                            <div
                              key={planMeal.id}
                              className="bg-card border border-border rounded-lg p-3 group hover:shadow-md transition-all cursor-pointer"
                              onClick={() => handleMealClick(meal)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{meal?.name || 'Unknown Meal'}</p>
                                  {meal?.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {meal.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 ml-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveMeal(planMeal.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/40 transition-colors"
                        onClick={() => handleAddMeal(day, mealTypeFilter)}
                      >
                        <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                        <p className="text-muted-foreground mb-2">No {mealTypeFilter} planned for this day</p>
                        <p className="text-sm text-muted-foreground/60">Click to add a {mealTypeFilter} meal</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Meal Dialog */}
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

      {/* Meal Details Dialog */}
      <Dialog open={showMealDetails} onOpenChange={setShowMealDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMeal?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedMeal && (
            <div className="space-y-4">
              <MealCard 
                meal={selectedMeal}
                onView={() => setShowMealDetails(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};