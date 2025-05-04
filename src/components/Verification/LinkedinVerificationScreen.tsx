
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LinkedinVerificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Check if profile exists and has linkedin_verified property
    if (profile?.linkedin_verified) {
      setVerified(true);
    }
  }, [profile]);

  const mockLinkedinAuthentication = async () => {
    setIsLoading(true);
    try {
      // Mock data that would come from LinkedIn
      const linkedinData = {
        full_name: "John Professional",
        job_title: "Senior Software Engineer",
        company: "Tech Innovations Inc.",
        education: "Computer Science, Stanford University",
        skills: ["JavaScript", "React", "Node.js"],
        linkedin_url: "https://linkedin.com/in/johnprofessional",
      };

      // Simulate an API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update the profile with LinkedIn data - use a partial update
      if (profile) {
        await updateProfile({
          full_name: linkedinData.full_name,
          job_title: linkedinData.job_title,
          company: linkedinData.company,
          education: linkedinData.education,
          skills: linkedinData.skills,
          linkedin_url: linkedinData.linkedin_url
        });
      }

      toast.success("LinkedIn profile connected successfully!");
      setStep(2);
    } catch (error: any) {
      console.error("Error connecting to LinkedIn:", error);
      toast.error(`Failed to connect: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the profile to mark as verified - use a partial update
      if (profile) {
        await updateProfile({
          linkedin_url: profile.linkedin_url || "https://linkedin.com/in/user",
          linkedin_verified: true
        });
      }
      
      // Refresh user data
      await refreshUser();
      
      setVerified(true);
      toast.success("Your profile has been verified!");
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast.error(`Verification failed: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-brand-blue/5 to-brand-purple/10 p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in backdrop-blur-sm bg-white/90 border-brand-purple/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
            LinkedIn Verification
          </CardTitle>
          <CardDescription className="text-gray-600">
            Connect your LinkedIn profile to boost your credibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Connect your LinkedIn profile to automatically fill in your profile details and show others you're a real professional.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-all"
                onClick={mockLinkedinAuthentication}
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Connect to LinkedIn"}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-gray-700">
                We've imported your LinkedIn details. Please verify to confirm your identity.
              </p>
              <Separator />
              <div className="text-sm text-gray-600">
                <p><strong>Full Name:</strong> {profile?.full_name}</p>
                <p><strong>Job Title:</strong> {profile?.job_title}</p>
                <p><strong>Company:</strong> {profile?.company}</p>
                <p><strong>Education:</strong> {profile?.education}</p>
                <p><strong>LinkedIn URL:</strong> {profile?.linkedin_url}</p>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-all"
                onClick={handleVerify}
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Profile"}
              </Button>
            </div>
          )}

          {verified && (
            <div className="space-y-4">
              <div className="text-green-600 font-semibold text-center">
                <svg className="h-10 w-10 mx-auto fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Your LinkedIn profile is now verified!
              </div>
              <p className="text-gray-700 text-center">
                Thanks for verifying your profile. This helps build trust in our community.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-all"
                onClick={() => navigate("/profile")}
              >
                Go to Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkedinVerificationScreen;
