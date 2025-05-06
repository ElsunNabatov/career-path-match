
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, RefreshCcw, Linkedin, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const VerificationScreen = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, refreshUser } = useAuth();
  
  // States for each verification step
  const [step, setStep] = useState<'initial' | 'linkedin' | 'selfie' | 'complete'>('initial');
  const [otp, setOtp] = useState("");
  const [selfieMode, setSelfieMode] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for selfie capture
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/signin');
      return;
    }
    
    console.log("Verification screen - profile:", profile);
    
    // Determine which step to show based on profile verification status
    if (profile) {
      if (profile.linkedin_verified && profile.selfie_verified) {
        // If both are verified, redirect to people
        console.log("Both verifications done, redirecting to people");
        navigate('/people');
      } else if (profile.linkedin_verified) {
        // If only LinkedIn is verified, go to selfie step
        console.log("LinkedIn verified, showing selfie step");
        setStep('selfie');
      } else {
        // If LinkedIn is not verified, go to LinkedIn step
        console.log("LinkedIn not verified, showing LinkedIn step");
        setStep('linkedin');
      }
    } else {
      // Default to LinkedIn step if no profile data yet
      console.log("No profile data, defaulting to LinkedIn step");
      setStep('linkedin');
    }
    
    // If user came from OAuth sign-in, they might not have profile data yet
    if (user && !profile) {
      console.log("User exists but no profile, refreshing user data");
      refreshUser();
    }
  }, [user, profile, navigate, refreshUser]);

  // Handle verification code entry (if needed in the future)
  const handleVerifyCode = () => {
    if (otp.length === 6) {
      // In a real application, verify the OTP with backend
      toast.success("Code verified successfully");
      setStep('linkedin');
    } else {
      toast.error("Please enter a valid verification code");
    }
  };
  
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
        linkedin_verified: true // Mark as verified for this demo
      });
      
      // Refresh profile data
      await refreshUser();
      
      toast.success("LinkedIn verified successfully");
      setStep('selfie');
    } catch (error: any) {
      toast.error(error.message || "Failed to save LinkedIn URL");
    } finally {
      setIsLoading(false);
    }
  };

  // Start camera for selfie
  const startCamera = async () => {
    try {
      if (videoRef.current) {
        setSelfieMode(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera. Please ensure camera permissions are granted.');
      setSelfieMode(false);
    }
  };

  // Handle selfie capture
  const handleSelfieCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Draw the video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // In a real app, you would upload this image to storage
        setSelfieTaken(true);
        
        // Stop the camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    }
  };

  // Handle retaking selfie
  const handleRetakeSelfie = () => {
    setSelfieTaken(false);
    startCamera();
  };

  // Complete verification process
  const handleCompleteVerification = async () => {
    try {
      setIsLoading(true);
      
      // Update profile with verification status
      await updateProfile({
        selfie_verified: true
      });
      
      await refreshUser();
      
      toast.success("Verification completed successfully!");
      navigate('/people');
    } catch (error: any) {
      toast.error(error.message || "Failed to complete verification");
    } finally {
      setIsLoading(false);
    }
  };

  // Render different steps based on current step
  const renderStepContent = () => {
    switch (step) {
      case 'initial':
        return (
          <>
            <div className="mb-2">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-muted-foreground mt-2">
                We've sent a verification code to your email
              </p>
            </div>
            
            <Button 
              className="w-full" 
              disabled={otp.length !== 6} 
              onClick={handleVerifyCode}
            >
              Verify Code
            </Button>
          </>
        );
        
      case 'linkedin':
        return (
          <div className="space-y-4">
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
              className="w-full" 
              onClick={handleLinkedInVerify}
              disabled={isLoading || !linkedinUrl}
            >
              {isLoading ? "Verifying..." : "Continue to Selfie Verification"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
        
      case 'selfie':
        return (
          <div className="flex flex-col items-center gap-4 w-full">
            {!selfieMode ? (
              <>
                <div className="w-64 h-64 rounded-full bg-muted flex justify-center items-center border-2 border-dashed border-primary/50">
                  <User size={64} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-center text-gray-600">
                  We need to verify that you match your LinkedIn profile picture.
                  Please take a quick selfie for verification.
                </p>
                <Button 
                  className="w-full" 
                  onClick={startCamera}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              </>
            ) : !selfieTaken ? (
              <>
                <div className="w-64 h-64 rounded-lg overflow-hidden bg-black relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  onClick={handleSelfieCapture}
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Selfie
                </Button>
                <canvas ref={canvasRef} width="640" height="640" className="hidden" />
              </>
            ) : (
              <>
                <div className="w-64 h-64 rounded-lg overflow-hidden bg-black relative">
                  <canvas ref={canvasRef} width="640" height="640" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-green-100 rounded-full p-1">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex w-full gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRetakeSelfie}
                    className="flex-1"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Retake
                  </Button>
                  <Button 
                    onClick={handleCompleteVerification}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Confirm & Complete"}
                  </Button>
                </div>
              </>
            )}
          </div>
        );
        
      case 'complete':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-green-700">Verification Complete</h3>
            <p className="text-gray-600">
              Thank you for completing the verification process. You can now access all features.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate('/people')}
            >
              Continue to App
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Verification</CardTitle>
          <CardDescription>
            {step === 'initial' && "Please verify your email to continue"}
            {step === 'linkedin' && "LinkedIn Profile Verification"}
            {step === 'selfie' && "Selfie Verification"}
            {step === 'complete' && "Verification Complete"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-6">
          {renderStepContent()}
        </CardContent>
        
        {step === 'initial' && (
          <CardFooter className="flex justify-center">
            <Button variant="link" className="text-muted-foreground">
              Didn't receive a code? Resend
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default VerificationScreen;
