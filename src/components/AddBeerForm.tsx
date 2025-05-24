
import React, { useState, useEffect } from 'react';
import { Plus, Beer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBeer } from '@/contexts/BeerContext';
import { supabase } from '@/lib/supabase';

interface BeerType {
  id: string;
  name: string;
  alcohol_percentage: number;
}

const AddBeerForm = () => {
  const { addEntry, isLoading } = useBeer();
  const [size, setSize] = useState<number>(500);
  const [selectedBeerType, setSelectedBeerType] = useState<string>('');
  const [beerTypes, setBeerTypes] = useState<BeerType[]>([]);
  const [customAlcoholPercentage, setCustomAlcoholPercentage] = useState<number>(5.0);
  const [loadingBeerTypes, setLoadingBeerTypes] = useState(true);

  // Load beer types from database
  useEffect(() => {
    const loadBeerTypes = async () => {
      try {
        console.log('Loading beer types...');
        const { data, error } = await supabase
          .from('beer_types')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error loading beer types:', error);
          throw error;
        }
        
        console.log('Beer types loaded:', data);
        setBeerTypes(data || []);
      } catch (error) {
        console.error('Error loading beer types:', error);
        // Set some default beer types if loading fails
        setBeerTypes([
          { id: '1', name: 'Lager', alcohol_percentage: 4.5 },
          { id: '2', name: 'Pilsner', alcohol_percentage: 4.8 },
          { id: '3', name: 'Karlovačko', alcohol_percentage: 5.4 },
          { id: '4', name: 'Other', alcohol_percentage: 5.0 }
        ]);
      } finally {
        setLoadingBeerTypes(false);
      }
    };

    loadBeerTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!size || size <= 0) {
      return;
    }

    let beerTypeName = 'Other';
    let alcoholPercentage = customAlcoholPercentage;

    if (selectedBeerType) {
      const selectedType = beerTypes.find(type => type.id === selectedBeerType);
      if (selectedType) {
        beerTypeName = selectedType.name;
        alcoholPercentage = selectedType.alcohol_percentage;
      }
    }

    console.log('Adding beer entry:', { size, beerTypeName, alcoholPercentage });
    await addEntry(size, beerTypeName, alcoholPercentage);
    
    // Reset form
    setSize(500);
    setSelectedBeerType('');
    setCustomAlcoholPercentage(5.0);
  };

  const selectedType = beerTypes.find(type => type.id === selectedBeerType);

  return (
    <Card className="border-beer-dark">
      <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
        <CardTitle className="flex items-center text-xl font-bold">
          <Beer className="mr-2 h-5 w-5" />
          Add Beer Entry
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beer-type">Beer Type</Label>
            {loadingBeerTypes ? (
              <div className="text-sm text-gray-500">Loading beer types...</div>
            ) : (
              <Select value={selectedBeerType} onValueChange={setSelectedBeerType}>
                <SelectTrigger className="border-beer-dark">
                  <SelectValue placeholder="Select beer type or leave blank for custom" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                  {beerTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.alcohol_percentage}% ABV)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {!selectedBeerType && (
            <div className="space-y-2">
              <Label htmlFor="custom-alcohol">Custom Alcohol % (ABV)</Label>
              <Input
                id="custom-alcohol"
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={customAlcoholPercentage}
                onChange={(e) => setCustomAlcoholPercentage(parseFloat(e.target.value) || 0)}
                className="border-beer-dark focus:ring-beer-amber"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="size">Size (ml)</Label>
            <div className="flex space-x-2">
              {[330, 500, 1000].map((presetSize) => (
                <Button
                  key={presetSize}
                  type="button"
                  variant={size === presetSize ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSize(presetSize)}
                  className={size === presetSize ? "bg-beer-amber text-beer-dark" : "border-beer-dark text-beer-dark hover:bg-beer-cream"}
                >
                  {presetSize}ml
                </Button>
              ))}
            </div>
            <Input
              id="size"
              type="number"
              min="1"
              max="2000"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value) || 0)}
              className="border-beer-dark focus:ring-beer-amber"
              placeholder="Custom size in ml"
            />
          </div>

          {selectedType && (
            <div className="p-3 bg-beer-cream rounded border border-beer-dark">
              <p className="text-sm text-beer-dark">
                <strong>{selectedType.name}</strong> - {selectedType.alcohol_percentage}% ABV
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-beer-amber hover:bg-beer-dark text-beer-dark hover:text-beer-cream"
            disabled={isLoading || !size || size <= 0}
          >
            {isLoading ? (
              "Adding..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Beer ({size}ml, {selectedType ? selectedType.alcohol_percentage : customAlcoholPercentage}% ABV)
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddBeerForm;
