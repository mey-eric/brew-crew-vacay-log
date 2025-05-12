
import React, { useState } from 'react';
import { Beer, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useBeer } from '@/contexts/BeerContext';

const BEER_TYPES = [
  "Lager",
  "Pilsner",
  "IPA",
  "Pale Ale",
  "Stout",
  "Porter",
  "Wheat Beer",
  "Amber Ale",
  "Brown Ale",
  "Sour",
  "Other"
];

const COMMON_SIZES = [
  { label: "Small (330ml)", value: 330 },
  { label: "Medium (500ml)", value: 500 },
  { label: "Large (1L)", value: 1000 },
];

const AddBeerForm = () => {
  const [unit, setUnit] = useState<'ml' | 'l'>('ml');
  const [size, setSize] = useState<number | string>(500);
  const [customSize, setCustomSize] = useState<boolean>(false);
  const [type, setType] = useState<string>(BEER_TYPES[0]);
  const { addEntry, isLoading } = useBeer();
  const { toast } = useToast();

  const handleSizeChange = (value: string) => {
    if (value === 'custom') {
      setCustomSize(true);
      setSize('');
    } else {
      setCustomSize(false);
      setSize(parseInt(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalSize: number;
    
    if (typeof size === 'string') {
      finalSize = parseInt(size);
      if (isNaN(finalSize) || finalSize <= 0) {
        toast({
          title: "Invalid size",
          description: "Please enter a valid beer size.",
          variant: "destructive",
        });
        return;
      }
    } else {
      finalSize = size;
    }
    
    // Convert to milliliters if necessary
    if (unit === 'l') {
      finalSize = finalSize * 1000;
    }
    
    addEntry(finalSize, type);
    
    // Reset form to default values
    setSize(500);
    setCustomSize(false);
    setType(BEER_TYPES[0]);
    setUnit('ml');
  };

  return (
    <Card className="border-beer-dark">
      <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
        <CardTitle className="flex items-center text-xl font-bold">
          <Beer className="mr-2 h-5 w-5" />
          Add New Beer
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="beer-type">Beer Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="beer-type" className="border-beer-dark focus:ring-beer-amber">
                <SelectValue placeholder="Select Beer Type" />
              </SelectTrigger>
              <SelectContent>
                {BEER_TYPES.map((beerType) => (
                  <SelectItem key={beerType} value={beerType}>
                    {beerType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Size</Label>
            {!customSize ? (
              <div className="grid grid-cols-3 gap-3">
                {COMMON_SIZES.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={size === option.value ? "default" : "outline"}
                    className={size === option.value 
                      ? "bg-beer-amber text-beer-dark hover:bg-beer-dark hover:text-beer-cream" 
                      : "border-beer-dark text-beer-dark hover:bg-beer-amber"}
                    onClick={() => handleSizeChange(option.value.toString())}
                  >
                    {option.label}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="border-beer-dark text-beer-dark hover:bg-beer-amber"
                  onClick={() => handleSizeChange('custom')}
                >
                  Custom Size
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={size.toString()}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="Enter size"
                    className="border-beer-dark focus:ring-beer-amber"
                    min="1"
                  />
                </div>
                <RadioGroup
                  value={unit}
                  onValueChange={(value) => setUnit(value as 'ml' | 'l')}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="ml" id="ml" className="text-beer-amber border-beer-dark" />
                    <Label htmlFor="ml">ml</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="l" id="l" className="text-beer-amber border-beer-dark" />
                    <Label htmlFor="l">L</Label>
                  </div>
                </RadioGroup>
                <Button
                  type="button"
                  variant="outline"
                  className="border-beer-dark text-beer-dark hover:bg-beer-amber"
                  onClick={() => {
                    setCustomSize(false);
                    setSize(500);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-beer-amber hover:bg-beer-dark text-beer-dark hover:text-beer-cream"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Beer
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddBeerForm;
