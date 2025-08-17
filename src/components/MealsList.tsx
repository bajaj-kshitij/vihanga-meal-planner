import { useState } from "react";
import { Plus, Search, Filter, ChefHat, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealCard } from "./MealCard";
import { MealForm } from "./MealForm";
import { RecipeImport } from "./RecipeImport";
import { CSVImport } from "./CSVImport";
import { Meal, useMeals } from "@/hooks/useMeals";

export const MealsList = () => {
  const { meals, loading, createMeal, updateMeal, deleteMeal } = useMeals();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMealType, setFilterMealType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

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

  const handleView = (meal: Meal) => {
    setSelectedMeal(meal);
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

  if (showImport) {
    return (
      <RecipeImport onClose={() => setShowImport(false)} />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meal Catalogue</h1>
          <p className="text-muted-foreground">Manage your recipes and discover new ones</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCSVImport(true)} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            CSV Import
          </Button>
          <Button onClick={() => setShowImport(true)} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Recipe API
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Meal
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
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
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
      <Tabs defaultValue="my-favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="my-favorites">My Meals & Liked ({userMealsAndFavorites.length})</TabsTrigger>
          <TabsTrigger value="all">All Meals ({filteredMeals.length})</TabsTrigger>
          <TabsTrigger value="my">My Recipes ({myMeals.length})</TabsTrigger>
          <TabsTrigger value="public">Public ({publicMeals.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favoriteMeals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my-favorites" className="mt-6">
          {userMealsAndFavorites.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No meals found</h3>
              <p className="text-muted-foreground">Start by adding your first meal recipe or like some public recipes!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userMealsAndFavorites.map((meal) => (
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

        <TabsContent value="my" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myMeals.map((meal) => (
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
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onView={handleView}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};