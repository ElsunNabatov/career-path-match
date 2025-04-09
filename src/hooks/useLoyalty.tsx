
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LoyaltyVenue } from '@/types/supabase';

export const useLoyalty = () => {
  const { user, subscription } = useAuth();

  // Fetch all loyalty venues
  const fetchLoyaltyVenues = async () => {
    const { data, error } = await supabase
      .from('loyalty_venues')
      .select('*')
      .order('name');

    if (error) throw error;
    
    return (data || []).map((venue: any) => {
      // Calculate applicable discount based on subscription level
      let discount = venue.discount_free;
      
      if (subscription === 'premium') {
        discount = venue.discount_premium;
      } else if (subscription === 'premium_plus') {
        discount = venue.discount_premium_plus;
      }
      
      return {
        ...venue,
        applicable_discount: discount,
      } as LoyaltyVenue & { applicable_discount: number };
    });
  };

  // Use React Query hooks to manage data fetching and caching
  const { data: venues = [], isLoading, error, refetch } = useQuery({
    queryKey: ['loyaltyVenues', subscription],
    queryFn: fetchLoyaltyVenues,
    enabled: !!user,
  });

  return {
    venues,
    isLoading,
    error,
    refetchVenues: refetch,
    // Helper function to determine if a venue has a discount for current user
    hasDiscount: (venue: LoyaltyVenue) => {
      if (!subscription || subscription === 'free') {
        return venue.discount_free > 0;
      }
      
      if (subscription === 'premium') {
        return venue.discount_premium > 0;
      }
      
      if (subscription === 'premium_plus') {
        return venue.discount_premium_plus > 0;
      }
      
      return false;
    },
  };
};
