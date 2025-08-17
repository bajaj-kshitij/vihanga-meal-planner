import { TrendingUp, Calendar, Users, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  const stats = [
    {
      icon: <Calendar className="w-5 h-5 text-secondary-foreground" />,
      title: "Meals Planned",
      value: "7",
      change: "This Week",
      trend: "neutral" as const
    },
    {
      icon: <Users className="w-5 h-5 text-secondary-foreground" />,
      title: "Family Members",
      value: "4",
      change: "Active",
      trend: "neutral" as const
    },
    {
      icon: <ShoppingCart className="w-5 h-5 text-secondary-foreground" />,
      title: "Groceries",
      value: "23",
      change: "Items in stock",
      trend: "up" as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
};