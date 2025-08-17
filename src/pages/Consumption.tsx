import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MealConsumptionTracker } from "@/components/MealConsumptionTracker";

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
    <div className="min-h-screen bg-gradient-gentle">
      <div className="container mx-auto px-6 py-8">
        <MealConsumptionTracker />
      </div>
    </div>
  );
};

export default Consumption;