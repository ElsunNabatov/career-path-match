
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = "md", withText = true }) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <div className="flex items-center">
      <div className={`flex ${sizeClasses[size]}`}>
        <div className="gradient-bg rounded-full p-2 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 9L9 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 9L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {withText && (
        <div className="ml-2 font-bold text-lg text-brand-blue">
          CareerMatchPath
        </div>
      )}
    </div>
  );
};

export default Logo;
