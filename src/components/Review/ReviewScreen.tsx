
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ReviewScreenProps {
  onClose?: () => void;
  onSubmit?: (review: {
    rating: number;
    secondDate: boolean;
    vibeRating: number;
    comment: string;
  }) => void;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({
  onClose,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [treatmentRating, setTreatmentRating] = useState(0);
  const [secondDate, setSecondDate] = useState<boolean | null>(null);
  const [vibeRating, setVibeRating] = useState(0);
  const [comment, setComment] = useState("");

  // Mock data for the match
  const matchData = {
    id: matchId || "1",
    name: "Alex Thompson",
    dateType: "coffee",
    location: "Brew Haven Coffee Shop",
    date: new Date(2023, 3, 15, 14, 30),
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = () => {
    // Validate
    if (treatmentRating === 0 || secondDate === null || vibeRating === 0) {
      toast.error("Please answer all questions");
      return;
    }

    // Submit review
    const reviewData = {
      rating: treatmentRating,
      secondDate,
      vibeRating,
      comment,
    };
    
    if (onSubmit) {
      onSubmit(reviewData);
    }

    // Show success message
    toast.success("Review submitted successfully!");

    // Go back to the calendar
    navigate("/calendar");
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center">
        <button onClick={handleClose} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Review Your Date</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="p-4 bg-brand-purple/5 rounded-lg">
          <h3 className="font-medium">{matchData.name}</h3>
          <p className="text-sm text-gray-500">
            {matchData.date.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            {" at "}
            {matchData.date.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-sm text-gray-500">{matchData.location}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              How did they treat you?
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setTreatmentRating(rating)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    treatmentRating >= rating
                      ? "bg-brand-purple text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      treatmentRating >= rating ? "fill-current" : ""
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {treatmentRating === 1 && "Poor"}
              {treatmentRating === 2 && "Below Average"}
              {treatmentRating === 3 && "Average"}
              {treatmentRating === 4 && "Good"}
              {treatmentRating === 5 && "Excellent"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Would you give a chance for a second date?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={secondDate === true ? "default" : "outline"}
                className={
                  secondDate === true
                    ? "bg-brand-purple hover:bg-brand-purple/90"
                    : ""
                }
                onClick={() => setSecondDate(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={secondDate === false ? "default" : "outline"}
                className={
                  secondDate === false
                    ? "bg-brand-purple hover:bg-brand-purple/90"
                    : ""
                }
                onClick={() => setSecondDate(false)}
              >
                No
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Overall, did you like their vibe?
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setVibeRating(rating)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    vibeRating >= rating
                      ? "bg-brand-purple text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      vibeRating >= rating ? "fill-current" : ""
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {vibeRating === 1 && "Poor"}
              {vibeRating === 2 && "Below Average"}
              {vibeRating === 3 && "Average"}
              {vibeRating === 4 && "Good"}
              {vibeRating === 5 && "Excellent"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Comments (Optional)
            </label>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-24"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-brand-purple hover:bg-brand-purple/90"
        >
          Submit Review
        </Button>
        
        <p className="text-xs text-center text-gray-500">
          Your review helps maintain quality standards in our community.
          Reviews are anonymous to your match.
        </p>
      </div>
    </div>
  );
};

export default ReviewScreen;
