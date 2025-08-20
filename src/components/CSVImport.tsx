import { useState, useRef, useEffect } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Papa from "papaparse";
import { useMeals, Meal } from "@/hooks/useMeals";
import { parseIngredientsArray } from "@/utils/ingredientParser";

interface CSVRow {
  "Recipe Name": string;
  "Description": string;
  "Ingredients": string;
  "Prep Time": string;
  "Cook Time": string;
  "Cuisine Type": string;
  "Meal Type": string;
  "Difficulty": string;
  "Serving": string;
  "Cooking Instructions": string;
  "Tags": string;
}

interface CSVImportProps {
  onClose: () => void;
}

export const CSVImport = ({ onClose }: CSVImportProps) => {
  const { createMeal, fetchMeals } = useMeals();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastImportErrors, setLastImportErrors] = useState<string[]>([]);
  const [errorTimestamp, setErrorTimestamp] = useState<number | null>(null);
  const [importSummary, setImportSummary] = useState<{
    successCount: number;
    failCount: number;
    failureReasons: { [key: string]: number };
    totalProcessed: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear last import errors after 2 minutes
  useEffect(() => {
    if (errorTimestamp) {
      const timer = setTimeout(() => {
        setLastImportErrors([]);
        setErrorTimestamp(null);
      }, 2 * 60 * 1000); // 2 minutes

      return () => clearTimeout(timer);
    }
  }, [errorTimestamp]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
        toast.error("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setErrors([]);
    }
  };

  const validateRow = (row: CSVRow, index: number): string[] => {
    const rowErrors: string[] = [];
    
    if (!row["Recipe Name"]?.trim()) {
      rowErrors.push(`Row ${index + 1}: Recipe Name is required`);
    }
    
    // Optional field validations - only validate if provided
    if (row["Meal Type"]?.trim()) {
      const validMealTypes = [
        "appetizer", "breakfast", "brunch", "dessert", "dinner", "eggetarian",
        "high-protein-vegetarian", "indian-breakfast", "lunch", "main-course", 
        "no-onion-no-garlic", "non-vegetarian", "north-indian-breakfast", 
        "one-pot-dish", "side-dish", "snack", "south-indian-breakfast", 
        "sugar-free-diet", "vegan", "vegetarian", "world-breakfast"
      ];
      if (!validMealTypes.includes(row["Meal Type"]?.toLowerCase().replace(/\s+/g, '-'))) {
        rowErrors.push(`Row ${index + 1}: Invalid Meal Type. Valid options are: ${validMealTypes.join(", ")}`);
      }
    }
    
    if (row["Difficulty"]?.trim()) {
      const validDifficulties = ["easy", "medium", "hard"];
      if (!validDifficulties.includes(row["Difficulty"]?.toLowerCase())) {
        rowErrors.push(`Row ${index + 1}: Difficulty must be one of: ${validDifficulties.join(", ")}`);
      }
    }
    
    if (row["Prep Time"]?.trim()) {
      const prepTime = parseInt(row["Prep Time"]);
      if (isNaN(prepTime) || prepTime < 0) {
        rowErrors.push(`Row ${index + 1}: Prep Time must be a valid number`);
      }
    }
    
    if (row["Cook Time"]?.trim()) {
      const cookTime = parseInt(row["Cook Time"]);
      if (isNaN(cookTime) || cookTime < 0) {
        rowErrors.push(`Row ${index + 1}: Cook Time must be a valid number`);
      }
    }
    
    if (row["Serving"]?.trim()) {
      const servings = parseInt(row["Serving"]);
      if (isNaN(servings) || servings < 1) {
        rowErrors.push(`Row ${index + 1}: Serving must be a valid number greater than 0`);
      }
    }
    
    return rowErrors;
  };

  const parseInstructions = (instructionsText: string): string[] => {
    if (!instructionsText?.trim()) return [];
    
    // Split by numbers (1., 2., etc.) or line breaks
    const instructions = instructionsText
      .split(/\d+\.\s*|\n/)
      .map(step => step.trim())
      .filter(step => step.length > 0);
    
    return instructions;
  };

  const parseTags = (tagsText: string): string[] => {
    if (!tagsText?.trim()) return [];
    
    return tagsText
      .split(/[,;|]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  const parseIngredients = (ingredientsText: string): string[] => {
    if (!ingredientsText?.trim()) return [];
    
    return ingredientsText
      .split(/[,;|\n]/)
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    setErrors([]);
    
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data as CSVRow[];
          
          if (data.length === 0) {
            toast.error("CSV file is empty");
            setIsProcessing(false);
            return;
          }
          
          if (data.length > 1000) {
            toast.error("Maximum 1000 rows allowed per upload");
            setIsProcessing(false);
            return;
          }
          
          // Validate all rows first
          const allErrors: string[] = [];
          data.forEach((row, index) => {
            const rowErrors = validateRow(row, index);
            allErrors.push(...rowErrors);
          });
          
          if (allErrors.length > 0) {
            const errorsToShow = allErrors.slice(0, 10);
            setErrors(errorsToShow);
            setLastImportErrors(errorsToShow);
            setErrorTimestamp(Date.now());
            setIsProcessing(false);
            return;
          }
          
          let successCount = 0;
          let failCount = 0;
          const failureReasons: { [key: string]: number } = {};
          
          // Process rows in batches to avoid overwhelming the database
          const batchSize = 10;
          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            
            await Promise.all(
              batch.map(async (row, batchIndex) => {
                try {
                  const ingredients = row["Ingredients"]?.trim() ? parseIngredients(row["Ingredients"]) : [];
                  const parsedIngredients = ingredients.length > 0 ? parseIngredientsArray(ingredients) : [];
                  
                  const mealData: Partial<Meal> = {
                    name: row["Recipe Name"].trim(),
                    description: row["Description"]?.trim() || "",
                    ingredients: ingredients,
                    parsed_ingredients: parsedIngredients,
                    prep_time_minutes: row["Prep Time"]?.trim() ? parseInt(row["Prep Time"]) : 0,
                    cook_time_minutes: row["Cook Time"]?.trim() ? parseInt(row["Cook Time"]) : 0,
                    cuisine_type: row["Cuisine Type"]?.trim() || "Indian",
                    meal_type: row["Meal Type"]?.trim() ? row["Meal Type"].toLowerCase().replace(/\s+/g, '-') : "lunch",
                    difficulty_level: (row["Difficulty"]?.trim()?.toLowerCase() as "easy" | "medium" | "hard") || "medium",
                    servings: row["Serving"]?.trim() ? parseInt(row["Serving"]) : 4,
                    instructions: row["Cooking Instructions"]?.trim() ? parseInstructions(row["Cooking Instructions"]) : [],
                    tags: row["Tags"]?.trim() ? parseTags(row["Tags"]) : [],
                    is_favorite: false,
                    is_public: false
                  };
                  
                  await createMeal(mealData);
                  successCount++;
                } catch (error) {
                  console.error("Error importing meal:", error);
                  failCount++;
                  
                  // Track failure reasons
                  let reason = "Unknown error";
                  if (error instanceof Error) {
                    if (error.message.includes("duplicate") || error.message.includes("unique") || error.message.includes("unique_meal_name_per_user")) {
                      reason = "Duplicate meal name";
                    } else if (error.message.includes("constraint") || error.message.includes("validation")) {
                      reason = "Data validation failed";
                    } else if (error.message.includes("network") || error.message.includes("connection")) {
                      reason = "Network/connection error";
                    } else if (error.message.includes("permission") || error.message.includes("authorization")) {
                      reason = "Permission denied";
                    } else {
                      reason = "Database error";
                    }
                  }
                  
                  failureReasons[reason] = (failureReasons[reason] || 0) + 1;
                }
              })
            );
            
            setProgress(Math.round(((i + batchSize) / data.length) * 100));
          }
          
          setIsProcessing(false);
          
          // Set import summary
          setImportSummary({
            successCount,
            failCount,
            failureReasons,
            totalProcessed: data.length
          });
          
          if (successCount > 0) {
            // Refresh the meals list to show imported meals
            await fetchMeals();
            toast.success(`Successfully imported ${successCount} meals${failCount > 0 ? ` (${failCount} failed)` : ""}`);
          } else {
            toast.error("Failed to import any meals");
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast.error("Failed to parse CSV file");
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import meals");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Import Meals from CSV</h1>
          <p className="text-muted-foreground">Upload a CSV file with your meal recipes</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              CSV Format Requirements
            </CardTitle>
            <CardDescription>
              Your CSV file must include these exact column headers (maximum 1000 rows):
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>1. Recipe Name</div>
              <div>2. Description</div>
              <div>3. Ingredients</div>
              <div>4. Prep Time (minutes)</div>
              <div>5. Cook Time (minutes)</div>
              <div>6. Cuisine Type</div>
              <div>7. Meal Type (see validation error for options)</div>
              <div>8. Difficulty (easy/medium/hard)</div>
              <div>9. Serving (number)</div>
              <div>10. Cooking Instructions</div>
              <div>11. Tags (comma-separated)</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              {file ? (
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Click to upload CSV file</p>
                  <p className="text-sm text-muted-foreground">
                    Or drag and drop your file here
                  </p>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {(errors.length > 0 || lastImportErrors.length > 0) && (
              <div className="border border-destructive/20 bg-destructive/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="font-medium text-destructive">
                    {errors.length > 0 ? "Validation Errors" : "Last Import Errors"}
                  </span>
                  {lastImportErrors.length > 0 && errors.length === 0 && errorTimestamp && (
                    <span className="text-xs text-muted-foreground">
                      (from {new Date(errorTimestamp).toLocaleTimeString()})
                    </span>
                  )}
                </div>
                <ul className="text-sm text-destructive space-y-1 max-h-32 overflow-y-auto">
                  {(errors.length > 0 ? errors : lastImportErrors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {(errors.length > 0 ? errors : lastImportErrors).length === 10 && (
                    <li className="font-medium">... and more errors. Fix these first.</li>
                  )}
                </ul>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing meals...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleImport}
                disabled={!file || isProcessing}
                className="flex-1"
              >
                {isProcessing ? "Importing..." : "Import Meals"}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {importSummary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Import Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-success">{importSummary.successCount}</div>
                  <div className="text-sm text-muted-foreground">Successfully Added</div>
                </div>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">{importSummary.failCount}</div>
                  <div className="text-sm text-muted-foreground">Failed to Add</div>
                </div>
                <div className="bg-muted/50 border border-muted-foreground/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{importSummary.totalProcessed}</div>
                  <div className="text-sm text-muted-foreground">Total Processed</div>
                </div>
              </div>
              
              {importSummary.failCount > 0 && Object.keys(importSummary.failureReasons).length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Key reasons for failures:</h4>
                  <div className="space-y-2">
                    {Object.entries(importSummary.failureReasons).map(([reason, count]) => (
                      <div key={reason} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-lg">
                        <span className="text-sm text-foreground">{reason}</span>
                        <span className="text-sm font-medium text-destructive">{count} meals</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setImportSummary(null)} 
                  variant="outline"
                  className="flex-1"
                >
                  Clear Summary
                </Button>
                {importSummary.failCount === 0 && (
                  <Button onClick={onClose} className="flex-1">
                    Close
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};