// Utility for fetching Indian recipes from public sources
// This is a simplified implementation that can be expanded with real APIs

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface PublicRecipe {
  name: string;
  description: string;
  cuisine_type: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty_level: "easy" | "medium" | "hard";
  instructions: string[];
  ingredients: RecipeIngredient[];
  tags: string[];
  image_url?: string;
}

// Sample Indian recipes database - in a real app, this would come from an API
const SAMPLE_INDIAN_RECIPES: PublicRecipe[] = [
  {
    name: "Dal Tadka",
    description: "Classic Indian lentil curry with aromatic tempering",
    cuisine_type: "Indian",
    meal_type: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 25,
    servings: 4,
    difficulty_level: "easy",
    instructions: [
      "Wash and soak lentils for 30 minutes",
      "Boil lentils with turmeric, salt until soft and mushy",
      "Heat ghee in a pan, add cumin seeds and let them splutter",
      "Add ginger-garlic paste, green chilies and sauté",
      "Add chopped onions and cook until golden brown",
      "Add tomatoes and cook until they break down",
      "Add red chili powder, coriander powder, and garam masala",
      "Add the cooked lentils and mix well",
      "Simmer for 10 minutes, adjust consistency with water",
      "Garnish with fresh cilantro and serve hot"
    ],
    ingredients: [
      { name: "Lentils (Dal)", amount: 1, unit: "cup" },
      { name: "Onions", amount: 2, unit: "piece" },
      { name: "Tomatoes", amount: 2, unit: "piece" },
      { name: "Ginger", amount: 1, unit: "inch" },
      { name: "Garlic", amount: 4, unit: "clove" },
      { name: "Green Chilies", amount: 2, unit: "piece" },
      { name: "Cumin Seeds", amount: 1, unit: "tsp" },
      { name: "Turmeric Powder", amount: 0.5, unit: "tsp" },
      { name: "Red Chili Powder", amount: 1, unit: "tsp" },
      { name: "Coriander Powder", amount: 1, unit: "tsp" },
      { name: "Garam Masala", amount: 0.5, unit: "tsp" },
      { name: "Ghee", amount: 2, unit: "tbsp" },
      { name: "Salt", amount: 1, unit: "tsp" },
      { name: "Cilantro", amount: 0.25, unit: "cup" }
    ],
    tags: ["vegetarian", "protein-rich", "comfort-food", "north-indian"]
  },
  {
    name: "Aloo Paratha",
    description: "Stuffed flatbread with spiced potato filling",
    cuisine_type: "Indian",
    meal_type: "breakfast",
    prep_time_minutes: 20,
    cook_time_minutes: 15,
    servings: 4,
    difficulty_level: "medium",
    instructions: [
      "Boil potatoes until tender, peel and mash them",
      "Heat oil, add cumin seeds and green chilies",
      "Add mashed potatoes, turmeric, red chili powder, salt",
      "Add cilantro and let the filling cool",
      "Make soft dough with flour, salt, and water",
      "Divide dough into portions and roll into circles",
      "Place filling in center and seal the edges",
      "Roll carefully into flatbread",
      "Cook on hot griddle with ghee until golden",
      "Serve hot with yogurt and pickle"
    ],
    ingredients: [
      { name: "Wheat Flour", amount: 2, unit: "cup" },
      { name: "Potatoes", amount: 4, unit: "piece" },
      { name: "Green Chilies", amount: 2, unit: "piece" },
      { name: "Cumin Seeds", amount: 1, unit: "tsp" },
      { name: "Turmeric Powder", amount: 0.5, unit: "tsp" },
      { name: "Red Chili Powder", amount: 1, unit: "tsp" },
      { name: "Cilantro", amount: 0.25, unit: "cup" },
      { name: "Ghee", amount: 3, unit: "tbsp" },
      { name: "Salt", amount: 1, unit: "tsp" }
    ],
    tags: ["vegetarian", "breakfast", "north-indian", "comfort-food"]
  },
  {
    name: "Masala Chai",
    description: "Spiced Indian tea with aromatic herbs and spices",
    cuisine_type: "Indian",
    meal_type: "snack",
    prep_time_minutes: 2,
    cook_time_minutes: 8,
    servings: 2,
    difficulty_level: "easy",
    instructions: [
      "Boil water in a saucepan",
      "Add tea leaves and let it boil for 2 minutes",
      "Add crushed ginger, cardamom, cloves, and cinnamon",
      "Add milk and bring to boil",
      "Add sugar to taste",
      "Simmer for 2-3 minutes until aromatic",
      "Strain and serve hot"
    ],
    ingredients: [
      { name: "Black Tea", amount: 2, unit: "tsp" },
      { name: "Milk", amount: 1, unit: "cup" },
      { name: "Water", amount: 1, unit: "cup" },
      { name: "Ginger", amount: 1, unit: "inch" },
      { name: "Cardamom", amount: 2, unit: "piece" },
      { name: "Cloves", amount: 2, unit: "piece" },
      { name: "Cinnamon", amount: 1, unit: "piece" },
      { name: "Sugar", amount: 2, unit: "tsp" }
    ],
    tags: ["beverage", "spiced", "aromatic", "traditional"]
  },
  {
    name: "Vegetable Biryani",
    description: "Fragrant rice dish with mixed vegetables and aromatic spices",
    cuisine_type: "Indian",
    meal_type: "dinner",
    prep_time_minutes: 30,
    cook_time_minutes: 45,
    servings: 6,
    difficulty_level: "hard",
    instructions: [
      "Soak basmati rice for 30 minutes",
      "Heat ghee, add whole spices - bay leaves, cardamom, cinnamon",
      "Add sliced onions and fry until golden brown",
      "Add mixed vegetables and cook for 5 minutes",
      "Add yogurt, ginger-garlic paste, and spices",
      "Cook vegetables until 70% done",
      "Boil rice with whole spices until 70% cooked",
      "Layer rice over vegetables",
      "Sprinkle fried onions, mint, and dots of ghee",
      "Cover and cook on dum (slow cooking) for 30 minutes",
      "Rest for 10 minutes before serving"
    ],
    ingredients: [
      { name: "Basmati Rice", amount: 2, unit: "cup" },
      { name: "Mixed Vegetables", amount: 3, unit: "cup" },
      { name: "Onions", amount: 3, unit: "piece" },
      { name: "Yogurt", amount: 0.5, unit: "cup" },
      { name: "Ginger-Garlic Paste", amount: 2, unit: "tbsp" },
      { name: "Ghee", amount: 4, unit: "tbsp" },
      { name: "Mint Leaves", amount: 0.5, unit: "cup" },
      { name: "Garam Masala", amount: 2, unit: "tsp" },
      { name: "Turmeric Powder", amount: 1, unit: "tsp" },
      { name: "Red Chili Powder", amount: 2, unit: "tsp" }
    ],
    tags: ["vegetarian", "festive", "aromatic", "one-pot", "south-indian"]
  },
  {
    name: "Paneer Butter Masala",
    description: "Creamy and rich cottage cheese curry in tomato-based gravy",
    cuisine_type: "Indian",
    meal_type: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    servings: 4,
    difficulty_level: "medium",
    instructions: [
      "Cut paneer into cubes and lightly fry until golden",
      "Blanch tomatoes, remove skin and blend to puree",
      "Heat butter in pan, add cumin seeds",
      "Add ginger-garlic paste and sauté",
      "Add tomato puree and cook until oil separates",
      "Add red chili powder, garam masala, and salt",
      "Add cream and let it simmer",
      "Add paneer cubes and mix gently",
      "Simmer for 5 minutes",
      "Garnish with cilantro and serve with naan"
    ],
    ingredients: [
      { name: "Paneer", amount: 400, unit: "gm" },
      { name: "Tomatoes", amount: 6, unit: "piece" },
      { name: "Heavy Cream", amount: 0.5, unit: "cup" },
      { name: "Butter", amount: 3, unit: "tbsp" },
      { name: "Ginger-Garlic Paste", amount: 1, unit: "tbsp" },
      { name: "Cumin Seeds", amount: 1, unit: "tsp" },
      { name: "Red Chili Powder", amount: 1, unit: "tsp" },
      { name: "Garam Masala", amount: 1, unit: "tsp" },
      { name: "Salt", amount: 1, unit: "tsp" },
      { name: "Cilantro", amount: 0.25, unit: "cup" }
    ],
    tags: ["vegetarian", "creamy", "restaurant-style", "north-indian"]
  }
];

export class RecipeApiService {
  // Simulate API call with delay
  private static async simulateApiCall<T>(data: T): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    return data;
  }

  // Search for recipes by name or cuisine
  static async searchRecipes(query: string = "", mealType?: string): Promise<PublicRecipe[]> {
    try {
      let filteredRecipes = SAMPLE_INDIAN_RECIPES;

      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.name.toLowerCase().includes(lowerQuery) ||
          recipe.description.toLowerCase().includes(lowerQuery) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      }

      if (mealType && mealType !== "all") {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.meal_type === mealType);
      }

      return this.simulateApiCall(filteredRecipes);
    } catch (error) {
      console.error("Error searching recipes:", error);
      return [];
    }
  }

  // Get recipes by meal type
  static async getRecipesByMealType(mealType: string): Promise<PublicRecipe[]> {
    return this.searchRecipes("", mealType);
  }

  // Get all available recipes
  static async getAllRecipes(): Promise<PublicRecipe[]> {
    return this.simulateApiCall([...SAMPLE_INDIAN_RECIPES]);
  }

  // Get random recipes
  static async getRandomRecipes(count: number = 3): Promise<PublicRecipe[]> {
    const shuffled = [...SAMPLE_INDIAN_RECIPES].sort(() => 0.5 - Math.random());
    return this.simulateApiCall(shuffled.slice(0, count));
  }

  // Extract unique ingredients from a recipe
  static extractIngredients(recipe: PublicRecipe): string[] {
    return recipe.ingredients.map(ing => ing.name);
  }

  // Get recipe suggestions based on available ingredients
  static async getRecipeSuggestions(availableIngredients: string[]): Promise<PublicRecipe[]> {
    try {
      const suggestions = SAMPLE_INDIAN_RECIPES.filter(recipe => {
        const recipeIngredients = this.extractIngredients(recipe);
        const matchingIngredients = recipeIngredients.filter(ingredient => 
          availableIngredients.some(available => 
            available.toLowerCase().includes(ingredient.toLowerCase()) ||
            ingredient.toLowerCase().includes(available.toLowerCase())
          )
        );
        // Return recipes where at least 40% of ingredients are available
        return matchingIngredients.length >= recipeIngredients.length * 0.4;
      });

      return this.simulateApiCall(suggestions);
    } catch (error) {
      console.error("Error getting recipe suggestions:", error);
      return [];
    }
  }
}

// In a real implementation, you would connect to APIs like:
// - Spoonacular API (has Indian cuisine support)
// - Edamam Recipe Search API
// - Custom curated Indian recipe databases
// - Community-driven recipe platforms

/*
Example of real API integration:

export class RealRecipeApiService {
  private static API_KEY = 'your-api-key';
  private static BASE_URL = 'https://api.spoonacular.com/recipes';

  static async searchIndianRecipes(query: string): Promise<PublicRecipe[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/complexSearch?apiKey=${this.API_KEY}&cuisine=indian&query=${query}&addRecipeInformation=true&number=20`
      );
      const data = await response.json();
      
      return data.results.map(this.transformSpoonacularRecipe);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  }

  private static transformSpoonacularRecipe(spoonacularRecipe: any): PublicRecipe {
    // Transform Spoonacular recipe format to our PublicRecipe interface
    return {
      name: spoonacularRecipe.title,
      description: spoonacularRecipe.summary?.replace(/<[^>]*>/g, '') || '',
      cuisine_type: 'Indian',
      meal_type: this.determineMealType(spoonacularRecipe.dishTypes),
      prep_time_minutes: spoonacularRecipe.preparationMinutes || 15,
      cook_time_minutes: spoonacularRecipe.cookingMinutes || 30,
      servings: spoonacularRecipe.servings || 4,
      difficulty_level: this.determineDifficulty(spoonacularRecipe),
      instructions: spoonacularRecipe.analyzedInstructions?.[0]?.steps?.map(step => step.step) || [],
      ingredients: spoonacularRecipe.extendedIngredients?.map(ing => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit
      })) || [],
      tags: spoonacularRecipe.dishTypes || [],
      image_url: spoonacularRecipe.image
    };
  }
}
*/