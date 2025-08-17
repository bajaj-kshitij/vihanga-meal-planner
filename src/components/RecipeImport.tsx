import { useState } from "react";
import { Search, Download, Clock, Users, ChefHat, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipeApiService, PublicRecipe } from "@/utils/recipeApi";
import { useMeals, Meal } from "@/hooks/useMeals";
import { toast } from "sonner";

interface RecipeImportProps {
  onClose: () => void;
}

export const RecipeImport = ({ onClose }: RecipeImportProps) => {
  const { createMeal } = useMeals();
  const [searchTerm, setSearchTerm] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState("all");
  const [recipes, setRecipes] = useState<PublicRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingIds, setImportingIds] = useState<Set<string>>(new Set());

  const searchRecipes = async () => {
    setLoading(true);
    try {
      const results = await RecipeApiService.searchRecipes(
        searchTerm, 
        mealTypeFilter === "all" ? undefined : mealTypeFilter
      );
      setRecipes(results);
    } catch (error) {
      console.error("Error searching recipes:", error);
      toast.error("Failed to search recipes");
    } finally {
      setLoading(false);
    }
  };

  const loadRandomRecipes = async () => {
    setLoading(true);
    try {
      const results = await RecipeApiService.getRandomRecipes(6);
      setRecipes(results);
    } catch (error) {
      console.error("Error loading recipes:", error);
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const importRecipe = async (recipe: PublicRecipe) => {
    const recipeId = recipe.name;
    setImportingIds(prev => new Set([...prev, recipeId]));

    try {
      const mealData: Partial<Meal> = {
        name: recipe.name,
        description: recipe.description,
        cuisine_type: recipe.cuisine_type,
        meal_type: recipe.meal_type,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        servings: recipe.servings,
        difficulty_level: recipe.difficulty_level,
        instructions: recipe.instructions,
        tags: recipe.tags,
        image_url: recipe.image_url,
        is_public: false
      };

      const result = await createMeal(mealData);
      if (result) {
        toast.success(`${recipe.name} imported successfully!`);
      }
    } catch (error) {
      console.error("Error importing recipe:", error);
      toast.error("Failed to import recipe");
    } finally {
      setImportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };

  const getMealTypeColor = (type: string) => {
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

  const getDifficultyColor = (difficulty: string) => {
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

  // Load random recipes on component mount
  useState(() => {
    loadRandomRecipes();
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Import Indian Recipes</h2>
          <p className="text-muted-foreground">Discover and import authentic Indian recipes</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          ← Back to Meals
        </Button>
      </div>

      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && searchRecipes()}
              />
            </div>
            
            <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Meal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={searchRecipes} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>

            <Button variant="outline" onClick={loadRandomRecipes} disabled={loading}>
              <ChefHat className="w-4 h-4 mr-2" />
              Random
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching recipes...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => {
            const isImporting = importingIds.has(recipe.name);
            
            return (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {recipe.name}
                  </CardTitle>
                  {recipe.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={getMealTypeColor(recipe.meal_type)}>
                      {recipe.meal_type}
                    </Badge>
                    <Badge className={getDifficultyColor(recipe.difficulty_level)}>
                      {recipe.difficulty_level}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      {recipe.cuisine_type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.prep_time_minutes + recipe.cook_time_minutes}min</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ChefHat className="w-4 h-4" />
                      <span>{recipe.prep_time_minutes}m prep</span>
                    </div>
                  </div>

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{recipe.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => importRecipe(recipe)}
                    disabled={isImporting}
                    className="w-full"
                    variant="sage"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Import Recipe
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && recipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No recipes found</h3>
          <p className="text-muted-foreground">Try searching with different keywords or load random recipes.</p>
        </div>
      )}
    </div>
  );
};