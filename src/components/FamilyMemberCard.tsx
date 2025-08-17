import { User, Edit3, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMeals } from "@/hooks/useMeals";
import type { FamilyMember } from '@/hooks/useFamilyMembers';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
}

export const FamilyMemberCard = ({ member, onEdit, onDelete }: FamilyMemberCardProps) => {
  const { meals } = useMeals();
  
  const favoriteMeals = meals.filter(meal => 
    member.meal_preferences?.includes(meal.id)
  );

  return (
    <Card className="p-6 bg-gradient-gentle border-border hover:shadow-warm transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center">
            <User className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{member.name}</h3>
            <p className="text-muted-foreground">
              {member.role && `${member.role} • `}
              {member.age && `${member.age} years old`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(member)}
            className="opacity-70 hover:opacity-100"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {favoriteMeals.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current text-primary" />
            Favorite Meals ({favoriteMeals.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {favoriteMeals.slice(0, 4).map((meal) => (
              <Badge 
                key={meal.id} 
                variant="secondary" 
                className="text-xs"
              >
                {meal.name}
              </Badge>
            ))}
            {favoriteMeals.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{favoriteMeals.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {favoriteMeals.length === 0 && (
        <div className="text-center py-4">
          <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground text-sm">No favorite meals selected</p>
        </div>
      )}
    </Card>
  );
};