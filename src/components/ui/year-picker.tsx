import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface YearPickerProps {
  selectedYear?: Date;
  onYearSelect: (year: Date) => void;
  placeholder?: string;
}

export function YearPicker({ selectedYear, onYearSelect, placeholder = "Select year" }: YearPickerProps) {
  const [currentDecade, setCurrentDecade] = useState(Math.floor((selectedYear?.getFullYear() || new Date().getFullYear()) / 10) * 10);
  
  const years = Array.from({ length: 10 }, (_, i) => currentDecade + i);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="justify-between font-normal"
        >
          {selectedYear ? selectedYear.getFullYear() : placeholder}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDecade(currentDecade - 10)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentDecade} - {currentDecade + 9}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDecade(currentDecade + 10)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {years.map((year) => (
              <Button
                key={year}
                variant={selectedYear?.getFullYear() === year ? "default" : "ghost"}
                size="sm"
                onClick={() => onYearSelect(new Date(year, 0, 1))}
                className="h-8"
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}