
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignUpFormValues } from "./index";

interface FormStepTwoProps {
  form: UseFormReturn<SignUpFormValues>;
  isLoading: boolean;
}

const FormStepTwo: React.FC<FormStepTwoProps> = ({ form, isLoading }) => {
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
};

export default FormStepTwo;
