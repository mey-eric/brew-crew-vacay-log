-- Fix the delete policy for beer_entries
DROP POLICY IF EXISTS "delete" ON public.beer_entries;

-- Create a proper delete policy that checks user ownership
CREATE POLICY "Users can delete their own entries" 
ON public.beer_entries 
FOR DELETE 
USING (auth.uid() = "userId");