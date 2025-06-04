import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getNearbyVenues, sendDateRequest, acceptDateRequest } from '@/lib/supabase';
import { toast } from 'sonner';
import { DateSchedule, DateLocation } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export const useCalendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch upcoming dates including date requests (status = pending)
  const fetchUpcomingDates = async () => {
    if (!user) throw new Error('No user logged in');
    
    // Fix the query syntax for the OR condition
    const { data, error } = await supabase
      .from('dates')
      .select(`
        *,
        matches!inner(user1, user2),
        profiles!dates_user1_profile_fk(*),
        profiles!dates_user2_profile_fk(*)
      `)
      .or(`matches.user1.eq.${user.id},matches.user2.eq.${user.id}`)
      .gt('date_time', new Date().toISOString())
      .order('date_time', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming dates:', error);
      throw error;
    }
    
    return (data || []).map((date: any) => {
      // Determine if the current user is user1 or user2
      const isUser1 = date.matches?.user1 === user.id;
      const partnerProfile = isUser1 ? date.profiles_dates_user2_profile_fk : date.profiles_dates_user1_profile_fk;
      const isInitiator = isUser1; // For now, assuming user1 is always the initiator
      
      return {
        ...date,
        partnerName: partnerProfile?.full_name,
        partnerId: isUser1 ? date.matches?.user2 : date.matches?.user1,
        partnerIsAnonymous: date.matches?.is_anonymous && !date.matches?.identity_revealed,
        isInitiator,
        isPending: date.status === 'pending',
      };
    });
  };

  // Fetch past dates
  const fetchPastDates = async () => {
    if (!user) throw new Error('No user logged in');
    
    // Fix the query syntax for the OR condition
    const { data, error } = await supabase
      .from('dates')
      .select(`
        *,
        matches!inner(user1, user2),
        profiles!dates_user1_profile_fk(*),
        profiles!dates_user2_profile_fk(*),
        reviews!left(id, reviewer_id)
      `)
      .or(`matches.user1.eq.${user.id},matches.user2.eq.${user.id}`)
      .lt('date_time', new Date().toISOString())
      .order('date_time', { ascending: false });

    if (error) {
      console.error('Error fetching past dates:', error);
      throw error;
    }
    
    return (data || []).map((date: any) => {
      // Determine if the current user is user1 or user2
      const isUser1 = date.matches?.user1 === user.id;
      const partnerProfile = isUser1 ? date.profiles_dates_user2_profile_fk : date.profiles_dates_user1_profile_fk;
      const hasReviewed = date.reviews?.some((review: any) => review.reviewer_id === user.id);
      
      return {
        ...date,
        partnerName: partnerProfile?.full_name,
        partnerId: isUser1 ? date.matches?.user2 : date.matches?.user1,
        partnerIsAnonymous: date.matches?.is_anonymous && !date.matches?.identity_revealed,
        reviewed: hasReviewed,
      };
    });
  };
  
  // Fetch venue recommendations
  const fetchVenueRecommendations = async (venueType: 'coffee' | 'meal' | 'drink', radius: number = 5000) => {
    if (!user) throw new Error('No user logged in');
    
    return getNearbyVenues(venueType, radius);
  };

  // Schedule a new date with time selection
  const scheduleDate = async (dateData: {
    match_id: string;
    date_time: string; // Now includes both date and time
    location_name: string;
    location_address: string;
    type: 'coffee' | 'meal' | 'drink';
    status?: string;
  }) => {
    if (!user) throw new Error('No user logged in');
    
    // Validate UUID format before sending to API
    try {
      // Simple UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dateData.match_id)) {
        throw new Error('Invalid match ID format');
      }
      
      const { data, error } = await supabase
        .from('dates')
        .insert({
          ...dateData
        })
        .select();

      if (error) throw error;
      
      return data[0];
    } catch (error: any) {
      console.error('Error scheduling date:', error);
      throw new Error(error.message || 'Failed to schedule date');
    }
  };

  // Send a date request
  const sendDateInvite = async (dateData: {
    match_id: string;
    date_time: string;
    location_name: string;
    location_address: string;
    type: 'coffee' | 'meal' | 'drink';
  }) => {
    if (!user) throw new Error('No user logged in');
    
    const result = await sendDateRequest(dateData);
    
    return result;
  };

  // Accept a date request
  const acceptDateInvite = async (dateId: string) => {
    if (!user) throw new Error('No user logged in');
    
    const result = await acceptDateRequest(dateId);
    
    return result;
  };

  // Cancel a date
  const cancelDate = async (dateId: string) => {
    const { error } = await supabase
      .from('dates')
      .update({ status: 'cancelled' })
      .eq('id', dateId);

    if (error) throw error;
    
    return { id: dateId, status: 'cancelled' };
  };

  // Mark a date as completed (after the date has passed)
  const markDateAsCompleted = async (dateId: string) => {
    const { error } = await supabase
      .from('dates')
      .update({ status: 'completed' })
      .eq('id', dateId);

    if (error) throw error;
    
    return { id: dateId, status: 'completed' };
  };

  // Submit a review for a date
  const submitReview = async (reviewData: {
    date_id: string;
    reviewer_id: string;
    reviewed_id: string;
    punctuality_rating: number;
    communication_rating: number;
    overall_rating: number;
    would_meet_again: boolean;
    comments?: string;
    share_publicly?: boolean;
  }) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select();

    if (error) throw error;
    
    return data[0];
  };

  // Use React Query hooks to manage data fetching and caching
  const upcomingDates = useQuery({
    queryKey: ['upcomingDates', user?.id],
    queryFn: fetchUpcomingDates,
    enabled: !!user,
  });

  const pastDates = useQuery({
    queryKey: ['pastDates', user?.id],
    queryFn: fetchPastDates,
    enabled: !!user,
  });

  const venueRecommendationQuery = (venueType: 'coffee' | 'meal' | 'drink', radius: number = 5000) => 
    useQuery({
      queryKey: ['venues', venueType, radius],
      queryFn: () => fetchVenueRecommendations(venueType, radius),
      enabled: !!user,
    });

  const scheduleDateMutation = useMutation({
    mutationFn: scheduleDate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingDates'] });
      toast.success('Date scheduled successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to schedule date: ${error.message}`);
    },
  });

  const sendDateInviteMutation = useMutation({
    mutationFn: sendDateInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingDates'] });
      toast.success('Date invitation sent!');
    },
    onError: (error: any) => {
      toast.error(`Failed to send date invitation: ${error.message}`);
    },
  });

  const acceptDateInviteMutation = useMutation({
    mutationFn: acceptDateInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingDates'] });
      toast.success('Date invitation accepted!');
    },
    onError: (error: any) => {
      toast.error(`Failed to accept date invitation: ${error.message}`);
    },
  });

  const cancelDateMutation = useMutation({
    mutationFn: cancelDate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingDates'] });
      toast.success('Date cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to cancel date: ${error.message}`);
    },
  });

  const markDateAsCompletedMutation = useMutation({
    mutationFn: markDateAsCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingDates'] });
      queryClient.invalidateQueries({ queryKey: ['pastDates'] });
      toast.success('Date marked as completed');
    },
    onError: (error: any) => {
      toast.error(`Failed to mark date as completed: ${error.message}`);
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pastDates'] });
      toast.success('Review submitted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to submit review: ${error.message}`);
    },
  });

  return {
    upcomingDates: upcomingDates.data || [],
    pastDates: pastDates.data || [],
    isLoadingUpcoming: upcomingDates.isLoading,
    isLoadingPast: pastDates.isLoading,
    getVenues: venueRecommendationQuery,
    // Expose the async version so callers can await the mutation
    scheduleDate: scheduleDateMutation.mutateAsync,
    sendDateInvite: sendDateInviteMutation.mutate,
    acceptDateInvite: acceptDateInviteMutation.mutate,
    cancelDate: cancelDateMutation.mutate,
    markDateAsCompleted: markDateAsCompletedMutation.mutate,
    submitReview: submitReviewMutation.mutate,
    refetchUpcoming: () => queryClient.invalidateQueries({ queryKey: ['upcomingDates'] }),
    refetchPast: () => queryClient.invalidateQueries({ queryKey: ['pastDates'] }),
  };
};
