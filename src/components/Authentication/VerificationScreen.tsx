
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const VerificationScreen = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [selfieMode, setSelfieMode] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);
  
  const handleVerify = () => {
    if (otp.length === 6 && selfieTaken) {
      navigate("/onboarding/personal-info");
    }
  };

  const handleSelfieCapture = () => {
    // This would integrate with the camera API in a real application
    setSelfieTaken(true);
  };

  const handleRetakeSelfie = () => {
    setSelfieTaken(false);
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Verification</CardTitle>
          <CardDescription>
            {selfieMode 
              ? "Take a selfie to verify your identity" 
              : "We've sent a verification code to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {!selfieMode ? (
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
              </div>
              
              <Button 
                className="w-full" 
                disabled={otp.length !== 6} 
                onClick={() => setSelfieMode(true)}
              >
                Verify Code
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              {!selfieTaken ? (
                <div className="w-64 h-64 rounded-full bg-muted flex justify-center items-center border-2 border-dashed border-primary/50 overflow-hidden">
                  <Camera size={64} className="text-muted-foreground" />
                </div>
              ) : (
                <div className="w-64 h-64 rounded-full bg-primary/10 flex justify-center items-center border-2 border-primary overflow-hidden relative">
                  {/* This would be the actual selfie in a real app */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Check size={64} className="text-green-500" />
                  </div>
                </div>
              )}
              
              {!selfieTaken ? (
                <Button 
                  className="w-full" 
                  onClick={handleSelfieCapture}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Selfie
                </Button>
              ) : (
                <div className="flex w-full gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={handleRetakeSelfie}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Retake
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleVerify}
                  >
                    Confirm & Continue
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        {!selfieMode && (
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
