import { useState } from "react";
import { Plus, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/DashboardStats";
import { QuickActions } from "@/components/QuickActions";
import { MealPlanPreview } from "@/components/MealPlanPreview";
import { FamilyMemberCard } from "@/components/FamilyMemberCard";
import heroImage from "@/assets/family-kitchen-hero.jpg";

interface FamilyMember {
  id: string;
  name: string;
  age: number;
  role: string;
  dietaryRestrictions: string[];
  preferences: string[];
}

interface DayPlan {
  date: string;
  day: string;
  meals: Array<{
    id: string;
    name: string;
    type: "breakfast" | "lunch" | "dinner" | "snack";
    prepTime: number;
    servings: number;
    cookMethod: "cook" | "self";
  }>;
}

const Dashboard = () => {
  const [familyMembers] = useState<FamilyMember[]>([
    {
      id: "1",
      name: "Sarah",
      age: 34,
      role: "Mom",
      dietaryRestrictions: ["Gluten-free"],
      preferences: ["Mediterranean", "Salads", "Fish"]
    },
    {
      id: "2", 
      name: "Mike",
      age: 36,
      role: "Dad",
      dietaryRestrictions: [],
      preferences: ["BBQ", "Pasta", "Asian cuisine"]
    }
  ]);

  const [weekPlan] = useState<DayPlan[]>([
    {
      date: new Date().toDateString(),
      day: "Today",
      meals: [
        {
          id: "1",
          name: "Overnight Oats with Berries",
          type: "breakfast",
          prepTime: 5,
          servings: 4,
          cookMethod: "self"
        },
        {
          id: "2",
          name: "Mediterranean Quinoa Bowl",
          type: "lunch",
          prepTime: 25,
          servings: 4,
          cookMethod: "cook"
        },
        {
          id: "3",
          name: "Herb-Crusted Salmon",
          type: "dinner",
          prepTime: 35,
          servings: 4,
          cookMethod: "cook"
        }
      ]
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-gentle">
      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-64 bg-cover bg-center bg-gradient-sage relative overflow-hidden"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-sage/80" />
          <div className="relative z-10 container mx-auto px-6 h-full flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2 animate-fade-in">Family Meal Planner</h1>
              <p className="text-xl opacity-90 animate-fade-in" style={{ animationDelay: "200ms" }}>
                Nourishing your family, one meal at a time
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Quick Actions</h2>
          <QuickActions
            onPlanMeals={() => console.log("Plan meals")}
            onManageInventory={() => console.log("Manage inventory")}
            onAddFamily={() => console.log("Add family")}
            onLogMeals={() => console.log("Log meals")}
            onViewNutrition={() => console.log("View nutrition")}
            onAddMeal={() => console.log("Add meal")}
          />
        </section>

        {/* Today's Plan & Family Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Meal Plan Preview */}
          <section>
            <MealPlanPreview 
              weekPlan={weekPlan}
              onViewFullPlan={() => console.log("View full plan")}
            />
          </section>

          {/* Family Members */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Family Members</h2>
              <Button variant="sage" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  onEdit={(member) => console.log("Edit member", member)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;