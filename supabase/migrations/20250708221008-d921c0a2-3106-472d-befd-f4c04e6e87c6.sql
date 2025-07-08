-- Create table for beer purchases
CREATE TABLE public.beer_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  beer_name TEXT NOT NULL,
  beer_type TEXT,
  cost DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  quantity_unit TEXT NOT NULL DEFAULT 'bottles', -- bottles, cans, liters, gallons
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  store_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.beer_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own purchases" 
ON public.beer_purchases 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own purchases" 
ON public.beer_purchases 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own purchases" 
ON public.beer_purchases 
FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own purchases" 
ON public.beer_purchases 
FOR DELETE 
USING (auth.uid()::text = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_beer_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_beer_purchases_updated_at
  BEFORE UPDATE ON public.beer_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_beer_purchases_updated_at();