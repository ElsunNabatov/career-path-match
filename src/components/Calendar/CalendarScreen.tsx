
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isSameDay, parseISO } from "date-fns";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/hooks/useCalendar";
import DateSchedulerV2 from "./DateSchedulerV2";
import CalendarView from "./CalendarView";
import CalendarDatesList from "./CalendarDatesList";
import DateHeader from "./DateHeader";

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [view, setView] = useState<"upcoming" | "past" | "all" | "requests">("upcoming");
  const navigate = useNavigate();
  
  const { 
    upcomingDates, 
    pastDates, 
    isLoadingUpcoming, 
    isLoadingPast, 
    sendDateInvite,
    acceptDateInvite,
    cancelDate,
    refetchUpcoming,
    refetchPast
  } = useCalendar();

  // Get count of pending date requests
  const pendingRequestsCount = upcomingDates.filter(date => date.status === 'pending').length;

  // Filter dates by selected date and view
  const getFilteredDates = () => {
    let filteredDates = [];
    
    switch (view) {
      case "upcoming":
        filteredDates = upcomingDates.filter(date => date.status !== 'pending');
        break;
      case "requests":
        filteredDates = upcomingDates.filter(date => date.status === 'pending');
        break;
      case "past":
        filteredDates = pastDates;
        break;
      case "all":
      default:
        filteredDates = [...upcomingDates, ...pastDates];
        break;
    }
    
    // Further filter by selected date if one is chosen
    if (selectedDate) {
      return filteredDates.filter(date => 
        isSameDay(parseISO(date.date_time), selectedDate)
      );
    }
    
    return filteredDates;
  };
  
  const datesBySelectedDate = getFilteredDates();

  // Get all days that have events for highlighting on the calendar
  const daysWithEvents = [
    ...upcomingDates.map(date => new Date(date.date_time)),
    ...pastDates.map(date => new Date(date.date_time))
  ];

  const handleCancelDate = (dateId: string) => {
    cancelDate(dateId);
  };

  const handleAcceptDateRequest = (dateId: string) => {
    acceptDateInvite(dateId);
    toast.success("Date request accepted! Event added to your calendar.", {
      description: "You'll receive a notification reminder closer to the date."
    });
  };

  const handleDeclineDateRequest = (dateId: string) => {
    cancelDate(dateId);
    toast.info("Date request declined");
  };

  const handleWriteReview = (matchId: string) => {
    navigate(`/reviews/${matchId}`);
  };

  const openScheduleModal = (matchId: string) => {
    setSelectedMatchId(matchId);
    setIsSchedulingModalOpen(true);
  };

  const handleDateScheduleSubmit = (dateData: {
    date_time: string;
    location_name: string;
    location_address: string;
    type: 'coffee' | 'meal' | 'drink';
  }) => {
    if (!selectedMatchId) return;
    
    sendDateInvite({
      match_id: selectedMatchId,
      ...dateData
    });
    
    setIsSchedulingModalOpen(false);
    setSelectedMatchId(null);
    
    // Show a success message
    toast.success("Date request sent!", {
      description: "You'll be notified when they respond."
    });
  };

  useEffect(() => {
    // Refresh data on component mount
    refetchUpcoming();
    refetchPast();
  }, [refetchUpcoming, refetchPast]);

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold text-center text-brand-blue">Calendar</h1>
        <Button 
          onClick={() => navigate("/calendar/schedule")}
          className="bg-brand-blue hover:bg-brand-blue/90"
          size="sm"
        >
          <CalendarPlus className="h-4 w-4 mr-1" />
          Schedule Date
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="upcoming" onValueChange={(value) => setView(value as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Requests
              {pendingRequestsCount > 0 && (
                <span className="absolute top-0 right-1 transform -translate-y-1/2 translate-x-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <CalendarView 
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          daysWithEvents={daysWithEvents}
        />

        <div className="space-y-4">
          <DateHeader 
            selectedDate={selectedDate}
            view={view}
            dateCount={datesBySelectedDate.length}
          />

          <CalendarDatesList 
            view={view}
            dates={datesBySelectedDate}
            selectedDate={selectedDate}
            isLoading={isLoadingUpcoming || isLoadingPast}
            onAcceptDateRequest={handleAcceptDateRequest}
            onDeclineDateRequest={handleDeclineDateRequest}
            onCancelDate={handleCancelDate}
            onWriteReview={handleWriteReview}
          />
        </div>
      </div>

      {/* Date Scheduling Modal */}
      <Dialog open={isSchedulingModalOpen} onOpenChange={setIsSchedulingModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule a Date</DialogTitle>
          </DialogHeader>
          <DateSchedulerV2
            onSubmit={handleDateScheduleSubmit}
            onCancel={() => setIsSchedulingModalOpen(false)}
            matchId={selectedMatchId || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarScreen;
