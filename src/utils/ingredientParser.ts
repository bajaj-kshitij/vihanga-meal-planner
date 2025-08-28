// Utility functions for parsing ingredient strings into structured data

export interface ParsedIngredient {
  name: string;
  quantity: string | null;
  unit: string | null;
  original: string;
  [key: string]: string | null; // Index signature for Supabase Json compatibility
}

// Common units mapping (both singular and plural forms)
const UNITS = [
  // Volume
  'cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 'teaspoon', 'teaspoons', 'tsp',
  'liter', 'liters', 'litre', 'litres', 'ml', 'milliliter', 'milliliters',
  'pint', 'pints', 'quart', 'quarts', 'gallon', 'gallons', 'fl oz', 'fluid ounce', 'fluid ounces',
  
  // Weight
  'kg', 'kilogram', 'kilograms', 'g', 'gram', 'grams', 'lb', 'lbs', 'pound', 'pounds',
  'oz', 'ounce', 'ounces', 'ton', 'tons',
  
  // Count/Other  
  'piece', 'pieces', 'pc', 'pcs', 'slice', 'slices', 'clove', 'cloves',
  'bunch', 'bunches', 'sprig', 'sprigs', 'inch', 'inches', 'pinch', 'pinches',
  'handful', 'handfuls', 'dash', 'dashes', 'drop', 'drops',
  
  // Indian specific
  'katori', 'bowl', 'bowls'
];

// Fraction conversion
const FRACTIONS: Record<string, string> = {
  '1/2': '0.5',
  '1/3': '0.33',
  '2/3': '0.67',
  '1/4': '0.25',
  '3/4': '0.75',
  '1/8': '0.125',
  '3/8': '0.375',
  '5/8': '0.625',
  '7/8': '0.875'
};

export function parseIngredient(ingredientText: string): ParsedIngredient {
  const original = ingredientText.trim();
  
  // If the ingredient is too short or seems like a description, return as-is
  if (original.length < 3 || !hasQuantityPattern(original)) {
    return {
      name: original,
      quantity: null,
      unit: null,
      original
    };
  }

  // Regex to match: optional quantity (number, fraction, or mixed) + optional unit + name
  const regex = /^(\d+(?:[-]\d+\/\d+|\.\d+|\/\d+)?)\s*([a-zA-Z]+)?\s+(.*?)$/;
  const match = original.match(regex);
  
  if (!match) {
    // Try alternative patterns
    return parseAlternativePatterns(original);
  }

  const [, quantityStr, potentialUnit, nameStr] = match;
  
  // Clean and validate unit
  const unit = potentialUnit && UNITS.includes(potentialUnit.toLowerCase()) 
    ? potentialUnit.toLowerCase() 
    : null;
    
  // If we found a unit, the name is everything after it
  // If no unit found, the "potentialUnit" is actually part of the name
  const name = unit ? nameStr.trim() : `${potentialUnit || ''} ${nameStr}`.trim();
  
  return {
    name: name || original,
    quantity: quantityStr || null,
    unit,
    original
  };
}

function hasQuantityPattern(text: string): boolean {
  // Check if the text starts with a number pattern
  return /^\d+(?:[-]\d+\/\d+|\.\d+|\/\d+)?/.test(text);
}

function parseAlternativePatterns(original: string): ParsedIngredient {
  // Try to match patterns like "Salt - to taste" or just descriptive text
  if (original.includes(' - ') || original.toLowerCase().includes('to taste')) {
    return {
      name: original,
      quantity: null,
      unit: null,
      original
    };
  }
  
  // If it's clearly a descriptive ingredient (common in some existing data)
  if (original.length > 50 || original.toLowerCase().includes('with') || original.toLowerCase().includes('aromatic')) {
    return {
      name: original,
      quantity: null,
      unit: null,
      original
    };
  }
  
  return {
    name: original,
    quantity: null,
    unit: null,
    original
  };
}

export function parseIngredientsArray(ingredients: string[]): ParsedIngredient[] {
  return ingredients.map(ingredient => parseIngredient(ingredient));
}

// Helper function to format parsed ingredient back to string
export function formatParsedIngredient(parsed: ParsedIngredient): string {
  if (!parsed.quantity) {
    return parsed.name;
  }
  
  const parts = [parsed.quantity];
  if (parsed.unit) {
    parts.push(parsed.unit);
  }
  parts.push(parsed.name);
  
  return parts.join(' ');
}