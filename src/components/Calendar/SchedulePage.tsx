
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import DateTypeSelector from "./DateTypeSelector";
import VenueRecommendations from "./VenueRecommendations";
import { useCalendar } from "@/hooks/useCalendar";
import { cn } from "@/lib/utils";

const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { scheduleDate } = useCalendar();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("6:00 PM");
  const [dateType, setDateType] = useState<'coffee' | 'meal' | 'drink'>('coffee');
  const [locationTab, setLocationTab] = useState<string>("recommended");
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [customLocationName, setCustomLocationName] = useState<string>("");
  const [customLocationAddress, setCustomLocationAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [matchId, setMatchId] = useState<string>("");
  const [matchIdError, setMatchIdError] = useState<string>("");
  
  // Validate UUID format
  const validateMatchId = (id: string) => {
    if (!id) {
      setMatchIdError("Match ID is required");
      return false;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      setMatchIdError("Invalid Match ID format. Please use a valid UUID");
      return false;
    }
    
    setMatchIdError("");
    return true;
  };

  const handleMatchIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMatchId(value);
    
    if (value) {
      validateMatchId(value);
    } else {
      setMatchIdError("");
    }
  };

  const handleSchedule = async () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!validateMatchId(matchId)) {
      return;
    }

    // Parse the selected time
    const [timeStr, period] = time.split(" ");
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // Adjust for PM
    if (period === "PM" && hour !== 12) {
      hour += 12;
    }
    // Adjust for 12 AM
    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    // Create a new date with the selected time
    const dateTime = new Date(date);
    dateTime.setHours(hour, minute, 0, 0);

    let locationName;
    let locationAddress;

    if (locationTab === "recommended" && selectedVenue) {
      locationName = selectedVenue.name;
      locationAddress = selectedVenue.address;
    } else {
      locationName = customLocationName;
      locationAddress = customLocationAddress;
    }

    if (!locationName || !locationAddress) {
      toast.error("Please select or enter a location");
      return;
    }

    setIsSubmitting(true);

    try {
      await scheduleDate({
        match_id: matchId,
        date_time: dateTime.toISOString(),
        location_name: locationName,
        location_address: locationAddress,
        type: dateType,
        status: 'scheduled'
      });
      navigate("/calendar");
    } catch (error: any) {
      console.error('Error scheduling date:', error);
      toast.error(error.message || 'Failed to schedule date');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Schedule a New Date</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match ID Input */}
          <div className="space-y-2">
            <Label htmlFor="match-id">Match ID</Label>
            <Input 
              id="match-id"
              value={matchId}
              onChange={handleMatchIdChange}
              placeholder="Enter match ID (e.g. 123e4567-e89b-12d3-a456-426614174000)"
              className={matchIdError ? "border-red-500" : ""}
            />
            {matchIdError && (
              <Alert variant="destructive" className="mt-2 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{matchIdError}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-gray-500">
              The Match ID is a unique identifier for the match between you and another user.
            </p>
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <TimePicker
                value={time}
                onChange={setTime}
                minuteStep={15}
                className="w-full"
              />
            </div>
          </div>

          {/* Date Type Selection */}
          <div className="space-y-2">
            <Label>Date Type</Label>
            <DateTypeSelector
              dateType={dateType}
              onDateTypeChange={setDateType}
            />
          </div>

          {/* Location Selection */}
          <div className="space-y-3">
            <Label>Location</Label>
            <Tabs 
              value={locationTab} 
              onValueChange={setLocationTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              <TabsContent value="recommended" className="space-y-4">
                <VenueRecommendations 
                  venueType={dateType}
                  selectedVenue={selectedVenue}
                  onVenueSelect={setSelectedVenue}
                />
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="location-name">Location Name</Label>
                    <Input
                      id="location-name"
                      placeholder="E.g., Café Luna"
                      value={customLocationName}
                      onChange={(e) => setCustomLocationName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location-address">Address</Label>
                    <Input
                      id="location-address"
                      placeholder="E.g., 123 Main St, City"
                      value={customLocationAddress}
                      onChange={(e) => setCustomLocationAddress(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/calendar")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSchedule}
              // Fix the string | boolean issue by ensuring isSubmitting is only boolean
              disabled={!!(isSubmitting || !date || matchIdError || !matchId || (locationTab === "recommended" ? !selectedVenue : (!customLocationName || !customLocationAddress)))}
              className="bg-brand-blue hover:bg-brand-blue/90"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Date"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePage;
