import { Calendar, ShoppingCart, Users, ChefHat, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: "warm" | "sage" | "family";
  onClick: () => void;
}

interface QuickActionsProps {
  onPlanMeals: () => void;
  onManageInventory: () => void;
  onAddFamily: () => void;
  onLogMeals: () => void;
  onViewNutrition: () => void;
  onAddMeal: () => void;
}

export const QuickActions = ({
  onPlanMeals,
  onManageInventory,
  onAddFamily,
  onLogMeals,
  onViewNutrition,
  onAddMeal
}: QuickActionsProps) => {
  const actions: QuickAction[] = [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Plan This Week",
      description: "Generate smart meal plans",
      variant: "sage",
      onClick: onPlanMeals
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      title: "Manage Inventory",
      description: "Track groceries & staples",
      variant: "warm",
      onClick: onManageInventory
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Family Members",
      description: "Update profiles & preferences",
      variant: "family",
      onClick: onAddFamily
    },
    {
      icon: <ChefHat className="w-5 h-5" />,
      title: "Log Meals",
      description: "Mark what was consumed",
      variant: "warm",
      onClick: onLogMeals
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Nutrition Analysis",
      description: "View health insights",
      variant: "sage",
      onClick: onViewNutrition
    },
    {
      icon: <Plus className="w-5 h-5" />,
      title: "Add New Meal",
      description: "Expand meal library",
      variant: "family",
      onClick: onAddMeal
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <Card
          key={index}
          className="p-4 bg-card hover:shadow-warm transition-all duration-300 cursor-pointer animate-slide-up border-border"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={action.onClick}
        >
          <div className="flex items-start gap-3">
            <Button
              variant={action.variant}
              size="icon"
              className="shrink-0"
            >
              {action.icon}
            </Button>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};