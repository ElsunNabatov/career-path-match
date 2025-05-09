import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Linkedin, Mail, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Logo from "../ui/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [signUpMethod, setSignUpMethod] = useState<"linkedin" | "email" | null>(
    null
  );
  const [orientation, setOrientation] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const navigate = useNavigate();
  const { user, profile, updateProfile, isLoading, refreshUser } = useAuth();
  
  // Protect this page - only authenticated users should see it
  useEffect(() => {
    console.log("OnboardingScreen - Loading state:", isLoading);
    console.log("OnboardingScreen - User:", user);
    console.log("OnboardingScreen - Profile:", profile);
    
    if (!isLoading && !user) {
      console.log("No authenticated user, redirecting to signin");
      navigate('/signin');
      return;
    }
    
    // If user has completed onboarding before, redirect to people page
    if (profile && profile.orientation) {
      console.log("User has already completed onboarding, redirecting to people page");
      navigate('/people');
      return;
    }
    
    // Check if LinkedIn is verified
    if (user && profile && !profile.linkedin_verified) {
      console.log("LinkedIn not verified, redirecting to verification");
      navigate('/verification');
      return;
    }
    
    // Pre-select signup method based on auth provider
    if (user?.app_metadata?.provider === 'google') {
      setSignUpMethod('linkedin');
    } else if (user?.app_metadata?.provider === 'linkedin_oidc') {
      setSignUpMethod('linkedin');
    } else {
      setSignUpMethod('email');
    }
  }, [user, profile, navigate, isLoading]);

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete onboarding and update profile
      try {
        toast.info("Saving your profile information...");
        
        const linkedInUrl = (document.getElementById('linkedin-url') as HTMLInputElement)?.value || 
          profile?.linkedin_url || '';
        
        await updateProfile({
          orientation: orientation,
          birthday: selectedDate ? new Date(selectedDate).toISOString() : undefined,
          linkedin_url: linkedInUrl
        });
        
        // Refresh the user data after updating
        await refreshUser();
        
        toast.success("Onboarding completed successfully!");
        
        // Navigate to home/people page
        navigate("/people");
      } catch (error: any) {
        console.error("Onboarding error:", error);
        toast.error("Failed to complete onboarding: " + error.message);
      }
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return signUpMethod !== null;
      case 2:
        return orientation !== "";
      case 3:
        return selectedDate !== "";
      default:
        return true;
    }
  };
  
  // Show a more informative loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-white to-brand-lightGray">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple mx-auto"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">Loading onboarding...</p>
          <p className="mt-2 text-sm text-gray-500">We're getting everything ready for you</p>
        </div>
      </div>
    );
  }
  
  // Safety check - ensure we have a user
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-white to-brand-lightGray">
        <div className="text-center">
          <p className="mt-4 text-xl font-medium text-red-600">Authentication Required</p>
          <p className="mt-2 text-sm text-gray-500">Please sign in to continue</p>
          <Button 
            onClick={() => navigate('/signin')}
            className="mt-4 bg-brand-purple hover:bg-brand-purple/90"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-brand-lightGray">
      <div className="py-6 px-4 flex justify-center">
        <Logo size="lg" />
      </div>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="flex justify-between mb-8">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full flex-1 mx-1 ${
                i + 1 <= step ? "bg-brand-purple" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>

        <div className="animate-fade-in">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-blue">Get Started</h2>
              <p className="text-gray-600">
                Choose how you'd like to sign up for CareerMatchPath
              </p>

              <div className="space-y-4 mt-8">
                <button
                  className={`w-full p-4 rounded-lg flex items-center border-2 ${
                    signUpMethod === "linkedin"
                      ? "border-brand-purple bg-brand-purple/5"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSignUpMethod("linkedin")}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      signUpMethod === "linkedin"
                        ? "bg-brand-purple text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {signUpMethod === "linkedin" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Linkedin className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Sign up with LinkedIn</div>
                    <div className="text-sm text-gray-500">
                      We'll import your professional details
                    </div>
                  </div>
                </button>

                <button
                  className={`w-full p-4 rounded-lg flex items-center border-2 ${
                    signUpMethod === "email"
                      ? "border-brand-purple bg-brand-purple/5"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSignUpMethod("email")}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      signUpMethod === "email"
                        ? "bg-brand-purple text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {signUpMethod === "email" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Mail className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Sign up with Email</div>
                    <div className="text-sm text-gray-500">
                      You'll need to provide your LinkedIn URL
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-blue">
                Your Orientation
              </h2>
              <p className="text-gray-600">
                Select your orientation to help us find your matches
              </p>

              <div className="pt-4">
                <RadioGroup
                  className="flex flex-col space-y-4"
                  value={orientation}
                  onValueChange={setOrientation}
                >
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="straight" id="straight" />
                    <Label htmlFor="straight" className="flex-1">
                      Straight
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="gay" id="gay" />
                    <Label htmlFor="gay" className="flex-1">
                      Gay
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="lesbian" id="lesbian" />
                    <Label htmlFor="lesbian" className="flex-1">
                      Lesbian
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-blue">
                Your Birthdate
              </h2>
              <p className="text-gray-600">
                We'll use this to calculate your zodiac sign and life path number
              </p>

              <div className="pt-4 space-y-4">
                <div className="flex items-center space-x-3 rounded-lg border p-4">
                  <Calendar className="h-5 w-5 text-brand-purple" />
                  <input
                    type="date"
                    className="flex-1 bg-transparent outline-none text-gray-800"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-blue">
                LinkedIn Profile
              </h2>
              <p className="text-gray-600">
                {signUpMethod === "linkedin"
                  ? "Confirm your LinkedIn URL"
                  : "Please provide your LinkedIn profile URL"}
              </p>

              <div className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin-url">LinkedIn URL</Label>
                  <Input
                    id="linkedin-url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full"
                    defaultValue={profile?.linkedin_url || (signUpMethod === "linkedin" ? "https://linkedin.com/in/johndoe" : "")}
                  />
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    We'll use your LinkedIn data to match you with compatible partners
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6">
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="w-full bg-brand-purple hover:bg-brand-purple/90"
          >
            {step < 4 ? "Continue" : "Complete Setup"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
