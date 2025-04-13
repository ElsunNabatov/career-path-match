
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, MessageSquare, Calendar, User, Gift } from "lucide-react";

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface CustomBottomNavigationProps {
  className?: string;
}

const CustomBottomNavigation: React.FC<CustomBottomNavigationProps> = ({
  className,
}) => {
  const navigationItems: NavigationItem[] = [
    {
      icon: <Users className="h-6 w-6" />,
      label: "People",
      href: "/people",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      label: "Chats",
      href: "/chats",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      label: "Calendar",
      href: "/calendar",
    },
    {
      icon: <Gift className="h-6 w-6" />,
      label: "Loyalty",
      href: "/loyalty",
    },
    {
      icon: <User className="h-6 w-6" />,
      label: "Profile",
      href: "/profile",
    },
  ];

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 flex items-center justify-around",
        className
      )}
    >
      {navigationItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center px-1 h-full w-full",
              isActive
                ? "text-brand-purple"
                : "text-gray-500 hover:text-brand-purple"
            )
          }
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default CustomBottomNavigation;
