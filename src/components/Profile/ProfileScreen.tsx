import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit, Check, User, EyeOff, Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import PhotoUpload from "./PhotoUpload";
import HobbiesSelector from "./HobbiesSelector";

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name || "");
  const [jobTitle, setJobTitle] = useState(profile?.job_title || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAnonymousMode, setIsAnonymousMode] = useState(profile?.is_anonymous_mode || false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [editingHobbies, setEditingHobbies] = useState(false);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(profile?.hobbies || []);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setJobTitle(profile.job_title || "");
      setCompany(profile.company || "");
      setBio(profile.bio || "");
      setIsAnonymousMode(profile.is_anonymous_mode || false);
      setSelectedHobbies(profile.hobbies || []);
    }
  }, [profile]);

  // Update profile information
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      
      // Create a partial profile update with just the fields we're changing
      const profileUpdate = {
        full_name: name,
        job_title: jobTitle,
        company: company,
        bio: bio
      };
      
      // Update profile
      if (profile) {
        await updateProfile(profileUpdate);
      }
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsUpdating(false);
      setIsEditingBio(false);
    }
  };

  const handleEditBio = () => {
    setIsEditingBio(true);
  };

  const handleCancelEditBio = () => {
    setIsEditingBio(false);
    setBio(profile?.bio || ""); // Revert to original bio
  };

  const handleOpenPhotoUpload = () => {
    setShowPhotoUpload(true);
  };

  const handleClosePhotoUpload = () => {
    setShowPhotoUpload(false);
  };

  // Handle photo update with a partial update
  const handleAddPhoto = async (url: string) => {
    if (!profile) return;
    
    try {
      // Create a new photos array with the existing photos plus the new one
      const updatedPhotos = [...(profile.photos || []), url];
      
      // Only update the photos field
      await updateProfile({ photos: updatedPhotos });
      
      toast.success("Photo added successfully!");
    } catch (error: any) {
      console.error('Error adding photo:', error);
      toast.error(`Failed to add photo: ${error.message}`);
    }
  };

  // Handle photo deletion
  const handleDeletePhoto = async (index: number) => {
    if (!profile?.photos) return;
    
    try {
      const updatedPhotos = [...profile.photos];
      updatedPhotos.splice(index, 1);
      
      // Only update the photos field
      await updateProfile({ photos: updatedPhotos });
      
      toast.success("Photo removed successfully!");
    } catch (error: any) {
      console.error('Error removing photo:', error);
      toast.error(`Failed to remove photo: ${error.message}`);
    }
  };

  // Toggle anonymous mode with a partial update
  const toggleAnonymousMode = async () => {
    if (!profile) return;
    
    try {
      setIsAnonymousMode(!isAnonymousMode);
      
      // Only update the is_anonymous_mode field
      await updateProfile({
        is_anonymous_mode: !isAnonymousMode
      });
      
      toast.success(`Anonymous mode ${!isAnonymousMode ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      console.error('Error toggling anonymous mode:', error);
      setIsAnonymousMode(isAnonymousMode); // revert UI change
      toast.error(`Failed to update anonymity: ${error.message}`);
    }
  };

  // Save hobbies with a partial update
  const saveHobbies = async (selectedHobbies: string[]) => {
    try {
      setEditingHobbies(false);
      
      // Only update the hobbies field
      await updateProfile({
        hobbies: selectedHobbies
      });
      
      toast.success("Hobbies updated successfully!");
    } catch (error: any) {
      console.error('Error updating hobbies:', error);
      toast.error(`Failed to update hobbies: ${error.message}`);
    }
  };

  const handleEditHobbies = () => {
    setEditingHobbies(true);
  };

  const handleCancelHobbies = () => {
    setEditingHobbies(false);
  };

  // Update subscription section to use profile?.subscription
  const renderUpgradeSection = () => {
    const userPlan = profile?.subscription || 'free';
    
    return (
      <div className="bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              {userPlan === 'free' ? 'Free Plan' : 
               userPlan === 'premium' ? 'Premium Plan' : 'Premium+ Plan'}
            </h3>
            <p className="text-sm text-gray-600">
              {userPlan === 'free' ? 'Upgrade for more features' : 'You have access to premium features'}
            </p>
          </div>
          {userPlan === 'free' && (
            <Button
              onClick={() => navigate('/premium')}
              className="bg-gradient-to-r from-brand-blue to-brand-purple"
            >
              Upgrade
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-12">
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          <Button variant="outline" onClick={() => navigate('/loyalty')}>
            Loyalty
          </Button>
        </CardHeader>
        <CardContent>
          {renderUpgradeSection()}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  type="text"
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditingBio ? (
                <div className="space-y-2">
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="resize-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancelEditBio}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          Updating <span className="animate-spin">...</span>
                        </>
                      ) : (
                        <>
                          Save <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className={cn("text-gray-700 py-2", bio ? "" : "italic text-gray-500")}>
                    {bio || "No bio added yet."}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleEditBio}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-brand-blue to-brand-purple" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  Updating <span className="animate-spin">...</span>
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Profile Photos</h4>
            <div className="flex space-x-4 overflow-x-auto">
              {profile?.photos && profile.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photo} alt={`Profile photo ${index + 1}`} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2"
                    onClick={() => handleDeletePhoto(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {profile?.photos && profile.photos.length < 5 && (
                <div>
                  <Button variant="secondary" onClick={handleOpenPhotoUpload}>
                    <Plus className="h-4 w-4 mr-2" /> Add Photo
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Hobbies</h4>
            {editingHobbies ? (
              <div>
                <HobbiesSelector
                  selectedHobbies={selectedHobbies}
                  onSave={saveHobbies}
                  onCancel={handleCancelHobbies}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedHobbies.length > 0 ? (
                    selectedHobbies.map((hobby) => (
                      <Badge key={hobby}>{hobby}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No hobbies added yet.</p>
                  )}
                </div>
                <Button variant="ghost" onClick={handleEditHobbies}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Anonymity</h4>
            <div className="flex items-center justify-between">
              <p className="text-gray-700">
                {isAnonymousMode
                  ? "You are currently in anonymous mode. Your name and photo are hidden from other users."
                  : "You are currently visible to other users."}
              </p>
              <Button
                variant="outline"
                onClick={toggleAnonymousMode}
              >
                {isAnonymousMode ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" /> Disable
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" /> Enable
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <PhotoUpload
        show={showPhotoUpload}
        onClose={handleClosePhotoUpload}
        onAddPhoto={handleAddPhoto}
      />
    </div>
  );
};

export default ProfileScreen;
