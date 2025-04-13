
import React from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import FormStepOne from "./FormStepOne";
import FormStepTwo from "./FormStepTwo";
import FormStepThree from "./FormStepThree";
import { calculateZodiacSign, calculateLifePathNumber } from "./utils";

// Form schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  linkedinUrl: z.string().url({ message: "Please enter a valid LinkedIn URL" }).includes("linkedin.com", { message: "Please enter a valid LinkedIn URL" }),
  birthday: z.string().refine(val => {
    const date = new Date(val);
    const now = new Date();
    return date < now && date > new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
  }, { message: "Please enter a valid birth date" }),
  orientation: z.enum(['straight', 'gay', 'lesbian'], {
    required_error: "Please select your orientation",
  }),
});

export type SignUpFormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithLinkedIn } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selfieCapture, setSelfieCapture] = React.useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      linkedinUrl: "",
      birthday: "",
      orientation: "straight",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    setIsLoading(true);
    try {
      const birthDate = new Date(values.birthday);
      const zodiacSign = calculateZodiacSign(birthDate);
      const lifePathNumber = calculateLifePathNumber(birthDate);
      
      await signUp(values.email, values.password, {
        full_name: "", // Will be filled from LinkedIn data
        linkedin_url: values.linkedinUrl,
        birthday: values.birthday,
        orientation: values.orientation,
        zodiac_sign: zodiacSign,
        life_path_number: lifePathNumber,
        selfie_verified: !!selfieCapture,
        is_anonymous_mode: true // Default to anonymous mode
      });
      
      navigate("/verification");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormStepOne 
            form={form} 
            isLoading={isLoading} 
            onGoogleSignUp={handleGoogleSignUp}
            onLinkedInSignUp={handleLinkedInSignUp}
          />
        );
      case 2:
        return <FormStepTwo form={form} isLoading={isLoading} />;
      case 3:
        return (
          <FormStepThree 
            form={form} 
            isLoading={isLoading}
            selfieCapture={selfieCapture}
            startCamera={startCamera}
          />
        );
      default:
        return null;
    }
  };

  const handleLinkedInSignUp = async () => {
    try {
      console.log("Starting LinkedIn sign-up flow");
      setIsLoading(true);
      await signInWithLinkedIn();
      // OAuth redirect will happen automatically
    } catch (error) {
      console.error("LinkedIn sign-up error:", error);
      setIsLoading(false);
      toast.error("LinkedIn sign-up failed. Please try another method.");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      console.log("Starting Google sign-up flow");
      setIsLoading(true);
      await signInWithGoogle();
      // OAuth redirect will happen automatically
    } catch (error) {
      console.error("Google sign-up error:", error);
      setIsLoading(false);
      toast.error("Google sign-up failed. Please try another method.");
    }
  };
  
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Could not access camera. Please check permissions.");
      console.error("Error accessing camera:", err);
    }
  };
  
  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(
          videoRef.current, 
          0, 
          0, 
          canvasRef.current.width, 
          canvasRef.current.height
        );
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setSelfieCapture(dataUrl);
        
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
        
        toast.success("Selfie captured successfully!");
      }
    }
  };

  const cancelCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setIsCameraOpen(false);
  };

  return {
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
  };
};

export default SignUpForm;
