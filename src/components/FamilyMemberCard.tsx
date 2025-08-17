import { User, Edit3, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FamilyMember {
  id: string;
  name: string;
  age: number;
  role: string;
  dietaryRestrictions: string[];
  preferences: string[];
  avatar?: string;
}

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
}

export const FamilyMemberCard = ({ member, onEdit }: FamilyMemberCardProps) => {
  return (
    <Card className="p-6 bg-gradient-gentle border-border hover:shadow-warm transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center">
            <User className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{member.name}</h3>
            <p className="text-muted-foreground">{member.role} • {member.age} years old</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(member)}
          className="opacity-70 hover:opacity-100"
        >
          <Edit3 className="w-4 h-4" />
        </Button>
      </div>

      {member.dietaryRestrictions.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-foreground mb-1">Dietary Restrictions</h4>
          <div className="flex flex-wrap gap-1">
            {member.dietaryRestrictions.map((restriction, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full"
              >
                {restriction}
              </span>
            ))}
          </div>
        </div>
      )}

      {member.preferences.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-1 flex items-center gap-1">
            <Heart className="w-3 h-3" />
            Preferences
          </h4>
          <div className="flex flex-wrap gap-1">
            {member.preferences.slice(0, 3).map((preference, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                {preference}
              </span>
            ))}
            {member.preferences.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                +{member.preferences.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};