
import React, { useState } from "react";
import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import VenueRecommendations from "./VenueRecommendations";
import { LoyaltyVenue } from "@/types/supabase";

interface LocationSelectorProps {
  dateType: 'coffee' | 'meal' | 'drink';
  selectedVenue: LoyaltyVenue | null;
  customLocationName: string;
  customLocationAddress: string;
  onVenueSelect: (venue: LoyaltyVenue) => void;
  onCustomLocationNameChange: (value: string) => void;
  onCustomLocationAddressChange: (value: string) => void;
  onTabChange: (value: string) => void;
  activeTab: string;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  dateType,
  selectedVenue,
  customLocationName,
  customLocationAddress,
  onVenueSelect,
  onCustomLocationNameChange,
  onCustomLocationAddressChange,
  onTabChange,
  activeTab,
  className
}) => {
  return (
    <div className={className}>
      <Tabs defaultValue="recommended" value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="custom">Custom Location</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended" className="space-y-4">
          <VenueRecommendations 
            venueType={dateType} 
            onVenueSelect={onVenueSelect} 
          />
          
          {selectedVenue && (
            <div className="p-3 bg-gray-50 rounded-md mt-3">
              <h4 className="font-medium text-sm flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Selected Venue
              </h4>
              <div className="mt-1 text-sm">
                <p className="font-medium">{selectedVenue.name}</p>
                <p className="text-gray-500">{selectedVenue.address}</p>
                {selectedVenue.discount_premium > 0 && (
                  <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                    {selectedVenue.discount_premium}% off with Premium
                  </Badge>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="locationName">Place Name</Label>
            <Input 
              id="locationName" 
              placeholder="e.g. Central Park Cafe"
              value={customLocationName}
              onChange={(e) => onCustomLocationNameChange(e.target.value)} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="locationAddress">Address</Label>
            <Input 
              id="locationAddress" 
              placeholder="e.g. 123 Main St, New York, NY 10001" 
              value={customLocationAddress}
              onChange={(e) => onCustomLocationAddressChange(e.target.value)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationSelector;
