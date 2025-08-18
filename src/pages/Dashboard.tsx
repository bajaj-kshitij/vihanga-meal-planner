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
import { useMealPlans } from "@/hooks/useMealPlans";
import { PageLayout } from "@/components/ui/page-layout";
import heroImage from "@/assets/family-kitchen-hero.jpg";

interface LegacyFamilyMember {
  id: string;
  name: string;
  age: number;
  role: string;
  dietaryRestrictions: string[];
  preferences: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
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
  const { getTodaysMeals, getTomorrowsMeals, getWeekPlan } = useMealPlans();

  const todaysMeals = getTodaysMeals();
  const tomorrowsMeals = getTomorrowsMeals();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);


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
    <PageLayout>
      <div className="min-h-screen bg-gradient-gentle">
        {/* Hero Section */}
        <div className="relative">
          <div 
            className="h-48 md:h-64 bg-cover bg-center bg-gradient-sage relative overflow-hidden"
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-sage/80" />
            <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
              <div className="text-white">
                <h1 className="text-2xl md:text-4xl font-bold mb-2 animate-fade-in">Family Meal Planner</h1>
                <p className="text-sm md:text-xl opacity-90 animate-fade-in" style={{ animationDelay: "200ms" }}>
                  Welcome back, {user.user_metadata?.full_name || user.user_metadata?.name || 'there'}!
                </p>
              </div>
              <div className="hidden md:flex gap-3">
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
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 md:space-y-8">
        {/* Stats */}
        <DashboardStats />

        {/* Plan */}
        <section>
          <MealPlanPreview 
            todayPlan={todaysMeals}
            tomorrowPlan={tomorrowsMeals}
            onViewFullPlan={() => navigate('/planner')}
          />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 md:mb-6">Quick Actions</h2>
          <QuickActions
            onPlanMeals={() => navigate('/planner')}
            onManageInventory={() => navigate('/inventory')}
            onAddFamily={() => navigate('/profiles')}
            onLogMeals={() => navigate('/consumption')}
            onAddMeal={() => navigate('/meals')}
          />
        </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;