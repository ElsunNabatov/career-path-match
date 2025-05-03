import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  LogOut, 
  Star, 
  Settings, 
  CreditCard, 
  Heart, 
  Shield, 
  Gift, 
  Upload,
  Camera,
  UserCog,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase, uploadFile } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HobbiesSelector from "./HobbiesSelector";

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, logout, refreshUser } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [isHobbiesDialogOpen, setIsHobbiesDialogOpen] = useState(false);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(profile?.hobbies as string[] || []);
  const [editForm, setEditForm] = useState({
    full_name: "",
    job_title: "",
    company: "",
    bio: "",
  });
  const [isAnonymousMode, setIsAnonymousMode] = useState(Boolean(profile?.is_anonymous_mode));
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || "",
        job_title: profile.job_title || "",
        company: profile.company || "",
        bio: profile.bio || "",
      });
      
      // If user has a photo in their profile, use it
      if (profile.photos && profile.photos.length > 0) {
        setImageUrl(profile.photos[0]);
      }

      setSelectedHobbies(profile.hobbies || []);
      setIsAnonymousMode(Boolean(profile.is_anonymous_mode));
    }
  }, [profile]);

  const handleLogout = async () => {
    await logout();
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (profile) {
        await updateProfile({
          ...profile, // Preserve existing profile fields
          full_name: editForm.full_name,
          job_title: editForm.job_title,
          company: editForm.company,
          bio: editForm.bio
        });
      }
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      await refreshUser();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }

      // Upload the file
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      
      const publicUrl = await uploadFile('profile_images', fileName, file);
      setImageUrl(publicUrl);

      // Update user profile with the new photo
      if (profile) {
        const photos = profile?.photos || [];
        await updateProfile({
          ...profile, // Preserve existing profile fields
          photos: [publicUrl, ...photos.slice(0, 4)] // Keep up to 5 photos
        });
      }
      
      await refreshUser();
      toast.success("Profile picture updated!");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const useLinkedinPhoto = async () => {
    try {
      // This is a placeholder - in a real app, you would fetch this from LinkedIn API
      toast.info("This would connect to LinkedIn API to fetch your profile photo");
      // For now, let's simulate this with a mock implementation
      if (profile?.linkedin_verified) {
        // Would normally get this URL from LinkedIn API
        await updateProfile({
          ...profile, // Preserve existing profile fields
          photos: ["https://via.placeholder.com/150?text=LinkedIn+Photo"]
        });
        await refreshUser();
      } else {
        toast.error("Please verify your LinkedIn profile first");
        navigate('/linkedin-verification');
      }
    } catch (error: any) {
      toast.error(`Failed to use LinkedIn photo: ${error.message}`);
    }
  };

  const handleToggleAnonymousMode = async () => {
    try {
      const newValue = !isAnonymousMode;
      setIsAnonymousMode(newValue);
      
      if (profile) {
        await updateProfile({
          ...profile, // Preserve existing profile fields
          is_anonymous_mode: newValue
        });
      }
      
      toast.success(
        newValue 
          ? "Anonymous mode enabled. Your personal details are now hidden." 
          : "Anonymous mode disabled. Your profile is now fully visible."
      );
      
      await refreshUser();
    } catch (error: any) {
      console.error("Error updating anonymous mode:", error);
      toast.error(`Failed to update settings: ${error.message}`);
      setIsAnonymousMode(!isAnonymousMode); // Revert the UI change
    }
  };
  
  const handleSaveHobbies = async () => {
    try {
      if (profile) {
        await updateProfile({
          ...profile, // Preserve existing profile fields
          hobbies: selectedHobbies
        });
      }
      
      toast.success("Hobbies updated successfully!");
      await refreshUser();
      setIsHobbiesDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating hobbies:", error);
      toast.error(`Failed to update hobbies: ${error.message}`);
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-center text-brand-blue">Profile</h1>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Avatar className="h-20 w-20 border-2 border-brand-purple">
              <AvatarImage src={imageUrl || profile?.photos?.[0]} alt={profile?.full_name || "User"} />
              <AvatarFallback className="bg-brand-purple/10 text-brand-purple text-lg">
                {profile?.full_name ? profile.full_name.charAt(0) : "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="ml-4">
              {!isEditing ? (
                <>
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold">{profile?.full_name || "New User"}</h2>
                    {profile?.linkedin_verified && (
                      <div className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">{profile?.job_title || "Add your title"}</p>
                  <p className="text-gray-600">{profile?.company || "Add your company"}</p>
                  {profile?.bio && <p className="text-gray-600 mt-1 text-sm">{profile.bio}</p>}
                </>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-2">
                  <Input 
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="text-lg font-bold"
                  />
                  <Input 
                    name="job_title"
                    value={editForm.job_title}
                    onChange={handleInputChange}
                    placeholder="Job Title"
                    className="text-sm"
                  />
                  <Input 
                    name="company"
                    value={editForm.company}
                    onChange={handleInputChange}
                    placeholder="Company"
                    className="text-sm"
                  />
                  <Input 
                    name="bio"
                    value={editForm.bio}
                    onChange={handleInputChange}
                    placeholder="Short bio"
                    className="text-sm"
                  />
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
              
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="mt-1 text-xs text-brand-purple hover:underline"
                >
                  Edit Profile
                </button>
              )}
              
              <div className="mt-2 flex items-center">
                <div className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center text-sm">
                  <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                  <span>{profile?.review_score || "N/A"}</span>
                </div>
                <span className="ml-2 text-xs text-gray-500">Review Score</span>
              </div>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-9 w-9 border-dashed border-gray-300"
              >
                <Camera className="h-4 w-4 text-gray-500" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Profile Picture</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Upload a photo</Label>
                  <div className="mt-2">
                    <label 
                      htmlFor="photo-upload" 
                      className="flex cursor-pointer items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-brand-purple transition-colors"
                    >
                      {isUploading ? (
                        <div className="animate-pulse">Uploading...</div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-1 text-sm text-gray-500">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <input 
                        id="photo-upload" 
                        name="photo" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="sr-only" 
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={useLinkedinPhoto}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="2" fill="#0A66C2" />
                    <path d="M8 10V16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 6.5V7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 16.5V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 16.5V12.5C16 11.5 15.5 10 14 10C12.5 10 12 11.5 12 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Use LinkedIn Profile Photo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile visibility toggle */}
        <div className="bg-gray-50 rounded-lg p-3 mt-2 flex items-center justify-between">
          <div className="flex items-center">
            {isAnonymousMode ? (
              <EyeOff className="h-5 w-5 text-gray-500 mr-2" />
            ) : (
              <Eye className="h-5 w-5 text-brand-purple mr-2" />
            )}
            <div>
              <h3 className="font-semibold">
                {isAnonymousMode ? "Anonymous Mode" : "Public Mode"}
              </h3>
              <p className="text-xs text-gray-600">
                {isAnonymousMode ? 
                  "Your personal details are hidden" : 
                  "Your full profile is visible to others"}
              </p>
            </div>
          </div>
          <Switch 
            checked={!isAnonymousMode}
            onCheckedChange={handleToggleAnonymousMode}
          />
        </div>

        <div className="bg-brand-purple/5 rounded-lg p-3 mt-2 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Current Plan: {subscription || "Free"}</h3>
            <p className="text-sm text-gray-600">
              {subscription === "premium" || subscription === "premium_plus" 
                ? "Your premium features are active" 
                : "Upgrade for more features"}
            </p>
          </div>
          {(!subscription || subscription === "free") && (
            <Button 
              onClick={() => navigateTo('/premium')}
              className="bg-brand-purple hover:bg-brand-purple/90"
              size="sm"
            >
              Upgrade
            </Button>
          )}
        </div>

        {/* Hobbies section */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Hobbies & Interests</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-brand-purple"
              onClick={() => setIsHobbiesDialogOpen(true)}
            >
              Edit
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedHobbies && selectedHobbies.length > 0 ? (
              selectedHobbies.map((hobby) => (
                <div 
                  key={hobby}
                  className="bg-gray-50 px-3 py-1 rounded-full text-sm"
                >
                  {hobby}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No hobbies added yet</p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="font-semibold text-gray-700 px-1">My Profile</h3>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/hobbies')}
          >
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-3 text-red-500" />
              <span className="text-left">Interests & Hobbies</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/profile/preferences')}
          >
            <div className="flex items-center">
              <UserCog className="h-5 w-5 mr-3 text-indigo-500" />
              <span className="text-left">Match Preferences</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/advisor')}
          >
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-3 text-amber-500" />
              <span className="text-left">Dating Advisor</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Separator className="my-2" />
          
          <h3 className="font-semibold text-gray-700 px-1">Account</h3>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/linkedin-verification')}
          >
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-brand-blue" />
              <span className="text-left">LinkedIn Verification</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/premium')}
          >
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-3 text-amber-500" />
              <span className="text-left">Premium Plans</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/payment')}
          >
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-3 text-green-600" />
              <span className="text-left">Payment Methods</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/people/liked-by')}
          >
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-3 text-red-500" />
              <span className="text-left">Liked By</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between items-center flex h-auto py-3 px-4"
            onClick={() => navigateTo('/loyalty')}
          >
            <div className="flex items-center">
              <Gift className="h-5 w-5 mr-3 text-purple-500" />
              <span className="text-left">Loyalty Program</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          <Separator className="my-2" />

          <Button 
            variant="ghost" 
            className="w-full justify-start items-center flex h-auto py-3 px-4 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Log out</span>
          </Button>
        </div>
      </div>
      
      {/* Hobbies Dialog */}
      <Dialog open={isHobbiesDialogOpen} onOpenChange={setIsHobbiesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hobbies & Interests</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <HobbiesSelector 
              selectedHobbies={selectedHobbies} 
              onHobbiesChange={setSelectedHobbies}
              maxSelections={10}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsHobbiesDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveHobbies}>
              Save Hobbies
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileScreen;
