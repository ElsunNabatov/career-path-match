import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StarIcon } from 'lucide-react';
import { ChatService } from '@/services/ChatService';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface DateReviewProps {
  dateId: string;
  reviewerId: string;
  reviewedId: string;
  onReviewSubmitted: () => void;
}

const DateReview: React.FC<DateReviewProps> = ({ dateId, reviewerId, reviewedId, onReviewSubmitted }) => {
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [wouldMeetAgain, setWouldMeetAgain] = useState(false);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmitReview = async () => {
    if (punctualityRating === 0 || communicationRating === 0 || overallRating === 0) {
      toast.error('Please provide ratings for all categories');
      return;
    }

    try {
      setIsSubmitting(true);

      await ChatService.submitReview({
        date_id: dateId,
        reviewer_id: reviewerId,
        reviewed_id: reviewedId,
        punctuality_rating: punctualityRating,
        communication_rating: communicationRating,
        overall_rating: overallRating,
        would_meet_again: wouldMeetAgain,
        comments
      });

      toast.success('Review submitted successfully!');
      setIsOpen(false);
      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = ({ rating, setRating }: { rating: number, setRating: (rating: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <StarIcon 
              className={`w-6 h-6 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Leave Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review Your Date</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Punctuality</Label>
            <RatingStars rating={punctualityRating} setRating={setPunctualityRating} />
          </div>
          
          <div className="space-y-2">
            <Label>Communication</Label>
            <RatingStars rating={communicationRating} setRating={setCommunicationRating} />
          </div>
          
          <div className="space-y-2">
            <Label>Overall Experience</Label>
            <RatingStars rating={overallRating} setRating={setOverallRating} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="would-meet-again">Would meet again</Label>
            <Switch
              id="would-meet-again"
              checked={wouldMeetAgain}
              onCheckedChange={setWouldMeetAgain}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Comments</Label>
            <Textarea
              placeholder="Share your experience..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmitReview} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateReview;
