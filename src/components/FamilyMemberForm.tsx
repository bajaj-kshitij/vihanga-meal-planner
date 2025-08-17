import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealSelector } from "./MealSelector";
import type { FamilyMember } from '@/hooks/useFamilyMembers';

interface FamilyMemberFormProps {
  member?: FamilyMember;
  onSubmit: (data: Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const FamilyMemberForm = ({ member, onSubmit, onCancel, loading }: FamilyMemberFormProps) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    age: member?.age || '',
    role: member?.role || '',
    meal_preferences: member?.meal_preferences || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      age: formData.age ? parseInt(formData.age.toString()) : undefined,
    });
  };

  const handleMealPreferencesChange = (mealIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      meal_preferences: mealIds
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{member ? 'Edit Family Member' : 'Add Family Member'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Family member name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Age"
                min="0"
                max="150"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              placeholder="e.g., Mom, Dad, Child, etc."
            />
          </div>

          <MealSelector
            selectedMealIds={formData.meal_preferences}
            onSelectionChange={handleMealPreferencesChange}
            maxSelections={25}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading || !formData.name.trim()} className="flex-1">
              {loading ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};