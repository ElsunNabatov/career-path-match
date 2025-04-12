
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coffee, Utensils, Wine, MapPin, Clock, Calendar as CalendarIcon, User, Star } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isSameDay } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DateSchedule, Profile } from "@/types/supabase";

const dateTypeIcons = {
  coffee: <Coffee className="h-4 w-4 text-amber-500" />,
  meal: <Utensils className="h-4 w-4 text-green-500" />,
  drink: <Wine className="h-4 w-4 text-purple-500" />,
};

type CalendarEvent = DateSchedule & {
  otherUser?: Profile;
};

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dates, setDates] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"upcoming" | "past" | "all">("upcoming");
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDates = async () => {
    try {
      setIsLoading(true);
      if (!user) return;

      // First get all matches for the current user
      const { data: matches, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`);

      if (matchError) throw matchError;

      if (!matches || matches.length === 0) {
        setDates([]);
        setIsLoading(false);
        return;
      }

      const matchIds = matches.map(match => match.id);

      // Get all dates for these matches
      const { data: datesData, error: datesError } = await supabase
        .from("dates")
        .select("*")
        .in("match_id", matchIds)
        .order("date_time", { ascending: true });

      if (datesError) throw datesError;

      if (!datesData || datesData.length === 0) {
        setDates([]);
        setIsLoading(false);
        return;
      }

      // For each date, get the other user's profile
      const enhancedDates = await Promise.all(
        datesData.map(async date => {
          const match = matches.find(m => m.id === date.match_id);
          if (!match) return { ...date };

          const otherUserId = match.user1 === user.id ? match.user2 : match.user1;

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", otherUserId)
            .single();

          return {
            ...date,
            otherUser: profile || undefined
          };
        })
      );

      setDates(enhancedDates);
    } catch (error) {
      console.error("Error fetching dates:", error);
      toast.error("Failed to load your calendar");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, [user]);

  const getDatesByView = () => {
    const now = new Date();
    
    switch (view) {
      case "upcoming":
        return dates.filter(date => new Date(date.date_time) >= now);
      case "past":
        return dates.filter(date => new Date(date.date_time) < now);
      case "all":
      default:
        return dates;
    }
  };

  const filteredDates = getDatesByView();
  
  const datesBySelectedDate = selectedDate 
    ? filteredDates.filter(date => 
        isSameDay(parseISO(date.date_time), selectedDate)
      )
    : [];

  // Get all days that have events for highlighting on the calendar
  const daysWithEvents = filteredDates.map(date => new Date(date.date_time));

  const getDateTypeIcon = (type: string | null) => {
    if (!type || !dateTypeIcons[type as keyof typeof dateTypeIcons]) {
      return <Coffee className="h-4 w-4" />;
    }
    return dateTypeIcons[type as keyof typeof dateTypeIcons];
  };

  const handleCancelDate = async (dateId: string) => {
    try {
      const { error } = await supabase
        .from("dates")
        .update({ status: "cancelled" })
        .eq("id", dateId);

      if (error) throw error;
      
      toast.success("Date cancelled successfully");
      fetchDates();
    } catch (error) {
      console.error("Error cancelling date:", error);
      toast.error("Failed to cancel date");
    }
  };

  const handleWriteReview = (matchId: string) => {
    navigate(`/reviews/${matchId}`);
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-center text-brand-blue">Calendar</h1>
      </div>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="upcoming" onValueChange={(value) => setView(value as any)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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
                : "All Scheduled Dates"}
            </h2>
            <Badge variant="outline" className="font-normal">
              {datesBySelectedDate.length} {datesBySelectedDate.length === 1 ? "date" : "dates"}
            </Badge>
          </div>

          {isLoading ? (
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
          ) : datesBySelectedDate.length > 0 ? (
            <div className="space-y-3">
              {datesBySelectedDate.map((date) => (
                <Card key={date.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 border">
                          <AvatarImage 
                            src={date.otherUser?.photos?.[0]} 
                            alt={date.otherUser?.full_name || "Date partner"} 
                          />
                          <AvatarFallback>{date.otherUser?.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{date.otherUser?.full_name || "Anonymous User"}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            {getDateTypeIcon(date.type)}
                            <span className="ml-1 capitalize">{date.type || "Date"}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          date.status === "scheduled" ? "default" : 
                          date.status === "completed" ? "success" : 
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
                      
                      {date.status === "completed" && (
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
                    : "You don't have any dates scheduled yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarScreen;
