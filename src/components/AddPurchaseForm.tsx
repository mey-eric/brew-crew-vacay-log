import React, { useState } from 'react';
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
  const [formData, setFormData] = useState({
    beerName: '',
    beerType: '',
    cost: 0,
    quantity: 1,
    quantityUnit: 'bottles',
    storeName: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !formData.beerName || formData.cost <= 0 || formData.quantity <= 0) {
      toast("Please fill in all required fields with valid values");
      return;
    }

    setIsLoading(true);
    
    try {
      const purchaseData = {
        user_id: currentUser.id,
        user_name: currentUser.name,
        beer_name: formData.beerName,
        beer_type: formData.beerType || null,
        cost: formData.cost,
        quantity: formData.quantity,
        quantity_unit: formData.quantityUnit,
        store_name: formData.storeName || null,
        notes: formData.notes || null,
        purchase_date: new Date().toISOString()
      };

      const { error } = await supabase
        .from('beer_purchases')
        .insert([purchaseData]);

      if (error) throw error;

      toast(`Purchase logged! ${formData.quantity} ${formData.quantityUnit} of ${formData.beerName} for $${formData.cost.toFixed(2)}`);
      
      // Reset form
      setFormData({
        beerName: '',
        beerType: '',
        cost: 0,
        quantity: 1,
        quantityUnit: 'bottles',
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
            <Label htmlFor="beer-name">Beer Name *</Label>
            <Input
              id="beer-name"
              type="text"
              value={formData.beerName}
              onChange={(e) => handleInputChange('beerName', e.target.value)}
              className="border-beer-dark focus:ring-beer-amber"
              placeholder="e.g., Heineken, Budweiser"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beer-type">Beer Type</Label>
            <Input
              id="beer-type"
              type="text"
              value={formData.beerType}
              onChange={(e) => handleInputChange('beerType', e.target.value)}
              className="border-beer-dark focus:ring-beer-amber"
              placeholder="e.g., Lager, IPA, Stout"
            />
          </div>

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
            <Label htmlFor="cost">Cost ($) *</Label>
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
            disabled={isLoading || !formData.beerName || formData.cost <= 0 || formData.quantity <= 0}
          >
            {isLoading ? "Logging Purchase..." : "Log Purchase"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPurchaseForm;