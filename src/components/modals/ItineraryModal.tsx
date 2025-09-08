import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';

interface ItineraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (itinerary: string, totalKm?: number) => void;
  initialItinerary?: string;
  initialKilometers?: number;
}

export function ItineraryModal({ onOpenChange, onConfirm, initialItinerary = '', initialKilometers = 0 }: ItineraryModalProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [totalKilometers, setTotalKilometers] = useState(initialKilometers.toString());

  // Parse and update locations when initialItinerary changes
  React.useEffect(() => {
    if (initialItinerary) {
      // Split by common separators: ' - ', '-', ' to ', ' -> '
      const parsed = initialItinerary
        .split(/\s*-\s*|\s+to\s+|\s*->\s*/i)
        .map(loc => loc.trim())
        .filter(Boolean);
      setLocations(parsed);
    } else {
      setLocations([]);
    }
    setTotalKilometers(initialKilometers.toString());
  }, [initialItinerary, initialKilometers]);

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const moveLocation = (fromIndex: number, toIndex: number) => {
    const items = Array.from(locations);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);
    setLocations(items);
  };

  const handleConfirm = () => {
    onConfirm(locations.join(' - '), parseFloat(totalKilometers) || 0);
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (initialItinerary) {
      const parsed = initialItinerary
        .split(/\s*-\s*|\s+to\s+|\s*->\s*/i)
        .map(loc => loc.trim())
        .filter(Boolean);
      setLocations(parsed);
    } else {
      setLocations([]);
    }
    setNewLocation('');
    setTotalKilometers(initialKilometers.toString());
    onOpenChange(false);
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold leading-none tracking-tight">Plan Itinerary</h3>
      </div>
      
      <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newLocation">Add Location</Label>
              <Input
                id="newLocation"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Enter location name"
                onKeyPress={(e) => e.key === 'Enter' && addLocation()}
              />
            </div>
            <Button onClick={addLocation} className="mt-6">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Locations ({locations.length})</Label>
            <Card className="p-4 min-h-[200px]">
              <CardContent className="p-0">
                  {locations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No locations added yet</p>
                  ) : (
                    <div className={`space-y-2 ${locations.length > 5 ? 'max-h-80 overflow-y-auto pr-2' : ''}`}>
                      {locations.map((location, index) => (
                        <Card key={index} className="p-3 bg-muted/50">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => index > 0 && moveLocation(index, index - 1)}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => index < locations.length - 1 && moveLocation(index, index + 1)}
                                disabled={index === locations.length - 1}
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="text-sm font-medium">{index + 1}.</span>
                            <span className="flex-1">{location}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLocation(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Label htmlFor="totalKilometers">Total Kilometers</Label>
            <Input
              id="totalKilometers"
              type="number"
              value={totalKilometers}
              onChange={(e) => setTotalKilometers(e.target.value)}
              placeholder="Enter total distance in km"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1" disabled={locations.length === 0}>
              Confirm Itinerary
            </Button>
          </div>
      </div>
    </div>
  );
}