import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { MobileNav } from "./mobile-nav";
import UserMenu from "../UserMenu";
import { ChefHat, Bell, Settings } from "lucide-react";
import { Button } from "./button";

export function AppHeader() {
  const { user } = useAuth();
  const location = useLocation();

  if (location.pathname === '/auth' || !user) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Mobile Menu */}
          <div className="flex items-center md:hidden">
            <MobileNav />
          </div>

          {/* Logo for Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Family Meal Planner</span>
          </div>

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 md:hidden">
            <ChefHat className="h-5 w-5 text-primary" />
            <span className="font-semibold">Family Meals</span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Settings className="h-4 w-4" />
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}