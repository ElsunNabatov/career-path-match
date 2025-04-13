
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { SignUpFormValues } from "./index";
import { Separator } from "@/components/ui/separator";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Linkedin } from "lucide-react";

interface FormStepOneProps {
  form: UseFormReturn<SignUpFormValues>;
  isLoading: boolean;
  onGoogleSignUp: () => Promise<void>;
  onLinkedInSignUp: () => Promise<void>;
}

const FormStepOne: React.FC<FormStepOneProps> = ({ 
  form, 
  isLoading, 
  onGoogleSignUp, 
  onLinkedInSignUp 
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button 
          variant="outline" 
          type="button" 
          className="border-gray-300 flex items-center justify-center gap-2 hover:bg-brand-purple/5 hover:border-brand-purple/30 transition-all"
          onClick={onGoogleSignUp}
          disabled={isLoading}
        >
          <Mail className="h-5 w-5 text-red-500" />
          <span>Gmail</span>
        </Button>
        
        <Button 
          variant="outline" 
          type="button" 
          className="border-gray-300 flex items-center justify-center gap-2 hover:bg-brand-blue/5 hover:border-brand-blue/30 transition-all"
          onClick={onLinkedInSignUp}
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
};

export default FormStepOne;
