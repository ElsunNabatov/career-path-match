
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DateTypeSelectorProps {
  dateType: 'coffee' | 'meal' | 'drink';
  onDateTypeChange: (value: 'coffee' | 'meal' | 'drink') => void;
  className?: string;
}

const DateTypeSelector: React.FC<DateTypeSelectorProps> = ({
  dateType,
  onDateTypeChange,
  className
}) => {
  return (
    <div className={className}>
      <Label>Date Type</Label>
      <RadioGroup
        defaultValue="coffee"
        value={dateType}
        onValueChange={(value) => onDateTypeChange(value as 'coffee' | 'meal' | 'drink')}
        className="flex space-x-1 mt-2"
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
  );
};

export default DateTypeSelector;
