-- Add purchase_id and remaining_quantity to beer_purchases table
ALTER TABLE public.beer_purchases 
ADD COLUMN remaining_quantity numeric DEFAULT 0;

-- Update remaining_quantity to match quantity for existing records
UPDATE public.beer_purchases 
SET remaining_quantity = quantity 
WHERE remaining_quantity = 0;

-- Add purchase_id to beer_entries to link consumption to purchases
ALTER TABLE public.beer_entries 
ADD COLUMN purchase_id uuid REFERENCES public.beer_purchases(id);

-- Add constraint to ensure remaining_quantity is not negative
ALTER TABLE public.beer_purchases 
ADD CONSTRAINT check_remaining_quantity_positive 
CHECK (remaining_quantity >= 0);