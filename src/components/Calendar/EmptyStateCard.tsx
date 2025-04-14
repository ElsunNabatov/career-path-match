
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  showButton?: boolean;
  buttonText?: string;
  buttonAction?: () => void;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: Icon,
  title,
  description,
  showButton = false,
  buttonText = "Browse Matches",
  buttonAction
}) => {
  const navigate = useNavigate();
  
  const handleButtonClick = () => {
    if (buttonAction) {
      buttonAction();
    } else {
      navigate('/chat');
    }
  };

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <Icon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-gray-500 mt-1">
          {description}
        </p>
        {showButton && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleButtonClick}
          >
            {buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
