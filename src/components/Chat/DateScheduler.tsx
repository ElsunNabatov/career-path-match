
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Coffee, Wine, Utensils } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ChatService, DateSchedule } from '@/services/ChatService';

interface DateSchedulerProps {
  matchId: string;
  onScheduled: () => void;
}

const DateScheduler: React.FC<DateSchedulerProps> = ({ matchId, onScheduled }) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState('');
  const [dateType, setDateType] = useState<'coffee' | 'meal' | 'drink'>('coffee');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
  ];

  const handleSchedule = async () => {
    if (!date || !timeSlot || !location || !address) {
      toast.error('Please fill in all the fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time
      const [hours, minutes] = timeSlot.split(':');
      const isPM = timeSlot.includes('PM');
      let hour = parseInt(hours);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      
      const dateTime = new Date(date);
      dateTime.setHours(hour);
      dateTime.setMinutes(parseInt(minutes));

      const dateSchedule: DateSchedule = {
        match_id: matchId,
        date_time: dateTime.toISOString(),
        location_name: location,
        location_address: address,
        type: dateType,
        status: 'scheduled'
      };

      await ChatService.scheduleDate(dateSchedule);
      toast.success('Date scheduled successfully!');
      setIsOpen(false);
      onScheduled();
    } catch (error: any) {
      console.error('Error scheduling date:', error);
      toast.error(error.message || 'Failed to schedule date');
    } finally {
      setIsSubmitting(false);
    }
  };

  const DateTypeIcon = () => {
    switch (dateType) {
      case 'coffee':
        return <Coffee className="w-4 h-4" />;
      case 'meal':
        return <Utensils className="w-4 h-4" />;
      case 'drink':
        return <Wine className="w-4 h-4" />;
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Schedule a Date
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule a Date</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date Type</Label>
            <Select value={dateType} onValueChange={(value: any) => setDateType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a date type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coffee" className="flex items-center">
                  <div className="flex items-center">
                    <Coffee className="w-4 h-4 mr-2" />
                    Coffee Date
                  </div>
                </SelectItem>
                <SelectItem value="meal">
                  <div className="flex items-center">
                    <Utensils className="w-4 h-4 mr-2" />
                    Meal Date
                  </div>
                </SelectItem>
                <SelectItem value="drink">
                  <div className="flex items-center">
                    <Wine className="w-4 h-4 mr-2" />
                    Drinks Date
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Select Date</Label>
            <div className="border rounded-md p-1">
              <Calendar 
                mode="single" 
                selected={date} 
                onSelect={setDate} 
                className="rounded-md" 
                disabled={(date) => date < new Date()}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Select Time</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Location Name</Label>
            <Input 
              placeholder="e.g., Starbucks, Olive Garden" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Address</Label>
            <Input 
              placeholder="123 Main St, City, State" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSchedule} disabled={isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Date'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DateScheduler;
