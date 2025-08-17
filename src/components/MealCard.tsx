import { Clock, Users, ChefHat, Heart, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Meal } from "@/hooks/useMeals";

interface MealCardProps {
  meal: Meal;
  onEdit?: (meal: Meal) => void;
  onView?: (meal: Meal) => void;
  onToggleFavorite?: (mealId: string) => void;
}

export const MealCard = ({ meal, onEdit, onView, onToggleFavorite }: MealCardProps) => {
  const getMealTypeColor = (type: Meal["meal_type"]) => {
    switch (type) {
      case "breakfast":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "lunch":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "dinner":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "snack":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: Meal["difficulty_level"]) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const totalTime = meal.prep_time_minutes + meal.cook_time_minutes;

  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground mb-2">
              {meal.name}
            </CardTitle>
            {meal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {meal.description}
              </p>
            )}
          </div>
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(meal.id)}
              className="shrink-0 ml-2"
            >
              <Heart 
                className={`w-4 h-4 ${meal.is_favorite ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge className={getMealTypeColor(meal.meal_type)}>
            {meal.meal_type}
          </Badge>
          <Badge className={getDifficultyColor(meal.difficulty_level)}>
            {meal.difficulty_level}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {meal.cuisine_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{totalTime}min</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{meal.servings} servings</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ChefHat className="w-4 h-4" />
            <span>
              {meal.prep_time_minutes > 0 ? `${meal.prep_time_minutes}m prep` : 'No prep'}
            </span>
          </div>
        </div>

        {meal.tags && meal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {meal.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {meal.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{meal.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(meal)}
              className="flex-1"
            >
              View Recipe
            </Button>
          )}
          {onEdit && (
            <Button
              variant="sage"
              size="sm"
              onClick={() => onEdit(meal)}
              className="flex-1"
            >
              Edit
            </Button>
          )}
        </div>

        {meal.is_public && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Star className="w-3 h-3" />
            <span>Public Recipe</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};