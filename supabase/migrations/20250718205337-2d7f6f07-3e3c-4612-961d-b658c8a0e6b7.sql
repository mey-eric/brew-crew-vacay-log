-- Add beer_size to beer_purchases table to track individual beer size
ALTER TABLE public.beer_purchases 
ADD COLUMN beer_size numeric DEFAULT 330;

-- Add a comment to clarify the column
COMMENT ON COLUMN public.beer_purchases.beer_size IS 'Size of each individual beer unit in ml (e.g., 330ml per can)';

-- Update existing records to have a default size
UPDATE public.beer_purchases 
SET beer_size = 330 
WHERE beer_size IS NULL;