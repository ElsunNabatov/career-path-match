
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";

import SelfieDialog from "./SignUpForm/SelfieDialog";
import { useSignUpForm } from "./SignUpForm/useSignUpForm";

const SignUpScreen = () => {
  const navigate = useNavigate();
  const { 
    form, 
    isLoading,
    currentStep,
    isCameraOpen,
    videoRef,
    canvasRef,
    setIsCameraOpen,
    takeSelfie, 
    cancelCamera,
    renderStepContent,
    onSubmit
  } = useSignUpForm();

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-brand-blue/5 to-brand-purple/10 p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in backdrop-blur-sm bg-white/90 border-brand-purple/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join our professional dating community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {renderStepContent()}
              
              <Button 
                type={currentStep === 3 ? "submit" : "button"}
                onClick={currentStep < 3 ? () => form.handleSubmit(onSubmit)() : undefined}
                className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentStep === 3 ? "Creating Account..." : "Next Step..."}
                  </>
                ) : (
                  <>
                    {currentStep === 3 ? "Create Account" : "Next Step"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Already have an account?</span>
            <Button 
              variant="link" 
              onClick={() => navigate("/signin")} 
              className="p-0 h-auto text-sm text-brand-purple hover:text-brand-blue transition-colors"
              disabled={isLoading}
            >
              Sign In
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <SelfieDialog 
        isOpen={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onCapture={takeSelfie}
        onCancel={cancelCamera}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />
    </div>
  );
};

export default SignUpScreen;
