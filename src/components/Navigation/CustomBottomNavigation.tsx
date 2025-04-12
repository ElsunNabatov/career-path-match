
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, MessageCircle, Search, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomBottomNavigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      name: "Discover",
      path: "/people",
      icon: <Search className="h-6 w-6" />,
      activeIcon: <Search className="h-6 w-6 fill-current" />,
    },
    {
      name: "Matches",
      path: "/people/liked-by",
      icon: <Users className="h-6 w-6" />,
      activeIcon: <Users className="h-6 w-6 fill-current" />,
    },
    {
      name: "Chat",
      path: "/chat",
      icon: <MessageCircle className="h-6 w-6" />,
      activeIcon: <MessageCircle className="h-6 w-6 fill-current" />,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: <Calendar className="h-6 w-6" />,
      activeIcon: <Calendar className="h-6 w-6 fill-current" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="h-6 w-6" />,
      activeIcon: <User className="h-6 w-6 fill-current" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="h-16 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              (currentPath === "/" && item.path === "/people") ||
              (currentPath.startsWith(item.path) && item.path !== "/") ||
              currentPath === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-1/5 h-full transition-all",
                  isActive
                    ? "text-brand-purple font-medium"
                    : "text-gray-500"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center mb-1",
                    isActive && "scale-110"
                  )}
                >
                  {isActive ? item.activeIcon : item.icon}
                </div>
                <span className="text-xs">{item.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 w-1/5 h-0.5 bg-brand-purple" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CustomBottomNavigation;
