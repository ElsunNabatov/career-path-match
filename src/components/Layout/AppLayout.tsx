
import React from "react";
import { Outlet } from "react-router-dom";
import BottomNavigation from "../Navigation/BottomNavigation";

const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <div className="screen-container">
        <Outlet />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
