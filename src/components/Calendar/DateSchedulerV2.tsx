
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoyaltyVenue } from "@/types/supabase";
import { addDays } from "date-fns";
import DateTimeSelector from "./DateTimeSelector";
import DateTypeSelector from "./DateTypeSelector";
import LocationSelector from "./LocationSelector";

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

      <div className="grid gap-5">
        <DateTimeSelector 
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />

        <DateTypeSelector 
          dateType={dateType}
          onDateTypeChange={setDateType}
          className="mt-1"
        />
        
        <LocationSelector 
          dateType={dateType}
          selectedVenue={selectedVenue}
          customLocationName={customLocationName}
          customLocationAddress={customLocationAddress}
          onVenueSelect={setSelectedVenue}
          onCustomLocationNameChange={setCustomLocationName}
          onCustomLocationAddressChange={setCustomLocationAddress}
          onTabChange={setTab}
          activeTab={tab}
          className="mt-2"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !isFormComplete()}
          className="bg-brand-blue hover:bg-brand-blue/90"
        >
          {isLoading ? "Scheduling..." : matchId ? "Send Date Request" : "Schedule Date"}
        </Button>
      </div>
    </div>
  );
};

export default DateSchedulerV2;
