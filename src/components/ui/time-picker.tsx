
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  minuteStep?: number;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  minuteStep = 30,
  className,
  disabled = false,
}: TimePickerProps) {
  // Generate time slots
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += minuteStep) {
        const h = hour % 12 === 0 ? 12 : hour % 12;
        const period = hour < 12 ? "AM" : "PM";
        const formattedMinute = minute.toString().padStart(2, "0");
        const formattedHour = h.toString();
        const time = `${formattedHour}:${formattedMinute} ${period}`;
        slots.push(time);
      }
    }
    return slots;
  }, [minuteStep]);

  return (
    <Select
      disabled={disabled}
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {timeSlots.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
