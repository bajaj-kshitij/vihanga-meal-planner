import { Calendar, Clock, Users, ChefHat, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  prepTime: number;
  servings: number;
  cookMethod: "cook" | "self";
  requiresOvernightSoaking?: string;
}

interface DayPlan {
  date: string;
  day: string;
  meals: Meal[];
}

interface MealPlanPreviewProps {
  todayPlan: DayPlan;
  tomorrowPlan: DayPlan;
  onViewFullPlan: () => void;
}

export const MealPlanPreview = ({ todayPlan, tomorrowPlan, onViewFullPlan }: MealPlanPreviewProps) => {
  const getMealTypeColor = (type: Meal["type"]) => {
    switch (type) {
      case "breakfast": return "bg-primary/10 text-primary";
      case "lunch": return "bg-accent/10 text-accent-foreground";
      case "dinner": return "bg-secondary/20 text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const renderMealList = (dayPlan: DayPlan) => (
    <div className="space-y-4">
      {dayPlan.meals.map((meal) => (
        <div
          key={meal.id}
          className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:shadow-soft transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(meal.type)}`}>
              {meal.type}
            </span>
            <div>
              <h3 className="font-medium text-foreground">{meal.name}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {meal.prepTime} min
                </div>
                {meal.requiresOvernightSoaking === "Yes" && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <Moon className="w-3 h-3" />
                    Overnight soaking
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {dayPlan.meals.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No meals planned for {dayPlan.day.toLowerCase()}</p>
          <Button variant="sage" className="mt-4" onClick={onViewFullPlan}>
            Start Planning
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Card className="p-6 bg-gradient-gentle border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Plan</h2>
          </div>
        </div>
        <Button variant="outline" onClick={onViewFullPlan}>
          View Full Week
        </Button>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-6">
          {renderMealList(todayPlan)}
        </TabsContent>
        <TabsContent value="tomorrow" className="mt-6">
          {renderMealList(tomorrowPlan)}
        </TabsContent>
      </Tabs>
    </Card>
  );
};