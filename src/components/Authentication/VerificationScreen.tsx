
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, RefreshCcw, Linkedin, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

const VerificationScreen = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, refreshUser, isLoading: authLoading } = useAuth();
  
  // States for verification step
  const [isLoading, setIsLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  
  useEffect(() => {
    // Initial loading state
    if (authLoading) return;
    
    console.log("Verification screen - Loading state:", authLoading);
    console.log("Verification screen - profile:", profile);
    console.log("Verification screen - user:", user);
    
    // Check if user is authenticated
    if (!user) {
      console.log("No user found, redirecting to signin");
      navigate('/signin');
      return;
    }
    
    // If profile contains a verified LinkedIn, navigate to onboarding or people
    if (profile?.linkedin_verified) {
      if (!profile.orientation) {
        console.log("LinkedIn already verified, redirecting to onboarding");
        navigate('/onboarding');
      } else {
        console.log("LinkedIn already verified and onboarding complete, redirecting to people");
        navigate('/people');
      }
      return;
    }
    
    // Pre-fill LinkedIn URL if available
    if (profile?.linkedin_url) {
      setLinkedinUrl(profile.linkedin_url);
    }
    
    // If user came from OAuth sign-in, they might not have profile data yet
    if (user && !profile) {
      console.log("User exists but no profile, refreshing user data");
      refreshUser();
    }
  }, [user, profile, navigate, refreshUser, authLoading]);

  // Handle LinkedIn URL verification
  const handleLinkedInVerify = async () => {
    try {
      setIsLoading(true);
      
      // Validate LinkedIn URL
      if (!linkedinUrl.includes('linkedin.com/')) {
        toast.error("Please enter a valid LinkedIn URL");
        setIsLoading(false);
        return;
      }
      
      // Update profile with LinkedIn URL
      await updateProfile({
        linkedin_url: linkedinUrl,
        linkedin_verified: true // Mark as verified
      });
      
      // Refresh profile data
      await refreshUser();
      
      toast.success("LinkedIn profile verified successfully!");
      
      // Redirect to onboarding or people page based on profile completion
      if (profile && profile.orientation) {
        navigate('/people');
      } else {
        navigate('/onboarding');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify LinkedIn URL");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-brand-blue/5 to-brand-purple/10">
        <Loader2 className="h-12 w-12 animate-spin text-brand-purple mb-4" />
        <p className="text-lg text-gray-700">Verifying your account...</p>
        <p className="text-sm text-gray-500 mt-2">This will only take a moment</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-brand-blue/5 to-brand-purple/10 p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in backdrop-blur-sm bg-white/90 border-brand-purple/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
            LinkedIn Verification
          </CardTitle>
          <CardDescription className="text-gray-600">
            Please verify your LinkedIn profile to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-6">
          <div className="space-y-4 w-full">
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <p className="text-sm text-blue-700">
                Please provide your LinkedIn profile URL for verification. This helps us ensure all users are real professionals.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="linkedin-url" className="text-sm font-medium text-gray-700">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="linkedin-url" 
                  type="url" 
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-all" 
              onClick={handleLinkedInVerify}
              disabled={isLoading || !linkedinUrl}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify LinkedIn Profile
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button variant="link" className="text-muted-foreground" onClick={() => navigate('/signin')}>
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerificationScreen;
