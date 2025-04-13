
import React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DateSchedule } from "@/types/supabase";

interface DateRequestCardProps {
  date: DateSchedule & {
    partnerName: string;
    partnerId: string;
    partnerIsAnonymous: boolean;
    partnerPhoto?: string;
    isInitiator: boolean;
  };
  onAccept: (dateId: string) => void;
  onDecline: (dateId: string) => void;
}

const DateRequestCard: React.FC<DateRequestCardProps> = ({
  date,
  onAccept,
  onDecline,
}) => {
  const dateTime = parseISO(date.date_time);

  // Get icon based on date type
  const getDateTypeIcon = (type: string) => {
    switch (type) {
      case 'coffee':
        return <span className="bg-amber-50 text-amber-600 p-1 rounded-full">☕</span>;
      case 'meal':
        return <span className="bg-green-50 text-green-600 p-1 rounded-full">🍽️</span>;
      case 'drink':
        return <span className="bg-purple-50 text-purple-600 p-1 rounded-full">🥂</span>;
      default:
        return <span className="bg-gray-50 text-gray-600 p-1 rounded-full">📅</span>;
    }
  };

  return (
    <Card className="overflow-hidden border-l-4 border-l-amber-400">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage 
                src={date.partnerPhoto} 
                alt={date.partnerName} 
              />
              <AvatarFallback>
                {date.partnerIsAnonymous ? "A" : date.partnerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium flex items-center gap-1">
                {date.partnerIsAnonymous ? "Anonymous User" : date.partnerName}
                <span className="ml-1">{getDateTypeIcon(date.type)}</span>
              </h3>
              <Badge variant="outline" className="text-xs font-normal">
                Date Request
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-md">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(dateTime, "EEEE, MMMM d, yyyy")}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{format(dateTime, "h:mm a")}</span>
          </div>
          
          <div className="flex items-start text-gray-600">
            <MapPin className="h-4 w-4 mr-2 mt-1" />
            <div>
              <div className="font-medium">{date.location_name}</div>
              <div className="text-gray-500 text-xs">{date.location_address}</div>
            </div>
          </div>
        </div>

        {!date.isInitiator && (
          <div className="mt-4 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDecline(date.id)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onAccept(date.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
          </div>
        )}
        
        {date.isInitiator && (
          <div className="mt-4 flex justify-end">
            <Badge variant="outline" className="text-xs font-normal text-amber-600 bg-amber-50 border-amber-200">
              Awaiting Response
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DateRequestCard;
