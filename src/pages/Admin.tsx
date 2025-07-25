import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useBeer } from '@/contexts/BeerContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Beer, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface BeerPurchase {
  id: string;
  beer_name: string;
  quantity: number;
  beer_size: number;
  remaining_quantity: number;
  purchase_date: string;
  user_name: string;
  location?: string;
  price?: number;
}

interface BeerEntry {
  id: string;
  beer_name: string;
  beer_size: number;
  userName: string;
  timestamp: string;
  location?: string;
}

const Admin = () => {
  const { isAuthenticated, currentUser } = useUser();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<BeerPurchase[]>([]);
  const [entries, setEntries] = useState<BeerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      // Load purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('beer_purchases')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (purchasesError) throw purchasesError;

      // Load entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('beer_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (entriesError) throw entriesError;

      setPurchases(purchasesData || []);
      setEntries(entriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePurchase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('beer_purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPurchases(purchases.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Purchase deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast({
        title: "Error",
        description: "Failed to delete purchase",
        variant: "destructive",
      });
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      // First get the entry to check if it has a purchase_id
      const { data: entryData, error: entryError } = await supabase
        .from('beer_entries')
        .select('purchase_id')
        .eq('id', id)
        .single();

      if (entryError) throw entryError;

      // Delete the entry
      const { error } = await supabase
        .from('beer_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // If the entry had a purchase_id, restore 1 unit to the purchase
      if (entryData.purchase_id) {
        // First get the current purchase to update it properly
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('beer_purchases')
          .select('remaining_quantity')
          .eq('id', entryData.purchase_id)
          .single();

        if (!purchaseError && purchaseData) {
          const { error: updateError } = await supabase
            .from('beer_purchases')
            .update({ 
              remaining_quantity: purchaseData.remaining_quantity + 1
            })
            .eq('id', entryData.purchase_id);

          if (updateError) {
            console.error('Error restoring purchase quantity:', updateError);
            // Don't fail the deletion, just log the error
          }
        }
      }

      setEntries(entries.filter(e => e.id !== id));
      toast({
        title: "Success",
        description: "Beer entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Delete purchases and beer entries. Use with caution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Purchases */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Beer Purchases ({purchases.length})
              </CardTitle>
              <CardDescription>
                Delete beer purchases from your history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {purchases.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No purchases found</p>
                ) : (
                  purchases.map((purchase) => (
                     <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                       <div className="flex-1 min-w-0">
                         <p className="font-medium text-sm truncate">{purchase.beer_name}</p>
                         <p className="text-xs text-muted-foreground">
                           by {purchase.user_name} • {purchase.quantity}x {purchase.beer_size}ml
                           {purchase.location && ` • ${purchase.location}`}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           {new Date(purchase.purchase_date).toLocaleDateString()}
                         </p>
                       </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePurchase(purchase.id)}
                        className="ml-2 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Beer Entries */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Beer className="h-5 w-5" />
                Beer Entries ({entries.length})
              </CardTitle>
              <CardDescription>
                Delete beer consumption entries from your log
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {entries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No entries found</p>
                ) : (
                  entries.map((entry) => (
                     <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                       <div className="flex-1 min-w-0">
                         <p className="font-medium text-sm truncate">{entry.beer_name}</p>
                         <p className="text-xs text-muted-foreground">
                           by {entry.userName} • {entry.beer_size}ml
                           {entry.location && ` • ${entry.location}`}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           {new Date(entry.timestamp).toLocaleString()}
                         </p>
                       </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        className="ml-2 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;