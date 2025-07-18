import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  user_id: string;
  user_name: string;
  beer_name: string;
  beer_type?: string;
  cost: number;
  quantity: number;
  quantity_unit: string;
  purchase_date: string;
  store_name?: string;
  notes?: string;
}

const AddPurchaseForm = () => {
  const { currentUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [beerTypes, setBeerTypes] = useState<BeerType[]>([]);
  const [loadingBeerTypes, setLoadingBeerTypes] = useState(true);
  const [formData, setFormData] = useState({
    beerTypeId: '',
    cost: 0,
    quantity: 1,
    quantityUnit: 'bottles',
    beerSize: 330,
    storeName: '',
    notes: ''
  });

  // Load beer types from database
  useEffect(() => {
    const loadBeerTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('beer_types')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setBeerTypes(data || []);
      } catch (error) {
        console.error('Error loading beer types:', error);
        toast("Failed to load beer types");
      } finally {
        setLoadingBeerTypes(false);
      }
    };

    loadBeerTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !formData.beerTypeId || formData.cost <= 0 || formData.quantity <= 0) {
      toast("Please fill in all required fields with valid values");
      return;
    }

    setIsLoading(true);
    
    try {
      const selectedBeerType = beerTypes.find(type => type.id === formData.beerTypeId);
      if (!selectedBeerType) {
        toast("Please select a valid beer type");
        return;
      }

      const purchaseData = {
        user_id: currentUser.id,
        user_name: currentUser.name,
        beer_name: selectedBeerType.name,
        beer_type: selectedBeerType.name,
        cost: formData.cost,
        quantity: formData.quantity,
        quantity_unit: formData.quantityUnit,
        beer_size: formData.beerSize,
        remaining_quantity: formData.quantity,
        store_name: formData.storeName || null,
        notes: formData.notes || null,
        purchase_date: new Date().toISOString()
      };

      const { error } = await supabase
        .from('beer_purchases')
        .insert([purchaseData]);

      if (error) throw error;

      toast(`Purchase logged! ${formData.quantity} ${formData.quantityUnit} of ${selectedBeerType.name} (${formData.beerSize}ml each) for €${(formData.cost * formData.quantity).toFixed(2)} (€${formData.cost.toFixed(2)}/unit)`);
      
      // Reset form
      setFormData({
        beerTypeId: '',
        cost: 0,
        quantity: 1,
        quantityUnit: 'bottles',
        beerSize: 330,
        storeName: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding purchase:', error);
      toast("Failed to log purchase. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedBeerType = beerTypes.find(type => type.id === formData.beerTypeId);

  return (
    <Card className="border-beer-dark">
      <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
        <CardTitle className="flex items-center text-xl font-bold">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Log Beer Purchase
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beer-type">Beer Type *</Label>
            {loadingBeerTypes ? (
              <div className="text-sm text-gray-500">Loading beer types...</div>
            ) : (
              <Select value={formData.beerTypeId} onValueChange={(value) => handleInputChange('beerTypeId', value)}>
                <SelectTrigger className="border-beer-dark">
                  <SelectValue placeholder="Select a beer type" />
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

          {selectedBeerType && (
            <div className="p-3 bg-beer-cream rounded border border-beer-dark">
              <p className="text-sm text-beer-dark">
                <strong>{selectedBeerType.name}</strong> - {selectedBeerType.alcohol_percentage}% ABV
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0.1"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 1)}
                className="border-beer-dark focus:ring-beer-amber"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity-unit">Unit</Label>
              <Select value={formData.quantityUnit} onValueChange={(value) => handleInputChange('quantityUnit', value)}>
                <SelectTrigger className="border-beer-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                  <SelectItem value="bottles">Bottles</SelectItem>
                  <SelectItem value="cans">Cans</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="gallons">Gallons</SelectItem>
                  <SelectItem value="pints">Pints</SelectItem>
                  <SelectItem value="cases">Cases</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="beer-size">Size per unit (ml) *</Label>
            <div className="flex space-x-2">
              {[330, 500, 1000].map((presetSize) => (
                <Button
                  key={presetSize}
                  type="button"
                  variant={formData.beerSize === presetSize ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('beerSize', presetSize)}
                  className={formData.beerSize === presetSize ? "bg-beer-amber text-beer-dark" : "border-beer-dark text-beer-dark hover:bg-beer-cream"}
                >
                  {presetSize}ml
                </Button>
              ))}
            </div>
            <Input
              id="beer-size"
              type="number"
              min="1"
              max="2000"
              value={formData.beerSize}
              onChange={(e) => handleInputChange('beerSize', parseInt(e.target.value) || 330)}
              className="border-beer-dark focus:ring-beer-amber"
              placeholder="Custom size in ml"
              required
            />
            <p className="text-sm text-gray-600">
              Total volume: {(formData.beerSize * formData.quantity).toFixed(0)}ml
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost per unit (€) *</Label>
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
              className="border-beer-dark focus:ring-beer-amber"
              placeholder="0.00"
              required
            />
            <p className="text-sm text-gray-600">
              Total cost: €{(formData.cost * formData.quantity).toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-name">Store/Location</Label>
            <Input
              id="store-name"
              type="text"
              value={formData.storeName}
              onChange={(e) => handleInputChange('storeName', e.target.value)}
              className="border-beer-dark focus:ring-beer-amber"
              placeholder="e.g., Walmart, Local brewery"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="border-beer-dark focus:ring-beer-amber"
              placeholder="Any additional notes about this purchase..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-beer-amber hover:bg-beer-dark text-beer-dark hover:text-beer-cream"
            disabled={isLoading || !formData.beerTypeId || formData.cost <= 0 || formData.quantity <= 0}
          >
            {isLoading ? "Logging Purchase..." : "Log Purchase"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPurchaseForm;