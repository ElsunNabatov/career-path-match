
import React, { useState } from "react";
import { Calendar, Clock, Coffee, Sandwich, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample upcoming dates
const sampleUpcomingDates = [
  {
    id: "1",
    matchName: "Emily J.",
    matchId: "1",
    date: new Date(2025, 3, 10, 18, 30),
    location: "Starbucks Coffee",
    address: "123 Tech Avenue",
    type: "coffee",
    isAnonymous: true,
  },
];

// Sample past dates
const samplePastDates = [
  {
    id: "2",
    matchName: "Michael Chen",
    matchId: "2",
    date: new Date(2025, 3, 5, 19, 0),
    location: "Urban Bistro",
    address: "456 Downtown Street",
    type: "meal",
    isAnonymous: false,
    reviewed: false,
  },
];

const CalendarScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [selectedPlace, setSelectedPlace] = useState("coffee");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewDateId, setReviewDateId] = useState<string | null>(null);

  // Date has events calculation (in a real app would check against actual events)
  const hasEventsForDate = (date: Date) => {
    // Check if there's an event on this date
    return sampleUpcomingDates.some(
      (event) => event.date.toDateString() === date.toDateString()
    );
  };

  const handleSchedule = () => {
    toast.success("Date scheduled successfully!");
    toast("Calendar reminder set for 2 hours before your date");
  };

  const handleSubmitReview = (dateId: string) => {
    // In a real app, this would submit the review to an API
    toast.success("Review submitted successfully!");
    setShowReviewForm(false);
    setReviewDateId(null);
  };

  const handleStartReview = (dateId: string) => {
    setReviewDateId(dateId);
    setShowReviewForm(true);
  };

  // Content rendering for upcoming dates tab
  const renderUpcomingTabContent = () => {
    if (sampleUpcomingDates.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="rounded-full bg-brand-purple/10 h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-brand-purple" />
          </div>
          <h3 className="font-medium text-lg mb-1">No upcoming dates</h3>
          <p className="text-gray-500">
            Schedule a date with one of your matches
          </p>
        </div>
      );
    }

    return (
      <>
        {sampleUpcomingDates.map((date) => (
          <Card key={date.id} className="card-shadow mb-4">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-brand-purple" />
                    <h3 className="font-semibold">
                      Date with {date.matchName}
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {date.date.toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {date.date.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>
                        {date.location} - {date.address}
                      </span>
                    </div>
                  </div>
                </div>
                {date.type === "coffee" ? (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    <Coffee className="h-3 w-3 mr-1" />
                    Coffee
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <Sandwich className="h-3 w-3 mr-1" />
                    Meal
                  </Badge>
                )}
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="outline" size="sm">
                  <Bell className="h-3 w-3 mr-1" />
                  Reminder on
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Schedule a New Date</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Select Date
              </label>
              <div className="border rounded-md">
                <CalendarUI
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasEvent: (date) => hasEventsForDate(date),
                  }}
                  modifiersClassNames={{
                    hasEvent: "bg-brand-purple/20 font-bold text-brand-purple",
                  }}
                  disabled={{
                    before: new Date(),
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Time
                </label>
                <Select
                  value={selectedTime}
                  onValueChange={setSelectedTime}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                    <SelectItem value="19:00">7:00 PM</SelectItem>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Date Type
                </label>
                <Select
                  value={selectedPlace}
                  onValueChange={setSelectedPlace}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coffee">
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 mr-2" />
                        Coffee (20% discount)
                      </div>
                    </SelectItem>
                    <SelectItem value="meal">
                      <div className="flex items-center">
                        <Sandwich className="h-4 w-4 mr-2" />
                        Meal (10% discount)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="w-full bg-brand-purple hover:bg-brand-purple/90 mt-4"
              onClick={handleSchedule}
            >
              Schedule Date
            </Button>
          </div>
        </div>
      </>
    );
  };

  // Content rendering for past dates tab
  const renderPastTabContent = () => {
    if (showReviewForm && reviewDateId) {
      return (
        <div className="bg-white p-4 rounded-lg border card-shadow animate-fade-in">
          <h3 className="font-medium text-lg mb-4">Review Your Date</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                How was your date treated you?
              </label>
              <div className="flex space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg hover:bg-brand-purple hover:text-white transition-colors"
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Would you give a chance for a second date?
              </label>
              <div className="flex space-x-4 mt-1">
                <button className="flex-1 py-2 border rounded-md hover:bg-brand-purple hover:text-white transition-colors">
                  Yes
                </button>
                <button className="flex-1 py-2 border rounded-md hover:bg-brand-purple hover:text-white transition-colors">
                  No
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Overall, did you like their vibe?
              </label>
              <div className="flex space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg hover:bg-brand-purple hover:text-white transition-colors"
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-brand-purple hover:bg-brand-purple/90"
                onClick={() => handleSubmitReview(reviewDateId)}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (samplePastDates.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="rounded-full bg-gray-100 h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-lg mb-1">No past dates</h3>
          <p className="text-gray-500">
            Your dating history will appear here
          </p>
        </div>
      );
    }

    return (
      <>
        {samplePastDates.map((date) => (
          <Card key={date.id} className="card-shadow mb-4">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <h3 className="font-semibold">
                      Date with {date.matchName}
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {date.date.toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {date.date.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {date.location} - {date.address}
                      </span>
                    </div>
                  </div>
                </div>
                {date.type === "coffee" ? (
                  <Badge className="bg-gray-100 text-gray-800">
                    <Coffee className="h-3 w-3 mr-1" />
                    Coffee
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">
                    <Sandwich className="h-3 w-3 mr-1" />
                    Meal
                  </Badge>
                )}
              </div>

              {!date.reviewed && (
                <div className="mt-4">
                  <Button
                    className="w-full bg-brand-purple hover:bg-brand-purple/90"
                    onClick={() => handleStartReview(date.id)}
                  >
                    Leave a Review
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </>
    );
  };

  return (
    <div className="pb-20">
      <div className="px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-brand-blue">Date Calendar</h1>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="upcoming" className="mt-0 space-y-6">
              {renderUpcomingTabContent()}
            </TabsContent>

            <TabsContent value="past" className="mt-0">
              {renderPastTabContent()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CalendarScreen;
