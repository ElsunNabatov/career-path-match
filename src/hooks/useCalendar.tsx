
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DateSchedule } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useCalendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch upcoming dates
  const fetchUpcomingDates = async () => {
    if (!user) throw new Error('No user logged in');
    
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

    if (error) throw error;
    
    return (data || []).map((date: any) => {
      // Determine if the current user is user1 or user2
      const isUser1 = date.matches.user1 === user.id;
      const partnerProfile = isUser1 ? date.profiles_dates_user2_profile_fk : date.profiles_dates_user1_profile_fk;
      
      return {
        ...date,
        partnerName: partnerProfile.full_name,
        partnerIsAnonymous: date.matches.is_anonymous && !date.matches.identity_revealed,
      };
    });
  };

  // Fetch past dates
  const fetchPastDates = async () => {
    if (!user) throw new Error('No user logged in');
    
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

    if (error) throw error;
    
    return (data || []).map((date: any) => {
      // Determine if the current user is user1 or user2
      const isUser1 = date.matches.user1 === user.id;
      const partnerProfile = isUser1 ? date.profiles_dates_user2_profile_fk : date.profiles_dates_user1_profile_fk;
      const hasReviewed = date.reviews?.some((review: any) => review.reviewer_id === user.id);
      
      return {
        ...date,
        partnerName: partnerProfile.full_name,
        partnerId: isUser1 ? date.matches.user2 : date.matches.user1,
        partnerIsAnonymous: date.matches.is_anonymous && !date.matches.identity_revealed,
        reviewed: hasReviewed,
      };
    });
  };
  
  // Schedule a new date
  const scheduleDate = async (dateData: {
    match_id: string;
    date_time: string;
    location_name: string;
    location_address: string;
    type: 'coffee' | 'meal';
    status?: string;
  }) => {
    if (!user) throw new Error('No user logged in');
    
    const { data, error } = await supabase
      .from('dates')
      .insert(dateData)
      .select();

    if (error) throw error;
    
    return data[0];
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
    scheduleDate: scheduleDateMutation.mutate,
    cancelDate: cancelDateMutation.mutate,
    submitReview: submitReviewMutation.mutate,
    refetchUpcoming: () => queryClient.invalidateQueries({ queryKey: ['upcomingDates'] }),
    refetchPast: () => queryClient.invalidateQueries({ queryKey: ['pastDates'] }),
  };
};
