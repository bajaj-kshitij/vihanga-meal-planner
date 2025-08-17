import { useState } from "react";
import { format, subDays, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, Plus, ChevronLeft, ChevronRight, Utensils, Clock, Save } from "lucide-react";
import { useMealConsumption } from "@/hooks/useMealConsumption";
import { useMealPlans } from "@/hooks/useMealPlans";
import { useMeals } from "@/hooks/useMeals";
import { MealSelector } from "@/components/MealSelector";

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

interface DayConsumptionProps {
  date: Date;
  consumption: any[];
  plannedMeals: any[];
  onMarkConsumed: (mealId: string, mealType: string, wasPlanned: boolean, mealPlanMealId?: string) => void;
  onRemoveConsumption: (consumptionId: string) => void;
  onAddMeal: (mealType: string) => void;
  onConfirmDay: (selectedPlannedMeals: string[]) => void;
  selectedMealType: string | null;
  canEdit: boolean;
}

const DayConsumption = ({ 
  date, 
  consumption, 
  plannedMeals, 
  onMarkConsumed, 
  onRemoveConsumption,
  onAddMeal,
  onConfirmDay,
  selectedMealType,
  canEdit
}: DayConsumptionProps) => {
  const [selectedPlannedMeals, setSelectedPlannedMeals] = useState<string[]>([]);
  const getMealTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      breakfast: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      lunch: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      dinner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      snack: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const getPlannedMealsForType = (mealType: string) => {
    return plannedMeals.filter(pm => pm.meal_type === mealType);
  };

  const getConsumedMealsForType = (mealType: string) => {
    return consumption.filter(c => c.meal_type === mealType);
  };

  const isPlannedMealConsumed = (plannedMealId: string) => {
    return consumption.some(c => c.meal_plan_meal_id === plannedMealId);
  };

  const handlePlannedMealSelection = (plannedMealId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlannedMeals(prev => [...prev, plannedMealId]);
    } else {
      setSelectedPlannedMeals(prev => prev.filter(id => id !== plannedMealId));
    }
  };

  const handleConfirmDay = () => {
    onConfirmDay(selectedPlannedMeals);
    setSelectedPlannedMeals([]);
  };

  const hasUnconsumedPlannedMeals = plannedMeals.some(pm => !isPlannedMealConsumed(pm.id));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            {format(date, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          {canEdit && hasUnconsumedPlannedMeals && selectedPlannedMeals.length > 0 && (
            <Button
              onClick={handleConfirmDay}
              className="gap-2"
              size="sm"
            >
              <Save className="h-4 w-4" />
              Confirm Selected ({selectedPlannedMeals.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {MEAL_TYPES.map(mealType => {
          const plannedMeals = getPlannedMealsForType(mealType);
          const consumedMeals = getConsumedMealsForType(mealType);
          
          return (
            <div key={mealType} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold capitalize flex items-center gap-2">
                  <Badge className={getMealTypeColor(mealType)}>
                    {mealType}
                  </Badge>
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddMeal(mealType)}
                  className="gap-1 text-muted-foreground"
                  disabled={!canEdit}
                >
                  <Plus className="h-3 w-3" />
                  Add Optional
                </Button>
              </div>

              {/* Planned Meals */}
              {plannedMeals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Planned meals:</p>
                  {plannedMeals.map(plannedMeal => {
                    const isConsumed = isPlannedMealConsumed(plannedMeal.id);
                    const isSelected = selectedPlannedMeals.includes(plannedMeal.id);
                    
                    return (
                      <div
                        key={plannedMeal.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isConsumed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {canEdit && !isConsumed && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => 
                                handlePlannedMealSelection(plannedMeal.id, checked as boolean)
                              }
                              className="bg-background border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{plannedMeal.meal?.name || plannedMeal.meals?.name}</p>
                            {(plannedMeal.meal?.prep_time_minutes || plannedMeal.meals?.prep_time_minutes) && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {(plannedMeal.meal?.prep_time_minutes || plannedMeal.meals?.prep_time_minutes) + ((plannedMeal.meal?.cook_time_minutes || plannedMeal.meals?.cook_time_minutes) || 0)} min
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isConsumed ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Consumed
                            </Badge>
                          ) : canEdit ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onMarkConsumed(
                                  plannedMeal.meal_id,
                                  mealType, 
                                  true, 
                                  plannedMeal.id
                                )}
                                className="gap-1"
                              >
                              <CheckCircle className="h-3 w-3" />
                              Mark Now
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Additional Consumed Meals */}
              {consumedMeals.filter(c => !c.was_planned).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Additional meals:</p>
                  {consumedMeals
                    .filter(c => !c.was_planned)
                    .map(consumption => (
                      <div
                        key={consumption.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 border-blue-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{consumption.meal?.name || consumption.meals?.name}</p>
                          {consumption.notes && (
                            <p className="text-sm text-muted-foreground">{consumption.notes}</p>
                          )}
                        </div>
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemoveConsumption(consumption.id)}
                            className="gap-1 text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-3 w-3" />
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {plannedMeals.length === 0 && consumedMeals.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No meals for {mealType}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export const MealConsumptionTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([]);

  const { consumption, addConsumption, removeConsumption, getConsumptionForDate } = useMealConsumption();
  const { activePlan, planMeals } = useMealPlans();
  const { meals } = useMeals();

  const handlePreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const handleMarkConsumed = async (mealId: string, mealType: string, wasPlanned: boolean, mealPlanMealId?: string) => {
    await addConsumption(mealId, currentDate, mealType, wasPlanned, mealPlanMealId);
  };

  const handleConfirmDay = async (selectedPlannedMeals: string[]) => {
    const plannedMealsForDate = getPlannedMealsForDate(currentDate);
    for (const plannedMealId of selectedPlannedMeals) {
      const plannedMeal = plannedMealsForDate.find(pm => pm.id === plannedMealId);
      if (plannedMeal) {
        await addConsumption(
          plannedMeal.meal_id,
          currentDate,
          plannedMeal.meal_type,
          true,
          plannedMeal.id
        );
      }
    }
  };

  const handleRemoveConsumption = async (consumptionId: string) => {
    await removeConsumption(consumptionId);
  };

  const handleAddMeal = (mealType: string) => {
    setSelectedMealType(mealType);
    setShowMealSelector(true);
  };

  const handleSaveMeals = async () => {
    if (!selectedMealType) return;

    for (const mealId of selectedMealIds) {
      await addConsumption(mealId, currentDate, selectedMealType, false);
    }

    setShowMealSelector(false);
    setSelectedMealIds([]);
    setSelectedMealType(null);
  };
  const getPlannedMealsForDate = (date: Date) => {
    if (!activePlan) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return planMeals.filter(pm => pm.planned_date === dateStr);
  };

  const dayConsumption = getConsumptionForDate(currentDate);
  const plannedMeals = getPlannedMealsForDate(currentDate);

  // Check if current date is within the last 3 days
  const today = new Date();
  const threeDaysAgo = subDays(today, 3);
  const canEdit = currentDate >= threeDaysAgo && currentDate <= today;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meal Consumption</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!canEdit && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            You can only edit consumption for the last 3 days. Viewing mode only.
          </p>
        </div>
      )}

      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="history">30-Day History</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <DayConsumption
            date={currentDate}
            consumption={dayConsumption}
            plannedMeals={plannedMeals}
            onMarkConsumed={canEdit ? handleMarkConsumed : () => {}}
            onRemoveConsumption={canEdit ? handleRemoveConsumption : () => {}}
            onAddMeal={canEdit ? handleAddMeal : () => {}}
            onConfirmDay={canEdit ? handleConfirmDay : () => {}}
            selectedMealType={selectedMealType}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {consumption.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Consumption History</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your meals to see your consumption history here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {consumption
                .reduce((acc, c) => {
                  const date = c.consumed_date;
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(c);
                  return acc;
                }, {} as Record<string, typeof consumption>)
                && Object.entries(
                  consumption.reduce((acc, c) => {
                    const date = c.consumed_date;
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(c);
                    return acc;
                  }, {} as Record<string, typeof consumption>)
                )
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .slice(0, 30)
                .map(([date, dayConsumption]) => (
                  <Card key={date}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {MEAL_TYPES.map(mealType => {
                          const mealsForType = dayConsumption.filter(c => c.meal_type === mealType);
                          if (mealsForType.length === 0) return null;
                          
                          return (
                            <div key={mealType} className="flex items-center gap-2">
                              <Badge className={getMealTypeColor(mealType)}>{mealType}</Badge>
                              <div className="flex flex-wrap gap-1">
                                {mealsForType.map(c => (
                                  <span key={c.id} className="text-sm">
                                    {c.meal?.name || c.meals?.name}
                                    {c.was_planned && <span className="text-green-600 ml-1">✓</span>}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showMealSelector} onOpenChange={setShowMealSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Meals for {selectedMealType}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MealSelector
              selectedMealIds={selectedMealIds}
              onSelectionChange={setSelectedMealIds}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMealSelector(false);
                  setSelectedMealIds([]);
                  setSelectedMealType(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveMeals}>
                Save Selected Meals
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const getMealTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    breakfast: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    lunch: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    dinner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    snack: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  };
  return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};