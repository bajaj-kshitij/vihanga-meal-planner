import { useState, useEffect } from "react";
import { Plus, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DashboardStats } from "@/components/DashboardStats";
import { QuickActions } from "@/components/QuickActions";
import { MealPlanPreview } from "@/components/MealPlanPreview";
import { FamilyMemberCard } from "@/components/FamilyMemberCard";
import UserMenu from "@/components/UserMenu";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import heroImage from "@/assets/family-kitchen-hero.jpg";

interface LegacyFamilyMember {
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { familyMembers } = useFamilyMembers();

  // Move all useState hooks to the top before any early returns
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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Convert database family members to legacy format for existing components
  const legacyFamilyMembers: LegacyFamilyMember[] = familyMembers.map(member => ({
    id: member.id,
    name: member.name,
    age: member.age || 0,
    role: member.role || '',
    dietaryRestrictions: member.dietary_restrictions || [],
    preferences: member.preferences || []
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-gentle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                Welcome back, {user.user_metadata?.full_name || user.user_metadata?.name || 'there'}!
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="w-4 h-4" />
              </Button>
              <UserMenu />
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
            onManageInventory={() => navigate('/inventory')}
            onAddFamily={() => navigate('/profiles')}
            onLogMeals={() => console.log("Log meals")}
            onViewNutrition={() => console.log("View nutrition")}
            onAddMeal={() => navigate('/meals')}
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
              <Button variant="sage" size="sm" onClick={() => navigate('/profiles')}>
                <Plus className="w-4 h-4 mr-2" />
                Manage Family
              </Button>
            </div>
            <div className="space-y-4">
              {legacyFamilyMembers.length > 0 ? (
                legacyFamilyMembers.map((member) => (
                  <FamilyMemberCard
                    key={member.id}
                    member={member}
                    onEdit={() => navigate('/profiles')}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No family members added yet.</p>
                  <Button variant="sage" className="mt-4" onClick={() => navigate('/profiles')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Family Member
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;