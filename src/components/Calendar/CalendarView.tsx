
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { parseISO } from "date-fns";

interface CalendarViewProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  daysWithEvents: Date[];
}

const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onSelectDate,
  daysWithEvents
}) => {
  return (
    <Card>
      <CardContent className="p-0 pt-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
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
  );
};

export default CalendarView;
