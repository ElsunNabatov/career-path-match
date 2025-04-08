
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, Calendar, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid h-full grid-cols-5">
        <NavLink
          to="/home"
          className={({ isActive }) => 
            cn("flex flex-col items-center justify-center", 
               isActive ? "text-brand-purple" : "text-gray-500 hover:text-brand-purple")
          }
        >
          <Home className="nav-icon" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) => 
            cn("flex flex-col items-center justify-center", 
               isActive ? "text-brand-purple" : "text-gray-500 hover:text-brand-purple")
          }
        >
          <Search className="nav-icon" />
          <span className="text-xs mt-1">Discover</span>
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
          to="/profile"
          className={({ isActive }) => 
            cn("flex flex-col items-center justify-center", 
               isActive ? "text-brand-purple" : "text-gray-500 hover:text-brand-purple")
          }
        >
          <User className="nav-icon" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNavigation;
