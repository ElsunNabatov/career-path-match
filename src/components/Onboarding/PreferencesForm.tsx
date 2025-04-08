
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Heart, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type OrientationOption = "straight" | "gay" | "lesbian";
type HobbyCategory = "professional" | "creative" | "athletic" | "intellectual" | "social";

const hobbies: Record<HobbyCategory, string[]> = {
  professional: ["Networking", "Public Speaking", "Leadership", "Entrepreneurship", "Mentoring"],
  creative: ["Photography", "Writing", "Painting", "Music", "Design"],
  athletic: ["Running", "Yoga", "Hiking", "Swimming", "Cycling"],
  intellectual: ["Reading", "Chess", "Languages", "History", "Science"],
  social: ["Volunteering", "Cooking", "Travel", "Foodie", "Wine Tasting"]
};

const PreferencesForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orientation, setOrientation] = useState<OrientationOption | null>(null);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  
  const handleNext = () => {
    if (step === 1 && orientation) {
      setStep(2);
    } else if (step === 2 && selectedHobbies.length >= 3) {
      navigate("/discover");
    }
  };

  const toggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter(h => h !== hobby));
    } else {
      if (selectedHobbies.length < 5) {
        setSelectedHobbies([...selectedHobbies, hobby]);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {step === 1 ? "Your Orientation" : "Your Interests"}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Select your orientation to help us find the right matches" 
              : "Select 3-5 interests that define you (choose at least 3)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <RadioGroup 
              value={orientation || ""} 
              onValueChange={(value) => setOrientation(value as OrientationOption)} 
              className="flex flex-col space-y-4"
            >
              <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="straight" id="straight" />
                <Label htmlFor="straight" className="flex-1 cursor-pointer">Straight</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="gay" id="gay" />
                <Label htmlFor="gay" className="flex-1 cursor-pointer">Gay</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="lesbian" id="lesbian" />
                <Label htmlFor="lesbian" className="flex-1 cursor-pointer">Lesbian</Label>
              </div>
            </RadioGroup>
          ) : (
            <div className="space-y-4">
              {Object.entries(hobbies).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground capitalize">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map(hobby => (
                      <Button
                        key={hobby}
                        type="button"
                        variant={selectedHobbies.includes(hobby) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleHobby(hobby)}
                        className={cn(
                          "rounded-full",
                          selectedHobbies.includes(hobby) && "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {selectedHobbies.includes(hobby) && (
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        )}
                        {hobby}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-center h-8 mt-4">
                {selectedHobbies.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {selectedHobbies.length} selected 
                    {selectedHobbies.length < 3 ? 
                      ` (choose at least ${3 - selectedHobbies.length} more)` : 
                      selectedHobbies.length < 5 ? 
                        ` (you can add ${5 - selectedHobbies.length} more)` : 
                        " (maximum reached)"
                    }
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleNext}
            disabled={(step === 1 && !orientation) || (step === 2 && selectedHobbies.length < 3)}
            className="w-full"
          >
            {step === 1 ? "Continue" : "Complete Profile"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PreferencesForm;
