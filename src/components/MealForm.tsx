import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Meal, useMeals } from "@/hooks/useMeals";

interface MealFormProps {
  meal?: Meal;
  onSubmit: (data: Partial<Meal>) => void;
  onCancel: () => void;
  loading?: boolean;
}


interface FormData {
  name: string;
  description: string;
  cuisine_type: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty_level: "easy" | "medium" | "hard";
  is_public: boolean;
}

export const MealForm = ({ meal, onSubmit, onCancel, loading }: MealFormProps) => {
  const [instructions, setInstructions] = useState<string[]>(meal?.instructions || [""]);
  const [tags, setTags] = useState<string[]>(meal?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [newInstruction, setNewInstruction] = useState("");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: meal?.name || "",
      description: meal?.description || "",
      cuisine_type: meal?.cuisine_type || "Indian",
      meal_type: meal?.meal_type || "lunch",
      prep_time_minutes: meal?.prep_time_minutes || 15,
      cook_time_minutes: meal?.cook_time_minutes || 30,
      servings: meal?.servings || 4,
      difficulty_level: meal?.difficulty_level || "medium",
      is_public: meal?.is_public || false,
    }
  });

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions([...instructions, newInstruction.trim()]);
      setNewInstruction("");
    }
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onFormSubmit = async (data: FormData) => {
    const finalInstructions = instructions.filter(inst => inst.trim());
    const mealData = {
      ...data,
      instructions: finalInstructions.length > 0 ? finalInstructions : undefined,
      tags: tags.length > 0 ? tags : undefined,
    };
    onSubmit(mealData);
  };


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{meal ? "Edit Meal" : "Add New Meal"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Meal Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Meal name is required" })}
                placeholder="e.g., Dal Tadka"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Input
                id="cuisine_type"
                {...register("cuisine_type")}
                placeholder="e.g., Indian, Italian"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the meal..."
              rows={3}
            />
          </div>

          {/* Meal Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal_type">Meal Type *</Label>
              <Select
                value={watch("meal_type")}
                onValueChange={(value) => setValue("meal_type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty_level">Difficulty</Label>
              <Select
                value={watch("difficulty_level")}
                onValueChange={(value) => setValue("difficulty_level", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                max="20"
                {...register("servings", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2 flex items-center gap-2 pt-8">
              <Label htmlFor="is_public">Public Recipe</Label>
              <Switch
                id="is_public"
                checked={watch("is_public")}
                onCheckedChange={(checked) => setValue("is_public", checked)}
              />
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prep_time_minutes">Prep Time (minutes)</Label>
              <Input
                id="prep_time_minutes"
                type="number"
                min="0"
                {...register("prep_time_minutes", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cook_time_minutes">Cook Time (minutes)</Label>
              <Input
                id="cook_time_minutes"
                type="number"
                min="0"
                {...register("cook_time_minutes", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label>Cooking Instructions</Label>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground min-w-[2rem] mt-2">
                    {index + 1}.
                  </span>
                  <div className="flex-1 text-sm border rounded-md p-2 bg-muted/30">
                    {instruction}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInstruction(index)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Textarea
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="Add cooking instruction..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addInstruction}
                  disabled={!newInstruction.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>


          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag (e.g., vegetarian, spicy)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : meal ? "Update Meal" : "Create Meal"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};