import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ProfileCard from "../Profile/ProfileCard";

// Sample profile data
const sampleProfiles = [
  {
    id: "1",
    name: "Emily Johnson",
    age: 28,
    jobTitle: "Product Manager",
    industry: "Technology",
    company: "Tech Innovations",
    education: "MBA, Stanford University",
    skills: ["Product Strategy", "User Research", "Agile", "Data Analysis"],
    zodiacSign: "Libra",
    lifePath: 3,
    photo: undefined,
    isAnonymous: true,
    compatibilityScore: 92,
    insights: [
      "Strong career alignment",
      "Astrologically well-matched",
      "Complementary personalities"
    ],
    pros: [
      "Professional goals highly compatible",
      "Natural personality alignment",
      "Similar communication styles"
    ],
    cons: [
      "Both may avoid difficult conversations",
      "Could compete for leadership roles"
    ]
  },
  {
    id: "2",
    name: "Michael Chen",
    age: 31,
    jobTitle: "Senior Software Engineer",
    industry: "Technology",
    company: "CloudTech Solutions",
    education: "MS Computer Science, MIT",
    skills: ["JavaScript", "React", "Node.js", "Cloud Architecture"],
    zodiacSign: "Scorpio",
    lifePath: 8,
    photo: undefined,
    isAnonymous: true,
    compatibilityScore: 78,
    insights: [
      "Complementary career paths",
      "Different life approaches",
      "Passionate connection"
    ],
    pros: [
      "Can learn from each other's professional experiences",
      "Strong intellectual connection",
      "Mutual ambition"
    ],
    cons: [
      "May have differing views on personal growth",
      "Potential power struggles"
    ]
  },
  {
    id: "3",
    name: "Sophia Rodriguez",
    age: 27,
    jobTitle: "Marketing Director",
    industry: "Media",
    company: "Creative Media Group",
    education: "BA Communications, Columbia University",
    skills: ["Brand Strategy", "Content Marketing", "Social Media", "Analytics"],
    zodiacSign: "Leo",
    lifePath: 1,
    photo: undefined,
    isAnonymous: false,
    compatibilityScore: 85,
    insights: [
      "Career paths are complementary",
      "Leadership and creativity match",
      "High energy connection"
    ],
    pros: [
      "Both value creativity and innovation",
      "Strong leadership qualities",
      "Social compatibility"
    ],
    cons: [
      "May compete for attention",
      "Both strong-willed personalities"
    ]
  }
];

const PeopleScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [likesUsed, setLikesUsed] = useState(8);
  const [stickerCounts, setStickerCounts] = useState({ coffee: 5, meal: 3 });
  const likeLimit = 10;
  const navigate = useNavigate();

  const currentProfile = sampleProfiles[currentProfileIndex];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would filter profiles based on the search query
    toast.info(`Searching for "${searchQuery}"`);
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
    if (currentProfileIndex < sampleProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      // Reset to first profile if we've gone through all
      setCurrentProfileIndex(0);
    }
  };

  const handleViewLikedBy = () => {
    navigate("/people/liked-by");
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
            
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex space-x-2">
            <Badge variant="outline" className="bg-white">
              All
            </Badge>
            <Badge variant="outline" className="bg-white">
              Tech
            </Badge>
            <Badge variant="outline" className="bg-white">
              Finance
            </Badge>
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
        <ProfileCard
          profile={{
            id: currentProfile.id,
            name: currentProfile.name,
            age: currentProfile.age,
            jobTitle: currentProfile.jobTitle,
            industry: currentProfile.industry,
            company: currentProfile.company,
            education: currentProfile.education,
            skills: currentProfile.skills,
            zodiacSign: currentProfile.zodiacSign,
            lifePath: currentProfile.lifePath,
            photo: currentProfile.photo,
            isAnonymous: currentProfile.isAnonymous,
          }}
          compatibilityScore={currentProfile.compatibilityScore}
          insights={currentProfile.insights}
          pros={currentProfile.pros}
          cons={currentProfile.cons}
          onLike={handleLike}
          onSkip={handleSkip}
          onCoffee={handleCoffee}
          onMeal={handleMeal}
          likeLimit={likeLimit}
          likesUsed={likesUsed}
        />
      </div>
    </div>
  );
};

export default PeopleScreen;
