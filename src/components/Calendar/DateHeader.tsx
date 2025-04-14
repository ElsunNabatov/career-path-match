
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DateHeaderProps {
  selectedDate: Date | undefined;
  view: "upcoming" | "past" | "all" | "requests";
  dateCount: number;
}

const DateHeader: React.FC<DateHeaderProps> = ({ selectedDate, view, dateCount }) => {
  const navigate = useNavigate();
  
  const getHeaderTitle = () => {
    if (selectedDate) {
      return `Dates on ${format(selectedDate, "MMMM d, yyyy")}`;
    } else {
      return view === "requests"
        ? "Date Requests"
        : view === "past"
          ? "Past Dates"
          : view === "upcoming"
            ? "Upcoming Dates"
            : "All Dates";
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">{getHeaderTitle()}</h2>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-normal">
          {dateCount} {dateCount === 1 ? "date" : "dates"}
        </Badge>
        {view === "upcoming" && (
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => navigate('/chat')}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default DateHeader;
