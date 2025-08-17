import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
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
    dietary_restrictions: member?.dietary_restrictions || [],
    preferences: member?.preferences || [],
  });

  const [newRestriction, setNewRestriction] = useState('');
  const [newPreference, setNewPreference] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      age: formData.age ? parseInt(formData.age.toString()) : undefined,
    });
  };

  const addRestriction = () => {
    if (newRestriction.trim() && !formData.dietary_restrictions.includes(newRestriction.trim())) {
      setFormData(prev => ({
        ...prev,
        dietary_restrictions: [...prev.dietary_restrictions, newRestriction.trim()]
      }));
      setNewRestriction('');
    }
  };

  const removeRestriction = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.filter(r => r !== restriction)
    }));
  };

  const addPreference = () => {
    if (newPreference.trim() && !formData.preferences.includes(newPreference.trim())) {
      setFormData(prev => ({
        ...prev,
        preferences: [...prev.preferences, newPreference.trim()]
      }));
      setNewPreference('');
    }
  };

  const removePreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.filter(p => p !== preference)
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

          <div className="space-y-2">
            <Label>Dietary Restrictions</Label>
            <div className="flex gap-2">
              <Input
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                placeholder="Add dietary restriction"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRestriction())}
              />
              <Button type="button" onClick={addRestriction} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.dietary_restrictions.map((restriction, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {restriction}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeRestriction(restriction)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Food Preferences</Label>
            <div className="flex gap-2">
              <Input
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
                placeholder="Add food preference"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreference())}
              />
              <Button type="button" onClick={addPreference} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.preferences.map((preference, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {preference}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removePreference(preference)}
                  />
                </Badge>
              ))}
            </div>
          </div>

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