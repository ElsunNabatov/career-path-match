
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNearbyVenues } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Coffee, MapPin, Star, Utensils, Wine } from "lucide-react";
import { LoyaltyVenue } from "@/types/supabase";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface VenueRecommendationsProps {
  venueType: 'coffee' | 'meal' | 'drink';
  onVenueSelect: (venue: LoyaltyVenue) => void;
  radius?: number;
}

const VenueRecommendations: React.FC<VenueRecommendationsProps> = ({ 
  venueType, 
  onVenueSelect,
  radius: initialRadius = 5000
}) => {
  const [radius, setRadius] = useState<number>(initialRadius);
  
  const { data: venues, isLoading, error } = useQuery({
    queryKey: ['venues', venueType, radius],
    queryFn: () => getNearbyVenues(venueType, radius),
  });

  const handleVenueSelect = (venue: any) => {
    const convertedVenue: LoyaltyVenue = {
      id: venue.id,
      name: venue.name,
      address: venue.address,
      type: venueType,
      discount_free: venue.discount_free || 0,
      discount_premium: venue.discount_premium || 0,
      discount_premium_plus: venue.discount_premium_plus || 0,
      logo_url: venue.logo_url
    };
    onVenueSelect(convertedVenue);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Fetching venue recommendations...</p>
        <div className="grid grid-cols-1 gap-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">Error loading venues. Please try again later.</p>;
  }

  if (!venues || venues.length === 0) {
    return <p className="text-sm text-gray-500">No venues found for this type. Try adjusting the radius or selecting a different option.</p>;
  }

  const getVenueIcon = () => {
    switch (venueType) {
      case 'coffee':
        return <Coffee className="h-5 w-5 text-amber-500" />;
      case 'meal':
        return <Utensils className="h-5 w-5 text-green-500" />;
      case 'drink':
        return <Wine className="h-5 w-5 text-purple-500" />;
      default:
        return <Coffee className="h-5 w-5 text-amber-500" />;
    }
  };

  const getDistanceText = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1000) return `${distance}m away`;
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-sm">Search radius</Label>
          <span className="text-xs text-gray-500">{(radius / 1000).toFixed(1)} km</span>
        </div>
        <Slider 
          value={[radius]} 
          min={500} 
          max={10000} 
          step={500} 
          onValueChange={(values) => setRadius(values[0])} 
          className="my-2"
        />
      </div>
      
      <p className="text-sm text-gray-500">
        Select a venue for your date 
        <span className="ml-1 inline-flex items-center">
          {getVenueIcon()}
        </span>
      </p>
      <div className="grid grid-cols-1 gap-2">
        {venues.map((venue) => (
          <Card key={venue.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <button 
                className="p-3 w-full flex justify-between items-center text-left" 
                onClick={() => handleVenueSelect(venue)}
              >
                <div className="flex items-center gap-3">
                  {venue.logo_url ? (
                    <img 
                      src={venue.logo_url} 
                      alt={venue.name} 
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {getVenueIcon()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{venue.name}</p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-[150px]">{venue.address}</span>
                    </div>
                    <div className="flex items-center mt-1 gap-2">
                      {venue.rating && (
                        <span className="flex items-center text-xs text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                          {venue.rating.toFixed(1)}
                        </span>
                      )}
                      {venue.distance && (
                        <span className="text-xs text-gray-500">
                          {getDistanceText(venue.distance)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {venue.discount_premium > 0 && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {venue.discount_premium}% off
                    </Badge>
                  )}
                </div>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VenueRecommendations;
