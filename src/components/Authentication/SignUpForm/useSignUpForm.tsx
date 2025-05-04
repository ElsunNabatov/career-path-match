
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import FormStepOne from './FormStepOne';
import FormStepTwo from './FormStepTwo';
import FormStepThree from './FormStepThree';
import { SignUpFormValues } from './index';

// Create a schema for zod validation
const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  linkedinUrl: z.string().url('Please enter a valid URL').or(z.string().length(0)),
  birthday: z.date().nullable(),
  zodiacSign: z.string(),
  lifePathNumber: z.number(),
  anonymousMode: z.boolean(),
  orientation: z.enum(['straight', 'gay', 'lesbian']),
});

export const useSignUpForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selfieCapture, setSelfieCapture] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithLinkedIn } = useAuth();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      linkedinUrl: '',
      birthday: null,
      zodiacSign: '',
      lifePathNumber: 0,
      anonymousMode: false,
      orientation: 'straight',
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp(
        data.email, 
        data.password, 
        {
          full_name: data.fullName,
          linkedin_url: data.linkedinUrl,
          birthday: data.birthday?.toISOString(),
          zodiac_sign: data.zodiacSign,
          life_path_number: data.lifePathNumber,
          selfie_verified: !!selfieCapture,
          is_anonymous_mode: data.anonymousMode,
          orientation: data.orientation
        }
      );
      
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera');
      setIsCameraOpen(false);
    }
  };

  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Draw the video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas to a data URL and set it as the capture
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelfieCapture(dataUrl);
        
        // Stop the camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
        video.srcObject = null;
      }
      
      setIsCameraOpen(false);
    }
  };

  const cancelCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOpen(false);
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Google signup failed:', error);
      toast.error('Google signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInSignUp = async () => {
    try {
      setIsLoading(true);
      await signInWithLinkedIn();
    } catch (error) {
      console.error('LinkedIn signup failed:', error);
      toast.error('LinkedIn signup failed. Please try again.');
    } finally {
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
        return (
          <FormStepTwo 
            form={form} 
            isLoading={isLoading} 
          />
        );
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

  return {
    form,
    isLoading,
    currentStep,
    isCameraOpen,
    videoRef,
    canvasRef,
    selfieCapture,
    setIsCameraOpen,
    takeSelfie,
    cancelCamera,
    renderStepContent,
    onSubmit
  };
};
