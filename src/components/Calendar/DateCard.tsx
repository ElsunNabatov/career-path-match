
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coffee, Utensils, Wine, MapPin, Clock } from "lucide-react";
import { DateSchedule } from "@/types/supabase";

interface DateCardProps {
  date: DateSchedule & {
    partnerName: string;
    partnerId: string;
    partnerIsAnonymous: boolean;
    partnerPhoto?: string;
    reviewed?: boolean;
  };
  onCancel: (dateId: string) => void;
  onWriteReview: (matchId: string) => void;
}

const DateCard: React.FC<DateCardProps> = ({
  date,
  onCancel,
  onWriteReview
}) => {
  const getDateTypeIcon = (type: string | null) => {
    switch (type) {
      case 'coffee':
        return <Coffee className="h-4 w-4 text-amber-500" />;
      case 'meal':
        return <Utensils className="h-4 w-4 text-green-500" />;
      case 'drink':
        return <Wine className="h-4 w-4 text-purple-500" />;
      default:
        return <Coffee className="h-4 w-4" />;
    }
  };

  return (
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
              onClick={() => onCancel(date.id)}
            >
              Cancel
            </Button>
          )}
          
          {date.status === "completed" && !date.reviewed && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onWriteReview(date.match_id)}
            >
              Write Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DateCard;
