import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNearbyVenues } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Coffee, MapPin, Star, Utensils, Wine } from "lucide-react";
import { LoyaltyVenue } from "@/types/supabase";

interface VenueRecommendationsProps {
  venueType: 'coffee' | 'meal' | 'drink';
  onVenueSelect: (venue: LoyaltyVenue) => void;
  radius?: number;
}

const VenueRecommendations: React.FC<VenueRecommendationsProps> = ({ 
  venueType, 
  onVenueSelect,
  radius = 5000
}) => {
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
    return <p className="text-sm text-gray-500">No venues found for this type. Try a different option.</p>;
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

  return (
    <div className="space-y-2">
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
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getVenueIcon()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{venue.name}</p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-[150px]">{venue.address}</span>
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
