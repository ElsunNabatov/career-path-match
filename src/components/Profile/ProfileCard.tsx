
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, Star, Coffee, Sandwich } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCompatibilityColorClass } from "@/utils/matchCalculator";

interface ProfileCardProps {
  profile: {
    id: string;
    name?: string;
    age: number;
    jobTitle: string;
    industry: string;
    education: string;
    skills: string[];
    zodiacSign: string;
    lifePath: number;
    photo?: string;
    company?: string;
    isAnonymous: boolean;
  };
  compatibilityScore: number;
  insights: string[];
  pros: string[];
  cons: string[];
  onLike?: (id: string) => void;
  onSkip?: (id: string) => void;
  onCoffee?: (id: string) => void;
  onMeal?: (id: string) => void;
  likeLimit: number;
  likesUsed: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  compatibilityScore,
  insights,
  pros,
  cons,
  onLike,
  onSkip,
  onCoffee,
  onMeal,
  likeLimit,
  likesUsed,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const scoreClass = getCompatibilityColorClass(compatibilityScore);
  
  const isPremiumRequired = likesUsed >= likeLimit;

  return (
    <Card className="w-full overflow-hidden card-shadow max-w-md mx-auto">
      <div className="relative">
        {/* Profile image */}
        <div className="h-80 bg-gray-200">
          {profile.photo && !profile.isAnonymous ? (
            <img
              src={profile.photo}
              alt={profile.name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-purple/10">
              <div className="text-center">
                {profile.isAnonymous ? (
                  <div className="p-6 rounded-full bg-brand-purple/20 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-brand-purple/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                ) : null}
                <p className="text-brand-blue font-semibold">
                  {profile.isAnonymous
                    ? "Anonymous Profile"
                    : "Profile Picture"}
                </p>
              </div>
            </div>
          )}

          {/* Compatibility badge */}
          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg flex items-center space-x-1">
            <Star className={`h-4 w-4 ${scoreClass}`} fill="currentColor" />
            <span className={`font-bold ${scoreClass}`}>{compatibilityScore}%</span>
          </div>
        </div>

        <CardContent className="p-5">
          <div className="space-y-4">
            {/* Profile header */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl">
                    {profile.isAnonymous ? "Anonymous" : profile.name}
                    <span className="ml-2 text-gray-600">
                      {profile.age}
                    </span>
                  </h3>
                  <p className="text-gray-600">
                    {profile.jobTitle} {profile.isAnonymous ? `in ${profile.industry}` : `at ${profile.company}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile details */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-brand-purple/10 text-brand-purple text-sm rounded-full">
                  {profile.zodiacSign}
                </span>
                <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue text-sm rounded-full">
                  Life Path {profile.lifePath}
                </span>
              </div>
              
              <h4 className="font-semibold text-sm mt-3 text-gray-700">Education</h4>
              <p className="text-sm">{profile.education}</p>

              <h4 className="font-semibold text-sm mt-3 text-gray-700">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {profile.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {profile.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{profile.skills.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Compatibility details - togglable */}
            <div>
              <button
                className="text-sm text-brand-purple font-semibold flex items-center"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "Hide details" : "Show compatibility details"}
              </button>

              {showDetails && (
                <div className="mt-3 space-y-3 pt-3 border-t">
                  {insights.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700">Insights</h4>
                      <ul className="list-disc pl-5 text-sm mt-1">
                        {insights.map((insight, i) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h4 className="font-semibold text-sm text-green-600">Pros</h4>
                      <ul className="list-disc pl-5 text-sm mt-1">
                        {pros.map((pro, i) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-red-500">Cons</h4>
                      <ul className="list-disc pl-5 text-sm mt-1">
                        {cons.map((con, i) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-3 flex flex-col space-y-3">
          {/* Like/Skip buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button 
              variant="outline" 
              className="border-gray-300"
              onClick={() => onSkip && onSkip(profile.id)}
            >
              Skip
            </Button>
            <Button 
              className="bg-brand-purple hover:bg-brand-purple/90"
              onClick={() => onLike && onLike(profile.id)}
              disabled={isPremiumRequired}
            >
              {isPremiumRequired ? 'Upgrade' : 'Like'}
              <Heart className={cn("ml-1 h-4 w-4", isPremiumRequired ? "" : "animate-pulse-subtle")} />
            </Button>
          </div>

          {/* Coffee/Meal stickers */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button 
              variant="outline" 
              className="border-amber-400 text-amber-600 hover:bg-amber-50"
              onClick={() => onCoffee && onCoffee(profile.id)}
            >
              <Coffee className="mr-1 h-4 w-4" />
              Coffee $1
            </Button>
            <Button 
              variant="outline" 
              className="border-red-400 text-red-600 hover:bg-red-50"
              onClick={() => onMeal && onMeal(profile.id)}
            >
              <Sandwich className="mr-1 h-4 w-4" />
              Meal $2
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ProfileCard;
