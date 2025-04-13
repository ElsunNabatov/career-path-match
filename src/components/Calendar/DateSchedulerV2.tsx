
import React, { useState } from "react";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, CalendarDays, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import VenueRecommendations from "./VenueRecommendations";
import { LoyaltyVenue } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";

interface DateSchedulerProps {
  onSubmit: (data: {
    date_time: string;
    location_name: string;
    location_address: string;
    type: 'coffee' | 'meal' | 'drink';
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  matchId?: string; // Added match ID for request flow
}

const DateSchedulerV2: React.FC<DateSchedulerProps> = ({ 
  onSubmit, 
  onCancel,
  isLoading = false,
  matchId 
}) => {
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [time, setTime] = useState<string>("6:00 PM");
  const [dateType, setDateType] = useState<'coffee' | 'meal' | 'drink'>('coffee');
  const [tab, setTab] = useState<string>("recommended");
  const [selectedVenue, setSelectedVenue] = useState<LoyaltyVenue | null>(null);
  const [customLocationName, setCustomLocationName] = useState<string>("");
  const [customLocationAddress, setCustomLocationAddress] = useState<string>("");

  const handleSubmit = () => {
    if (!date) {
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

    // Format for submission
    const formattedDateTime = dateTime.toISOString();

    let locationName = "";
    let locationAddress = "";

    if (tab === "recommended" && selectedVenue) {
      locationName = selectedVenue.name;
      locationAddress = selectedVenue.address;
    } else {
      locationName = customLocationName;
      locationAddress = customLocationAddress;
    }

    onSubmit({
      date_time: formattedDateTime,
      location_name: locationName,
      location_address: locationAddress,
      type: dateType,
    });
  };

  const isDateInPast = (date: Date) => {
    return isBefore(date, new Date());
  };

  const handleVenueSelect = (venue: LoyaltyVenue) => {
    setSelectedVenue(venue);
  };

  // Check if form is ready to submit
  const isFormComplete = () => {
    if (!date) return false;
    
    if (tab === "recommended") {
      return !!selectedVenue;
    } else {
      return customLocationName.trim() !== "" && customLocationAddress.trim() !== "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium text-base">Schedule Date</h3>
        <p className="text-sm text-gray-500">
          Pick a time to {matchId ? "invite your match" : "meet"}.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
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
                disabled={(date) => isDateInPast(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="time">Time</Label>
          <div className="flex space-x-2">
            <TimePicker
              className="flex-1"
              value={time}
              onChange={setTime}
              minuteStep={15}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Date Type</Label>
          <RadioGroup
            defaultValue="coffee"
            value={dateType}
            onValueChange={(value) => setDateType(value as 'coffee' | 'meal' | 'drink')}
            className="flex space-x-1"
          >
            <div className="flex items-center space-x-2 rounded-md border p-2 flex-1 cursor-pointer">
              <RadioGroupItem value="coffee" id="coffee" />
              <Label htmlFor="coffee" className="cursor-pointer">☕ Coffee</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-2 flex-1 cursor-pointer">
              <RadioGroupItem value="meal" id="meal" />
              <Label htmlFor="meal" className="cursor-pointer">🍽️ Meal</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-2 flex-1 cursor-pointer">
              <RadioGroupItem value="drink" id="drink" />
              <Label htmlFor="drink" className="cursor-pointer">🥂 Drink</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Tabs defaultValue="recommended" value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="custom">Custom Location</TabsTrigger>
            </TabsList>
            <TabsContent value="recommended" className="space-y-4">
              <VenueRecommendations 
                venueType={dateType} 
                onVenueSelect={handleVenueSelect} 
              />
              
              {selectedVenue && (
                <div className="p-3 bg-gray-50 rounded-md mt-3">
                  <h4 className="font-medium text-sm flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Selected Venue
                  </h4>
                  <div className="mt-1 text-sm">
                    <p className="font-medium">{selectedVenue.name}</p>
                    <p className="text-gray-500">{selectedVenue.address}</p>
                    {selectedVenue.discount_premium > 0 && (
                      <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                        {selectedVenue.discount_premium}% off with Premium
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="locationName">Place Name</Label>
                <Input 
                  id="locationName" 
                  placeholder="e.g. Central Park Cafe"
                  value={customLocationName}
                  onChange={(e) => setCustomLocationName(e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="locationAddress">Address</Label>
                <Input 
                  id="locationAddress" 
                  placeholder="e.g. 123 Main St, New York, NY 10001" 
                  value={customLocationAddress}
                  onChange={(e) => setCustomLocationAddress(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !isFormComplete()}
        >
          {isLoading ? "Scheduling..." : matchId ? "Send Date Request" : "Schedule Date"}
        </Button>
      </div>
    </div>
  );
};

export default DateSchedulerV2;
