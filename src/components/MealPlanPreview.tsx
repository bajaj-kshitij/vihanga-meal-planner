import { Calendar, Clock, Users, ChefHat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  prepTime: number;
  servings: number;
  cookMethod: "cook" | "self";
}

interface DayPlan {
  date: string;
  day: string;
  meals: Meal[];
}

interface MealPlanPreviewProps {
  weekPlan: DayPlan[];
  onViewFullPlan: () => void;
}

export const MealPlanPreview = ({ weekPlan, onViewFullPlan }: MealPlanPreviewProps) => {
  const today = new Date().toDateString();
  const todayPlan = weekPlan.find(plan => plan.date === today) || weekPlan[0];

  const getMealTypeColor = (type: Meal["type"]) => {
    switch (type) {
      case "breakfast": return "bg-primary/10 text-primary";
      case "lunch": return "bg-accent/10 text-accent-foreground";
      case "dinner": return "bg-secondary/20 text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-6 bg-gradient-gentle border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Today's Plan</h2>
            <p className="text-muted-foreground">{todayPlan.day}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onViewFullPlan}>
          View Full Week
        </Button>
      </div>

      <div className="space-y-4">
        {todayPlan.meals.map((meal, index) => (
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
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {meal.servings} servings
                  </div>
                  <div className="flex items-center gap-1">
                    <ChefHat className="w-3 h-3" />
                    {meal.cookMethod === "cook" ? "Cook prepares" : "Self-made"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {todayPlan.meals.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No meals planned for today</p>
          <Button variant="sage" className="mt-4" onClick={onViewFullPlan}>
            Start Planning
          </Button>
        </div>
      )}
    </Card>
  );
};