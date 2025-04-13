
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coffee, Utensils, Wine, MapPin, Clock, Calendar as CalendarIcon, User, Star, Bell, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isSameDay } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendar } from "@/hooks/useCalendar";
import DateSchedulerV2 from "./DateSchedulerV2";
import DateRequestCard from "./DateRequestCard";

const dateTypeIcons = {
  coffee: <Coffee className="h-4 w-4 text-amber-500" />,
  meal: <Utensils className="h-4 w-4 text-green-500" />,
  drink: <Wine className="h-4 w-4 text-purple-500" />,
};

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [view, setView] = useState<"upcoming" | "past" | "all" | "requests">("upcoming");
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const { 
    upcomingDates, 
    pastDates, 
    isLoadingUpcoming, 
    isLoadingPast, 
    scheduleDate,
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

  const getDateTypeIcon = (type: string | null) => {
    if (!type || !dateTypeIcons[type as keyof typeof dateTypeIcons]) {
      return <Coffee className="h-4 w-4" />;
    }
    return dateTypeIcons[type as keyof typeof dateTypeIcons];
  };

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
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-center text-brand-blue">Calendar</h1>
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

        <Card>
          <CardContent className="p-0 pt-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              modifiers={{
                event: daysWithEvents,
              }}
              modifiersStyles={{
                event: { 
                  fontWeight: "bold",
                  backgroundColor: "rgba(147, 51, 234, 0.1)", 
                  borderRadius: "100%" 
                }
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {selectedDate
                ? `Dates on ${format(selectedDate, "MMMM d, yyyy")}`
                : view === "requests" 
                  ? "Date Requests" 
                  : view === "past" 
                    ? "Past Dates" 
                    : view === "upcoming" 
                      ? "Upcoming Dates"
                      : "All Dates"}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal">
                {datesBySelectedDate.length} {datesBySelectedDate.length === 1 ? "date" : "dates"}
              </Badge>
              {view === "upcoming" && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => {
                    // Navigate to matches page for now
                    // In a real implementation, this would show a match selection UI
                    navigate('/chat');
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </Button>
              )}
            </div>
          </div>

          {isLoadingUpcoming || isLoadingPast ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : view === "requests" ? (
            datesBySelectedDate.length > 0 ? (
              <div className="space-y-3">
                {datesBySelectedDate.map((date) => (
                  <DateRequestCard 
                    key={date.id}
                    date={date as any}
                    onAccept={handleAcceptDateRequest}
                    onDecline={handleDeclineDateRequest}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium">No date requests</h3>
                  <p className="text-gray-500 mt-1">
                    You don't have any pending date requests
                  </p>
                </CardContent>
              </Card>
            )
          ) : datesBySelectedDate.length > 0 ? (
            <div className="space-y-3">
              {datesBySelectedDate.map((date) => (
                <Card key={date.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 border">
                          <AvatarImage 
                            src={date.partnerPhoto} 
                            alt={date.partnerName || "Date partner"} 
                          />
                          <AvatarFallback>{date.partnerName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{date.partnerIsAnonymous ? "Anonymous User" : date.partnerName}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            {getDateTypeIcon(date.type)}
                            <span className="ml-1 capitalize">{date.type || "Date"}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          date.status === "scheduled" ? "default" : 
                          date.status === "completed" ? "secondary" : 
                          date.status === "pending" ? "outline" :
                          "destructive"
                        }
                        className="capitalize"
                      >
                        {date.status}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {format(new Date(date.date_time), "EEEE, MMMM d • h:mm a")}
                      </div>
                      
                      <div className="flex items-start text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 mt-1" />
                        <div>
                          <div>{date.location_name}</div>
                          <div className="text-gray-500">{date.location_address}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      {date.status === "scheduled" && new Date(date.date_time) > new Date() && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelDate(date.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      
                      {date.status === "completed" && !date.reviewed && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleWriteReview(date.match_id)}
                        >
                          Write Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium">No dates scheduled</h3>
                <p className="text-gray-500 mt-1">
                  {selectedDate
                    ? "There are no dates scheduled for this day"
                    : view === "past"
                      ? "You don't have any past dates yet"
                      : view === "upcoming"
                        ? "You don't have any upcoming dates yet"
                        : "You don't have any dates scheduled"}
                </p>
                {view === "upcoming" && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/chat')}
                  >
                    Browse Matches
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
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
