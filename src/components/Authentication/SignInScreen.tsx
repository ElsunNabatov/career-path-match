
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, Linkedin, Mail, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const SignInScreen = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithLinkedIn, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      // Auth context will handle navigation on successful login
    } catch (error) {
      // Auth context will handle error display
      setIsLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithLinkedIn();
      // OAuth redirect will happen automatically
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // OAuth redirect will happen automatically
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setIsLoading(true);
      await resetPassword(resetEmail);
      toast.success("Password reset instructions sent to your email");
      setShowForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset instructions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-brand-blue/5 to-brand-purple/10 p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in backdrop-blur-sm bg-white/90 border-brand-purple/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to continue your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showForgotPassword ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="border-gray-300 flex items-center justify-center gap-2 hover:bg-brand-purple/5 hover:border-brand-purple/30 transition-all"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Google</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  type="button" 
                  className="border-gray-300 flex items-center justify-center gap-2 hover:bg-brand-blue/5 hover:border-brand-blue/30 transition-all"
                  onClick={handleLinkedInSignIn}
                  disabled={isLoading}
                >
                  <Linkedin className="h-5 w-5 text-[#0077B5]" />
                  <span>LinkedIn</span>
                </Button>
              </div>
              
              <div className="relative my-6">
                <Separator />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                  OR
                </span>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="border-gray-300 focus-visible:ring-brand-purple"
                />
                <p className="text-xs text-gray-500">
                  We'll send you instructions to reset your password.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Instructions"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {!showForgotPassword && (
            <Button 
              variant="link" 
              onClick={() => setShowForgotPassword(true)}
              className="text-brand-purple hover:text-brand-blue transition-colors"
              disabled={isLoading}
            >
              Forgot your password?
            </Button>
          )}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Don't have an account?</span>
            <Button 
              variant="link" 
              onClick={() => navigate("/signup")} 
              className="p-0 h-auto text-sm text-brand-purple hover:text-brand-blue transition-colors"
              disabled={isLoading}
            >
              Sign Up
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInScreen;
