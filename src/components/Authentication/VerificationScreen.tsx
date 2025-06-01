
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const VerificationScreen = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();
  
  useEffect(() => {
    if (isLoading) {
      console.log("VerificationScreen - Auth still loading, waiting...");
      return;
    }
    
    console.log("Verification screen - Testing mode: auto-redirecting");
    console.log("Verification screen - profile:", profile);
    console.log("Verification screen - user:", user);
    
    // Check if user is authenticated
    if (!user) {
      console.log("No user found, redirecting to signin");
      navigate('/signin');
      return;
    }
    
    // For testing: always redirect based on profile completion
    if (!profile?.orientation) {
      console.log("No orientation set, redirecting to onboarding");
      navigate('/onboarding');
    } else {
      console.log("Profile complete, redirecting to people page");
      navigate('/people');
    }
  }, [user, profile, navigate, isLoading]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-brand-blue/5 to-brand-purple/10">
      <Loader2 className="h-12 w-12 animate-spin text-brand-purple mb-4" />
      <p className="text-lg text-gray-700">Redirecting to main application...</p>
      <p className="text-sm text-gray-500 mt-2">Testing mode - skipping verification</p>
    </div>
  );
};

export default VerificationScreen;
