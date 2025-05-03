
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile } from "@/lib/supabase";

interface PhotoUploadProps {
  onPhotoUploaded: (url: string) => void;
  onCancel: () => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoUploaded, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large (max 5MB)');
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Generate a unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `profile_photos/${fileName}`;
      
      // Upload to storage
      const photoUrl = await uploadFile('profile_photos', filePath, selectedFile);
      
      // Update UI
      setUploadSuccess(true);
      toast.success('Photo uploaded successfully');
      
      // Notify parent component
      onPhotoUploaded(photoUrl);
      
      // Reset form after a short delay to show success state
      setTimeout(() => {
        setSelectedFile(null);
        setPreview(null);
        setUploadSuccess(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Click to select or drop an image
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-lg object-cover max-h-64"
          />
          <button
            onClick={() => {
              setSelectedFile(null);
              setPreview(null);
            }}
            className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading || uploadSuccess}
          className="relative"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : uploadSuccess ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Success
            </>
          ) : (
            'Upload Photo'
          )}
        </Button>
      </div>
    </div>
  );
};

export default PhotoUpload;
