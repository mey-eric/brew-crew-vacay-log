
import React, { useState, useEffect } from 'react';
import { Plus, Beer, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useBeer } from '@/contexts/BeerContext';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

interface BeerType {
  id: string;
  name: string;
  alcohol_percentage: number;
}

interface BeerPurchase {
  id: string;
  beer_name: string;
  beer_type: string;
  remaining_quantity: number;
  quantity_unit: string;
  beer_size: number;
  store_name?: string;
  purchase_date: string;
}

const AddBeerForm = () => {
  const { addEntry, isLoading } = useBeer();
  const { currentUser } = useUser();
  const [size, setSize] = useState<number>(500);
  const [selectedBeerType, setSelectedBeerType] = useState<string>('');
  const [beerTypes, setBeerTypes] = useState<BeerType[]>([]);
  const [customAlcoholPercentage, setCustomAlcoholPercentage] = useState<number>(5.0);
  const [loadingBeerTypes, setLoadingBeerTypes] = useState(true);
  const [consumptionSource, setConsumptionSource] = useState<'new' | 'purchase'>('new');
  const [selectedPurchase, setSelectedPurchase] = useState<string>('');
  const [purchases, setPurchases] = useState<BeerPurchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

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

  // Load user's purchases when consumption source is 'purchase'
  useEffect(() => {
    if (consumptionSource === 'purchase' && currentUser) {
      loadPurchases();
    }
  }, [consumptionSource, currentUser]);

  const loadPurchases = async () => {
    if (!currentUser) return;
    
    setLoadingPurchases(true);
    try {
      const { data, error } = await supabase
        .from('beer_purchases')
        .select('*')
        .gt('remaining_quantity', 0)
        .order('purchase_date', { ascending: false });
      
      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast("Failed to load purchases");
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!size || size <= 0) {
      return;
    }

    let beerTypeName = 'Other';
    let alcoholPercentage = customAlcoholPercentage;
    let purchaseId = null;

    if (consumptionSource === 'purchase') {
      if (!selectedPurchase) {
        toast("Please select a purchase");
        return;
      }
      
      const purchase = purchases.find(p => p.id === selectedPurchase);
      if (!purchase) {
        toast("Selected purchase not found");
        return;
      }

      // Check if there's enough remaining quantity and set size based on purchase
      const consumedUnits = 1; // We're consuming 1 unit from the purchase
      if (consumedUnits > purchase.remaining_quantity) {
        toast(`Not enough remaining quantity. Only ${purchase.remaining_quantity} ${purchase.quantity_unit} left.`);
        return;
      }

      beerTypeName = purchase.beer_name;
      purchaseId = purchase.id;
      
      // Set the size to match the purchase beer size
      setSize(purchase.beer_size);
      
      // Get alcohol percentage from beer type
      const matchingBeerType = beerTypes.find(type => type.name === purchase.beer_type);
      if (matchingBeerType) {
        alcoholPercentage = matchingBeerType.alcohol_percentage;
      }

      // Update remaining quantity (subtract 1 unit)
      try {
        const { error } = await supabase
          .from('beer_purchases')
          .update({ remaining_quantity: purchase.remaining_quantity - consumedUnits })
          .eq('id', purchase.id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error updating purchase quantity:', error);
        toast("Failed to update purchase quantity");
        return;
      }
    } else {
      // New beer consumption
      if (selectedBeerType) {
        const selectedType = beerTypes.find(type => type.id === selectedBeerType);
        if (selectedType) {
          beerTypeName = selectedType.name;
          alcoholPercentage = selectedType.alcohol_percentage;
        }
      }
    }

    console.log('Adding beer entry:', { size, beerTypeName, alcoholPercentage, purchaseId });
    await addEntry(size, beerTypeName, alcoholPercentage, purchaseId);
    
    // Reset form
    setSize(500);
    setSelectedBeerType('');
    setCustomAlcoholPercentage(5.0);
    setSelectedPurchase('');
    
    // Reload purchases if we used one
    if (consumptionSource === 'purchase') {
      loadPurchases();
    }
  };

  // When consumption source changes to purchase, reset the size 
  const handleConsumptionSourceChange = (value: 'new' | 'purchase') => {
    setConsumptionSource(value);
    if (value === 'new') {
      setSize(500); // Reset to default
      setSelectedPurchase('');
    }
  };

  // When a purchase is selected, automatically set the size
  const handlePurchaseChange = (purchaseId: string) => {
    setSelectedPurchase(purchaseId);
    const purchase = purchases.find(p => p.id === purchaseId);
    if (purchase) {
      setSize(purchase.beer_size);
    }
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
          <div className="space-y-3">
            <Label>Consumption Source</Label>
            <RadioGroup value={consumptionSource} onValueChange={handleConsumptionSourceChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">New Beer (not from purchase)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="purchase" id="purchase" />
                <Label htmlFor="purchase">From Previous Purchase</Label>
              </div>
            </RadioGroup>
          </div>

          {consumptionSource === 'purchase' ? (
            <div className="space-y-2">
              <Label htmlFor="purchase-select">Select Purchase</Label>
              {loadingPurchases ? (
                <div className="text-sm text-gray-500">Loading purchases...</div>
              ) : purchases.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 bg-gray-100 rounded">
                  No purchases with remaining quantity found. Buy some beer first!
                </div>
              ) : (
                <Select value={selectedPurchase} onValueChange={handlePurchaseChange}>
                  <SelectTrigger className="border-beer-dark">
                    <SelectValue placeholder="Select a purchase" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                    {purchases.map((purchase) => (
                      <SelectItem key={purchase.id} value={purchase.id}>
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="h-4 w-4" />
                          <span>
                            {purchase.beer_name} ({purchase.beer_size}ml) - {purchase.remaining_quantity} {purchase.quantity_unit} left
                            {purchase.store_name && ` (${purchase.store_name})`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="size">Size (ml)</Label>
            {consumptionSource === 'purchase' && selectedPurchase ? (
              <div className="p-3 bg-beer-cream rounded border border-beer-dark">
                <p className="text-sm text-beer-dark">
                  Size automatically set to {size}ml based on your purchase
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {((consumptionSource === 'new' && selectedType) || (consumptionSource === 'purchase' && selectedPurchase)) && (
            <div className="p-3 bg-beer-cream rounded border border-beer-dark">
              {consumptionSource === 'new' && selectedType && (
                <p className="text-sm text-beer-dark">
                  <strong>{selectedType.name}</strong> - {selectedType.alcohol_percentage}% ABV
                </p>
              )}
              {consumptionSource === 'purchase' && selectedPurchase && (
                (() => {
                  const purchase = purchases.find(p => p.id === selectedPurchase);
                  const beerType = beerTypes.find(type => type.name === purchase?.beer_type);
                  return purchase ? (
                    <p className="text-sm text-beer-dark">
                      <strong>{purchase.beer_name}</strong> ({purchase.beer_size}ml) - {beerType?.alcohol_percentage || 5.0}% ABV
                      <br />
                      <span className="text-xs">From purchase: {purchase.remaining_quantity} {purchase.quantity_unit} remaining</span>
                    </p>
                  ) : null;
                })()
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-beer-amber hover:bg-beer-dark text-beer-dark hover:text-beer-cream"
            disabled={isLoading || !size || size <= 0 || (consumptionSource === 'purchase' && !selectedPurchase)}
          >
            {isLoading ? (
              "Adding..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Beer ({size}ml, {
                  consumptionSource === 'purchase' && selectedPurchase
                    ? (() => {
                        const purchase = purchases.find(p => p.id === selectedPurchase);
                        const beerType = beerTypes.find(type => type.name === purchase?.beer_type);
                        return beerType?.alcohol_percentage || 5.0;
                      })()
                    : selectedType ? selectedType.alcohol_percentage : customAlcoholPercentage
                }% ABV)
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddBeerForm;
