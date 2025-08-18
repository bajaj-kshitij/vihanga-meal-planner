import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ChefHat, Package, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Planner", href: "/planner", icon: Calendar },
  { name: "Meals", href: "/meals", icon: ChefHat },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Family", href: "/profiles", icon: Users },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/auth') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "h-full rounded-none flex flex-col gap-1 px-2 py-2",
                isActive && "text-primary bg-primary/10"
              )}
              onClick={() => navigate(item.href)}
            >
              <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
              <span className={cn("text-xs", isActive && "text-primary font-medium")}>
                {item.name}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}