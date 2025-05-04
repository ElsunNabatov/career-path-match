
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';
import { Loader2 } from "lucide-react";
import { format } from 'date-fns'
import { calculateLifePathNumber, getZodiacSign } from '@/utils/matchCalculator';
import { Switch } from "@/components/ui/switch"
import { Profile } from '@/types/supabase';
import { DatePicker } from "@/components/ui/date-picker";
import { useSignUpForm } from './useSignUpForm';

export interface SignUpFormValues {
  fullName: string;
  email: string;
  password: string;
  linkedinUrl: string;
  birthday: Date | null;
  zodiacSign: string;
  lifePathNumber: number;
  anonymousMode: boolean;
  orientation: 'straight' | 'gay' | 'lesbian';
}

interface SignUpFormProps {
  selfieVerified: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ selfieVerified }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormValues>({
    fullName: '',
    email: '',
    password: '',
    linkedinUrl: '',
    birthday: null,
    zodiacSign: '',
    lifePathNumber: 0,
    anonymousMode: false,
    orientation: 'straight',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBirthdayChange = (date: Date | undefined) => {
    if (date) {
      // Create a new Date object from the date parameter
      const newDate = new Date(date);
      
      // Calculate zodiac and life path number using the date object directly
      const zodiac = getZodiacSign(newDate);
      const lifePath = calculateLifePathNumber(newDate);
      
      setFormData(prev => ({
        ...prev,
        birthday: newDate,
        zodiacSign: zodiac,
        lifePathNumber: lifePath
      }));
    }
  };

  const handleAnonymousModeChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      anonymousMode: checked
    }));
  };

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Basic email validation
      if (!values.email.includes('@') || values.email.length < 5) {
        setError('Please enter a valid email address');
        return;
      }
      
      // Password validation
      if (values.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      // Create account
      const { data, error } = await signUp(
        values.email, 
        values.password, 
        {
          full_name: values.fullName,
          linkedin_url: values.linkedinUrl,
          birthday: values.birthday ? values.birthday.toISOString() : undefined,
          zodiac_sign: values.zodiacSign,
          life_path_number: values.lifePathNumber,
          selfie_verified: selfieVerified,
          is_anonymous_mode: values.anonymousMode,
          orientation: values.orientation
        } as Partial<Profile>
      );
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Registration successful - redirect to onboarding
      toast.success('Registration successful! Redirecting to onboarding...');
      navigate('/onboarding');
    } catch (error: any) {
      console.error('Registration failed:', error.message);
      setError(error.message || 'Registration failed. Please try again.');
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignUp(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          required
        />
      </div>
      <div>
        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
        <Input
          type="url"
          id="linkedinUrl"
          name="linkedinUrl"
          value={formData.linkedinUrl}
          onChange={handleInputChange}
          placeholder="Enter your LinkedIn URL"
        />
      </div>
      <div>
        <Label>Birthday</Label>
        <DatePicker
          onSelect={handleBirthdayChange}
          value={formData.birthday}
        />
        {formData.birthday && (
          <p className="text-sm text-gray-500 mt-1">
            Selected Date: {format(formData.birthday, 'PPP')}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="anonymousMode">Anonymous Mode</Label>
        <Switch
          id="anonymousMode"
          checked={formData.anonymousMode}
          onCheckedChange={handleAnonymousModeChange}
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Button disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </>
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  );
};

export default SignUpForm;
