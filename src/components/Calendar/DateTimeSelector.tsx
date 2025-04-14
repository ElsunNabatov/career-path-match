
import React from "react";
import { format, isBefore } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/ui/time-picker";

interface DateTimeSelectorProps {
  date: Date | undefined;
  time: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  className?: string;
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  className
}) => {
  const isDateInPast = (date: Date) => {
    return isBefore(date, new Date());
  };

  return (
    <div className={cn("space-y-4", className)}>
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
              onSelect={onDateChange}
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
            onChange={onTimeChange}
            minuteStep={15}
          />
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelector;
