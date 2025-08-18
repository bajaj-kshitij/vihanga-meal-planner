import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MealConsumptionTracker } from "@/components/MealConsumptionTracker";
import { PageLayout } from "@/components/ui/page-layout";

const Consumption = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-gentle">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
          <MealConsumptionTracker />
        </div>
      </div>
    </PageLayout>
  );
};

export default Consumption;