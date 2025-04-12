
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  LogOut, 
  Star, 
  Settings, 
  CreditCard, 
  Heart, 
  Shield, 
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const user = {
    name: "Jane Smith",
    jobTitle: "Senior Product Designer",
    company: "Tech Innovations Inc.",
    photo: undefined,
    linkedinVerified: true,
    reviewScore: 4.7,
    membershipType: "Free" // Free, Premium, Premium+
  };


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      return;
    }
    toast.success("Successfully logged out");

  
    navigate("/signin");
  };
  

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-center text-brand-blue">Profile</h1>
      </div>

      <div className="p-4">
        <div className="flex items-center">
          <Avatar className="h-20 w-20 border-2 border-brand-purple">
            <AvatarImage src={user.photo} alt={user.name} />
            <AvatarFallback className="bg-brand-purple/10 text-brand-purple text-lg">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">{user.name}</h2>
              {user.linkedinVerified && (
                <div className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </div>
              )}
            </div>
            <p className="text-gray-600">{user.jobTitle}</p>
            <p className="text-gray-600">{user.company}</p>
            
            <div className="mt-2 flex items-center">
              <div className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center text-sm">
                <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                <span>{user.reviewScore}</span>
              </div>
              <span className="ml-2 text-xs text-gray-500">Review Score</span>
            </div>
          </div>
        </div>

        <div className="bg-brand-purple/5 rounded-lg p-3 mt-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Current Plan: {user.membershipType}</h3>
            <p className="text-sm text-gray-600">
              {user.membershipType === "Free" 
                ? "Upgrade for more features" 
                : "Your premium features are active"}
            </p>
          </div>
          {user.membershipType === "Free" && (
            <Button 
              onClick={() => navigateTo('/premium')}
              className="bg-brand-purple hover:bg-brand-purple/90"
              size="sm"
            >
              Upgrade
            </Button>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-gray-700 px-1">Account</h3>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/linkedin-verification')}
          >
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-brand-blue" />
              <span className="text-left">LinkedIn Verification</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/premium')}
          >
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-3 text-amber-500" />
              <span className="text-left">Premium Plans</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/payment')}
          >
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-3 text-green-600" />
              <span className="text-left">Payment Methods</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/people/liked-by')}
          >
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-3 text-red-500" />
              <span className="text-left">Liked By</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/loyalty')}
          >
            <div className="flex items-center">
              <Gift className="h-5 w-5 mr-3 text-purple-500" />
              <span className="text-left">Loyalty Program</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Separator className="my-2" />

          <Button 
            variant="ghost" 
            className="w-full justify-start items-center flex h-auto py-3 px-4 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Log out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
