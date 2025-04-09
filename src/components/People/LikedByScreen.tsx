
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const LikedByScreen: React.FC = () => {
  const navigate = useNavigate();
  const isPremium = false; // In a real app, this would come from user context

  const handleUpgrade = () => {
    navigate("/premium");
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate("/people")} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Liked by</h1>
      </div>

      <div className="p-4">
        {!isPremium ? (
          <div className="h-[70vh] flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Lock className="h-10 w-10 text-brand-purple" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">
              See who likes you
            </h2>
            <p className="text-center text-gray-500 mb-6 max-w-xs">
              Upgrade to Premium to see all the professionals who have liked your profile
            </p>
            <Button 
              onClick={handleUpgrade} 
              className="bg-brand-purple hover:bg-brand-purple/90 w-full max-w-xs"
            >
              Upgrade to Premium
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              15 people have liked your profile
            </p>
            {/* Sample content that would show if the user was premium */}
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-xl flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mr-3"></div>
                  <div>
                    <h3 className="font-semibold">User Name</h3>
                    <p className="text-sm text-gray-500">Job Title</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedByScreen;
