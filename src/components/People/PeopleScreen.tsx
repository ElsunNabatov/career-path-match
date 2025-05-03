import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ProfileCard from "../Profile/ProfileCard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import AdvisorBot from "../Advisor/AdvisorBot";
import CompatibilityService from "@/services/CompatibilityService";
import { Profile } from "@/types/supabase";
import { loadSampleData } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface LocationFilter {
  enabled: boolean;
  radius: number;
  location?: string;
}

const PeopleScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [likesUsed, setLikesUsed] = useState(8);
  const [stickerCounts, setStickerCounts] = useState({ coffee: 5, meal: 3 });
  const [isLoading, setIsLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState<LocationFilter>({
    enabled: false,
    radius: 25
  });
  const [compatibilityResults, setCompatibilityResults] = useState<any>({});
  const [industries, setIndustries] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  
  const likeLimit = 10;
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchProfiles();
    }
  }, [user?.id]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      
      // First attempt to fetch profiles from the database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // If no profiles exist or there are very few, generate sample data
      if (!data || data.length < 3) {
        try {
          toast.info("Generating sample data for testing...");
          const sampleData = await loadSampleData(user?.id || '');
          toast.success("Sample data generated successfully");
          
          // Attempt to fetch profiles again after generating sample data
          const { data: refreshedData, error: refreshError } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user?.id || '')
            .order('created_at', { ascending: false });
            
          if (refreshError) throw refreshError;
          
          if (refreshedData) {
            processProfiles(refreshedData);
          }
        } catch (sampleError) {
          console.error("Error generating sample data:", sampleError);
          // If sample data generation fails, continue with whatever data we have
          if (data) {
            processProfiles(data);
          }
        }
      } else {
        // We have existing profiles, process them
        processProfiles(data);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const processProfiles = (profilesData: any[]) => {
    // Extract unique industries
    const allIndustries = profilesData
      .map((profile: any) => {
        const jobTitle = profile.job_title || '';
        if (jobTitle.includes('Engineer') || jobTitle.includes('Developer')) 
          return 'Tech';
        if (jobTitle.includes('Finance') || jobTitle.includes('Accountant'))
          return 'Finance';
        return jobTitle.split(' ')[0]; // Simplified industry extraction
      })
      .filter(Boolean);
    
    setIndustries(['All', ...new Set(allIndustries)]);
    
    // Ensure correct typing by processing the profiles
    const typedProfiles = profilesData.map(profile => {
      return {
        ...profile,
        hobbies: Array.isArray(profile.hobbies) ? profile.hobbies : 
                (profile.hobbies ? [profile.hobbies.toString()] : [])
      } as Profile;
    });
    
    setProfiles(typedProfiles);
    
    // Analyze compatibility for each profile
    const compatResults: any = {};
    typedProfiles.forEach((targetProfile: Profile) => {
      const result = CompatibilityService.analyzeCompatibility(profile, targetProfile);
      compatResults[targetProfile.id] = result;
    });
    
    setCompatibilityResults(compatResults);
  };

  const currentProfile = profiles[currentProfileIndex];
  const currentCompatibility = currentProfile ? 
    compatibilityResults[currentProfile.id] : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter profiles based on search query
    if (searchQuery) {
      const filteredIndex = profiles.findIndex(profile => 
        profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredIndex !== -1) {
        setCurrentProfileIndex(filteredIndex);
      } else {
        toast("No matching profiles found");
      }
    }
  };

  const handleLike = (id: string) => {
    if (likesUsed >= likeLimit) {
      // Show upgrade modal in a real app
      toast.error("You've reached your like limit. Upgrade to Premium!");
      navigate("/premium");
      return;
    }

    toast.success("You liked this profile!");
    setLikesUsed(likesUsed + 1);
    goToNextProfile();
  };

  const handleSkip = (id: string) => {
    toast("Profile skipped");
    goToNextProfile();
  };

  const handleCoffee = (id: string) => {
    if (stickerCounts.coffee <= 0) {
      toast.error("You're out of coffee stickers! Buy more to continue.");
      navigate("/payment?type=coffee");
      return;
    }
    
    setStickerCounts({
      ...stickerCounts,
      coffee: stickerCounts.coffee - 1
    });
    toast.success("Coffee sticker sent!");
    goToNextProfile();
  };

  const handleMeal = (id: string) => {
    if (stickerCounts.meal <= 0) {
      toast.error("You're out of meal stickers! Buy more to continue.");
      navigate("/payment?type=meal");
      return;
    }
    
    setStickerCounts({
      ...stickerCounts,
      meal: stickerCounts.meal - 1
    });
    toast.success("Meal sticker sent!");
    goToNextProfile();
  };

  const goToNextProfile = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else if (profiles.length > 0) {
      // Reset to first profile if we've gone through all
      setCurrentProfileIndex(0);
    }
  };

  const handleViewLikedBy = () => {
    navigate("/people/liked-by");
  };

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    
    if (value === "All") {
      return;
    }
    
    // Find first profile matching the selected industry
    const industryIndex = profiles.findIndex(profile => {
      const jobTitle = profile.job_title || '';
      return jobTitle.includes(value);
    });
    
    if (industryIndex !== -1) {
      setCurrentProfileIndex(industryIndex);
    }
  };

  const toggleLocationFilter = () => {
    setLocationFilter({
      ...locationFilter,
      enabled: !locationFilter.enabled
    });
    
    toast(locationFilter.enabled ? 
      "Location filter disabled" : 
      `Location filter enabled (${locationFilter.radius} miles radius)`
    );
  };

  const handleRadiusChange = (value: number[]) => {
    setLocationFilter({
      ...locationFilter,
      radius: value[0]
    });
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-blue">People</h1>

          <div className="flex space-x-2">
            <form onSubmit={handleSearch} className="relative">
              <Input
                className="pr-8 bg-gray-50 border-none focus-visible:ring-brand-purple"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Search className="h-4 w-4 text-gray-500" />
              </button>
            </form>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter People</SheetTitle>
                  <SheetDescription>
                    Customize your matching preferences.
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-4 space-y-6">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select 
                      value={selectedIndustry} 
                      onValueChange={handleIndustryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="location-filter">Location Filter</Label>
                      <Button 
                        variant={locationFilter.enabled ? "default" : "outline"} 
                        size="sm"
                        onClick={toggleLocationFilter}
                      >
                        {locationFilter.enabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Radius: {locationFilter.radius} miles</span>
                      </div>
                      <Slider
                        id="radius-slider"
                        min={5}
                        max={100}
                        step={5}
                        defaultValue={[locationFilter.radius]}
                        onValueChange={handleRadiusChange}
                        disabled={!locationFilter.enabled}
                      />
                    </div>
                  </div>
                  
                  <SheetClose asChild>
                    <Button className="w-full mt-4">Apply Filters</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            <Badge variant="outline" className={selectedIndustry === "All" ? "bg-brand-purple text-white" : "bg-white"}>
              All
            </Badge>
            {industries.filter(i => i !== "All").slice(0, 3).map((industry) => (
              <Badge 
                key={industry} 
                variant="outline" 
                className={selectedIndustry === industry ? "bg-brand-purple text-white" : "bg-white"}
                onClick={() => handleIndustryChange(industry)}
              >
                {industry}
              </Badge>
            ))}
            {locationFilter.enabled && (
              <Badge variant="default" className="bg-brand-blue text-white flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{locationFilter.radius} miles</span>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-brand-purple">{likesUsed}</span>/{likeLimit} Likes
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewLikedBy}
              className="border-brand-purple text-brand-purple flex items-center gap-1"
            >
              <Heart className="h-3 w-3 fill-brand-purple" />
              <span>Liked By</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex gap-2 items-center text-xs">
            <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-full border border-amber-200">
              Coffee: {stickerCounts.coffee}
            </span>
            <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full border border-red-200">
              Meal: {stickerCounts.meal}
            </span>
          </div>
          <Button 
            variant="link" 
            size="sm" 
            className="text-brand-purple"
            onClick={() => navigate("/payment")}
          >
            Buy more
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
        ) : profiles.length > 0 ? (
          <ProfileCard
            profile={{
              id: currentProfile.id,
              name: currentProfile.full_name || "Anonymous User",
              age: currentProfile.birthday 
                ? Math.floor((new Date().getTime() - new Date(currentProfile.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
                : undefined,
              jobTitle: currentProfile.job_title,
              industry: undefined,
              company: currentProfile.company,
              education: currentProfile.education,
              skills: currentProfile.skills,
              zodiacSign: CompatibilityService.getZodiacSign(currentProfile.birthday),
              lifePath: CompatibilityService.calculateLifePathNumber(currentProfile.birthday),
              photo: currentProfile.photos?.[0],
              isAnonymous: currentProfile.is_anonymous_mode || false,
            }}
            compatibilityScore={currentCompatibility?.score || 0}
            insights={currentCompatibility?.insights || []}
            pros={currentCompatibility?.pros || []}
            cons={currentCompatibility?.cons || []}
            onLike={() => handleLike(currentProfile.id)}
            onSkip={() => handleSkip(currentProfile.id)}
            onCoffee={() => handleCoffee(currentProfile.id)}
            onMeal={() => handleMeal(currentProfile.id)}
            likeLimit={likeLimit}
            likesUsed={likesUsed}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-700">No profiles found</h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>
      
      {/* Dating Advisor Bot for the People section */}
      <AdvisorBot 
        currentProfile={currentProfile} 
        context="people" 
      />
    </div>
  );
};

export default PeopleScreen;
