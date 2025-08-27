import { useState, useEffect } from "react";
import { Plus, Search, Filter, ChefHat, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MealCard } from "./MealCard";
import { MealForm } from "./MealForm";
import { CSVImport } from "./CSVImport";
import { Meal, useMeals, type MealIngredient } from "@/hooks/useMeals";

export const MealsList = () => {
  const { meals, loading, createMeal, updateMeal, deleteMeal, getMealIngredients } = useMeals();
  const [showForm, setShowForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMealType, setFilterMealType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [mealIngredients, setMealIngredients] = useState<MealIngredient[]>([]);

  const handleCreateMeal = async (mealData: Partial<Meal>) => {
    const result = await createMeal(mealData);
    if (result) {
      setShowForm(false);
    }
  };

  const handleUpdateMeal = async (mealData: Partial<Meal>) => {
    if (editingMeal) {
      const result = await updateMeal(editingMeal.id, mealData);
      if (result) {
        setEditingMeal(null);
        setShowForm(false);
      }
    }
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setShowForm(true);
  };

  const handleView = async (meal: Meal) => {
    setSelectedMeal(meal);
    
    // Load ingredients for the selected meal
    try {
      const ingredients = await getMealIngredients(meal.id);
      setMealIngredients(ingredients);
    } catch (error) {
      console.error("Error loading meal ingredients:", error);
      setMealIngredients([]);
    }
  };

  const handleToggleFavorite = async (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (meal) {
      await updateMeal(mealId, { is_favorite: !meal.is_favorite });
    }
  };

  const handleDelete = async (mealId: string) => {
    if (confirm('Are you sure you want to delete this meal?')) {
      await deleteMeal(mealId);
    }
  };

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meal.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMealType = filterMealType === "all" || meal.meal_type === filterMealType;
    const matchesDifficulty = filterDifficulty === "all" || meal.difficulty_level === filterDifficulty;
    
    return matchesSearch && matchesMealType && matchesDifficulty;
  });

  const myMeals = filteredMeals.filter(meal => !meal.is_public);
  const publicMeals = filteredMeals.filter(meal => meal.is_public);
  const favoriteMeals = filteredMeals.filter(meal => meal.is_favorite);
  
  // Show only user's meals and favorites by default
  const userMealsAndFavorites = filteredMeals.filter(meal => !meal.is_public || meal.is_favorite);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meals...</p>
        </div>
      </div>
    );
  }

  if (showCSVImport) {
    return (
      <CSVImport onClose={() => setShowCSVImport(false)} />
    );
  }

  if (showForm) {
    return (
      <MealForm
        meal={editingMeal || undefined}
        onSubmit={editingMeal ? handleUpdateMeal : handleCreateMeal}
        onCancel={() => {
          setShowForm(false);
          setEditingMeal(null);
        }}
        loading={loading}
      />
    );
  }

  if (selectedMeal) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => setSelectedMeal(null)}
          className="mb-6"
        >
          ← Back to Meals
        </Button>
        
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{selectedMeal.name}</h1>
              {selectedMeal.description && (
                <p className="text-muted-foreground mt-2">{selectedMeal.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleFavorite(selectedMeal.id)}
            >
              <ChefHat className={`w-5 h-5 ${selectedMeal.is_favorite ? 'text-red-500' : ''}`} />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Prep Time</p>
              <p className="font-semibold">{selectedMeal.prep_time_minutes}min</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Cook Time</p>
              <p className="font-semibold">{selectedMeal.cook_time_minutes}min</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Servings</p>
              <p className="font-semibold">{selectedMeal.servings}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <p className="font-semibold capitalize">{selectedMeal.difficulty_level}</p>
            </div>
          </div>

          {selectedMeal.instructions && selectedMeal.instructions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Instructions</h3>
              <ol className="space-y-3">
                {selectedMeal.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Ingredients Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
            
            {/* Simple ingredients list (from text field) */}
            {selectedMeal.ingredients && selectedMeal.ingredients.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Recipe Ingredients</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedMeal.ingredients.map((ingredient: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Structured ingredients (from meal_ingredients table) */}
            {mealIngredients.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Detailed Ingredients</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mealIngredients.map((mealIngredient) => (
                    <div key={mealIngredient.id} className="p-3 border border-border rounded-lg bg-card">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{mealIngredient.ingredient?.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {mealIngredient.ingredient?.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {mealIngredient.quantity} {mealIngredient.unit}
                      </div>
                      {mealIngredient.notes && (
                        <div className="text-xs text-muted-foreground mt-1 italic">
                          {mealIngredient.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show message if no ingredients are available */}
            {(!selectedMeal.ingredients || selectedMeal.ingredients.length === 0) && 
             mealIngredients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No ingredients listed for this recipe yet.</p>
              </div>
            )}
          </div>

          {selectedMeal.tags && selectedMeal.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedMeal.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meal Catalogue</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your recipes and discover new ones</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowCSVImport(true)} variant="outline" className="gap-2 w-full sm:w-auto">
            <Upload className="w-4 h-4" />
            <span className="sm:inline">CSV Import</span>
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            <span className="sm:inline">Add Meal</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterMealType} onValueChange={setFilterMealType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Meal Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="appetizer">Appetizer</SelectItem>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="brunch">Brunch</SelectItem>
            <SelectItem value="dessert">Dessert</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="eggetarian">Eggetarian</SelectItem>
            <SelectItem value="high-protein-vegetarian">High Protein Vegetarian</SelectItem>
            <SelectItem value="indian-breakfast">Indian Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="main-course">Main Course</SelectItem>
            <SelectItem value="no-onion-no-garlic">No Onion No Garlic (Sattvic)</SelectItem>
            <SelectItem value="non-vegetarian">Non Vegetarian</SelectItem>
            <SelectItem value="north-indian-breakfast">North Indian Breakfast</SelectItem>
            <SelectItem value="one-pot-dish">One Pot Dish</SelectItem>
            <SelectItem value="side-dish">Side Dish</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
            <SelectItem value="south-indian-breakfast">South Indian Breakfast</SelectItem>
            <SelectItem value="sugar-free-diet">Sugar Free Diet</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="vegetarian">Vegetarian</SelectItem>
            <SelectItem value="world-breakfast">World Breakfast</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Meals Tabs */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="favorites" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Favorites</span>
            <span className="sm:hidden">♥</span>
            <span className="ml-1">({favoriteMeals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({filteredMeals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          {favoriteMeals.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No favorite meals</h3>
              <p className="text-muted-foreground">Start by liking some meals to see them here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onEdit={handleEdit}
                  onView={handleView}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {filteredMeals.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No meals found</h3>
              <p className="text-muted-foreground">Start by adding your first meal recipe!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onEdit={handleEdit}
                  onView={handleView}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};