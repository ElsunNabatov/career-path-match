import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ProfileCard from "../Profile/ProfileCard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import CompatibilityService from "@/services/CompatibilityService";
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
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/types/supabase";

interface DiscoveryFilters {
  ageRange: [number, number];
  region: string | null;
  zodiacSign: string | null;
  lifePathNumber: number | null;
  hobbies: string[];
}

const DiscoveryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [likesUsed, setLikesUsed] = useState(0);
  const [likeLimit, setLikeLimit] = useState(10);
  const [compatibilityResults, setCompatibilityResults] = useState<any>({});
  const [filters, setFilters] = useState<DiscoveryFilters>({
    ageRange: [18, 65],
    region: null,
    zodiacSign: null,
    lifePathNumber: null,
    hobbies: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, profile, subscription } = useAuth();
  
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  
  const lifePathNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
  
  const regions = [
    "North America", "South America", "Europe", "Asia", 
    "Africa", "Australia", "Middle East"
  ];
  
  const sampleHobbies = [
    "Reading", "Hiking", "Cooking", "Photography", "Travel", 
    "Gaming", "Sports", "Art", "Music", "Dancing", "Yoga"
  ];

  useEffect(() => {
    // Set like limit based on subscription
    if (subscription === "premium") {
      setLikeLimit(30);
    } else if (subscription === "premium_plus") {
      setLikeLimit(100);
    } else {
      setLikeLimit(10);
    }
    
    fetchProfiles();
  }, [subscription]);

  useEffect(() => {
    applyFilters();
  }, [profiles, filters, searchQuery]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all profiles except current user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Process hobbies for each profile
        const processedProfiles = data.map(profile => {
          // Convert hobbies from Json to string[] if needed
          if (profile.hobbies && !Array.isArray(profile.hobbies)) {
            try {
              // If it's a JSON string, parse it
              if (typeof profile.hobbies === 'string') {
                profile.hobbies = JSON.parse(profile.hobbies);
              }
              // Ensure it's an array
              if (!Array.isArray(profile.hobbies)) {
                profile.hobbies = [];
              }
            } catch (e) {
              console.error("Error parsing hobbies for profile", profile.id, ":", e);
              profile.hobbies = [];
            }
          }
          return profile as Profile;
        });
        
        setProfiles(processedProfiles);
        
        // Analyze compatibility for each profile
        const compatResults: any = {};
        processedProfiles.forEach(targetProfile => {
          const result = CompatibilityService.analyzeCompatibility(profile, targetProfile);
          compatResults[targetProfile.id] = result;
        });
        
        setCompatibilityResults(compatResults);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...profiles];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.full_name?.toLowerCase().includes(query) ||
        p.job_title?.toLowerCase().includes(query) ||
        (p.company ? p.company.toLowerCase().includes(query) : false) ||
        p.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }
    
    // Apply region filter
    if (filters.region) {
      filtered = filtered.filter(p => p.location?.includes(filters.region));
    }
    
    // Apply zodiac filter
    if (filters.zodiacSign) {
      filtered = filtered.filter(p => {
        const zodiac = CompatibilityService.getZodiacSign(p.birthday);
        return zodiac === filters.zodiacSign;
      });
    }
    
    // Apply life path filter
    if (filters.lifePathNumber) {
      filtered = filtered.filter(p => {
        const lifePath = CompatibilityService.calculateLifePathNumber(p.birthday);
        return lifePath === filters.lifePathNumber;
      });
    }
    
    // TODO: Apply hobby filter when hobby data is available
    
    setFilteredProfiles(filtered);
    setCurrentProfileIndex(0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleLike = (id: string) => {
    if (likesUsed >= likeLimit) {
      toast.error("You've reached your like limit. Upgrade to Premium!");
      return;
    }

    // TODO: Implement backend like functionality
    toast.success("You liked this profile!");
    setLikesUsed(likesUsed + 1);
    goToNextProfile();
  };

  const handleSkip = (id: string) => {
    toast("Profile skipped");
    goToNextProfile();
  };

  const handleCoffee = (id: string) => {
    toast.success("Coffee sticker sent! ($1 charged)");
    goToNextProfile();
  };

  const handleMeal = (id: string) => {
    toast.success("Meal sticker sent! ($2 charged)");
    goToNextProfile();
  };

  const goToNextProfile = () => {
    if (currentProfileIndex < filteredProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else if (filteredProfiles.length > 0) {
      // Reset to first profile if we've gone through all
      setCurrentProfileIndex(0);
    }
  };

  const currentProfile = filteredProfiles[currentProfileIndex];
  const currentCompatibility = currentProfile ? 
    compatibilityResults[currentProfile.id] : null;

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-blue">Discover</h1>

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
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Discovery Filters</SheetTitle>
                  <SheetDescription>
                    Refine your search to find your perfect match.
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-4 space-y-6">
                  <div className="space-y-2">
                    <Label>Age Range</Label>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{filters.ageRange[0]}</span>
                      <span>{filters.ageRange[1]}</span>
                    </div>
                    <Slider 
                      defaultValue={filters.ageRange}
                      min={18}
                      max={80}
                      step={1}
                      onValueChange={(value) => 
                        setFilters({...filters, ageRange: [value[0], value[1]]})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select 
                      value={filters.region || ''} 
                      onValueChange={(value) => 
                        setFilters({...filters, region: value || null})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any region</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Zodiac Sign</Label>
                    <Select 
                      value={filters.zodiacSign || ''} 
                      onValueChange={(value) => 
                        setFilters({...filters, zodiacSign: value || null})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any sign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any sign</SelectItem>
                        {zodiacSigns.map((sign) => (
                          <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Life Path Number</Label>
                    <Select 
                      value={filters.lifePathNumber?.toString() || ''} 
                      onValueChange={(value) => 
                        setFilters({...filters, lifePathNumber: value ? parseInt(value) : null})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any number</SelectItem>
                        {lifePathNumbers.map((num) => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Hobbies</Label>
                    <div className="flex flex-wrap gap-2">
                      {sampleHobbies.map(hobby => (
                        <Badge 
                          key={hobby} 
                          variant={filters.hobbies.includes(hobby) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const updatedHobbies = filters.hobbies.includes(hobby)
                              ? filters.hobbies.filter(h => h !== hobby)
                              : [...filters.hobbies, hobby];
                            setFilters({...filters, hobbies: updatedHobbies});
                          }}
                        >
                          {hobby}
                          {filters.hobbies.includes(hobby) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setFilters({
                        ageRange: [18, 65],
                        region: null,
                        zodiacSign: null,
                        lifePathNumber: null,
                        hobbies: []
                      })}
                    >
                      Reset
                    </Button>
                    <SheetClose asChild>
                      <Button onClick={applyFilters}>Apply Filters</Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            <Badge variant="outline" className="bg-white">
              All
            </Badge>
            {Object.keys(filters).map(key => {
              const value = (filters as any)[key];
              if (value !== null && (Array.isArray(value) ? value.length > 0 : true) && key !== 'ageRange') {
                return (
                  <Badge key={key} variant="default" className="bg-brand-purple/10 text-brand-purple border-brand-purple">
                    {Array.isArray(value) 
                      ? `${key}: ${value.length} selected` 
                      : `${key}: ${value}`}
                  </Badge>
                );
              }
              return null;
            })}
          </div>

          <div className="text-sm text-gray-500 whitespace-nowrap">
            <span className="font-medium text-brand-purple">{likesUsed}</span>/{likeLimit} Likes
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
        ) : filteredProfiles.length > 0 ? (
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
              isAnonymous: false,
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
              Try adjusting your filters to see more people
            </p>
            <Button 
              className="mt-4" 
              onClick={() => {
                setFilters({
                  ageRange: [18, 65],
                  region: null,
                  zodiacSign: null,
                  lifePathNumber: null,
                  hobbies: []
                });
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryScreen;
