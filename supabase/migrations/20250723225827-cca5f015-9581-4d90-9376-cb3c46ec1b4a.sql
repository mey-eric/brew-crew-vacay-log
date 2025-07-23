-- Update the select policy for beer_purchases to allow everyone to view all purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.beer_purchases;

-- Create a new policy that allows everyone to view all purchases
CREATE POLICY "Everyone can view all purchases" 
ON public.beer_purchases 
FOR SELECT 
USING (true);