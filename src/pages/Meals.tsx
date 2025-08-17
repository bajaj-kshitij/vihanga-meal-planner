import { MealsList } from "@/components/MealsList";

const Meals = () => {
  return (
    <div className="min-h-screen bg-gradient-gentle">
      <div className="container mx-auto px-6 py-8">
        <MealsList />
      </div>
    </div>
  );
};

export default Meals;