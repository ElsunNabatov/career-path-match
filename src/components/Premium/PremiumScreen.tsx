
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, Star, Coffee, HeartHandshake, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const PremiumScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium" | "premiumPlus">("premium");

  const handlePlanSelection = (plan: "free" | "premium" | "premiumPlus") => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (selectedPlan === "free") {
      toast.info("You're continuing with the free plan");
      navigate("/people");
      return;
    }
    
    navigate("/payment?plan=" + selectedPlan);
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate(-1)} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Choose Your Plan</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Upgrade Your Experience</h2>
          <p className="text-gray-600">
            Get more features and benefits with our premium plans
          </p>
        </div>

        {/* Free Plan */}
        <div 
          className={`border-2 rounded-xl p-4 ${selectedPlan === "free" 
            ? "border-brand-purple bg-brand-purple/5" 
            : "border-gray-200"}`}
          onClick={() => handlePlanSelection("free")}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">Free</h3>
              <p className="text-gray-600 text-sm">Basic features</p>
            </div>
            <div className="font-bold text-xl">$0</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-sm">Limited likes per day (10)</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-sm">Basic matching</span>
            </div>
            <div className="flex items-start text-gray-400">
              <div className="h-5 w-5 mr-2" />
              <span className="text-sm">No discounts at partner venues</span>
            </div>
            <div className="flex items-start text-gray-400">
              <div className="h-5 w-5 mr-2" />
              <span className="text-sm">Can't see who liked you</span>
            </div>
          </div>
        </div>

        {/* Premium Plan */}
        <div 
          className={`border-2 rounded-xl p-4 ${selectedPlan === "premium" 
            ? "border-brand-purple bg-brand-purple/5" 
            : "border-gray-200"}`}
          onClick={() => handlePlanSelection("premium")}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">Premium</h3>
              <p className="text-gray-600 text-sm">Most popular</p>
            </div>
            <div>
              <div className="font-bold text-xl">$10</div>
              <p className="text-xs text-gray-500 text-right">weekly</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-sm">Unlimited likes</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-sm">See who liked you</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-sm">10% discount at partner coffee shops</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-sm">Priority matching</span>
            </div>
          </div>
        </div>

        {/* Premium Plus Plan */}
        <div 
          className={`border-2 rounded-xl p-4 ${selectedPlan === "premiumPlus" 
            ? "border-brand-purple bg-brand-purple/5" 
            : "border-gray-200"}`}
          onClick={() => handlePlanSelection("premiumPlus")}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">Premium+</h3>
              <p className="text-gray-600 text-sm">All features</p>
            </div>
            <div>
              <div className="font-bold text-xl">$20</div>
              <p className="text-xs text-gray-500 text-right">weekly</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-sm">All Premium features</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-sm">20% discount at partner coffee shops</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-sm">10% discount at partner restaurants</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-sm">VIP profile status</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleContinue}
          className="w-full mt-4 bg-brand-purple hover:bg-brand-purple/90 h-12 text-lg"
        >
          {selectedPlan === "free" ? "Continue with Free" : "Continue to Payment"}
        </Button>

        <p className="text-xs text-center text-gray-500 mt-4">
          You can cancel your subscription at any time from your profile settings
        </p>
      </div>
    </div>
  );
};

export default PremiumScreen;
