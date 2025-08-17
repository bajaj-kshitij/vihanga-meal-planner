import { useState, useRef } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Papa from "papaparse";
import { useMeals, Meal } from "@/hooks/useMeals";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    if (!row["Ingredients"]?.trim()) {
      rowErrors.push(`Row ${index + 1}: Ingredients is required`);
    }
    
    const prepTime = parseInt(row["Prep Time"]);
    if (isNaN(prepTime) || prepTime < 0) {
      rowErrors.push(`Row ${index + 1}: Prep Time must be a valid number`);
    }
    
    const cookTime = parseInt(row["Cook Time"]);
    if (isNaN(cookTime) || cookTime < 0) {
      rowErrors.push(`Row ${index + 1}: Cook Time must be a valid number`);
    }
    
    const servings = parseInt(row["Serving"]);
    if (isNaN(servings) || servings < 1) {
      rowErrors.push(`Row ${index + 1}: Serving must be a valid number greater than 0`);
    }
    
    const validMealTypes = ["breakfast", "lunch", "dinner", "snack"];
    if (!validMealTypes.includes(row["Meal Type"]?.toLowerCase())) {
      rowErrors.push(`Row ${index + 1}: Meal Type must be one of: ${validMealTypes.join(", ")}`);
    }
    
    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(row["Difficulty"]?.toLowerCase())) {
      rowErrors.push(`Row ${index + 1}: Difficulty must be one of: ${validDifficulties.join(", ")}`);
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
            setErrors(allErrors.slice(0, 10)); // Show first 10 errors
            setIsProcessing(false);
            return;
          }
          
          let successCount = 0;
          let failCount = 0;
          
          // Process rows in batches to avoid overwhelming the database
          const batchSize = 10;
          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            
            await Promise.all(
              batch.map(async (row) => {
                try {
                  const mealData: Partial<Meal> = {
                    name: row["Recipe Name"].trim(),
                    description: row["Description"]?.trim() || "",
                    ingredients: parseIngredients(row["Ingredients"]),
                    prep_time_minutes: parseInt(row["Prep Time"]),
                    cook_time_minutes: parseInt(row["Cook Time"]),
                    cuisine_type: row["Cuisine Type"]?.trim() || "Indian",
                    meal_type: row["Meal Type"].toLowerCase() as "breakfast" | "lunch" | "dinner" | "snack",
                    difficulty_level: row["Difficulty"].toLowerCase() as "easy" | "medium" | "hard",
                    servings: parseInt(row["Serving"]),
                    instructions: parseInstructions(row["Cooking Instructions"]),
                    tags: parseTags(row["Tags"]),
                    is_favorite: false,
                    is_public: false
                  };
                  
                  await createMeal(mealData);
                  successCount++;
                } catch (error) {
                  console.error("Error importing meal:", error);
                  failCount++;
                }
              })
            );
            
            setProgress(Math.round(((i + batchSize) / data.length) * 100));
          }
          
          setIsProcessing(false);
          
          if (successCount > 0) {
            // Refresh the meals list to show imported meals
            await fetchMeals();
            toast.success(`Successfully imported ${successCount} meals${failCount > 0 ? ` (${failCount} failed)` : ""}`);
            if (failCount === 0) {
              onClose();
            }
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
              <div>7. Meal Type (breakfast/lunch/dinner/snack)</div>
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

            {errors.length > 0 && (
              <div className="border border-destructive/20 bg-destructive/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="font-medium text-destructive">Validation Errors</span>
                </div>
                <ul className="text-sm text-destructive space-y-1 max-h-32 overflow-y-auto">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {errors.length === 10 && (
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
      </div>
    </div>
  );
};