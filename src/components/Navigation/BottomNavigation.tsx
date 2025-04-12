
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
        <NavButton to="/people" icon={<Search />} label="People" />
        <NavButton to="/calendar" icon={<Calendar />} label="Calendar" />
        <NavButton to="/chats" icon={<MessageCircle />} label="Chats" />
        <NavButton 
          to="/loyalty" 
          icon={<Gift />} 
          label="Loyalty" 
          badge={
            (subscription === 'premium' || subscription === 'premium_plus') && (
              <div className="absolute top-0 right-5 h-1.5 w-1.5 bg-green-500 rounded-full"></div>
            )
          }
        />
        <NavButton 
          to="/profile" 
          icon={
            <div className="relative">
              <User />
              <PremiumBadge />
            </div>
          } 
          label="Profile" 
        />
      </div>
    </div>
  );
};

interface NavButtonProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        cn("flex flex-col items-center justify-center relative", 
           isActive 
             ? "text-brand-purple after:content-[''] after:absolute after:bottom-0 after:w-1/2 after:h-0.5 after:bg-brand-purple after:rounded-full" 
             : "text-gray-500 hover:text-brand-purple")
      }
    >
      <div className="relative">
        <div className="nav-icon">{icon}</div>
        {badge}
      </div>
      <span className="text-xs mt-1 font-medium">{label}</span>
    </NavLink>
  );
};

export default BottomNavigation;
