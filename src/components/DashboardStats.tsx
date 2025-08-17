import { TrendingUp, Calendar, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useMealPlans } from "@/hooks/useMealPlans";
import { useInventory } from "@/hooks/useInventory";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

const StatCard = ({ icon, title, value, change, trend }: StatCardProps) => {
  const trendColor = trend === "up" ? "text-primary" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  
  return (
    <Card className="p-6 bg-gradient-gentle border-border hover:shadow-soft transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-warm rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
        <div className={`text-sm font-medium ${trendColor}`}>
          {change}
        </div>
      </div>
    </Card>
  );
};

export const DashboardStats = () => {
  const { getWeekPlan } = useMealPlans();
  const { getLowStockItems } = useInventory();
  
  const weekPlan = getWeekPlan();
  const totalMealsPlanned = weekPlan.reduce((total, day) => total + day.meals.length, 0);
  const lowStockItems = getLowStockItems();
  
  const lowStockTrend: "up" | "down" = lowStockItems.length > 5 ? "down" : "up";
  
  const stats = [
    {
      icon: <Calendar className="w-5 h-5 text-secondary-foreground" />,
      title: "Meals Planned",
      value: totalMealsPlanned.toString(),
      change: "Next 7 Days",
      trend: "neutral" as const
    },
    {
      icon: <Package className="w-5 h-5 text-secondary-foreground" />,
      title: "Low Inventory",
      value: lowStockItems.length.toString(),
      change: "Items below threshold",
      trend: lowStockTrend
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
};