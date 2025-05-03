
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UploadCloud, X } from 'lucide-react';

interface PhotoUploadProps {
  show: boolean;
  onClose: () => void;
  onAddPhoto: (url: string) => Promise<void>;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ show, onClose, onAddPhoto }) => {
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;
    
    try {
      setIsUploading(true);
      await onAddPhoto(photoUrl);
      setPhotoUrl('');
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error('Error adding photo:', error);
      toast.error('Failed to add photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPhotoUrl(url);
    if (url) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };
  
  const handleClose = () => {
    setPhotoUrl('');
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a new photo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo-url">Image URL</Label>
            <Input
              id="photo-url"
              placeholder="https://example.com/photo.jpg"
              value={photoUrl}
              onChange={handleUrlChange}
            />
          </div>
          
          {previewUrl && (
            <div className="relative mt-4 border rounded-md overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-48 object-cover"
                onError={() => {
                  toast.error("Invalid image URL");
                  setPreviewUrl(null);
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPhotoUrl('');
                  setPreviewUrl(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {!previewUrl && (
            <div className="border border-dashed rounded-lg p-10 text-center">
              <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Enter a URL to see a preview
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!photoUrl || isUploading}>
              {isUploading ? 'Adding...' : 'Add Photo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUpload;
