
import React from "react";
import { NavLink } from "react-router-dom";
import { Search, Calendar, MessageCircle, User, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "../ui/badge";

const BottomNavigation: React.FC = () => {
  const { subscription } = useAuth();
  
  // Determine badge for premium status
  const PremiumBadge = () => {
    if (subscription === 'premium_plus') {
      return (
        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-[9px]">
          PLUS
        </Badge>
      );
    }
    
    if (subscription === 'premium') {
      return (
        <Badge className="absolute -top-2 -right-2 bg-brand-purple text-[9px]">
          PRO
        </Badge>
      );
    }
    
    return null;
  };
  
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid h-full grid-cols-5">
        <NavLink
          to="/people"
          className={({ isActive }) => 
            cn("flex flex-col items-center justify-center", 
               isActive ? "text-brand-purple" : "text-gray-500 hover:text-brand-purple")
          }
        >
          <Search className="nav-icon" />
          <span className="text-xs mt-1">People</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) => 
            cn("flex flex-col items-center justify-center", 
               isActive ? "text-brand-purple" : "text-gray-500 hover:text-brand-purple")
          }
        >
          <Calendar className="nav-icon" />
          <span className="text-xs mt-1">Calendar</span>
        </NavLink>

        <NavLink
          to="/chats"
          className={({ isActive }) => 
            cn("flex flex-col items-center justify-center", 
               isActive ? "text-brand-purple" : "text-gray-500 hover:text-brand-purple")
          }
        >
          <MessageCircle className="nav-icon" />
          <span className="text-xs mt-1">Chats</span>
        </NavLink>

        <NavLink
          to="/loyalty"
          className={({ isActive }) => 
            cn("flex flex-col items-center justify-center relative", 
               isActive ? "text-brand-purple" : "text-gray-500 hover:text-brand-purple")
          }
        >
          <Gift className="nav-icon" />
          <span className="text-xs mt-1">Loyalty</span>
          {(subscription === 'premium' || subscription === 'premium_plus') && (
            <div className="absolute top-0 right-5 h-1.5 w-1.5 bg-green-500 rounded-full"></div>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => 
            cn("flex flex-col items-center justify-center relative", 
               isActive ? "text-brand-purple" : "text-gray-500 hover:text-brand-purple")
          }
        >
          <div className="relative">
            <User className="nav-icon" />
            <PremiumBadge />
          </div>
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNavigation;
