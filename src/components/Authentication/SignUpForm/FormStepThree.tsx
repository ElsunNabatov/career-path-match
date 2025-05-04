
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2 } from "lucide-react";
import { SignUpFormValues } from "./index";

interface FormStepThreeProps {
  form: UseFormReturn<SignUpFormValues>;
  isLoading: boolean;
  selfieCapture: string | null;
  startCamera: () => Promise<void>;
}

const FormStepThree: React.FC<FormStepThreeProps> = ({ 
  form, 
  isLoading, 
  selfieCapture, 
  startCamera 
}) => {
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
};

export default FormStepThree;
