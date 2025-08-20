import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Settings } from "lucide-react";
import { MealPlanForm } from "@/components/MealPlanForm";
import { MealPlanCalendar } from "@/components/MealPlanCalendar";
import { useMealPlans } from "@/hooks/useMealPlans";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { BackButton } from "@/components/ui/back-button";

const MealPlanner = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mealPlans, activePlan, setActivePlan, loading } = useMealPlans();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-gentle flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading meal plans...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-gentle">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meal Planner</h1>
            <p className="text-muted-foreground mt-2">
              Plan your family's meals for the week, month, or day
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            {mealPlans.length > 0 && (
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={activePlan?.id || ""}
                  onValueChange={(value) => {
                    if (value === "create-new") {
                      setShowCreateForm(true);
                    } else {
                      const plan = mealPlans.find(p => p.id === value);
                      setActivePlan(plan || null);
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} ({plan.plan_type})
                      </SelectItem>
                    ))}
                    <SelectItem value="create-new">
                      <div className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Plan
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {mealPlans.length === 0 && (
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Meal Plan</DialogTitle>
                  </DialogHeader>
                  <MealPlanForm onClose={() => setShowCreateForm(false)} />
                </DialogContent>
              </Dialog>
            )}
            
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Meal Plan</DialogTitle>
                </DialogHeader>
                <MealPlanForm onClose={() => setShowCreateForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {mealPlans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Meal Plans Yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first meal plan to start organizing your family's meals. 
                You can plan daily, weekly, or monthly schedules.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <MealPlanCalendar />
        )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MealPlanner;