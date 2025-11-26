-- Add must_change_password column to profiles
ALTER TABLE public.profiles 
ADD COLUMN must_change_password BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX idx_profiles_must_change_password 
ON public.profiles(must_change_password) 
WHERE must_change_password = true;