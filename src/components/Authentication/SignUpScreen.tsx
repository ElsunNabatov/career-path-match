
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  ArrowRight, 
  Linkedin, 
  Loader2, 
  Mail, 
  Camera, 
  CheckCircle2, 
  User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Define the form schema with zodiac
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

const SignUpScreen = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithLinkedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selfieCapture, setSelfieCapture] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      linkedinUrl: "",
      birthday: "",
      orientation: "straight",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    setIsLoading(true);
    try {
      // Calculate zodiac sign and life path number
      const birthDate = new Date(values.birthday);
      const zodiacSign = calculateZodiacSign(birthDate);
      const lifePathNumber = calculateLifePathNumber(birthDate);
      
      // Include additional metadata for profile creation
      await signUp(values.email, values.password, {
        data: {
          full_name: "", // Will be filled from LinkedIn data
          linkedin_url: values.linkedinUrl,
          birthday: values.birthday,
          orientation: values.orientation,
          zodiac_sign: zodiacSign,
          life_path_number: lifePathNumber,
          selfie_verified: !!selfieCapture,
          is_anonymous_mode: true // Default to anonymous mode
        },
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      navigate("/verification");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
      setIsLoading(false);
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
        // Capture the current video frame
        context.drawImage(
          videoRef.current, 
          0, 
          0, 
          canvasRef.current.width, 
          canvasRef.current.height
        );
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setSelfieCapture(dataUrl);
        
        // Stop the camera
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
  
  const calculateZodiacSign = (birthday: Date): string => {
    const month = birthday.getMonth() + 1;
    const day = birthday.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
    return "Pisces";
  };
  
  const calculateLifePathNumber = (birthday: Date): number => {
    const month = birthday.getMonth() + 1;
    const day = birthday.getDate();
    const year = birthday.getFullYear();
    
    // Calculate sum of all digits
    const sumDigits = (num: number): number => {
      let sum = 0;
      while (num > 0) {
        sum += num % 10;
        num = Math.floor(num / 10);
      }
      return sum;
    };
    
    let yearSum = sumDigits(year);
    let monthSum = sumDigits(month);
    let daySum = sumDigits(day);
    
    // Reduce to single digit unless it's a master number (11, 22)
    const reduceToSingleDigit = (num: number): number => {
      while (num > 9 && num !== 11 && num !== 22) {
        num = sumDigits(num);
      }
      return num;
    };
    
    yearSum = reduceToSingleDigit(yearSum);
    monthSum = reduceToSingleDigit(monthSum);
    daySum = reduceToSingleDigit(daySum);
    
    let lifePathNumber = yearSum + monthSum + daySum;
    return reduceToSingleDigit(lifePathNumber);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button 
                variant="outline" 
                type="button" 
                className="border-gray-300 flex items-center justify-center gap-2 hover:bg-brand-purple/5 hover:border-brand-purple/30 transition-all"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <Mail className="h-5 w-5 text-red-500" />
                <span>Gmail</span>
              </Button>
              
              <Button 
                variant="outline" 
                type="button" 
                className="border-gray-300 flex items-center justify-center gap-2 hover:bg-brand-blue/5 hover:border-brand-blue/30 transition-all"
                onClick={handleLinkedInSignUp}
                disabled={isLoading}
              >
                <Linkedin className="h-5 w-5 text-[#0077B5]" />
                <span>LinkedIn</span>
              </Button>
            </div>
            
            <div className="relative my-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                OR MANUAL SIGNUP
              </span>
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com" 
                      {...field}
                      disabled={isLoading}
                      className="border-gray-300 focus-visible:ring-brand-purple" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field}
                      disabled={isLoading}
                      className="border-gray-300 focus-visible:ring-brand-purple" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 2:
        return (
          <>
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">LinkedIn Profile URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://linkedin.com/in/yourprofile" 
                      {...field}
                      disabled={isLoading}
                      className="border-gray-300 focus-visible:ring-brand-purple" 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll use your LinkedIn data to verify your profile and enhance matching.
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Birth Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      disabled={isLoading}
                      className="border-gray-300 focus-visible:ring-brand-purple" 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for zodiac sign and life path number calculation.
                  </p>
                </FormItem>
              )}
            />
          </>
        );
      case 3:
        return (
          <>
            <FormField
              control={form.control}
              name="orientation"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-gray-700">Orientation</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="straight" />
                        </FormControl>
                        <FormLabel className="font-normal">Straight</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="gay" />
                        </FormControl>
                        <FormLabel className="font-normal">Gay</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="lesbian" />
                        </FormControl>
                        <FormLabel className="font-normal">Lesbian</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="mt-6">
              <p className="text-gray-700 font-medium mb-2">Profile Verification</p>
              {selfieCapture ? (
                <div className="relative">
                  <img 
                    src={selfieCapture} 
                    alt="Selfie" 
                    className="w-full h-auto rounded-lg border" 
                  />
                  <div className="absolute -top-2 -right-2 bg-green-100 rounded-full border border-green-300">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-xs text-green-600 font-medium mt-2 text-center">
                    Selfie verification complete
                  </p>
                </div>
              ) : (
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full py-6 border-dashed flex flex-col items-center gap-2"
                  onClick={startCamera}
                  disabled={isLoading}
                >
                  <Camera className="h-8 w-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Take a Selfie</p>
                    <p className="text-xs text-muted-foreground">
                      Used to verify your profile authenticity
                    </p>
                  </div>
                </Button>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

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
      
      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Take a Selfie for Verification</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <canvas ref={canvasRef} width="640" height="640" className="hidden" />
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={cancelCamera}>
              Cancel
            </Button>
            <Button onClick={takeSelfie}>
              Capture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignUpScreen;
