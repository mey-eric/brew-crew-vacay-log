import React, { useState, useEffect } from 'react';
import { Receipt, Calendar, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { format } from 'date-fns';

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

const PurchaseHistory = () => {
  const { currentUser } = useUser();
  const [purchases, setPurchases] = useState<BeerPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadPurchases();
    }
  }, [currentUser]);

  const loadPurchases = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('beer_purchases')
        .select('*')
        .order('purchase_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSpent = purchases.reduce((sum, purchase) => sum + (purchase.cost * purchase.quantity), 0);
  const totalItems = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);

  if (isLoading) {
    return (
      <Card className="border-beer-dark">
        <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
          <CardTitle className="flex items-center text-xl font-bold">
            <Receipt className="mr-2 h-5 w-5" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading purchases...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-beer-dark">
      <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
        <CardTitle className="flex items-center text-xl font-bold">
          <Receipt className="mr-2 h-5 w-5" />
          All Purchase History
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        {purchases.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Receipt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No purchases recorded yet</p>
            <p className="text-sm">Start tracking your beer purchases!</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-beer-cream p-4 rounded border border-beer-dark">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-beer-dark mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-beer-dark">€{(totalSpent).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-beer-cream p-4 rounded border border-beer-dark">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-beer-dark mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-beer-dark">{totalItems}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-beer-dark">Recent Purchases</h3>
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-white p-4 rounded border border-gray-200 hover:border-beer-amber transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-beer-dark">{purchase.beer_name}</h4>
                      <p className="text-sm text-gray-500">by {purchase.user_name}</p>
                      {purchase.beer_type && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {purchase.beer_type}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-beer-dark">€{(purchase.cost * purchase.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        {purchase.quantity} {purchase.quantity_unit} @ €{purchase.cost.toFixed(2)}/unit
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(purchase.purchase_date), 'MMM d, yyyy')}
                    </div>
                    {purchase.store_name && (
                      <div>@ {purchase.store_name}</div>
                    )}
                  </div>
                  
                  {purchase.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{purchase.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseHistory;