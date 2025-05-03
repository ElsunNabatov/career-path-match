
import React from "react";
import { DateSchedule } from "@/types/supabase";
import { Bell, Calendar } from "lucide-react";
import DateRequestCard from "./DateRequestCard";
import DateCard from "./DateCard";
import EmptyStateCard from "./EmptyStateCard";

interface CalendarDatesListProps {
  view: "upcoming" | "past" | "all" | "requests";
  dates: (DateSchedule & {
    partnerName: string;
    partnerId: string;
    partnerIsAnonymous: boolean;
    partnerPhoto?: string;
    isInitiator?: boolean;
    reviewed?: boolean;
  })[];
  selectedDate: Date | undefined;
  isLoading: boolean;
  onAcceptDateRequest: (dateId: string) => void;
  onDeclineDateRequest: (dateId: string) => void;
  onCancelDate: (dateId: string) => void;
  onWriteReview: (matchId: string) => void;
}

const CalendarDatesList: React.FC<CalendarDatesListProps> = ({
  view,
  dates,
  selectedDate,
  isLoading,
  onAcceptDateRequest,
  onDeclineDateRequest,
  onCancelDate,
  onWriteReview
}) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading dates...</div>;
  }

  if (dates.length === 0) {
    const getEmptyStateProps = () => {
      if (selectedDate) {
        return {
          icon: Calendar,
          title: "No dates scheduled",
          description: "There are no dates scheduled for this day",
          showButton: false
        };
      }

      switch (view) {
        case "requests":
          return {
            icon: Bell,
            title: "No date requests",
            description: "You don't have any pending date requests",
            showButton: false
          };
        case "past":
          return {
            icon: Calendar,
            title: "No past dates",
            description: "You don't have any past dates yet",
            showButton: false
          };
        case "upcoming":
        case "all":
          return {
            icon: Calendar,
            title: "No upcoming dates",
            description: "You don't have any upcoming dates yet",
            showButton: true,
            buttonText: "Browse Matches"
          };
        default:
          return {
            icon: Calendar,
            title: "No dates scheduled",
            description: "You don't have any dates scheduled",
            showButton: false
          };
      }
    };

    return <EmptyStateCard {...getEmptyStateProps()} />;
  }

  if (view === "requests") {
    return (
      <div className="space-y-3">
        {dates.map((date) => (
          <DateRequestCard 
            key={date.id}
            date={date as any}
            onAccept={onAcceptDateRequest}
            onDecline={onDeclineDateRequest}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dates.map((date) => (
        <DateCard 
          key={date.id}
          date={date}
          onCancel={onCancelDate}
          onWriteReview={onWriteReview}
        />
      ))}
    </div>
  );
};

export default CalendarDatesList;
