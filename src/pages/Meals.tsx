import { MealsList } from "@/components/MealsList";
import { PageLayout } from "@/components/ui/page-layout";
import { BackButton } from "@/components/ui/back-button";

const Meals = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-gentle">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="mb-6">
            <BackButton />
          </div>
          <MealsList />
        </div>
      </div>
    </PageLayout>
  );
};

export default Meals;